import styled from "styled-components";

export const HeaderShell = styled.section`
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  flex-wrap: wrap;
  border-radius: var(--radius-lg);
  border: 1px solid color-mix(in srgb, var(--color-primary) 24%, var(--color-border));
  padding: 14px 16px;
  background:
    radial-gradient(circle at 14% 18%, rgba(30, 112, 255, 0.14), transparent 38%),
    radial-gradient(circle at 86% 86%, rgba(0, 214, 160, 0.12), transparent 42%),
    linear-gradient(
      140deg,
      color-mix(in srgb, var(--color-surface-2) 80%, transparent),
      var(--color-surface)
    );
  box-shadow: var(--shadow-sm);
`;

export const HeaderMain = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
`;

export const HeaderIcon = styled.div`
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid color-mix(in srgb, var(--color-primary) 24%, var(--color-border));
  background: color-mix(in srgb, var(--color-surface-2) 78%, transparent);
  box-shadow: var(--shadow-sm);
  flex-shrink: 0;
`;

export const HeaderCopy = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

export const HeaderMeta = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
`;
