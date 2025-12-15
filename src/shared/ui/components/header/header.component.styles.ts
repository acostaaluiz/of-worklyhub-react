import styled from "styled-components";

export const HeaderShell = styled.header`
  width: 100%;
  position: sticky;
  top: 0;
  z-index: 50;

  background: var(--color-surface-elevated);
  border-bottom: 1px solid var(--color-border);
`;

export const HeaderInner = styled.div`
  height: 64px;
  display: flex;
  align-items: center;
  gap: var(--space-4);
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
`;

export const Nav = styled.nav`
  flex: 0 0 auto;

  .ant-menu {
    background: transparent;
    border-bottom: 0;
  }

  .ant-menu-item {
    border-radius: var(--radius-sm);
    margin: 0 var(--space-1);
  }

  .ant-menu-item-selected::after,
  .ant-menu-item-active::after {
    display: none;
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
  }
`;

export const Right = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-3);
  min-width: 220px;
`;
