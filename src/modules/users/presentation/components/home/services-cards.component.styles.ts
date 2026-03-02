import { Card, Row } from "antd";
import styled from "styled-components";

export const ServicesRow = styled(Row)`
  padding-top: 2px;
  padding-bottom: 2px;

  .ant-col {
    display: flex;
  }
`;

export const ServiceCard = styled(Card)<{ $disabled?: boolean }>`
  width: 100%;
  border-radius: 12px;
  opacity: ${({ $disabled }) => ($disabled ? 0.7 : 1)};
  cursor: ${({ $disabled }) => ($disabled ? "default" : "pointer")};
  transition:
    box-shadow var(--motion-duration-fast) var(--motion-ease-standard),
    border-color var(--motion-duration-fast) var(--motion-ease-standard);
  will-change: box-shadow, border-color;

  .ant-card-body {
    padding: var(--space-3);
  }

  &:hover {
    box-shadow: ${({ $disabled }) => ($disabled ? "none" : "var(--shadow-md)")};
    border-color: ${({ $disabled }) =>
      $disabled ? "var(--color-border)" : "var(--color-primary)"};
  }
`;

export const ServiceContent = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-3);
`;

export const ServiceIcon = styled.div`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-surface-2);
  border-radius: var(--radius-sm);
  flex-shrink: 0;
`;

export const ServiceMeta = styled.div`
  min-width: 0;
`;

export const ServiceTitle = styled.div`
  font-weight: 600;
`;

export const ServiceSubtitle = styled.div`
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
  margin-top: 2px;
`;
