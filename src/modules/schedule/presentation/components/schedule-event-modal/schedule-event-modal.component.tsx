import { useEffect, useMemo, useState } from "react";
import { Button, Input, Modal, Select, Segmented, Typography } from "antd";
import dayjs from "dayjs";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";

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
  AddServiceLink,
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

function addMinutes(date: dayjs.Dayjs, minutes: number) {
  return date.add(minutes, "minute");
}

function getWeekDays(anchor: dayjs.Dayjs) {
  const start = anchor.startOf("week");
  return Array.from({ length: 7 }).map((_, i) => start.add(i, "day"));
}

function buildSlots(day: dayjs.Dayjs, part: DayPart) {
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

export function ScheduleEventModal(props: ScheduleEventModalProps) {
  const {
    open,
    onClose,
    onConfirm,
    categories,
    initialDate,
    initialStartTime,
  } = props;

  const [weekAnchor, setWeekAnchor] = useState(dayjs());
  const [selectedDay, setSelectedDay] = useState(dayjs());
  const [dayPart, setDayPart] = useState<DayPart>("morning");

  const [slotPage, setSlotPage] = useState(0);
  const [selectedTime, setSelectedTime] = useState<string | undefined>(
    undefined
  );

  const [title, setTitle] = useState("Appointment");
  const [description, setDescription] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>(
    () => categories[0]?.id ?? ""
  );
  const [durationMinutes, setDurationMinutes] = useState<number>(25);
  const [price, setPrice] = useState<number>(50);

  const weekDays = useMemo(() => getWeekDays(weekAnchor), [weekAnchor]);
  const slots = useMemo(
    () => buildSlots(selectedDay, dayPart),
    [selectedDay, dayPart]
  );

  const visibleSlots = useMemo(() => {
    const pageSize = 6;
    const from = slotPage * pageSize;
    return slots.slice(from, from + pageSize);
  }, [slots, slotPage]);

  const maxSlotPage = useMemo(() => {
    const pageSize = 6;
    return Math.max(0, Math.ceil(slots.length / pageSize) - 1);
  }, [slots.length]);

  const headerLabel = useMemo(
    () => selectedDay.format("MMMM YYYY"),
    [selectedDay]
  );

  const selectedStart = useMemo(() => {
    if (!selectedTime) return null;
    const [h, m] = selectedTime.split(":").map((v) => Number(v));
    return selectedDay.hour(h).minute(m).second(0).millisecond(0);
  }, [selectedDay, selectedTime]);

  const selectedEnd = useMemo(() => {
    if (!selectedStart) return null;
    return addMinutes(selectedStart, durationMinutes);
  }, [selectedStart, durationMinutes]);

  const canConfirm = useMemo(() => {
    return Boolean(categoryId && title.trim() && selectedStart && selectedEnd);
  }, [categoryId, title, selectedStart, selectedEnd]);

  useEffect(() => {
    if (!open) return;

    const base = initialDate ? dayjs(initialDate, "YYYY-MM-DD") : dayjs();
    setWeekAnchor(base);
    setSelectedDay(base);

    if (initialStartTime) {
      setSelectedTime(initialStartTime);
      const hour = Number(initialStartTime.split(":")[0] ?? 9);
      setDayPart(hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening");
    } else {
      setSelectedTime(undefined);
      setDayPart("morning");
    }

    setSlotPage(0);
    setTitle("Appointment");
    setDescription("");
    setCategoryId(categories[0]?.id ?? "");
    setDurationMinutes(25);
    setPrice(50);
  }, [open, initialDate, initialStartTime, categories]);

  useEffect(() => {
    setSlotPage(0);
    setSelectedTime(undefined);
  }, [selectedDay, dayPart]);

  const handleConfirm = () => {
    if (!selectedStart || !selectedEnd || !categoryId) return;

    const draft: ScheduleEventDraft = {
      title: title.trim(),
      description: description.trim() ? description.trim() : undefined,
      categoryId,
      date: selectedStart.format("YYYY-MM-DD"),
      startTime: selectedStart.format("HH:mm"),
      endTime: selectedEnd.format("HH:mm"),
    };

    onConfirm(draft);
  };

  const whenLabel = useMemo(() => {
    if (!selectedStart || !selectedEnd) return "Select a time";
    return `${selectedStart.format("ddd, MMM D")} · ${selectedStart.format("HH:mm")} - ${selectedEnd.format("HH:mm")}`;
  }, [selectedStart, selectedEnd]);

  const categoryLabel = useMemo(() => {
    return categories.find((c) => c.id === categoryId)?.label ?? "—";
  }, [categories, categoryId]);

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
        title={
          <Typography.Title level={3} style={{ margin: 0 }}>
            {headerLabel}
          </Typography.Title>
        }
      >
        <ModalBody>
          <Section>
            <DateStrip>
              <RoundIconButton
                onClick={() => setWeekAnchor((d) => d.subtract(7, "day"))}
                aria-label="Previous week"
              >
                <ChevronLeft size={18} />
              </RoundIconButton>

              <DateRail>
                {weekDays.map((d) => {
                  const isActive = d.isSame(selectedDay, "day");
                  return (
                    <DateChip
                      key={d.format("YYYY-MM-DD")}
                      type="button"
                      $active={isActive}
                      onClick={() => setSelectedDay(d)}
                    >
                      <span className="dow">{d.format("ddd")}</span>
                      <span className="day">{d.format("DD")}</span>
                      <span className="dot" />
                    </DateChip>
                  );
                })}
              </DateRail>

              <RoundIconButton
                onClick={() => setWeekAnchor((d) => d.add(7, "day"))}
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
                value={dayPart}
                onChange={(v) => setDayPart(v as DayPart)}
                options={[
                  { label: "Morning", value: "morning" },
                  { label: "Afternoon", value: "afternoon" },
                  { label: "Evening", value: "evening" },
                ]}
              />
            </TimeTabsRow>

            <SlotsRow>
              <RoundIconButton
                onClick={() => setSlotPage((p) => Math.max(0, p - 1))}
                disabled={slotPage === 0}
                aria-label="Previous times"
              >
                <ChevronLeft size={18} />
              </RoundIconButton>

              <SlotsRail>
                {visibleSlots.map((s) => (
                  <TimeChip
                    key={s.value}
                    type="button"
                    $active={selectedTime === s.value}
                    disabled={s.disabled}
                    onClick={() => setSelectedTime(s.value)}
                  >
                    {s.label}
                  </TimeChip>
                ))}
              </SlotsRail>

              <RoundIconButton
                onClick={() => setSlotPage((p) => Math.min(maxSlotPage, p + 1))}
                disabled={slotPage === maxSlotPage}
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
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
              />

              <Input.TextArea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description (optional)"
                rows={3}
              />

              <FieldRow3>
                <Select
                  size="large"
                  value={categoryId || undefined}
                  onChange={(v) => setCategoryId(v)}
                  placeholder="Category"
                  options={categories.map((c) => ({
                    value: c.id,
                    label: c.label,
                  }))}
                />

                <Select
                  size="large"
                  value={durationMinutes}
                  onChange={(v) => setDurationMinutes(Number(v))}
                  options={DURATION_OPTIONS.map((d) => ({
                    value: d.minutes,
                    label: d.label,
                  }))}
                />

                <Select
                  size="large"
                  value={price}
                  onChange={(v) => setPrice(Number(v))}
                  options={[
                    { value: 0, label: "Free" },
                    { value: 25, label: formatMoney(25) },
                    { value: 50, label: formatMoney(50) },
                    { value: 75, label: formatMoney(75) },
                    { value: 100, label: formatMoney(100) },
                  ]}
                />
              </FieldRow3>

              <FieldRow>
                <SlotCard>
                  <SlotLeft>
                    <div className="title">{title.trim() || "Appointment"}</div>
                    <div className="meta">{whenLabel}</div>
                    <div className="meta">Category: {categoryLabel}</div>
                  </SlotLeft>

                  <SlotRight>
                    <Typography.Text strong style={{ fontSize: 18 }}>
                      {formatMoney(price)}
                    </Typography.Text>

                    <Button
                      size="middle"
                      disabled={!selectedStart || !selectedEnd}
                    >
                      Change
                    </Button>
                  </SlotRight>
                </SlotCard>

                <div style={{ display: "flex", alignItems: "center" }}>
                  <AddServiceLink type="button" disabled>
                    <Plus size={16} />
                    Add another service
                  </AddServiceLink>
                </div>
              </FieldRow>
            </FormStack>
          </Section>

          <FooterBar>
            <div />

            <FooterTotal>
              <div className="label">Total</div>
              <div className="value">{formatMoney(price)}</div>
              <div className="sub">{durationMinutes} min</div>
            </FooterTotal>
          </FooterBar>

          <ContinueWrap>
            <Button
              type="primary"
              size="large"
              block
              disabled={!canConfirm}
              onClick={handleConfirm}
            >
              Continue
            </Button>
          </ContinueWrap>
        </ModalBody>
      </Modal>
    </ModalOverrides>
  );
}
