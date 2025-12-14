import { Card } from "antd";
import styled from "styled-components";

export const SummaryCard = styled(Card)`
  width: 100%;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
  background: var(--color-surface);
`;

export const CardBody = styled.div`
  padding: var(--space-6);

  @media (max-width: 480px) {
    padding: var(--space-5);
  }
`;

export const Line = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);

  svg {
    color: var(--color-primary);
  }
`;

export const Badge = styled.span`
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid var(--color-border);
  background: var(--color-glass-surface);
  color: var(--color-text);
  font-size: var(--font-size-sm);
`;

export const PriceRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
`;

export const TotalRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;
