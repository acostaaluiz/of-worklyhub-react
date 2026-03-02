import { Col } from "antd";
import { Calendar, DollarSign, Clock } from "lucide-react";
import { formatDate } from "@core/utils/mask";
import { formatMoney } from "@core/utils/currency";
import {
  MetricCard,
  MetricContent,
  MetricIcon,
  MetricLabel,
  MetricMeta,
  MetricsRow,
  MetricValue,
} from "./metrics-cards.component.styles";

type NextAppointment = { title?: string; date?: string; time?: string } | undefined;

type Props = {
  appointmentsToday: number;
  revenueThisMonthCents?: number | null;
  nextAppointment?: NextAppointment;
};

export default function MetricsCards({
  appointmentsToday,
  revenueThisMonthCents,
  nextAppointment,
}: Props) {
  const formatNextLabel = (next?: NextAppointment) => {
    if (!next) return "-";
    const rawTitle = (next.title ?? "").trim();
    const category = rawTitle.includes(":")
      ? rawTitle.split(":")[0].trim()
      : rawTitle || "Appointment";
    const date = formatDate(next.date, "DD/MM");
    const time = next.time ?? "";
    return `${category} - ${date} ${time}`.trim();
  };

  return (
    <MetricsRow gutter={[12, 12]}>
      <Col xs={24} sm={8}>
        <MetricCard className="surface">
          <MetricContent>
            <MetricIcon>
              <Calendar size={18} />
            </MetricIcon>
            <MetricMeta>
              <MetricLabel>Appointments today</MetricLabel>
              <MetricValue>{appointmentsToday}</MetricValue>
            </MetricMeta>
          </MetricContent>
        </MetricCard>
      </Col>

      <Col xs={24} sm={8}>
        <MetricCard className="surface">
          <MetricContent>
            <MetricIcon>
              <DollarSign size={18} />
            </MetricIcon>
            <MetricMeta>
              <MetricLabel>Revenue (month)</MetricLabel>
              <MetricValue>{formatMoney(revenueThisMonthCents ?? null)}</MetricValue>
            </MetricMeta>
          </MetricContent>
        </MetricCard>
      </Col>

      <Col xs={24} sm={8}>
        <MetricCard className="surface">
          <MetricContent>
            <MetricIcon>
              <Clock size={18} />
            </MetricIcon>
            <MetricMeta>
              <MetricLabel>Next appointment</MetricLabel>
              <MetricValue $compact>{formatNextLabel(nextAppointment)}</MetricValue>
            </MetricMeta>
          </MetricContent>
        </MetricCard>
      </Col>
    </MetricsRow>
  );
}
