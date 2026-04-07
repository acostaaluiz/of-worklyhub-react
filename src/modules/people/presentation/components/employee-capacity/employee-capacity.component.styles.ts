import { Card } from "antd";
import styled from "styled-components";

export const IndicatorCardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

export const IndicatorMetricCard = styled(Card)`
  height: 100%;
  min-height: 104px;
  border-radius: 16px;
  border: 1px solid color-mix(in srgb, var(--color-primary) 18%, var(--color-border));
  background:
    radial-gradient(circle at 16% 18%, rgba(30, 112, 255, 0.12), transparent 36%),
    radial-gradient(circle at 86% 84%, rgba(0, 214, 160, 0.14), transparent 40%),
    linear-gradient(
      145deg,
      color-mix(in srgb, var(--color-surface-2) 86%, transparent),
      color-mix(in srgb, var(--color-surface) 90%, transparent)
    );
  box-shadow: var(--shadow-sm);
  transition:
    transform var(--motion-duration-fast) var(--motion-ease-standard),
    box-shadow var(--motion-duration-fast) var(--motion-ease-standard),
    border-color var(--motion-duration-fast) var(--motion-ease-standard);

  .ant-card-body {
    height: 100%;
    padding: 12px 14px;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
    border-color: color-mix(in srgb, var(--color-primary) 38%, var(--color-border));
  }
`;

export const IndicatorMetricContent = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  height: 100%;
`;

export const IndicatorMetricIcon = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: 1px solid color-mix(in srgb, var(--color-primary) 20%, var(--color-border));
  background: color-mix(in srgb, var(--color-surface) 82%, transparent);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: var(--shadow-sm);
`;

export const IndicatorMetricMeta = styled.div`
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const IndicatorMetricLabel = styled.div`
  font-size: 11px;
  line-height: 1.2;
  color: var(--color-text-muted);
`;

export const IndicatorMetricValue = styled.div`
  font-size: clamp(24px, 2.2vh, 30px);
  line-height: 1;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--color-text);
  margin-top: 4px;
  word-break: break-word;
`;

export const IndicatorMetricHint = styled.div<{ $tone?: "success" | "warning" }>`
  margin-top: auto;
  font-size: 11px;
  line-height: 1.35;
  color: ${({ $tone }) =>
    $tone === "warning"
      ? "color-mix(in srgb, var(--color-warning) 78%, var(--color-text))"
      : "color-mix(in srgb, var(--color-success) 72%, var(--color-text))"};
`;

