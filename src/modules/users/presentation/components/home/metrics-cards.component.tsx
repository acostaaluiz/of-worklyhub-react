import React from "react";
import { Card, Row, Col } from "antd";
import { Calendar, DollarSign, Clock } from "lucide-react";
import { formatMoney } from "@core/utils/currency";

type NextAppointment = { title?: string; date?: string; time?: string } | undefined;

type Props = {
  appointmentsToday: number;
  revenueThisMonthCents?: number | null;
  nextAppointment?: NextAppointment;
};

export default function MetricsCards({ appointmentsToday, revenueThisMonthCents, nextAppointment }: Props) {
  // use shared util for currency formatting

  return (
    <Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
      <Col xs={24} sm={8}>
        <Card className="surface" bodyStyle={{ padding: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 8, background: "var(--color-surface-2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Calendar size={18} />
            </div>
            <div>
              <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Appointments today</div>
              <div style={{ fontWeight: 700, fontSize: 18 }}>{appointmentsToday}</div>
            </div>
          </div>
        </Card>
      </Col>

      <Col xs={24} sm={8}>
        <Card className="surface" bodyStyle={{ padding: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 8, background: "var(--color-surface-2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <DollarSign size={18} />
            </div>
            <div>
              <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Revenue (month)</div>
              <div style={{ fontWeight: 700, fontSize: 18 }}>{formatMoney(revenueThisMonthCents ?? null)}</div>
            </div>
          </div>
        </Card>
      </Col>

      <Col xs={24} sm={8}>
        <Card className="surface" bodyStyle={{ padding: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 8, background: "var(--color-surface-2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Clock size={18} />
            </div>
            <div>
              <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Next appointment</div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{nextAppointment ? `${nextAppointment.title ?? "Appointment"} • ${nextAppointment.date ?? ""} ${nextAppointment.time ?? ""}` : "—"}</div>
            </div>
          </div>
        </Card>
      </Col>
    </Row>
  );
}
