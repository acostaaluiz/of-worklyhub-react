import React from "react";
import { Card, Row, Col } from "antd";

type ServiceItem = { id: string; title: string; subtitle?: string; icon?: React.ReactNode };

type Props = {
  services: ServiceItem[];
};

export default function ServicesCards({ services }: Props) {
  return (
    <Row gutter={[16, 16]}>
      {services.map((s) => (
        <Col key={s.id} xs={24} sm={12} md={8} lg={6}>
          <Card hoverable>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40 }}>{s.icon}</div>
              <div>
                <div style={{ fontWeight: 600 }}>{s.title}</div>
                <div style={{ color: "var(--muted)", fontSize: 12 }}>{s.subtitle}</div>
              </div>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
}
