import { toAppError } from "@core/errors/to-app-error";
import dayjs from "dayjs";
import type { FinanceEntryModel, FinanceEntryCreatePayload } from "@modules/finance/interfaces/finance-entry.model";
import type { CompanyServiceModel } from "@modules/company/interfaces/service.model";
import { CompanyServicesService } from "@modules/company/services/company-services.service";
import type { FinanceQueryModel } from "@modules/finance/interfaces/finance-query.model";
import type { FinanceResponseModel } from "@modules/finance/interfaces/finance-response.model";
import type { FinanceSeries } from "@modules/finance/interfaces/finance-series.model";
import { useMockStore } from "@core/storage/mock-store.provider";
import { FinanceApi, type FinanceEntryType } from "@modules/finance/services/finance-api";
import { httpClient } from "@core/http/client.instance";

// Simple per-workspace in-flight/cached promise map to avoid duplicate requests
const entryTypesCache = new Map<string, Promise<FinanceEntryType[]>>();
// In-flight/cached entries list promises to avoid duplicate GETs
const entriesCache = new Map<string, Promise<unknown[]>>();

const inMemoryDb: { entries: FinanceEntryModel[] } = { entries: [] };

function makeId(prefix = "fe") {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

export class FinanceService {
  private companyService = new CompanyServicesService();
  private api = new FinanceApi(httpClient as unknown as import("@core/http/interfaces/http-client.interface").HttpClient);

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

  async getRevenueForMonth(workspaceId?: string | null): Promise<number | null> {
    try {
      // prefer backend revenue endpoint with period=month
      const res = await this.api.getRevenue(workspaceId ?? undefined, { period: "month" });
      if (!res || typeof res.revenue_cents !== "number") return null;
      return Math.round(res.revenue_cents);
    } catch (err) {
      return null;
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
import { useCallback, useMemo } from "react";

export function useFinanceApi() {
  const store = useMockStore();

  const listEntries = useCallback(async (opts?: { workspaceId?: string; start?: string; end?: string; limit?: number; offset?: number; typeId?: string }) => {
    const key = JSON.stringify({ workspaceId: opts?.workspaceId, typeId: opts?.typeId, start: opts?.start, end: opts?.end, limit: opts?.limit, offset: opts?.offset });
    if (entriesCache.has(key)) return entriesCache.get(key)!;

    const p = (async () => {
      try {
        const api = new FinanceApi(httpClient as unknown as import("@core/http/interfaces/http-client.interface").HttpClient);

        const query: Record<string, unknown> = {};
        if (opts?.typeId) query.typeId = opts.typeId;
        if (opts?.start) query.start = opts.start;
        if (opts?.end) query.end = opts.end;
        if (opts?.limit) query.limit = opts.limit;
        if (opts?.offset) query.offset = opts.offset;

        const rows = await api.listEntries(opts?.workspaceId, query);

        // try to map typeId -> type key/name for UI convenience
        const types = await (async () => {
          try {
            return await (new FinanceApi(httpClient as unknown as import("@core/http/interfaces/http-client.interface").HttpClient)).listEntryTypes(opts?.workspaceId);
          } catch {
            return [] as FinanceEntryType[];
          }
        })();

        const typeMap = new Map<string, FinanceEntryType>();
        (types || []).forEach((t) => {
          if (t?.id) typeMap.set(t.id, t);
        });

        const mapped = (rows || []).map((r: unknown) => {
          const rr = r as Record<string, unknown>;
          const amountRaw = rr["amount_cents"] ?? rr["amount"] ?? 0;
          const amount = typeof amountRaw === "number" ? (amountRaw as number) / 100 : Number(String(amountRaw || "0")) / 100;
          const occurred = (rr["occurred_at"] ?? rr["date"] ?? rr["created_at"]) as string | undefined;
          const typeIdKey = (rr["typeId"] ?? rr["type_id"]) as string | undefined;
          const t = typeMap.get(typeIdKey ?? "");
          return {
            id: (rr["id"] as string) ?? undefined,
            serviceId: (rr["serviceId"] ?? rr["service_id"]) as string | undefined,
            amount,
            date: occurred,
            note: (rr["description"] ?? rr["note"]) as string | undefined,
            description: (rr["description"] ?? rr["note"]) as string | undefined,
            type: String((t?.key ?? (t?.name ?? ""))).toLowerCase(),
            typeId: typeIdKey,
            raw: rr,
          } as unknown;
        });

        return mapped;
      } catch (err) {
        return store.finance;
      }
    })();

    entriesCache.set(key, p);
    return p;
  }, [store]);

  const createEntry = useCallback(async (payload: { serviceId?: string; type?: string; typeId?: string; amount: number; date: string; note?: string; workspaceId?: string }) => {
    // Try remote creation via API; fall back to mock store on error
    try {
      const api = new FinanceApi(httpClient as unknown as import("@core/http/interfaces/http-client.interface").HttpClient);

      const occurredAt = payload.date ? dayjs(payload.date).toISOString() : dayjs().toISOString();
      const amountCents = Math.round((Number(payload.amount) || 0) * 100);

      const body: { typeId?: string; amount_cents: number | string; occurred_at: string; description?: string; workspaceId?: string } = {
        typeId: payload.typeId ?? payload.type,
        amount_cents: amountCents,
        occurred_at: occurredAt,
        description: payload.note,
      };

      if (payload.workspaceId) body.workspaceId = payload.workspaceId;

      const res = await api.createEntry(payload.workspaceId, body);
      const id = res?.id ?? `f-${Math.random().toString(16).slice(2)}`;

      // Update mock store so UI shows the new entry locally
      // invalidate entries cache so lists refresh on next load
      try { entriesCache.clear(); } catch (e) { void e; }
      return store.addFinanceEntry({ id, serviceId: payload.serviceId, amount: Number(payload.amount), date: occurredAt, note: payload.note });
    } catch (err) {
      // fallback to mock store
      return store.addFinanceEntry({ ...payload, id: `f-${Math.random().toString(16).slice(2)}` });
    }
  }, [store]);

  const removeEntry = useCallback(async (id: string) => {
    try {
      // if remote removal exists, call it (not implemented in mock)
      // invalidate cache
      entriesCache.clear();
    } catch (e) { void e; }
    store.removeFinanceEntry(id);
    return true;
  }, [store]);

  const listEntryTypes = useCallback(async (workspaceId?: string): Promise<FinanceEntryType[]> => {
    const key = workspaceId ?? "__default";
    if (entryTypesCache.has(key)) {
      return entryTypesCache.get(key)!;
    }

    const p = (async () => {
      try {
        const api = new FinanceApi(httpClient as unknown as import("@core/http/interfaces/http-client.interface").HttpClient);
        const rows = await api.listEntryTypes(workspaceId);
        if (Array.isArray(rows) && rows.length > 0) return rows;
      } catch (err) {
        // fallback to store/mock list
      }

      return [
        { id: "income", key: "income", name: "Income" },
        { id: "expense", key: "expense", name: "Expense" },
        { id: "fixed", key: "fixed", name: "Fixed" },
      ];
    })();

    entryTypesCache.set(key, p);
    return p;
  }, []);

  return useMemo(() => ({ listEntries, createEntry, removeEntry, listEntryTypes }), [listEntries, createEntry, removeEntry, listEntryTypes]);
}
