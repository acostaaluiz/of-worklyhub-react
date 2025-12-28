import type { PaymentStatusKey } from "./dashboard-payment-status.model";

export type DashboardSaleItemModel = {
  id: string;
  clientName: string;
  serviceName: string;
  dateTime: string;
  amount: number;
  status: PaymentStatusKey;
};
