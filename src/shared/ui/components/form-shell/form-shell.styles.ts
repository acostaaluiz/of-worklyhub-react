import { Button, Card } from "antd";
import styled from "styled-components";

export const BaseFormCard = styled(Card)`
  width: 100%;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
  background: var(--color-surface);
`;

export const BaseFormCardBody = styled.div`
  padding: var(--space-6);

  @media (max-width: 480px) {
    padding: var(--space-5);
  }
`;

export const BasePrimaryButton = styled(Button)`
  height: 44px;
  border-radius: var(--radius-sm);
`;

export const BaseSecondaryButton = styled(Button)`
  height: 44px;
  border-radius: var(--radius-sm);
`;
