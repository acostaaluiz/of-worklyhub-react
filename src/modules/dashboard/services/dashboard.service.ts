import dayjs from "dayjs";

import type { DashboardQueryModel } from "../interfaces/dashboard-query.model";
import type { DashboardKpiModel } from "../interfaces/dashboard-kpi.model";
import type { DashboardSeriesPointModel } from "../interfaces/dashboard-series.model";
import type { DashboardServiceSalesModel } from "../interfaces/dashboard-service-sales.model";
import type { DashboardPaymentStatusModel } from "../interfaces/dashboard-payment-status.model";
import type { DashboardClientRankModel } from "../interfaces/dashboard-client-rank.model";
import type { DashboardSaleItemModel } from "../interfaces/dashboard-sale-item.model";

export type DashboardResponse = {
  kpis: DashboardKpiModel[];
  revenueSeries: DashboardSeriesPointModel[];
  serviceBreakdown: DashboardServiceSalesModel[];
  paymentStatus: DashboardPaymentStatusModel[];
  topClients: DashboardClientRankModel[];
  recentSales: DashboardSaleItemModel[];
};

const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));

const money = (base: number, t: number) => {
  const wave = Math.sin(t / 2.8) * 0.18 + Math.cos(t / 4.6) * 0.12;
  const jitter = Math.sin(t * 1.7) * 0.06;
  return Math.round(base * (1 + wave + jitter));
};

export class DashboardService {
  async getDashboard(query: DashboardQueryModel): Promise<DashboardResponse> {
    const from = dayjs(query.from, "YYYY-MM-DD");
    const to = dayjs(query.to, "YYYY-MM-DD");

    const steps =
      query.groupBy === "month"
        ? clamp(to.diff(from, "month") + 1, 1, 24)
        : query.groupBy === "week"
          ? clamp(to.diff(from, "week") + 1, 1, 32)
          : clamp(to.diff(from, "day") + 1, 1, 62);

    const revenueSeries: DashboardSeriesPointModel[] = Array.from({
      length: steps,
    }).map((_, i) => {
      const key =
        query.groupBy === "month"
          ? from.add(i, "month").format("YYYY-MM")
          : query.groupBy === "week"
            ? from.add(i, "week").startOf("week").format("YYYY-MM-DD")
            : from.add(i, "day").format("YYYY-MM-DD");

      const label =
        query.groupBy === "month"
          ? from.add(i, "month").format("MMM")
          : query.groupBy === "week"
            ? from.add(i, "week").startOf("week").format("DD/MM")
            : from.add(i, "day").format("DD");

      const rev = money(4200, i + steps);
      const profit = Math.round(rev * 0.62);

      return { key, label, revenue: rev, profit };
    });

    const totalRevenue = revenueSeries.reduce((acc, p) => acc + p.revenue, 0);
    const totalProfit = revenueSeries.reduce((acc, p) => acc + p.profit, 0);
    const orders = Math.round(steps * 18 + 42);
    const avgTicket = totalRevenue / Math.max(1, orders);

    const kpis: DashboardKpiModel[] = [
      {
        id: "revenue",
        label: "Gross revenue",
        value: totalRevenue,
        changePct: 8.2,
      },
      { id: "profit", label: "Net profit", value: totalProfit, changePct: 5.6 },
      { id: "ticket", label: "Avg ticket", value: avgTicket, changePct: 2.1 },
      {
        id: "orders",
        label: "Services completed",
        value: orders,
        changePct: 3.4,
      },
    ];

    const serviceBreakdown: DashboardServiceSalesModel[] = [
      {
        serviceId: "srv-1",
        serviceName: "Consultation",
        count: 92,
        revenue: 9200,
      },
      {
        serviceId: "srv-2",
        serviceName: "Maintenance",
        count: 64,
        revenue: 12800,
      },
      {
        serviceId: "srv-3",
        serviceName: "Installation",
        count: 38,
        revenue: 17100,
      },
      { serviceId: "srv-4", serviceName: "Audit", count: 21, revenue: 10500 },
      { serviceId: "srv-5", serviceName: "Support", count: 74, revenue: 7400 },
    ].sort((a, b) => b.revenue - a.revenue);

    const paymentStatus: DashboardPaymentStatusModel[] = [
      { status: "paid", count: 164, amount: Math.round(totalRevenue * 0.74) },
      { status: "pending", count: 41, amount: Math.round(totalRevenue * 0.22) },
      { status: "refunded", count: 6, amount: Math.round(totalRevenue * 0.04) },
    ];

    const topClients: DashboardClientRankModel[] = [
      {
        clientId: "cl-1",
        clientName: "Northwind LLC",
        ordersCount: 18,
        totalSpent: 12450,
        avgTicket: 691.67,
        lastPurchase: dayjs().subtract(3, "day").format("YYYY-MM-DD"),
      },
      {
        clientId: "cl-2",
        clientName: "Blue River Co.",
        ordersCount: 14,
        totalSpent: 9820,
        avgTicket: 701.43,
        lastPurchase: dayjs().subtract(6, "day").format("YYYY-MM-DD"),
      },
      {
        clientId: "cl-3",
        clientName: "Atlas Partners",
        ordersCount: 11,
        totalSpent: 8140,
        avgTicket: 740,
        lastPurchase: dayjs().subtract(10, "day").format("YYYY-MM-DD"),
      },
      {
        clientId: "cl-4",
        clientName: "Orbit Studio",
        ordersCount: 9,
        totalSpent: 6760,
        avgTicket: 751.11,
        lastPurchase: dayjs().subtract(12, "day").format("YYYY-MM-DD"),
      },
    ];

    const recentSales: DashboardSaleItemModel[] = Array.from({ length: 8 }).map(
      (_, i) => {
        const status =
          i % 7 === 0 ? "pending" : i % 11 === 0 ? "refunded" : "paid";
        const amount = money(240, i + 9) * (i % 3 === 0 ? 2 : 1);

        return {
          id: `sale-${Date.now()}-${i}`,
          clientName: [
            "Northwind LLC",
            "Blue River Co.",
            "Atlas Partners",
            "Orbit Studio",
          ][i % 4],
          serviceName: [
            "Maintenance",
            "Installation",
            "Consultation",
            "Audit",
            "Support",
          ][i % 5],
          dateTime: dayjs()
            .subtract(i * 6, "hour")
            .format("YYYY-MM-DD HH:mm"),
          amount,
          status,
        };
      }
    );

    return {
      kpis,
      revenueSeries,
      serviceBreakdown,
      paymentStatus,
      topClients,
      recentSales,
    };
  }
}
