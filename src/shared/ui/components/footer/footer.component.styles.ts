import styled from "styled-components";
import { Typography } from "antd";

export const FooterShell = styled.footer`
  width: 100%;
  background: transparent;
  border-top: 1px solid var(--color-border);
`;

export const FooterInner = styled.div`
  padding: var(--space-6) var(--space-4);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-6);

  @media (max-width: 768px) {
    flex-direction: column;
    padding: var(--space-5) var(--space-3);
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
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);

  .brand-logo {
    display: block;
    flex-shrink: 0;
  }
`;

export const Right = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  width: 100%;

  @media (max-width: 768px) {
    align-items: flex-start;
  }
`;

export const LinksRow = styled.div`
  display: flex;
  align-items: center;
  min-height: 28px;
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

export const TaglineText = styled(Typography.Text)`
  display: block;
  font-size: var(--font-size-sm);
  line-height: 1;
`;

export const AttributionRow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
`;

export const AttributionLabel = styled(Typography.Text)`
  font-size: var(--font-size-xs);
`;

export const AttributionLink = styled.a`
  display: inline-flex;
  align-items: center;
  border-radius: var(--radius-pill);
  text-decoration: none;
  transition: opacity 160ms ease;

  &:hover {
    opacity: 0.9;
  }
`;

export const AttributionBrand = styled.div`
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  font-weight: 600;

  .of-logo {
    width: auto;
    height: 14px;
    display: block;
  }
`;

export const FooterMetaRow = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-2);
  }
`;
