import dayjs from "dayjs";
import { formatDateTime } from "@core/utils/mask";
import type { ScheduleStatus } from "@modules/schedule/services/schedules-api";
import type { ScheduleCategory } from "../../../interfaces/schedule-category.model";
import type {
  InventoryItemLine,
  ScheduleEvent,
} from "../../../interfaces/schedule-event.model";
import { getStatusColorWithOverrides } from "../../../constants/colors";
import { escapeHtml, normalizeCssColor } from "./schedule-calendar.factory";
import type { ScheduleEventDraft } from "../schedule-event-modal/schedule-event-modal.form.types";
import type {
  EventCategoryRef,
  EventInventoryRef,
  EventServiceRef,
  EventWorkerRef,
  ScheduleEventExtended,
  TuiScheduleEvent,
} from "./schedule-calendar.component.types";

type BuildScheduleEventDraftInput = {
  id?: string;
  title?: string | null;
  description?: string | null;
  categoryId?: string | null;
  category?: EventCategoryRef | null;
  date?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  durationMinutes?: number | null;
  services?: EventServiceRef[] | null;
  workers?: EventWorkerRef[] | null;
  inventoryInputs?: EventInventoryRef[] | null;
  inventoryOutputs?: EventInventoryRef[] | null;
  statusId?: string | null;
  categories: ScheduleCategory[];
};

type BuildTuiEventsInput = {
  categories: ScheduleCategory[];
  filteredEvents: ScheduleEvent[];
  inventoryNameMap: Map<string, string>;
  statuses?: ScheduleStatus[] | null;
  statusColorOverrides?: Record<string, string> | null;
  themeText?: string;
  themeOnPrimary?: string;
  themePrimary?: string;
  onEditDraft: (draft: ScheduleEventDraft & { id?: string }) => void;
};

type BuildTuiEventsOutput = {
  events: TuiScheduleEvent[];
  eventColorMap: Map<string, string>;
};

const normalizeRaw = (value?: string | null): string => String(value ?? "").trim();
const normalizeKey = (value?: string | null): string => normalizeRaw(value).toLowerCase();

function toInventoryItemLine(line: EventInventoryRef): InventoryItemLine | null {
  const iid =
    line?.itemId ??
    line?.id ??
    line?.inventoryItemId ??
    line?.item_id ??
    line?.productId;
  if (!iid) return null;
  const quantity =
    typeof line?.quantity === "number"
      ? line.quantity
      : line?.quantity
      ? Number(line.quantity)
      : undefined;
  const out: InventoryItemLine = {
    itemId: String(iid),
  };
  if (quantity !== undefined) out.quantity = quantity;
  return out;
}

function resolveDraftCategoryId(input: {
  categoryId?: string | null;
  category?: EventCategoryRef | null;
  categories: ScheduleCategory[];
}): string {
  const byEvent = normalizeRaw(input.categoryId);
  const byRawId = normalizeRaw(input.category?.id);
  const byRawCode = normalizeRaw(input.category?.code);
  if (byEvent) return byEvent;
  if (byRawId) return byRawId;
  if (byRawCode) {
    const codeKey = normalizeKey(byRawCode);
    const found = input.categories.find((c) => {
      const categoryCodeKey = normalizeKey(c.code);
      const categoryIdKey = normalizeKey(c.id);
      return categoryCodeKey === codeKey || categoryIdKey === codeKey;
    });
    if (found?.id) return String(found.id);
  }
  return input.categories[0]?.id ? String(input.categories[0].id) : "";
}

function buildInventorySummary(
  lines: EventInventoryRef[] | null | undefined,
  inventoryNameMap: Map<string, string>
): string {
  if (!Array.isArray(lines)) return "";
  return lines
    .map((line) => {
      const iid = line?.itemId ?? line?.id ?? "";
      if (!iid) return null;
      const name = inventoryNameMap.get(String(iid)) ?? String(iid);
      const qty =
        line?.quantity && Number(line.quantity) !== 1
          ? ` x${Number(line.quantity)}`
          : "";
      return `${name}${qty}`;
    })
    .filter((line): line is string => Boolean(line))
    .join(", ");
}

function buildStatusColorMap(
  statuses?: ScheduleStatus[] | null
): Map<string, string> {
  const map = new Map<string, string>();
  (statuses ?? []).forEach((status) => {
    const key = normalizeKey(status.code);
    const color = normalizeCssColor(status.color);
    if (!key || !color) return;
    map.set(key, color);
  });
  return map;
}

function readEventCategoryLabel(event: ScheduleEventExtended): string {
  const raw = event as unknown as Record<string, unknown>;
  const value = raw["categoryLabel"];
  if (typeof value !== "string") return "";
  return value;
}

export function buildScheduleEventDraft(
  input: BuildScheduleEventDraftInput
): ScheduleEventDraft & { id?: string } {
  const categoryId = resolveDraftCategoryId({
    categoryId: input.categoryId,
    category: input.category,
    categories: input.categories,
  });

  return {
    id: input.id,
    title: input.title ?? "",
    description: input.description ?? undefined,
    categoryId,
    date: input.date ?? "",
    startTime: input.startTime ?? "09:00",
    endTime: input.endTime ?? "09:30",
    durationMinutes: input.durationMinutes ?? undefined,
    serviceIds: Array.isArray(input.services)
      ? input.services
          .map((service) => service.serviceId ?? service.id ?? null)
          .filter((serviceId): serviceId is string => Boolean(serviceId))
      : undefined,
    employeeIds: Array.isArray(input.workers)
      ? input.workers
          .map((worker) => worker.userUid ?? worker.id ?? null)
          .filter((workerId): workerId is string => Boolean(workerId))
      : undefined,
    inventoryInputs: Array.isArray(input.inventoryInputs)
      ? input.inventoryInputs
          .map((line) => toInventoryItemLine(line))
          .filter((line): line is InventoryItemLine => Boolean(line))
      : undefined,
    inventoryOutputs: Array.isArray(input.inventoryOutputs)
      ? input.inventoryOutputs
          .map((line) => toInventoryItemLine(line))
          .filter((line): line is InventoryItemLine => Boolean(line))
      : undefined,
    totalPriceCents: Array.isArray(input.services)
      ? input.services.reduce(
          (acc: number, service: EventServiceRef) =>
            acc + Number(service.priceCents ?? 0),
          0
        )
      : undefined,
    statusId: input.statusId ?? undefined,
  };
}

export function buildTuiEvents(input: BuildTuiEventsInput): BuildTuiEventsOutput {
  const out: TuiScheduleEvent[] = [];
  const eventColorMap = new Map<string, string>();
  const statusColorsByCode = buildStatusColorMap(input.statuses);
  const textColor = input.themeOnPrimary || input.themeText || "#ffffff";
  const themePrimary = input.themePrimary || "";

  const categoriesById = new Map<string, ScheduleCategory>();
  const categoriesByIdKey = new Map<string, ScheduleCategory>();
  const categoriesByCode = new Map<string, ScheduleCategory>();
  const categoriesByLabel = new Map<string, ScheduleCategory>();
  input.categories.forEach((categoryItem) => {
    const id = normalizeRaw(categoryItem.id);
    const idKey = normalizeKey(categoryItem.id);
    const code = normalizeKey(categoryItem.code);
    const label = normalizeKey(categoryItem.label);
    if (id) categoriesById.set(id, categoryItem);
    if (idKey) categoriesByIdKey.set(idKey, categoryItem);
    if (code) categoriesByCode.set(code, categoryItem);
    if (label) categoriesByLabel.set(label, categoryItem);
  });

  input.filteredEvents.forEach((scheduleEvent) => {
    const event = scheduleEvent as ScheduleEventExtended;
    const start = dayjs(`${scheduleEvent.date}T${scheduleEvent.startTime}`).toDate();
    const end = dayjs(`${scheduleEvent.date}T${scheduleEvent.endTime}`).toDate();
    if (!start || Number.isNaN(start.getTime())) return;
    if (!end || Number.isNaN(end.getTime())) return;

    const rawCategory: EventCategoryRef | null = event.category ?? null;
    const eventCategoryId = normalizeRaw(scheduleEvent.categoryId);
    const eventCategoryIdKey = normalizeKey(scheduleEvent.categoryId);
    const eventCategoryCode = normalizeKey(scheduleEvent.categoryCode);
    const rawCategoryId = normalizeRaw(rawCategory?.id);
    const rawCategoryIdKey = normalizeKey(rawCategory?.id);
    const rawCategoryCode = normalizeKey(rawCategory?.code);
    const rawCategoryLabel = normalizeKey(rawCategory?.label);
    const eventCategoryLabel = normalizeKey(readEventCategoryLabel(event));

    const resolvedCategory =
      categoriesById.get(eventCategoryId) ??
      categoriesByIdKey.get(eventCategoryIdKey) ??
      categoriesById.get(rawCategoryId) ??
      categoriesByIdKey.get(rawCategoryIdKey) ??
      categoriesByCode.get(eventCategoryCode) ??
      categoriesByCode.get(rawCategoryCode) ??
      categoriesByCode.get(eventCategoryIdKey) ??
      categoriesByLabel.get(rawCategoryLabel) ??
      categoriesByLabel.get(eventCategoryLabel);

    const resolvedCategoryId = resolvedCategory?.id
      ? String(resolvedCategory.id)
      : "";

    const rawCategoryColor =
      resolvedCategory?.color ??
      rawCategory?.color ??
      themePrimary ??
      "#1e70ff";
    const categoryColor =
      normalizeCssColor(rawCategoryColor) ??
      normalizeCssColor(themePrimary) ??
      "#1e70ff";

    const statusCode = event?.status?.code ?? null;
    const normalizedStatusCode = normalizeKey(statusCode);
    const statusColorRaw = statusCode
      ? getStatusColorWithOverrides(statusCode, input.statusColorOverrides) ??
        event?.status?.color ??
        statusColorsByCode.get(normalizedStatusCode)
      : event?.status?.color;
    const statusColor = normalizeCssColor(statusColorRaw) ?? "#94A3B8";

    const startText = formatDateTime(start);
    const endText = dayjs(end).format("HH:mm");
    const inventoryInputsRaw = event.inventoryInputs ?? null;
    const inventoryOutputsRaw = event.inventoryOutputs ?? null;
    const inventoryInputsText = buildInventorySummary(
      inventoryInputsRaw,
      input.inventoryNameMap
    );
    const inventoryOutputsText = buildInventorySummary(
      inventoryOutputsRaw,
      input.inventoryNameMap
    );
    const bodyHtml = `
      <div style="background:var(--color-surface);color:var(--color-text);border:1px solid var(--color-border);box-shadow:var(--shadow-md);border-radius:8px;padding:12px;width:min(250px,calc(100vw - 24px));font-family:inherit;overflow:hidden;">
        <div style="font-weight:800;margin-bottom:6px;color:var(--color-text);">${escapeHtml(scheduleEvent.title)}</div>
        <div style="font-size:12px;color:var(--color-text-muted);margin-bottom:8px;">${startText} â€” ${endText}</div>
        <div style="font-size:13px;color:var(--color-text);">${escapeHtml(scheduleEvent.description ?? "")}</div>
      </div>
    `;

    const preferCategory = (color?: string | undefined) =>
      color && String(color).trim() ? color : undefined;
    const cardColor = preferCategory(categoryColor) ?? statusColor;

    const draft = buildScheduleEventDraft({
      id: scheduleEvent.id,
      title: scheduleEvent.title ?? "",
      description: event.description ?? undefined,
      categoryId: scheduleEvent.categoryId,
      category: event.category ?? null,
      date: scheduleEvent.date,
      startTime: scheduleEvent.startTime ?? "09:00",
      endTime: scheduleEvent.endTime ?? "09:30",
      durationMinutes: event.durationMinutes ?? undefined,
      services: event.services ?? null,
      workers: event.workers ?? null,
      inventoryInputs: inventoryInputsRaw ?? null,
      inventoryOutputs: inventoryOutputsRaw ?? null,
      statusId: event.status?.id,
      categories: input.categories,
    });

    const mappedEvent: TuiScheduleEvent = {
      id: scheduleEvent.id,
      calendarId: String(
        resolvedCategoryId ||
          eventCategoryId ||
          rawCategoryId ||
          rawCategoryCode ||
          eventCategoryCode ||
          "default"
      ),
      title: scheduleEvent.title,
      category: "time",
      start,
      end,
      backgroundColor: cardColor,
      borderColor: cardColor,
      color: textColor,
      dragBackgroundColor: cardColor,
      customStyle: { fontWeight: "700" },
      body: bodyHtml,
      raw: {
        description: scheduleEvent.description,
        date: scheduleEvent.date,
        startTime: scheduleEvent.startTime,
        endTime: scheduleEvent.endTime,
        services: event.services ?? null,
        workers: event.workers ?? null,
        inventoryInputs: inventoryInputsRaw ?? null,
        inventoryOutputs: inventoryOutputsRaw ?? null,
        inventoryInputsText,
        inventoryOutputsText,
        _bodyHtml: bodyHtml,
        status: event.status ?? null,
        category: resolvedCategory
          ? {
              id: String(resolvedCategory.id),
              code: resolvedCategory.code ?? "",
              label: resolvedCategory.label,
              color: resolvedCategory.color ?? undefined,
            }
          : event.category ?? null,
        statusColor,
        categoryColor,
      },
      onEdit: () => {
        try {
          input.onEditDraft(draft);
        } catch (error) {
          void error;
        }
      },
    };

    out.push(mappedEvent);
    const id = mappedEvent.id as string;
    const bg = normalizeCssColor(
      mappedEvent.backgroundColor ||
        mappedEvent.raw?.categoryColor ||
        mappedEvent.raw?.statusColor ||
        ""
    );
    if (id && bg) {
      eventColorMap.set(id, bg as string);
    }
  });

  return { events: out, eventColorMap };
}
