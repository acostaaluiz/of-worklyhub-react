export interface CompanyServiceModel {
  id: string;
  title: string;
  description?: string;
  durationMinutes?: number;
  priceCents?: number;
  capacity?: number;
  staffRequired?: number;
  tags?: string[];
  active?: boolean;
  createdAt: string;
}

export type CompanyServiceCreatePayload = Omit<CompanyServiceModel, "id" | "createdAt">;
