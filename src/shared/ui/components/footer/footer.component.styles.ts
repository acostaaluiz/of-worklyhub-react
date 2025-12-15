import styled from "styled-components";

export const FooterShell = styled.footer`
  width: 100%;
  background: var(--color-surface-elevated);
  border-top: 1px solid var(--color-border);
`;

export const FooterInner = styled.div`
  padding: var(--space-6) 0;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-6);

  @media (max-width: 768px) {
    flex-direction: column;
    padding: var(--space-5) 0;
  }
`;

export const Left = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  min-width: 220px;

  @media (max-width: 768px) {
    min-width: auto;
  }
`;

export const Brand = styled.div`
  font-weight: 800;
  letter-spacing: -0.02em;
  cursor: pointer;
  user-select: none;
`;

export const Right = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-end;

  @media (max-width: 768px) {
    width: 100%;
    align-items: flex-start;
  }
`;

export const LinksRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: var(--space-3);

  @media (max-width: 768px) {
    justify-content: flex-start;
  }
`;

export const FooterLink = styled.span`
  color: var(--color-link);
  cursor: pointer;
  user-select: none;
  font-size: var(--font-size-sm);

  &:hover {
    color: var(--color-link-hover);
  }
`;
