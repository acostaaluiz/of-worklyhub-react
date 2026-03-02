import styled, { css } from "styled-components";

type LandingVariant = "default" | "soft-accent";

export const LandingShell = styled.div<{ $variant?: LandingVariant }>`
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  padding: var(--space-6);

  ${({ $variant }) =>
    $variant === "soft-accent" &&
    css`
      border-radius: calc(var(--radius-lg) + 2px);
      border: 1px solid color-mix(in srgb, var(--color-primary) 26%, var(--color-border));
      background:
        radial-gradient(circle at 12% 18%, rgba(30, 112, 255, 0.14), transparent 38%),
        radial-gradient(circle at 86% 86%, rgba(0, 214, 160, 0.14), transparent 42%),
        color-mix(in srgb, var(--color-surface) 94%, transparent);
      box-shadow: var(--shadow-sm);
    `}

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

export const LandingTitleIcon = styled.span<{ $variant?: LandingVariant }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid
    ${({ $variant }) =>
      $variant === "soft-accent"
        ? "color-mix(in srgb, var(--color-primary) 26%, var(--color-border))"
        : "transparent"};
  background: ${({ $variant }) =>
    $variant === "soft-accent"
      ? "color-mix(in srgb, var(--color-surface-2) 84%, transparent)"
      : "var(--color-surface-2)"};
  color: var(--color-text);
  box-shadow: ${({ $variant }) => ($variant === "soft-accent" ? "var(--shadow-sm)" : "none")};
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

export const LandingCard = styled.button<{ $disabled?: boolean; $variant?: LandingVariant }>`
  display: flex;
  align-items: center;
  gap: var(--space-4);
  width: 100%;
  padding: var(--space-4);
  text-align: left;
  font: inherit;
  border-radius: var(--radius-lg);
  border: 1px solid
    ${({ $variant }) =>
      $variant === "soft-accent"
        ? "color-mix(in srgb, var(--color-primary) 18%, var(--color-border))"
        : "var(--color-divider)"};
  background: ${({ $variant }) =>
    $variant === "soft-accent"
      ? "linear-gradient(140deg, color-mix(in srgb, var(--color-surface-2) 72%, transparent), var(--color-surface))"
      : "var(--color-surface)"};
  color: var(--color-text);
  appearance: none;
  cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};
  opacity: ${({ $disabled }) => ($disabled ? 0.6 : 1)};
  box-shadow: ${({ $variant }) => ($variant === "soft-accent" ? "var(--shadow-sm)" : "none")};
  transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;

  &:hover {
    transform: ${({ $disabled, $variant }) =>
      $disabled ? "none" : $variant === "soft-accent" ? "translateY(-2px)" : "translateY(-1px)"};
    box-shadow: ${({ $disabled, $variant }) =>
      $disabled ? "none" : $variant === "soft-accent" ? "var(--shadow-md)" : "var(--shadow-sm)"};
    border-color: ${({ $disabled, $variant }) =>
      $disabled
        ? "var(--color-divider)"
        : $variant === "soft-accent"
          ? "color-mix(in srgb, var(--color-primary) 52%, var(--color-border))"
          : "var(--color-primary)"};
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }
`;

export const CardIcon = styled.div<{ $disabled?: boolean; $variant?: LandingVariant }>`
  width: 44px;
  height: 44px;
  border-radius: 10px;
  border: 1px solid
    ${({ $variant }) =>
      $variant === "soft-accent"
        ? "color-mix(in srgb, var(--color-primary) 22%, var(--color-border))"
        : "transparent"};
  background: ${({ $variant }) =>
    $variant === "soft-accent"
      ? "color-mix(in srgb, var(--color-surface-2) 82%, transparent)"
      : "var(--color-surface-2)"};
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

export const CardAction = styled.div<{ $disabled?: boolean; $variant?: LandingVariant }>`
  width: 28px;
  height: 28px;
  border-radius: 999px;
  border: 1px solid
    ${({ $variant }) =>
      $variant === "soft-accent"
        ? "color-mix(in srgb, var(--color-primary) 22%, var(--color-border))"
        : "transparent"};
  background: ${({ $variant }) =>
    $variant === "soft-accent"
      ? "color-mix(in srgb, var(--color-surface-2) 84%, transparent)"
      : "var(--color-surface-2)"};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ $disabled }) => ($disabled ? "var(--color-text-muted)" : "var(--color-text)")};
  flex-shrink: 0;
`;
