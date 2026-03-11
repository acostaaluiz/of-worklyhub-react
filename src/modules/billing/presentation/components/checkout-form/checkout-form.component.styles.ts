import styled from "styled-components";
import {
  BaseFormCard,
  BaseFormCardBody,
  BasePrimaryButton,
  BaseSecondaryButton,
} from "@shared/ui/components/form-shell/form-shell.styles";

export const FormCard = styled(BaseFormCard)``;

export const CardBody = styled(BaseFormCardBody)`
  /* allow the body to grow so the card fills its container */
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
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

export const PrimaryButton = styled(BasePrimaryButton)``;

export const SecondaryButton = styled(BaseSecondaryButton)``;
