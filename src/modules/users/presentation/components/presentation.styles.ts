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
  padding: var(--space-7);

  @media (max-width: 480px) {
    padding: var(--space-6);
  }
`;

export const SocialRow = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  gap: var(--space-3);
`;

export const SocialButton = styled(Button)`
  width: 56px;
`;

export const BottomRow = styled.div`
  width: 100%;
  text-align: center;
  margin-top: var(--space-6);

  /* garante que o texto e o link fiquem centralizados como uma “linha” */
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
`;

export const PrimaryButton = styled(Button)`
  height: 44px;
  border-radius: var(--radius-sm);
`;
