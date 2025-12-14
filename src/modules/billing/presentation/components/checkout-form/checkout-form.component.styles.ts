import { Button, Card } from "antd";
import styled from "styled-components";

export const FormCard = styled(Card)`
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

export const SectionTitle = styled.div`
  margin-bottom: var(--space-2);
`;

export const Row = styled.div`
  display: flex;
  gap: var(--space-3);

  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

export const PrimaryButton = styled(Button)`
  height: 44px;
  border-radius: var(--radius-sm);
`;

export const SecondaryButton = styled(Button)`
  height: 44px;
  border-radius: var(--radius-sm);
`;
