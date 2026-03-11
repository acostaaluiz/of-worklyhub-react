import styled from "styled-components";
import {
  BaseFormCard,
  BaseFormCardBody,
} from "@shared/ui/components/form-shell/form-shell.styles";

export const SummaryCard = styled(BaseFormCard)``;

export const CardBody = styled(BaseFormCardBody)`
  /* allow the body to grow so the card fills the column height */
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
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
