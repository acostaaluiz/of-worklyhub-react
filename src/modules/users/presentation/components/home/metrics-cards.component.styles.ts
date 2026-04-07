import { Row } from "antd";
import { css } from "styled-components";
import styled from "styled-components";

export const MetricsRow = styled(Row)`
  margin-bottom: var(--space-3);
`;

const metricSurfaceStyles = css`
  background:
    radial-gradient(
      120% 120% at 6% 8%,
      color-mix(in srgb, var(--color-primary) 12%, transparent),
      transparent 42%
    ),
    radial-gradient(
      120% 120% at 92% 88%,
      color-mix(in srgb, var(--color-secondary) 12%, transparent),
      transparent 46%
    ),
    linear-gradient(
      140deg,
      color-mix(in srgb, var(--color-surface-2) 72%, transparent),
      var(--color-surface)
    );
  border: 1px solid color-mix(in srgb, var(--color-primary) 18%, var(--color-border));
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
`;

export const MetricCard = styled.article`
  ${metricSurfaceStyles}
  width: 100%;
  height: 100%;
  min-height: 100px;
  padding: 10px;
  display: flex;
  align-items: center;
  transition:
    transform var(--motion-duration-fast) var(--motion-ease-standard),
    box-shadow var(--motion-duration-fast) var(--motion-ease-standard);
`;

export const MetricContent = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
`;

export const MetricIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--color-surface-2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

export const MetricMeta = styled.div`
  min-width: 0;
`;

export const MetricLabel = styled.div`
  font-size: 11px;
  color: var(--color-text-muted);
`;

export const MetricLabelRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

export const MetricValue = styled.div<{ $compact?: boolean }>`
  font-weight: 700;
  font-size: ${({ $compact }) =>
    $compact ? "13px" : "34px"};
  line-height: var(--line-height-tight);
  margin-top: 2px;
  word-break: break-word;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const MetricHint = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 3px;
  flex-shrink: 0;
  color: var(--color-text-muted);
  font-size: 10px;
  line-height: 1;
  opacity: 0.72;
  white-space: nowrap;

  svg {
    opacity: 0.7;
  }
`;

export const MetricFlipInner = styled.div<{ $flipped: boolean }>`
  position: relative;
  width: 100%;
  min-height: 100px;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform var(--motion-duration-slow) var(--motion-ease-standard);
  transform: ${({ $flipped }) => ($flipped ? "rotateY(180deg)" : "rotateY(0deg)")};
`;

export const MetricFace = styled.div<{ $side: "front" | "back" }>`
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  display: flex;
  height: 100%;
  width: 100%;
  transform: ${({ $side }) => ($side === "back" ? "rotateY(180deg)" : "rotateY(0deg)")};
`;

export const MetricBack = styled.div`
  ${metricSurfaceStyles}
  width: 100%;
  min-height: 100%;
  padding: 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 8px;
`;

export const MetricBackHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

export const MetricBackLabel = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--color-text-muted);
  font-size: 11px;
  font-weight: 700;
`;

export const MetricBackDetail = styled.div`
  color: var(--color-text);
  font-size: 13px;
  font-weight: 700;
  line-height: 1.45;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const MetricBackFooter = styled.div`
  color: var(--color-text-muted);
  font-size: 11px;
  line-height: 1.35;
`;

export const MetricFlipCard = styled.button`
  appearance: none;
  -webkit-appearance: none;
  width: 100%;
  height: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  border-radius: var(--radius-md);
  perspective: 1200px;
  cursor: pointer;
  text-align: left;
  overflow: visible;

  &:focus-visible {
    outline: 2px solid color-mix(in srgb, var(--color-primary) 65%, white);
    outline-offset: 3px;
  }

  &:hover ${MetricCard},
  &:focus-visible ${MetricCard} {
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }

  &:hover ${MetricFlipInner},
  &:focus-visible ${MetricFlipInner},
  &[aria-pressed="true"] ${MetricFlipInner} {
    transform: rotateY(180deg);
  }
`;
