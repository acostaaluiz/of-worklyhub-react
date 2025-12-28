import styled from "styled-components";

export const OverviewShell = styled.div`
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: var(--space-6);
`;

export const HeroImage = styled.div`
  height: 320px;
  background-size: cover;
  background-position: center;
`;

export const InfoRow = styled.div`
  display: flex;
  gap: var(--space-4);
  padding: var(--space-4);
  align-items: center;
`;

export const MetaRow = styled.div`
  margin-top: 6px;
`;

export const AvatarWrap = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 12px;
  background: var(--surface-2, #f3f4f6);
`;

export default OverviewShell;
