export type PaymentStatusKey = "paid" | "pending" | "refunded";

export type DashboardPaymentStatusModel = {
  status: PaymentStatusKey;
  count: number;
  amount: number;
};
