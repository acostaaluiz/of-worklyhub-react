import styled from "styled-components";

export const LandingShell = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  padding: var(--space-6);

  @media (max-width: 768px) {
    padding: var(--space-5);
  }

  @media (max-width: 480px) {
    padding: var(--space-4);
  }
`;

export const LandingHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
`;

export const LandingTitleRow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
`;

export const LandingTitle = styled.h2`
  margin: 0;
`;

export const LandingTitleIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--color-surface-2);
  color: var(--color-text);
`;

export const LandingDescription = styled.p`
  margin: var(--space-2) 0 0;
  color: var(--color-text-muted);
`;

export const LandingGrid = styled.div<{ $columns?: number }>`
  display: grid;
  gap: var(--space-4);
  grid-template-columns: repeat(${({ $columns }) => Math.max(1, $columns ?? 1)}, minmax(0, 1fr));

  @media (max-width: 768px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const LandingCard = styled.button<{ $disabled?: boolean }>`
  display: flex;
  align-items: center;
  gap: var(--space-4);
  width: 100%;
  padding: var(--space-4);
  text-align: left;
  font: inherit;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-divider);
  background: var(--color-surface);
  color: var(--color-text);
  appearance: none;
  cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};
  opacity: ${({ $disabled }) => ($disabled ? 0.6 : 1)};
  transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;

  &:hover {
    transform: ${({ $disabled }) => ($disabled ? "none" : "translateY(-1px)")};
    box-shadow: ${({ $disabled }) => ($disabled ? "none" : "var(--shadow-sm)")};
    border-color: ${({ $disabled }) => ($disabled ? "var(--color-divider)" : "var(--color-primary)")};
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }
`;

export const CardIcon = styled.div<{ $disabled?: boolean }>`
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: var(--color-surface-2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ $disabled }) => ($disabled ? "var(--color-text-muted)" : "var(--color-text)")};
  flex-shrink: 0;
`;

export const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
`;

export const CardTitle = styled.div`
  font-weight: 600;
`;

export const CardDescription = styled.div`
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
`;

export const CardMeta = styled.div`
  font-size: 12px;
  color: var(--color-text-muted);
`;

export const CardAction = styled.div<{ $disabled?: boolean }>`
  width: 28px;
  height: 28px;
  border-radius: 999px;
  background: var(--color-surface-2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ $disabled }) => ($disabled ? "var(--color-text-muted)" : "var(--color-text)")};
  flex-shrink: 0;
`;
