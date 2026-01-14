import styled from "styled-components";

export const PrivatePageShell = styled.div`
  min-height: 100vh;
  width: 100%;

  display: flex;
  flex-direction: column;
  align-items: stretch;

  padding: 0;
`;

export const ContentShell = styled.main`
  width: 100%;
  padding: var(--space-6) 0 var(--space-8);
  flex: 1;

  @media (max-width: 768px) {
    padding: var(--space-5) 0 var(--space-7);
  }
`;

export const PrivateFrame = styled.div`
  width: 100%;
  max-width: 1120px;
  margin-inline: auto;

  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-elevated);

  padding: var(--space-4);
  /* allow children popups (calendar, tooltips) to escape the frame and not be clipped */
  overflow: visible;


  margin-top: var(--space-2);
  min-height: 420px;
  transition: min-height 240ms ease, opacity 160ms ease;

  @media (max-width: 768px) {
    padding: var(--space-3);
    margin-top: var(--space-2);
    min-height: 320px;
  }
`;

export const SkeletonOverlay = styled.div`
  position: absolute;
  inset: 0;
  padding: var(--space-4);
  background: rgba(0,0,0,0); /* keep transparent to show surface */
  display: flex;
  align-items: flex-start;
  justify-content: center;
  pointer-events: none;
  transition: opacity 280ms ease;
  opacity: 1;

  &.fading {
    opacity: 0;
  }

  @media (max-width: 768px) {
    padding: var(--space-3);
  }
`;

export const SkeletonWrap = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: var(--space-4);

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const shimmer = `
  linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0) 100%)
`;

export const SkeletonRow = styled.div`
  height: 14px;
  border-radius: 6px;
  background: linear-gradient(180deg, var(--color-surface-2), var(--color-surface-2));
  position: relative;
  overflow: hidden;
  margin-bottom: 10px;

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: -150%;
    height: 100%;
    width: 150%;
    background-image: ${shimmer};
    transform: translateX(0);
    animation: shimmer 1.2s ease-in-out infinite;
    opacity: 0.8;
  }

  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;

export const SkeletonAvatar = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 12px;
  background: var(--color-surface-2);
  position: relative;

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: -150%;
    height: 100%;
    width: 150%;
    background-image: ${shimmer};
    animation: shimmer 1.2s ease-in-out infinite;
    opacity: 0.8;
  }
`;

export const SkeletonList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

/* removed SkeletonOverlay (reverted overlay approach) */
