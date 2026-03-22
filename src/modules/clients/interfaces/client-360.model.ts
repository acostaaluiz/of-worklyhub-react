export type Client360Source = "backend" | "aggregated";

export type Client360Module = "clients" | "schedule" | "work-order" | "finance";

export type ClientProfile = {
  id: string;
  workspaceId: string;
  displayName: string;
  email?: string | null;
  phone?: string | null;
  firstSeenAt?: string | null;
  lastInteractionAt?: string | null;
  totalAppointments: number;
  totalWorkOrders: number;
  totalFinanceEntries: number;
  totalBilledCents: number;
  tags?: string[];
};

export type ClientTimelineItem = {
  id: string;
  clientId: string;
  workspaceId: string;
  module: Client360Module;
  eventAt: string;
  title: string;
  description?: string | null;
  status?: string | null;
  amountCents?: number | null;
  referenceId?: string | null;
};

export type Client360PaginationMeta = {
  limit: number;
  offset: number;
  total: number;
  hasMore: boolean;
  nextOffset: number | null;
};

export type Client360Pagination = {
  profiles: Client360PaginationMeta;
  timeline: Client360PaginationMeta;
};

export type Client360Bundle = {
  generatedAt: string;
  source: Client360Source;
  profiles: ClientProfile[];
  timeline: ClientTimelineItem[];
  pagination?: Client360Pagination;
};
