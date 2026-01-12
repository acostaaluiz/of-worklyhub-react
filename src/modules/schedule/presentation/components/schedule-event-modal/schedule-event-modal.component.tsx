import React from "react";
import { Button, Input, Modal, Select, Segmented, Typography, Tag } from "antd";
import DurationTimeSelector from "@shared/ui/components/duration-time-selector/duration-time-selector.component";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import SelectCardModal from "@shared/ui/components/select-card-modal/select-card-modal.component";
import { BaseComponent } from "@shared/base/base.component";

import type {
  DayPart,
  ScheduleEventDraft,
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
  SlotCard,
  SlotLeft,
  SlotRight,
  FooterBar,
  FooterTotal,
  ContinueWrap,
  ModalOverrides,
} from "./schedule-calendar.component.styles";

type DurationOption = { label: string; minutes: number };

const DURATION_OPTIONS: DurationOption[] = [
  { label: "15 min", minutes: 15 },
  { label: "25 min", minutes: 25 },
  { label: "30 min", minutes: 30 },
  { label: "45 min", minutes: 45 },
  { label: "60 min", minutes: 60 },
];

const formatMoney = (value: number) =>
  value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });

function addMinutes(date: Dayjs, minutes: number) {
  return date.add(minutes, "minute");
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
  error?: unknown;
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
  selectModalOpen?: "services" | "employees" | null;
}

export class ScheduleEventModal extends BaseComponent<ScheduleEventModalProps, ScheduleEventModalState> {
  constructor(props: ScheduleEventModalProps) {
    super(props);

    const { categories, initialDate } = props;
    const base = initialDate ? dayjs(initialDate, "YYYY-MM-DD") : dayjs();

    this.state = {
      isLoading: false,
      error: undefined,
      weekAnchor: base,
      selectedDay: base,
      dayPart: "morning",
      slotPage: 0,
      selectedTime: undefined,
      title: "",
      description: "",
      categoryId: categories?.[0]?.id ?? "",
      durationMinutes: 25,
      priceCents: 5000,
      selectedServiceIds: [],
      selectedEmployeeIds: [],
      selectModalOpen: null,
    };
  }

  componentDidMount(): void {
    super.componentDidMount();
  }

  componentDidUpdate(prevProps: ScheduleEventModalProps): void {
    const { open, initialDate, initialStartTime, categories } = this.props;

    if (open && !prevProps.open) {
      const base = initialDate ? dayjs(initialDate, "YYYY-MM-DD") : dayjs();
      const dayPart = initialStartTime
        ? (Number(initialStartTime.split(":")[0]) < 12
            ? "morning"
            : Number(initialStartTime.split(":")[0]) < 17
            ? "afternoon"
            : "evening")
        : "morning";

      this.setSafeState({
        weekAnchor: base,
        selectedDay: base,
        selectedTime: initialStartTime ?? undefined,
        dayPart,
        slotPage: 0,
        title: "",
        description: "",
        categoryId: categories?.[0]?.id ?? "",
        durationMinutes: 25,
        priceCents: 5000,
      });
    }

    // if opening in edit mode with an initialDraft, populate fields from it
    if (open && this.props.initialDraft && this.props.initialDraft !== prevProps.initialDraft) {
      const d = this.props.initialDraft;
      const base = dayjs(d.date, "YYYY-MM-DD");
      const dayPart = d.startTime
        ? (Number(d.startTime.split(":")[0]) < 12
            ? "morning"
            : Number(d.startTime.split(":")[0]) < 17
            ? "afternoon"
            : "evening")
        : "morning";

      this.setSafeState({
        weekAnchor: base,
        selectedDay: base,
        selectedTime: d.startTime ?? undefined,
        dayPart,
        slotPage: 0,
        title: d.title ?? "",
        description: d.description ?? "",
        categoryId: d.categoryId ?? categories?.[0]?.id ?? "",
        durationMinutes: d.durationMinutes ?? 25,
        priceCents: d.totalPriceCents ?? 5000,
        selectedServiceIds: d.serviceIds ?? [],
        selectedEmployeeIds: d.employeeIds ?? [],
      });
    }

    if (categories !== prevProps.categories) {
      this.setSafeState({ categoryId: categories?.[0]?.id ?? "" });
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

  private get canConfirm() {
    return Boolean(
      this.state.categoryId && this.state.title.trim() && this.selectedStart && this.selectedEnd
    );
  }

  private handleConfirm = () => {
    const { onConfirm } = this.props;

    if (!this.selectedStart || !this.selectedEnd || !this.state.categoryId) return;

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
      totalPriceCents: this.state.priceCents,
    };

    onConfirm(draft);
  };

  private get whenLabel() {
    if (!this.selectedStart || !this.selectedEnd) return "Select a time";
    return `${this.selectedStart.format("ddd, MMM D")} · ${this.selectedStart.format("HH:mm")} - ${this.selectedEnd.format("HH:mm")}`;
  }

  private get categoryLabel() {
    return this.props.categories.find((c) => c.id === this.state.categoryId)?.label ?? "—";
  }

  protected renderView(): React.ReactNode {
    const { open, onClose } = this.props;

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
                  aria-label="Previous week"
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
                  aria-label="Next week"
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
                    { label: "Morning", value: "morning" },
                    { label: "Afternoon", value: "afternoon" },
                    { label: "Evening", value: "evening" },
                  ]}
                />
              </TimeTabsRow>

              <SlotsRow>
                <RoundIconButton
                  onClick={() => this.setSafeState({ slotPage: Math.max(0, this.state.slotPage - 1) })}
                  disabled={this.state.slotPage === 0}
                  aria-label="Previous times"
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
                  aria-label="Next times"
                >
                  <ChevronRight size={18} />
                </RoundIconButton>
              </SlotsRow>
            </Section>

            <Separator />

            <Section>
              <Typography.Title level={5} style={{ margin: 0 }}>
                Appointment details
              </Typography.Title>

              <FormStack>
                <Input
                  size="large"
                  value={this.state.title}
                  onChange={(e) => this.setSafeState({ title: e.target.value })}
                  placeholder="title"
                />

                <Input.TextArea
                  value={this.state.description}
                  onChange={(e) => this.setSafeState({ description: e.target.value })}
                  placeholder="Description (optional)"
                  rows={3}
                />

                <FieldRow3>
                  <Select
                    size="large"
                    value={this.state.categoryId || undefined}
                    onChange={(v) => this.setSafeState({ categoryId: v })}
                    placeholder="Category"
                    options={this.props.categories.map((c) => ({ value: c.id, label: c.label }))}
                  />
                </FieldRow3>

                {/* Duration selector moved to its own row to avoid crowding */}
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <DurationTimeSelector
                    mode="duration"
                    size="large"
                    value={this.state.durationMinutes}
                    onChange={(v) => this.setSafeState({ durationMinutes: Number(v) })}
                    durations={DURATION_OPTIONS.map((d) => d.minutes)}
                  />
                </div>

                <FieldRow>
                  <SlotCard>
                    <SlotLeft>
                      <div className="title">{this.state.title.trim() || "Appointment"}</div>
                      <div className="meta">{this.whenLabel}</div>
                      <div className="meta">Category: {this.categoryLabel}</div>
                    </SlotLeft>

                    <SlotRight />
                  </SlotCard>

                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <Button onClick={() => this.setSafeState({ selectModalOpen: "services" })} icon={<Plus size={14} />}>
                        Adicionar serviço
                      </Button>

                      <Button onClick={() => this.setSafeState({ selectModalOpen: "employees" })} icon={<Plus size={14} />}>
                        Adicionar funcionário
                      </Button>
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
                            {s.title} {s.priceCents ? `- ${formatMoney((s.priceCents ?? 0) / 100)}` : ""}
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
                    </div>
                  </div>
                </FieldRow>
              </FormStack>
            </Section>

            {/* selection modals */}
            <SelectCardModal
              open={this.state.selectModalOpen === "services"}
              title="Adicionar serviço"
              items={(this.props.availableServices ?? []).map((s) => ({ id: s.id, title: s.title, subtitle: s.description, right: s.priceCents ? formatMoney((s.priceCents ?? 0) / 100) : undefined }))}
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
              title="Adicionar funcionário"
              items={(this.props.availableEmployees ?? []).map((e) => ({ id: e.id, title: `${e.firstName} ${e.lastName}`, subtitle: e.role ?? undefined }))}
              multiple={true}
              initialSelected={this.state.selectedEmployeeIds}
              onCancel={() => this.setSafeState({ selectModalOpen: null })}
              onConfirm={(ids) => {
                const uniq = Array.from(new Set([...(this.state.selectedEmployeeIds ?? []), ...ids]));
                this.setSafeState({ selectedEmployeeIds: uniq, selectModalOpen: null });
              }}
            />

            <FooterBar>
              <div />

              <FooterTotal>
                <div className="label">Total</div>
                <div className="value">{formatMoney((this.state.priceCents ?? 0) / 100)}</div>
                <div className="sub">{this.state.durationMinutes} min</div>
              </FooterTotal>
            </FooterBar>

            <ContinueWrap>
              <Button type="primary" size="large" block disabled={!this.canConfirm} onClick={this.handleConfirm}>
                {(this.props.initialDraft && this.props.initialDraft.id) ? 'Save edit' : 'Continue'}
              </Button>
            </ContinueWrap>
          </ModalBody>
        </Modal>
      </ModalOverrides>
    );
  }
}
