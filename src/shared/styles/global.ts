import styled from "styled-components";

export const ActionsRow = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: var(--space-2);
`;

export const TitleBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
`;

export const HelperCenter = styled.div`
  width: 100%;
  text-align: center;
`;

export const ButtonIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-right: var(--space-2);
  color: inherit;
`;

export const FieldIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  opacity: 0.9;
`;
