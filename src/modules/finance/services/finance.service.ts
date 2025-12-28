import { toAppError } from "@core/errors/to-app-error";
import dayjs from "dayjs";
import type { FinanceEntryModel, FinanceEntryCreatePayload } from "@modules/finance/interfaces/finance-entry.model";
import type { CompanyServiceModel } from "@modules/company/interfaces/service.model";
import { CompanyServicesService } from "@modules/company/services/company-services.service";
import type { FinanceQueryModel } from "@modules/finance/interfaces/finance-query.model";
import type { FinanceResponseModel } from "@modules/finance/interfaces/finance-response.model";
import type { FinanceSeries } from "@modules/finance/interfaces/finance-series.model";
import { useMockStore } from "@core/storage/mock-store.provider";

const inMemoryDb: { entries: FinanceEntryModel[] } = { entries: [] };

function makeId(prefix = "fe") {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

export class FinanceService {
  private companyService = new CompanyServicesService();

  // Entries
  async listEntries(): Promise<FinanceEntryModel[]> {
    try {
      await new Promise((r) => setTimeout(r, 40));
      return inMemoryDb.entries.slice();
    } catch (err) {
      throw toAppError(err);
    }
  }

  async createEntry(payload: FinanceEntryCreatePayload): Promise<FinanceEntryModel> {
    try {
      await new Promise((r) => setTimeout(r, 40));
      const ent: FinanceEntryModel = { ...payload, id: makeId("fe") };
      inMemoryDb.entries.unshift(ent);
      return ent;
    } catch (err) {
      throw toAppError(err);
    }
  }

  async removeEntry(id: string): Promise<boolean> {
    try {
      const idx = inMemoryDb.entries.findIndex((e) => e.id === id);
      if (idx === -1) return false;
      inMemoryDb.entries.splice(idx, 1);
      return true;
    } catch (err) {
      throw toAppError(err);
    }
  }

  // Services suggestions
  async suggestPriceForService(svc: CompanyServiceModel): Promise<number> {
    try {
      const base = svc.priceCents ?? 0;
      return Math.max(0, Math.round(base * 0.85));
    } catch (err) {
      throw toAppError(err);
    }
  }

  async listServicesWithSuggestions(): Promise<Array<CompanyServiceModel & { suggestedCents: number }>> {
    try {
      const services = await this.companyService.list();
      return await Promise.all(services.map(async (s) => ({ ...s, suggestedCents: await this.suggestPriceForService(s) })));
    } catch (err) {
      throw toAppError(err);
    }
  }

  // Analytics (mocked)
  async getFinance(query: FinanceQueryModel): Promise<FinanceResponseModel> {
    try {
      await new Promise((r) => setTimeout(r, 450));

      const from = dayjs(query.from);
      const to = dayjs(query.to);

      const points = this.buildPoints(from, to, query.groupBy);
      const revenue = this.makeSeries("revenue", points, 1800, 9800, 0.22);
      const expenses = this.makeSeries("expenses", points, 800, 5400, 0.28);
      const profit = this.makeProfitSeries(revenue, expenses);

      const totalRevenue = revenue.points.reduce((a, p) => a + p.value, 0);
      const totalExpenses = expenses.points.reduce((a, p) => a + p.value, 0);
      const totalProfit = totalRevenue - totalExpenses;
      const margin = totalRevenue > 0 ? totalProfit / totalRevenue : 0;

      const expensesByCategory = [
        { id: "rent", category: "Rent", value: clamp(totalExpenses * 0.22, 0, totalExpenses) },
        { id: "payroll", category: "Payroll", value: clamp(totalExpenses * 0.36, 0, totalExpenses) },
        { id: "supplies", category: "Supplies", value: clamp(totalExpenses * 0.14, 0, totalExpenses) },
        { id: "tools", category: "Tools", value: clamp(totalExpenses * 0.09, 0, totalExpenses) },
        { id: "other", category: "Other", value: clamp(totalExpenses * 0.19, 0, totalExpenses) },
      ];

      const cashflow = this.makeCashflow(from, to);
      const topServices = this.makeTopServices(totalRevenue);

      return {
        kpis: [
          { id: "revenue", label: "Revenue", value: totalRevenue, format: "money", delta: 0.08 },
          { id: "expenses", label: "Expenses", value: totalExpenses, format: "money", delta: 0.03 },
          { id: "profit", label: "Profit", value: totalProfit, format: "money", delta: 0.11 },
          { id: "margin", label: "Margin", value: margin, format: "percent", delta: 0.02 },
        ],
        revenueSeries: revenue,
        expensesSeries: expenses,
        profitSeries: profit,
        expensesByCategory,
        cashflow,
        topServices,
      } as FinanceResponseModel;
    } catch (err) {
      throw toAppError(err);
    }
  }

  private buildPoints(from: dayjs.Dayjs, to: dayjs.Dayjs, groupBy: "day" | "week" | "month") {
    const points: Array<{ label: string; seed: number }> = [];

    if (groupBy === "day") {
      const days = Math.max(1, to.diff(from, "day") + 1);
      for (let i = 0; i < days; i++) {
        const d = from.add(i, "day");
        points.push({ label: d.format("YYYY-MM-DD"), seed: i + 1 });
      }
      return points;
    }

    if (groupBy === "week") {
      let cursor = from.startOf("week");
      const end = to.endOf("week");
      let i = 0;
      while (cursor.isBefore(end) || cursor.isSame(end, "day")) {
        points.push({ label: `W${cursor.format("WW")}`, seed: i + 1 });
        cursor = cursor.add(1, "week");
        i++;
      }
      return points;
    }

    let cursor = from.startOf("month");
    const end = to.endOf("month");
    let i = 0;
    while (cursor.isBefore(end) || cursor.isSame(end, "month")) {
      points.push({ label: cursor.format("MMM"), seed: i + 1 });
      cursor = cursor.add(1, "month");
      i++;
    }
    return points;
  }

  private makeSeries(key: FinanceSeries["key"], points: Array<{ label: string; seed: number }>, minValue: number, maxValue: number, volatility: number): FinanceSeries {
    let last = (minValue + maxValue) / 2;

    return {
      key,
      points: points.map((p) => {
        const wave = Math.sin(p.seed / 1.9) * (maxValue - minValue) * 0.12;
        const rnd = (Math.cos(p.seed * 1.7) + 1) / 2;
        const drift = (rnd - 0.5) * (maxValue - minValue) * volatility;

        last = clamp(last + wave + drift, minValue, maxValue);
        return { label: p.label, value: Math.round(last) };
      }),
    } as FinanceSeries;
  }

  private makeProfitSeries(revenue: FinanceSeries, expenses: FinanceSeries): FinanceSeries {
    return {
      key: "profit",
      points: revenue.points.map((p, idx) => ({ label: p.label, value: Math.round(p.value - (expenses.points[idx]?.value ?? 0)) })),
    } as FinanceSeries;
  }

  private makeCashflow(from: dayjs.Dayjs, to: dayjs.Dayjs) {
    const rows: Array<{ id: string; date: string; description: string; type: 'in' | 'out'; category: string; amount: number; status: 'pending' | 'paid' }> = [];
    const days = Math.max(10, Math.min(28, to.diff(from, "day") + 1));
    for (let i = 0; i < days; i++) {
      const d = from.add(i, "day");
      const isOut = i % 3 === 1;
      rows.push({
        id: `cf-${d.format("YYYYMMDD")}-${i}`,
        date: d.format("YYYY-MM-DD"),
        description: isOut ? "Supplier payment" : "Service order",
        type: isOut ? ("out" as const) : ("in" as const),
        category: isOut ? "Supplies" : "Services",
        amount: isOut ? 120 + i * 19 : 240 + i * 33,
        status: i % 4 === 0 ? ("pending" as const) : ("paid" as const),
      });
    }
    return rows.reverse();
  }

  private makeTopServices(totalRevenue: number) {
    const base = Math.max(1, Math.round(totalRevenue / 10));
    return [
      { id: "svc-1", serviceName: "Premium Cut", orders: 42, revenue: base * 3.1, avgTicket: (base * 3.1) / 42 },
      { id: "svc-2", serviceName: "Color & Style", orders: 18, revenue: base * 2.4, avgTicket: (base * 2.4) / 18 },
      { id: "svc-3", serviceName: "Basic Service", orders: 63, revenue: base * 1.8, avgTicket: (base * 1.8) / 63 },
      { id: "svc-4", serviceName: "Maintenance", orders: 27, revenue: base * 1.2, avgTicket: (base * 1.2) / 27 },
    ].map((r) => ({ ...r, revenue: Math.round(r.revenue), avgTicket: Math.round(r.avgTicket) }));
  }
}

// Hook-based API to integrate with MockStoreProvider
export function useFinanceApi() {
  const store = useMockStore();

  const listEntries = async () => {
    return store.finance;
  };

  const createEntry = async (payload: { serviceId?: string; amount: number; date: string; note?: string }) => {
    return store.addFinanceEntry({ ...payload, id: `f-${Math.random().toString(16).slice(2)}` });
  };

  const removeEntry = async (id: string) => {
    store.removeFinanceEntry(id);
    return true;
  };

  return { listEntries, createEntry, removeEntry };
}
