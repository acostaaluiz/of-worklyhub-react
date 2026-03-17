import React from "react";
import { Button, Input, Modal, Select, Segmented, Typography, Tag, message } from "antd";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import {
  ChevronLeft,
  ChevronRight,
  X,
  ClipboardList,
  Clock3,
  UserRoundPlus,
  BriefcaseBusiness,
  PackageMinus,
  PackagePlus,
  CheckCircle2,
  BadgeDollarSign,
} from "lucide-react";
import { formatMoneyFromCents } from "@core/utils/mask";
import { i18n as appI18n } from "@core/i18n";
import { BaseComponent } from "@shared/base/base.component";
import DurationTimeSelector from "@shared/ui/components/duration-time-selector/duration-time-selector.component";
import SelectCardModal from "@shared/ui/components/select-card-modal/select-card-modal.component";
import type { InventoryItemLine } from "@modules/schedule/interfaces/schedule-event.model";

import type {
  DayPart,
  ScheduleEventDraft,
  ScheduleEventModalSettings,
  ScheduleEventModalProps,
} from "./schedule-event-modal.form.types";
import {
  ModalBody,
  DateStrip,
  DateRail,
  DateChip,
  RoundIconButton,
  Separator,
  Section,
  TimeTabsRow,
  SlotsRow,
  SlotsRail,
  TimeChip,
  FormStack,
  FieldRow,
  FieldRow3,
  InlineRow,
  SlotCard,
  SlotLeft,
  SlotRight,
  FooterBar,
  FooterTotal,
  ContinueWrap,
  ModalOverrides,
  StatusRow,
  StatusCard,
  Label,
} from "./schedule-calendar.component.styles";

type DurationOption = { label: string; minutes: number };

const DURATION_OPTIONS: DurationOption[] = [
  { label: "15 min", minutes: 15 },
  { label: "25 min", minutes: 25 },
  { label: "30 min", minutes: 30 },
  { label: "45 min", minutes: 45 },
  { label: "60 min", minutes: 60 },
];
const IS_DEV_ENV = import.meta.env.MODE !== "production";
const DEFAULT_MODAL_SETTINGS: ScheduleEventModalSettings = {
  defaultDurationMinutes: 30,
  defaultDayPart: "morning",
  defaultCategoryId: null,
  requireDescription: false,
  requireService: false,
  requireEmployee: false,
  autoSelectFirstService: false,
  autoSelectFirstEmployee: false,
  enableInventoryTracking: true,
  confirmationPolicy: "required",
  reminderEnabled: true,
  reminderLeadMinutes: 120,
  noShowPolicy: "none",
  noShowFeePercent: 0,
};

function addMinutes(date: Dayjs, minutes: number) {
  return date.add(minutes, "minute");
}

function inferDayPartFromTime(time?: string): DayPart {
  if (!time) return "morning";
  const [hoursRaw] = time.split(":");
  const hours = Number(hoursRaw);
  if (!Number.isFinite(hours)) return "morning";
  if (hours < 12) return "morning";
  if (hours < 17) return "afternoon";
  return "evening";
}

function getWeekDays(anchor: Dayjs) {
  const start = anchor.startOf("week");
  return Array.from({ length: 7 }).map((_, i) => start.add(i, "day"));
}

function buildSlots(day: Dayjs, part: DayPart) {
  const ranges: Record<DayPart, { startH: number; endH: number }> = {
    morning: { startH: 9, endH: 12 },
    afternoon: { startH: 12, endH: 17 },
    evening: { startH: 17, endH: 21 },
  };

  const { startH, endH } = ranges[part];
  const slots: Array<{ label: string; value: string; disabled: boolean }> = [];

  const now = dayjs();
  for (let h = startH; h < endH; h++) {
    for (const m of [0, 15, 30, 45]) {
      const label = dayjs().hour(h).minute(m).format("HH:mm");
      const slotDate = day.hour(h).minute(m).second(0).millisecond(0);
      const disabled =
        day.isSame(now, "day") && slotDate.isBefore(now.add(1, "minute"));
      slots.push({ label, value: label, disabled });
    }
  }

  return slots;
}

interface ScheduleEventModalState {
  isLoading: boolean;
  error?: DataValue;
  weekAnchor: Dayjs;
  selectedDay: Dayjs;
  dayPart: DayPart;
  slotPage: number;
  selectedTime?: string;
  title: string;
  description: string;
  categoryId: string;
  durationMinutes: number;
  // price stored in cents
  priceCents: number;
  selectedServiceIds: string[];
  selectedEmployeeIds: string[];
  selectedInventoryInputs: InventoryItemLine[];
  selectedInventoryOutputs: InventoryItemLine[];
  selectedStatusId?: string | null;
  selectModalOpen?: "services" | "employees" | "inventory-in" | "inventory-out" | null;
}

export class ScheduleEventModal extends BaseComponent<ScheduleEventModalProps, ScheduleEventModalState> {
  private get modalSettings(): ScheduleEventModalSettings {
    return {
      ...DEFAULT_MODAL_SETTINGS,
      ...(this.props.settings ?? {}),
    };
  }

  private getDefaultCategoryId(categories: Array<{ id: string; label: string }>): string {
    const preferred = this.modalSettings.defaultCategoryId;
    if (preferred && categories.some((category) => category.id === preferred)) {
      return preferred;
    }
    return categories?.[0]?.id ?? "";
  }

  private getDefaultServiceIds(): string[] {
    if (!this.modalSettings.autoSelectFirstService) return [];
    const firstId = this.props.availableServices?.[0]?.id;
    return firstId ? [firstId] : [];
  }

  private getDefaultEmployeeIds(): string[] {
    if (!this.modalSettings.autoSelectFirstEmployee) return [];
    const firstId = this.props.availableEmployees?.[0]?.id;
    return firstId ? [firstId] : [];
  }

  private getDefaultStatusId(): string | undefined {
    const statuses = this.props.statuses ?? [];
    if (!statuses.length) return undefined;

    const preferredCode =
      this.modalSettings.confirmationPolicy === "optional"
        ? "confirmed"
        : "pending";

    const byCode = statuses.find(
      (status) => (status.code ?? "").toLowerCase() === preferredCode
    );
    if (byCode?.id) return byCode.id;

    return statuses[0]?.id ?? undefined;
  }

  private getServiceTotalCents(serviceIds: string[]): number {
    if (!serviceIds.length) return 0;
    const serviceMap = new Map(
      (this.props.availableServices ?? []).map((service) => [
        service.id,
        service.priceCents ?? 0,
      ])
    );
    return serviceIds.reduce((acc, serviceId) => acc + (serviceMap.get(serviceId) ?? 0), 0);
  }

  constructor(props: ScheduleEventModalProps) {
    super(props);

    const { categories, initialDate } = props;
    const base = initialDate ? dayjs(initialDate, "YYYY-MM-DD") : dayjs();
    const defaultServiceIds = this.getDefaultServiceIds();
    const defaultEmployeeIds = this.getDefaultEmployeeIds();

    this.state = {
      isLoading: false,
      error: undefined,
      weekAnchor: base,
      selectedDay: base,
      dayPart: this.modalSettings.defaultDayPart,
      slotPage: 0,
      selectedTime: undefined,
      title: "",
      description: "",
      categoryId: this.getDefaultCategoryId(categories),
      durationMinutes: this.modalSettings.defaultDurationMinutes,
      priceCents: this.getServiceTotalCents(defaultServiceIds),
      selectedServiceIds: defaultServiceIds,
      selectedEmployeeIds: defaultEmployeeIds,
      selectedInventoryInputs: [],
      selectedInventoryOutputs: [],
      selectedStatusId: this.getDefaultStatusId(),
      selectModalOpen: null,
    };
  }

  componentDidMount(): void {
    super.componentDidMount();
  }

  componentDidUpdate(prevProps: ScheduleEventModalProps): void {
    const { open, initialDate, initialStartTime, categories } = this.props;

    if (open && !prevProps.open && !this.props.initialDraft) {
      const base = initialDate ? dayjs(initialDate, "YYYY-MM-DD") : dayjs();
      const defaultServiceIds = this.getDefaultServiceIds();
      const defaultEmployeeIds = this.getDefaultEmployeeIds();
      const dayPart = initialStartTime
        ? inferDayPartFromTime(initialStartTime)
        : this.modalSettings.defaultDayPart;

      this.setSafeState({
        weekAnchor: base,
        selectedDay: base,
        selectedTime: initialStartTime ?? undefined,
        dayPart,
        slotPage: 0,
        title: "",
        description: "",
        categoryId: this.getDefaultCategoryId(categories),
        durationMinutes: this.modalSettings.defaultDurationMinutes,
        priceCents: this.getServiceTotalCents(defaultServiceIds),
        selectedServiceIds: defaultServiceIds,
        selectedEmployeeIds: defaultEmployeeIds,
        selectedInventoryInputs: [],
        selectedInventoryOutputs: [],
        selectedStatusId: this.getDefaultStatusId(),
      });
    }

    // if opening in edit mode with an initialDraft, populate fields from it
    if (open && this.props.initialDraft && this.props.initialDraft !== prevProps.initialDraft) {
      const d = this.props.initialDraft;
      const base = dayjs(d.date, "YYYY-MM-DD");
      const dayPart = d.startTime
        ? inferDayPartFromTime(d.startTime)
        : this.modalSettings.defaultDayPart;

      const resolvedCategoryId = d.categoryId ?? this.getDefaultCategoryId(categories);
      const resolvedServiceIds = d.serviceIds ?? [];

      this.setSafeState({
        weekAnchor: base,
        selectedDay: base,
        selectedTime: d.startTime ?? undefined,
        dayPart,
        slotPage: 0,
        title: d.title ?? "",
        description: d.description ?? "",
        categoryId: resolvedCategoryId,
        durationMinutes: d.durationMinutes ?? this.modalSettings.defaultDurationMinutes,
        priceCents: d.totalPriceCents ?? this.getServiceTotalCents(resolvedServiceIds),
        selectedServiceIds: resolvedServiceIds,
        selectedEmployeeIds: d.employeeIds ?? [],
        selectedInventoryInputs: d.inventoryInputs ?? [],
        selectedInventoryOutputs: d.inventoryOutputs ?? [],
        selectedStatusId: d.statusId ?? this.getDefaultStatusId(),
      });
    }

    if (open && !this.props.initialDraft && this.props.statuses !== prevProps.statuses) {
      this.setSafeState({
        selectedStatusId: this.getDefaultStatusId(),
      });
    }

    if (categories !== prevProps.categories) {
      // Avoid overwriting categoryId when opening the modal to edit an existing event
      // If an initialDraft is present we already populated categoryId from it.
      // Also avoid resetting when state already contains a categoryId (preserve user's selection).
      if (!this.props.initialDraft && !this.state.categoryId) {
        this.setSafeState({ categoryId: this.getDefaultCategoryId(categories) });
      }
    }
  }

  private get weekDays() {
    return getWeekDays(this.state.weekAnchor);
  }

  private get slots() {
    return buildSlots(this.state.selectedDay, this.state.dayPart);
  }

  private get visibleSlots() {
    const pageSize = 6;
    const from = this.state.slotPage * pageSize;
    return this.slots.slice(from, from + pageSize);
  }

  private get maxSlotPage() {
    const pageSize = 6;
    return Math.max(0, Math.ceil(this.slots.length / pageSize) - 1);
  }

  private get headerLabel() {
    return this.state.selectedDay.format("MMMM YYYY");
  }

  private get selectedStart() {
    if (!this.state.selectedTime) return null;
    const [h, m] = this.state.selectedTime.split(":").map((v: string) => Number(v));
    return this.state.selectedDay.hour(h).minute(m).second(0).millisecond(0);
  }

  private get selectedEnd() {
    if (!this.selectedStart) return null;
    return addMinutes(this.selectedStart, this.state.durationMinutes);
  }

  private upsertInventoryLines(current: InventoryItemLine[], ids: string[]) {
    const map = new Map<string, InventoryItemLine>();
    current.forEach((l) => {
      if (l?.itemId) map.set(l.itemId, { itemId: l.itemId, quantity: l.quantity ?? 1 });
    });
    ids.forEach((id) => {
      if (!map.has(id)) map.set(id, { itemId: id, quantity: 1 });
    });
    return Array.from(map.values());
  }

  private inventoryLabel(line: InventoryItemLine) {
    const item = (this.props.availableInventoryItems ?? []).find((i) => i.id === line.itemId);
    const qty = line.quantity && line.quantity !== 1 ? ` x${line.quantity}` : "";
    return `${item?.name ?? line.itemId}${qty}`;
  }

  private get canConfirm() {
    const hasDescription = this.state.description.trim().length > 0;
    const hasService = this.state.selectedServiceIds.length > 0;
    const hasEmployee = this.state.selectedEmployeeIds.length > 0;

    return Boolean(
      this.state.categoryId &&
      this.state.title.trim() &&
      this.selectedStart &&
      this.selectedEnd &&
      (!this.modalSettings.requireDescription || hasDescription) &&
      (!this.modalSettings.requireService || hasService) &&
      (!this.modalSettings.requireEmployee || hasEmployee)
    );
  }

  private handleConfirm = () => {
    const { onConfirm } = this.props;

    if (!this.selectedStart || !this.selectedEnd || !this.state.categoryId) return;

    if (this.modalSettings.requireDescription && this.state.description.trim().length === 0) {
      message.info(
        appI18n.t("legacyInline.schedule.presentation_components_schedule_event_modal_schedule_event_modal_component.k001")
      );
      return;
    }
    if (this.modalSettings.requireService && this.state.selectedServiceIds.length === 0) {
      message.info(
        appI18n.t("legacyInline.schedule.presentation_components_schedule_event_modal_schedule_event_modal_component.k002")
      );
      return;
    }
    if (this.modalSettings.requireEmployee && this.state.selectedEmployeeIds.length === 0) {
      message.info(
        appI18n.t("legacyInline.schedule.presentation_components_schedule_event_modal_schedule_event_modal_component.k003")
      );
      return;
    }

    const draft: ScheduleEventDraft = {
      title: this.state.title.trim(),
      description: this.state.description.trim() ? this.state.description.trim() : undefined,
      categoryId: this.state.categoryId,
      date: this.selectedStart.format("YYYY-MM-DD"),
      startTime: this.selectedStart.format("HH:mm"),
      endTime: this.selectedEnd.format("HH:mm"),
      durationMinutes: this.state.durationMinutes,
      serviceIds: this.state.selectedServiceIds.length ? this.state.selectedServiceIds.slice() : undefined,
      employeeIds: this.state.selectedEmployeeIds.length ? this.state.selectedEmployeeIds.slice() : undefined,
      inventoryInputs: this.state.selectedInventoryInputs.length ? this.state.selectedInventoryInputs.map((l) => ({ ...l })) : undefined,
      inventoryOutputs: this.state.selectedInventoryOutputs.length ? this.state.selectedInventoryOutputs.map((l) => ({ ...l })) : undefined,
      totalPriceCents: this.state.priceCents,
      statusId: this.state.selectedStatusId ?? undefined,
    };

    onConfirm(draft);
  };

  private get whenLabel() {
    if (!this.selectedStart || !this.selectedEnd) {
      return appI18n.t("legacyInline.schedule.presentation_components_schedule_event_modal_schedule_event_modal_component.k004");
    }
    return `${this.selectedStart.format("ddd, MMM D")} · ${this.selectedStart.format("HH:mm")} - ${this.selectedEnd.format("HH:mm")}`;
  }

  private get categoryLabel() {
    return this.props.categories.find((c) => c.id === this.state.categoryId)?.label ?? "-";
  }

  protected renderView(): React.ReactNode {
    const { open, onClose } = this.props;
    const selectedStatus = (this.props.statuses ?? []).find(
      (status) => status.id === this.state.selectedStatusId
    );
    const isExecutionCompletedStatus = (() => {
      if (!selectedStatus) return false;
      const code = (selectedStatus.code ?? "").toLowerCase();
      const label = (selectedStatus.label ?? "").toLowerCase();
      return (
        code.includes("complete") ||
        code.includes("done") ||
        code.includes("finish") ||
        code.includes("close") ||
        label.includes("completed") ||
        label.includes("concl")
      );
    })();

    // available services / employees are accessed directly from props where needed

    return (
      <ModalOverrides>
        <Modal
          open={open}
          onCancel={onClose}
          footer={null}
          centered
          width={1040}
          closeIcon={<X size={18} />}
          className="wh-schedule-modal"
          styles={{
            header: { background: "transparent" },
            body: { paddingTop: "var(--space-4)" },
            footer: { background: "transparent" },
          }}
          title={<Typography.Title level={3} style={{ margin: 0 }}>{this.headerLabel}</Typography.Title>}
        >
          <ModalBody>
            <Section>
              <DateStrip>
                <RoundIconButton
                  onClick={() => this.setSafeState({ weekAnchor: this.state.weekAnchor.subtract(7, "day") })}
                  aria-label={appI18n.t("legacyInline.schedule.presentation_components_schedule_event_modal_schedule_event_modal_component.k005")}
                >
                  <ChevronLeft size={18} />
                </RoundIconButton>

                <DateRail>
                  {this.weekDays.map((d) => {
                    const isActive = d.isSame(this.state.selectedDay, "day");
                    return (
                      <DateChip
                        key={d.format("YYYY-MM-DD")}
                        type="button"
                        $active={isActive}
                        onClick={() => this.setSafeState({ selectedDay: d })}
                      >
                        <span className="dow">{d.format("ddd")}</span>
                        <span className="day">{d.format("DD")}</span>
                        <span className="dot" />
                      </DateChip>
                    );
                  })}
                </DateRail>

                <RoundIconButton
                  onClick={() => this.setSafeState({ weekAnchor: this.state.weekAnchor.add(7, "day") })}
                  aria-label={appI18n.t("legacyInline.schedule.presentation_components_schedule_event_modal_schedule_event_modal_component.k006")}
                >
                  <ChevronRight size={18} />
                </RoundIconButton>
              </DateStrip>
            </Section>

            <Separator />

            <Section>
              <TimeTabsRow>
                <Segmented
                  value={this.state.dayPart}
                  onChange={(v) => this.setSafeState({ dayPart: v as DayPart, slotPage: 0, selectedTime: undefined })}
                  options={[
                    { label: appI18n.t("legacyInline.schedule.presentation_components_schedule_event_modal_schedule_event_modal_component.k007"), value: "morning" },
                    { label: appI18n.t("legacyInline.schedule.presentation_components_schedule_event_modal_schedule_event_modal_component.k008"), value: "afternoon" },
                    { label: appI18n.t("legacyInline.schedule.presentation_components_schedule_event_modal_schedule_event_modal_component.k009"), value: "evening" },
                  ]}
                />
              </TimeTabsRow>

              <SlotsRow>
                <RoundIconButton
                  onClick={() => this.setSafeState({ slotPage: Math.max(0, this.state.slotPage - 1) })}
                  disabled={this.state.slotPage === 0}
                  aria-label={appI18n.t("legacyInline.schedule.presentation_components_schedule_event_modal_schedule_event_modal_component.k010")}
                >
                  <ChevronLeft size={18} />
                </RoundIconButton>

                <SlotsRail>
                  {this.visibleSlots.map((s) => (
                    <TimeChip
                      key={s.value}
                      type="button"
                      $active={this.state.selectedTime === s.value}
                      disabled={s.disabled}
                      onClick={() => this.setSafeState({ selectedTime: s.value })}
                    >
                      {s.label}
                    </TimeChip>
                  ))}
                </SlotsRail>

                <RoundIconButton
                  onClick={() => this.setSafeState({ slotPage: Math.min(this.maxSlotPage, this.state.slotPage + 1) })}
                  disabled={this.state.slotPage === this.maxSlotPage}
                  aria-label={appI18n.t("legacyInline.schedule.presentation_components_schedule_event_modal_schedule_event_modal_component.k011")}
                >
                  <ChevronRight size={18} />
                </RoundIconButton>
              </SlotsRow>
            </Section>

            <Separator />

            <Section>
              <Label>{appI18n.t("legacyInline.schedule.presentation_components_schedule_event_modal_schedule_event_modal_component.k012")}</Label>

              <FormStack>
                <FieldRow3>
                  <Input
                    size="large"
                    value={this.state.title}
                    onChange={(e) => this.setSafeState({ title: e.target.value })}
                    placeholder={appI18n.t("legacyInline.schedule.presentation_components_schedule_event_modal_schedule_event_modal_component.k013")}
                    prefix={<ClipboardList size={16} />}
                  />

                  <Select
                    size="large"
                    value={this.state.categoryId || undefined}
                    onChange={(v) => this.setSafeState({ categoryId: v })}
                    placeholder={appI18n.t("legacyInline.schedule.presentation_components_schedule_event_modal_schedule_event_modal_component.k014")}
                    options={this.props.categories.map((c) => ({ value: c.id, label: c.label }))}
                  />
                </FieldRow3>

                <Input.TextArea
                  value={this.state.description}
                  onChange={(e) => this.setSafeState({ description: e.target.value })}
                  placeholder={
                    this.modalSettings.requireDescription
                      ? appI18n.t("legacyInline.schedule.presentation_components_schedule_event_modal_schedule_event_modal_component.k015")
                      : appI18n.t("legacyInline.schedule.presentation_components_schedule_event_modal_schedule_event_modal_component.k016")
                  }
                  rows={3}
                />

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Tag color="blue">
                    {this.modalSettings.confirmationPolicy === "required"
                      ? appI18n.t("legacyInline.schedule.presentation_components_schedule_event_modal_schedule_event_modal_component.k017")
                      : appI18n.t("legacyInline.schedule.presentation_components_schedule_event_modal_schedule_event_modal_component.k018")}
                  </Tag>
                  {this.modalSettings.reminderEnabled ? (
                    <Tag>{`${appI18n.t("legacyInline.schedule.presentation_components_schedule_event_modal_schedule_event_modal_component.k019")}: ${this.modalSettings.reminderLeadMinutes} ${appI18n.t("legacyInline.schedule.presentation_components_schedule_event_modal_schedule_event_modal_component.k020")}`}</Tag>
                  ) : (
                    <Tag>{appI18n.t("legacyInline.schedule.presentation_components_schedule_event_modal_schedule_event_modal_component.k021")}</Tag>
                  )}
                  {this.modalSettings.noShowPolicy === "charge" ? (
                    <Tag color="orange">{`${appI18n.t("legacyInline.schedule.presentation_components_schedule_event_modal_schedule_event_modal_component.k022")}: ${this.modalSettings.noShowFeePercent}%`}</Tag>
                  ) : this.modalSettings.noShowPolicy === "flag" ? (
                    <Tag color="gold">
                      {appI18n.t("legacyInline.schedule.presentation_components_schedule_event_modal_schedule_event_modal_component.k023")}
                    </Tag>
                  ) : (
                    <Tag>{appI18n.t("legacyInline.schedule.presentation_components_schedule_event_modal_schedule_event_modal_component.k024")}</Tag>
                  )}
                </div>

                <InlineRow>
                  {/* Status selector - only shown when editing an existing event */}
                  {this.props.initialDraft && this.props.initialDraft.id ? (
                    <div style={{ flex: 1, minWidth: 260 }}>
                      <Label>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                          <CheckCircle2 size={16} />
                          {appI18n.t("legacyInline.schedule.presentation_components_schedule_event_modal_schedule_event_modal_component.k025")}
                        </span>
                      </Label>
                      <div style={{ height: 6 }} />
                      <StatusRow>
                        {(this.props.statuses ?? []).map((s) => {
                          const active = this.state.selectedStatusId === s.id;
                          return (
                            <StatusCard
                              key={s.id}
                              type="button"
                              $active={active}
                              onClick={() => this.setSafeState({ selectedStatusId: s.id })}
                              aria-pressed={active}
                            >
                              <div style={{ fontWeight: 700, fontSize: 13 }}>{s.label}</div>
                            </StatusCard>
                          );
                        })}
                      </StatusRow>
                      {isExecutionCompletedStatus ? (
                        <div
                          style={{
                            marginTop: 10,
                            padding: "8px 10px",
                            border: "1px solid color-mix(in srgb, var(--color-primary) 24%, var(--color-border))",
                            borderRadius: 10,
                            background:
                              "color-mix(in srgb, var(--color-surface-2) 76%, transparent)",
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 8,
                          }}
                        >
                          <BadgeDollarSign size={14} style={{ marginTop: 2 }} />
                          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                            {appI18n.t("legacyInline.schedule.presentation_components_schedule_event_modal_schedule_event_modal_component.k026")}
                            {IS_DEV_ENV
                              ? appI18n.t("legacyInline.schedule.presentation_components_schedule_event_modal_schedule_event_modal_component.k027")
                              : appI18n.t("legacyInline.schedule.presentation_components_schedule_event_modal_schedule_event_modal_component.k028")}
                          </Typography.Text>
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  <div style={{ flex: this.props.initialDraft && this.props.initialDraft.id ? "0 0 260px" : "1 0 260px" }}>
                    <Label>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <Clock3 size={16} />
                        {appI18n.t("legacyInline.schedule.presentation_components_schedule_event_modal_schedule_event_modal_component.k029")}
                      </span>
                    </Label>
                    <div style={{ height: 6 }} />
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      <DurationTimeSelector
                        mode="duration"
                        size="large"
                        value={this.state.durationMinutes}
                        onChange={(v) => this.setSafeState({ durationMinutes: Number(v) })}
                        durations={DURATION_OPTIONS.map((d) => d.minutes)}
                      />
                    </div>
                  </div>
                </InlineRow>

                <FieldRow>
                  <SlotCard>
                    <SlotLeft>
                      <div className="title">
                        {this.state.title.trim() || appI18n.t("legacyInline.schedule.presentation_components_schedule_event_modal_schedule_event_modal_component.k030")}
                      </div>
                      <div className="meta">{this.whenLabel}</div>
                      <div className="meta">
                        {appI18n.t("legacyInline.schedule.presentation_components_schedule_event_modal_schedule_event_modal_component.k031")}: {this.categoryLabel}
                      </div>
                    </SlotLeft>

                    <SlotRight />
                  </SlotCard>

                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <Button onClick={() => this.setSafeState({ selectModalOpen: "services" })} icon={<BriefcaseBusiness size={14} />}>
                        {appI18n.t("legacyInline.schedule.presentation_components_schedule_event_modal_schedule_event_modal_component.k032")}
                      </Button>

                      <Button onClick={() => this.setSafeState({ selectModalOpen: "employees" })} icon={<UserRoundPlus size={14} />}>
                        {appI18n.t("legacyInline.schedule.presentation_components_schedule_event_modal_schedule_event_modal_component.k033")}
                      </Button>

                      {this.modalSettings.enableInventoryTracking ? (
                        <>
                          <Button onClick={() => this.setSafeState({ selectModalOpen: "inventory-in" })} icon={<PackageMinus size={14} />}>
                            {appI18n.t("legacyInline.schedule.presentation_components_schedule_event_modal_schedule_event_modal_component.k034")}
                          </Button>

                          <Button onClick={() => this.setSafeState({ selectModalOpen: "inventory-out" })} icon={<PackagePlus size={14} />}>
                            {appI18n.t("legacyInline.schedule.presentation_components_schedule_event_modal_schedule_event_modal_component.k035")}
                          </Button>
                        </>
                      ) : null}
                    </div>

                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                      {(this.state.selectedServiceIds || []).map((id) => {
                        const s = (this.props.availableServices ?? []).find((x) => x.id === id);
                        if (!s) return null;
                        return (
                          <Tag key={s.id} closable onClose={() => {
                            const next = this.state.selectedServiceIds.filter((x) => x !== s.id);
                            const servicesList = this.props.availableServices ?? [];
                            const total = next.reduce((acc, sid) => acc + (servicesList.find((ss) => ss.id === sid)?.priceCents ?? 0), 0);
                            this.setSafeState({ selectedServiceIds: next, priceCents: total });
                          }}>
                            {s.title} {s.priceCents ? `- ${formatMoneyFromCents(s.priceCents ?? 0)}` : ""}
                          </Tag>
                        );
                      })}

                      {(this.state.selectedEmployeeIds || []).map((id) => {
                        const e = (this.props.availableEmployees ?? []).find((x) => x.id === id);
                        if (!e) return null;
                        return (
                          <Tag key={e.id} closable onClose={() => {
                            const next = this.state.selectedEmployeeIds.filter((x) => x !== e.id);
                            this.setSafeState({ selectedEmployeeIds: next });
                          }}>
                            {e.firstName} {e.lastName}
                          </Tag>
                        );
                      })}

                      {(this.state.selectedInventoryInputs || []).map((line) => {
                        const label = this.inventoryLabel(line);
                        return (
                          <Tag key={`in-${line.itemId}`} color="magenta" closable onClose={() => {
                            const next = (this.state.selectedInventoryInputs ?? []).filter((l) => l.itemId !== line.itemId);
                            this.setSafeState({ selectedInventoryInputs: next });
                          }}>
                            {appI18n.t("legacyInline.schedule.presentation_components_schedule_event_modal_schedule_event_modal_component.k036")}: {label}
                          </Tag>
                        );
                      })}

                      {(this.state.selectedInventoryOutputs || []).map((line) => {
                        const label = this.inventoryLabel(line);
                        return (
                          <Tag key={`out-${line.itemId}`} color="cyan" closable onClose={() => {
                            const next = (this.state.selectedInventoryOutputs ?? []).filter((l) => l.itemId !== line.itemId);
                            this.setSafeState({ selectedInventoryOutputs: next });
                          }}>
                            {appI18n.t("legacyInline.schedule.presentation_components_schedule_event_modal_schedule_event_modal_component.k037")}: {label}
                          </Tag>
                        );
                      })}
                    </div>
                  </div>
                </FieldRow>
              </FormStack>
            </Section>

            {/* selection modals */}
            <SelectCardModal
              open={this.state.selectModalOpen === "services"}
              title={appI18n.t("legacyInline.schedule.presentation_components_schedule_event_modal_schedule_event_modal_component.k038")}
              items={(this.props.availableServices ?? []).map((s) => ({ id: s.id, title: s.title, subtitle: s.description, right: s.priceCents ? formatMoneyFromCents(s.priceCents ?? 0) : undefined }))}
              multiple={true}
              initialSelected={this.state.selectedServiceIds}
              onCancel={() => this.setSafeState({ selectModalOpen: null })}
              onConfirm={(ids) => {
                const uniq = Array.from(new Set([...(this.state.selectedServiceIds ?? []), ...ids]));
                const servicesList = this.props.availableServices ?? [];
                const total = uniq.reduce((acc, sid) => acc + (servicesList.find((s) => s.id === sid)?.priceCents ?? 0), 0);
                this.setSafeState({ selectedServiceIds: uniq, priceCents: total, selectModalOpen: null });
              }}
            />

            <SelectCardModal
              open={this.state.selectModalOpen === "employees"}
              title={appI18n.t("legacyInline.schedule.presentation_components_schedule_event_modal_schedule_event_modal_component.k039")}
              items={(this.props.availableEmployees ?? []).map((e) => ({ id: e.id, title: `${e.firstName} ${e.lastName}`, subtitle: e.role ?? undefined }))}
              multiple={true}
              initialSelected={this.state.selectedEmployeeIds}
              onCancel={() => this.setSafeState({ selectModalOpen: null })}
              onConfirm={(ids) => {
                const uniq = Array.from(new Set([...(this.state.selectedEmployeeIds ?? []), ...ids]));
                this.setSafeState({ selectedEmployeeIds: uniq, selectModalOpen: null });
              }}
            />

            {this.modalSettings.enableInventoryTracking ? (
              <>
                <SelectCardModal
                  open={this.state.selectModalOpen === "inventory-in"}
                  title={appI18n.t("legacyInline.schedule.presentation_components_schedule_event_modal_schedule_event_modal_component.k040")}
                  items={(this.props.availableInventoryItems ?? []).map((p) => ({ id: p.id, title: p.name, subtitle: p.sku ?? undefined }))}
                  multiple={true}
                  initialSelected={(this.state.selectedInventoryInputs ?? []).map((l) => l.itemId)}
                  onCancel={() => this.setSafeState({ selectModalOpen: null })}
                  onConfirm={(ids) => {
                    const next = this.upsertInventoryLines(this.state.selectedInventoryInputs ?? [], ids);
                    this.setSafeState({ selectedInventoryInputs: next, selectModalOpen: null });
                  }}
                />

                <SelectCardModal
                  open={this.state.selectModalOpen === "inventory-out"}
                  title={appI18n.t("legacyInline.schedule.presentation_components_schedule_event_modal_schedule_event_modal_component.k041")}
                  items={(this.props.availableInventoryItems ?? []).map((p) => ({ id: p.id, title: p.name, subtitle: p.sku ?? undefined }))}
                  multiple={true}
                  initialSelected={(this.state.selectedInventoryOutputs ?? []).map((l) => l.itemId)}
                  onCancel={() => this.setSafeState({ selectModalOpen: null })}
                  onConfirm={(ids) => {
                    const next = this.upsertInventoryLines(this.state.selectedInventoryOutputs ?? [], ids);
                    this.setSafeState({ selectedInventoryOutputs: next, selectModalOpen: null });
                  }}
                />
              </>
            ) : null}

            <FooterBar>
              <div />

              <FooterTotal>
                <div className="label">{appI18n.t("legacyInline.schedule.presentation_components_schedule_event_modal_schedule_event_modal_component.k042")}</div>
                <div className="value">{formatMoneyFromCents(this.state.priceCents ?? 0)}</div>
                <div className="sub">{this.state.durationMinutes} {appI18n.t("legacyInline.schedule.presentation_components_schedule_event_modal_schedule_event_modal_component.k043")}</div>
              </FooterTotal>
            </FooterBar>

            <ContinueWrap>
              <Button type="primary" size="large" block disabled={!this.canConfirm} onClick={this.handleConfirm}>
                {(this.props.initialDraft && this.props.initialDraft.id)
                  ? appI18n.t("legacyInline.schedule.presentation_components_schedule_event_modal_schedule_event_modal_component.k044")
                  : appI18n.t("legacyInline.schedule.presentation_components_schedule_event_modal_schedule_event_modal_component.k045")}
              </Button>
            </ContinueWrap>
          </ModalBody>
        </Modal>
      </ModalOverrides>
    );
  }
}
