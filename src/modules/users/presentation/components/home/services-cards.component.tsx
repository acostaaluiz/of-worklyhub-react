import React from "react";
import { Col } from "antd";
import { resolveModulePath } from "@modules/users/presentation/utils/module-navigation";
import {
  ServiceCard,
  ServiceCardLink,
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
  return (
    <ServicesRow gutter={[16, 16]}>
      {services.map((s) => {
        const path = resolveModulePath({ id: s.id, title: s.title });
        const isDisabled = !path;
        const cardContent = (
          <ServiceContent>
            <ServiceIcon>{s.icon}</ServiceIcon>
            <ServiceMeta>
              <ServiceTitle>{s.title}</ServiceTitle>
              <ServiceSubtitle>{s.subtitle}</ServiceSubtitle>
            </ServiceMeta>
          </ServiceContent>
        );

        return (
          <Col key={s.id} xs={24} sm={12} md={8} lg={6}>
            {isDisabled ? (
              <ServiceCard hoverable={false} $disabled>
                {cardContent}
              </ServiceCard>
            ) : (
              <ServiceCardLink to={path}>
                <ServiceCard hoverable $disabled={false}>
                  {cardContent}
                </ServiceCard>
              </ServiceCardLink>
            )}
          </Col>
        );
      })}
    </ServicesRow>
  );
}
