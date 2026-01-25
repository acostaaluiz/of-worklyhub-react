import React from "react";
import { Card, Row, Col } from "antd";
import { useNavigate } from "react-router-dom";
import { resolveModulePath } from "@modules/users/presentation/utils/module-navigation";

type ServiceItem = { id: string; title: string; subtitle?: string; icon?: React.ReactNode };

type Props = {
  services: ServiceItem[];
};

export default function ServicesCards({ services }: Props) {
  const navigate = useNavigate();

  return (
    <Row gutter={[16, 16]}>
      {services.map((s) => {
        const path = resolveModulePath({ id: s.id, title: s.title });
        const isDisabled = !path;
        return (
          <Col key={s.id} xs={24} sm={12} md={8} lg={6}>
            <Card
              hoverable
              bodyStyle={{ padding: 12 }}
              style={{ borderRadius: 12, cursor: isDisabled ? "default" : "pointer", opacity: isDisabled ? 0.7 : 1 }}
              onClick={() => {
                if (!isDisabled && path) navigate(path);
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-surface-2)", borderRadius: 8 }}>
                  {s.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>{s.title}</div>
                  <div style={{ color: "var(--color-text-muted)", fontSize: 12 }}>{s.subtitle}</div>
                </div>
              </div>
            </Card>
          </Col>
        );
      })}
    </Row>
  );
}
