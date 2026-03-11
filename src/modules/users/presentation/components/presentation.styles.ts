import styled from "styled-components";
import {
  BaseFormCard,
  BaseFormCardBody,
  BasePrimaryButton,
} from "@shared/ui/components/form-shell/form-shell.styles";

export const FormCard = styled(BaseFormCard)``;

export const CardBody = styled(BaseFormCardBody)`
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

export const SocialButton = styled(BasePrimaryButton)`
  width: 56px;
  height: auto;
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

export const PrimaryButton = styled(BasePrimaryButton)``;
