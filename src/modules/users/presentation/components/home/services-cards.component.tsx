import React from "react";
import { Col } from "antd";
import { useNavigate } from "react-router-dom";
import { resolveModulePath } from "@modules/users/presentation/utils/module-navigation";
import {
  ServiceCard,
  ServiceContent,
  ServiceIcon,
  ServiceMeta,
  ServicesRow,
  ServiceSubtitle,
  ServiceTitle,
} from "./services-cards.component.styles";

type ServiceItem = { id: string; title: string; subtitle?: string; icon?: React.ReactNode };

type Props = {
  services: ServiceItem[];
};

export default function ServicesCards({ services }: Props) {
  const navigate = useNavigate();

  return (
    <ServicesRow gutter={[16, 16]}>
      {services.map((s) => {
        const path = resolveModulePath({ id: s.id, title: s.title });
        const isDisabled = !path;
        return (
          <Col key={s.id} xs={24} sm={12} md={8} lg={6}>
            <ServiceCard
              hoverable={!isDisabled}
              $disabled={isDisabled}
              onClick={() => {
                if (!isDisabled && path) navigate(path);
              }}
            >
              <ServiceContent>
                <ServiceIcon>{s.icon}</ServiceIcon>
                <ServiceMeta>
                  <ServiceTitle>{s.title}</ServiceTitle>
                  <ServiceSubtitle>{s.subtitle}</ServiceSubtitle>
                </ServiceMeta>
              </ServiceContent>
            </ServiceCard>
          </Col>
        );
      })}
    </ServicesRow>
  );
}
