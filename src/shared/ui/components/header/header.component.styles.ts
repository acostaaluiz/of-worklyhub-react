import styled from "styled-components";

export const HeaderShell = styled.header`
  width: 100%;
  position: sticky;
  top: 0;
  z-index: 1200;

  color: var(--color-text);
  background: var(--color-glass-surface);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  border-bottom: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
`;

export const HeaderInner = styled.div`
  height: 64px;
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: 0 var(--space-4);
`;

export const Left = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-width: 160px;
`;

export const Brand = styled.div`
  font-weight: 800;
  letter-spacing: -0.02em;
  cursor: pointer;
  user-select: none;
  display: flex;
  align-items: center;
  gap: 8px;

  color: var(--color-text);

  .brand-logo {
    display: block;
    flex-shrink: 0;
  }
`;

export const Nav = styled.nav`
  flex: 0 0 auto;

  .ant-menu {
    background: transparent;
    border-bottom: 0;
    color: var(--color-text);
  }

  .ant-menu-item {
    border-radius: var(--radius-sm);
    margin: 0 var(--space-1);
    transition: background 180ms, color 180ms, transform 120ms;
  }

  .ant-menu-item:hover {
    transform: translateY(-2px);
    background: var(--color-glass-surface);
  }

  .ant-menu-item a,
  .ant-menu-item {
    color: var(--color-text);
  }

  .ant-menu-item-selected {
    color: var(--color-primary);
    box-shadow: inset 0 -2px 0 var(--color-primary);
    background: transparent;
  }

  @media (max-width: 1024px) {
    display: none;
  }
`;

export const Center = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;

  @media (max-width: 768px) {
    justify-content: flex-start;
  }
`;

export const SearchWrap = styled.div`
  width: 100%;
  max-width: 420px;

  .ant-input-affix-wrapper {
    border-radius: 999px;
    background: var(--color-glass-surface);
    border: 1px solid var(--color-border);
    transition: box-shadow .15s, transform .12s;
  }

  .ant-input-affix-wrapper:focus,
  .ant-input-affix-wrapper:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-1px);
  }
`;

export const Right = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-3);
  min-width: 220px;
  padding-left: var(--space-2);
`;

export const MobileMenuButton = styled.button`
  background: transparent;
  border: none;
  display: none;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  @media (max-width: 1024px) {
    display: inline-flex;
  }
`;
