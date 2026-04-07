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
  animation: motion-fade var(--motion-duration-slow) var(--motion-ease-standard)
    both;

  .mobile-nav-drawer .ant-drawer-content {
    background: var(--color-surface-elevated);
    color: var(--color-text);
  }

  .mobile-nav-drawer .ant-drawer-header {
    background: color-mix(in srgb, var(--color-surface-2) 70%, var(--color-surface));
    border-bottom-color: var(--color-divider);
  }

  .mobile-nav-drawer .ant-drawer-title {
    color: var(--color-text);
  }
`;

export const HeaderInner = styled.div`
  height: 64px;
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: 0 var(--space-4);

  @media (max-width: 1024px) {
    height: auto;
    min-height: 64px;
    flex-wrap: wrap;
    padding: var(--space-2) var(--space-3);
    gap: var(--space-2);
  }
`;

export const Left = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-width: 160px;

  @media (max-width: 1024px) {
    min-width: 0;
    flex: 1 1 auto;
  }
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

  @media (max-width: 480px) {
    span {
      display: none;
    }
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
    transition:
      background var(--motion-duration-base) var(--motion-ease-standard),
      color var(--motion-duration-base) var(--motion-ease-standard),
      transform var(--motion-duration-fast) var(--motion-ease-standard);
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
  min-width: 0;

  @media (max-width: 1024px) {
    order: 3;
    flex: 1 1 100%;
  }

  @media (max-width: 768px) {
    justify-content: stretch;
  }
`;

export const SearchWrap = styled.div`
  width: 100%;
  max-width: 420px;

  .ant-input-affix-wrapper {
    border-radius: 999px;
    background: var(--color-glass-surface);
    border: 1px solid var(--color-border);
    transition:
      box-shadow var(--motion-duration-fast) var(--motion-ease-standard),
      background var(--motion-duration-fast) var(--motion-ease-standard),
      transform var(--motion-duration-fast) var(--motion-ease-standard);
  }

  .ant-input-affix-wrapper:focus,
  .ant-input-affix-wrapper:hover {
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.14);
    background: rgba(255, 255, 255, 0.02);
    transform: translateY(-1px);
  }

  @media (max-width: 1024px) {
    max-width: none;
  }
`;

export const Right = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-3);
  min-width: 220px;
  padding-left: var(--space-2);

  @media (max-width: 1024px) {
    min-width: 0;
    padding-left: 0;
    margin-left: auto;
  }

  @media (max-width: 560px) {
    .upgrade-button {
      display: none;
    }
  }

  .upgrade-button {
    border-radius: 999px;
    transition:
      transform var(--motion-duration-fast) var(--motion-ease-standard),
      box-shadow var(--motion-duration-fast) var(--motion-ease-standard);
  }

  .notifications-button {
    width: 38px;
    height: 38px;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    transition:
      transform var(--motion-duration-fast) var(--motion-ease-standard),
      box-shadow var(--motion-duration-fast) var(--motion-ease-standard),
      border-color var(--motion-duration-fast) var(--motion-ease-standard);
  }

  .notifications-badge {
    display: inline-flex;
    line-height: 1;
  }

  .notifications-badge .ant-badge-count {
    box-shadow: 0 0 0 1px var(--color-surface);
  }

  .notifications-button:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
  }

  .notifications-button.has-unread {
    border-color: color-mix(in srgb, var(--color-primary) 55%, var(--color-border));
  }

  .notifications-button.has-unread svg {
    animation: header-bell-ring 2.2s ease-in-out infinite;
    transform-origin: top center;
  }

  .upgrade-button:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
  }

  .user-avatar {
    cursor: pointer;
    transition:
      transform var(--motion-duration-fast) var(--motion-ease-standard),
      box-shadow var(--motion-duration-fast) var(--motion-ease-standard);
  }

  .user-avatar:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
  }

  @keyframes header-bell-ring {
    0%,
    100% {
      transform: rotate(0);
    }
    10% {
      transform: rotate(-10deg);
    }
    22% {
      transform: rotate(9deg);
    }
    34% {
      transform: rotate(-6deg);
    }
    46% {
      transform: rotate(4deg);
    }
  }
`;

export const MobileMenuButton = styled.button`
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  width: 38px;
  height: 38px;
  display: none;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--color-text);
  transition:
    transform var(--motion-duration-fast) var(--motion-ease-standard),
    box-shadow var(--motion-duration-fast) var(--motion-ease-standard);

  @media (max-width: 1024px) {
    display: inline-flex;
  }

  &:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
  }
`;

export const UserMenuOverlay = styled.div`
  min-width: 240px;
  padding: 8px;
  border-radius: 14px;
  border: 1px solid color-mix(in srgb, var(--color-primary) 18%, var(--color-border));
  background:
    radial-gradient(
      120% 120% at 8% 10%,
      color-mix(in srgb, var(--color-primary) 11%, transparent),
      transparent 42%
    ),
    radial-gradient(
      120% 120% at 90% 90%,
      color-mix(in srgb, var(--color-secondary) 10%, transparent),
      transparent 48%
    ),
    linear-gradient(
      140deg,
      color-mix(in srgb, var(--color-surface-2) 76%, transparent),
      var(--color-surface)
    );
  box-shadow: var(--shadow-md);
`;

export const UserMenuIdentity = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 4px 8px;

  .identity-avatar {
    border: 1px solid color-mix(in srgb, var(--color-primary) 40%, var(--color-border));
  }
`;

export const UserMenuIdentityMeta = styled.div`
  min-width: 0;
`;

export const UserMenuIdentityName = styled.div`
  font-size: 13px;
  line-height: 1.3;
  font-weight: 700;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const UserMenuIdentityEmail = styled.div`
  margin-top: 1px;
  font-size: 11px;
  line-height: 1.3;
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const UserMenuDivider = styled.div`
  height: 1px;
  margin: 0 2px 6px;
  background: var(--color-divider);
`;
