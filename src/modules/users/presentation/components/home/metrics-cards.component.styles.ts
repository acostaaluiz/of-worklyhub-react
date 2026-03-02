import { Card, Row } from "antd";
import styled from "styled-components";

export const MetricsRow = styled(Row)`
  margin-bottom: var(--space-3);
`;

export const MetricCard = styled(Card)`
  height: 100%;
  transition:
    transform var(--motion-duration-fast) var(--motion-ease-standard),
    box-shadow var(--motion-duration-fast) var(--motion-ease-standard),
    border-color var(--motion-duration-fast) var(--motion-ease-standard);

  .ant-card-body {
    padding: var(--space-3);
  }

  &:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
    border-color: var(--color-primary);
  }
`;

export const MetricContent = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-3);
`;

export const MetricIcon = styled.div`
  width: 44px;
  height: 44px;
  border-radius: var(--radius-sm);
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
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
`;

export const MetricValue = styled.div<{ $compact?: boolean }>`
  font-weight: 700;
  font-size: ${({ $compact }) =>
    $compact ? "var(--font-size-sm)" : "var(--font-size-lg)"};
  line-height: var(--line-height-tight);
  margin-top: 2px;
  word-break: break-word;
`;
