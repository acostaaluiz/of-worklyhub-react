import { Button, Card, Space, Tabs } from "antd";
import styled from "styled-components";

export const GrowthRoot = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const HeroCard = styled.section`
  border: 1px solid color-mix(in srgb, var(--color-primary) 24%, var(--color-border));
  border-radius: var(--radius-lg);
  padding: 14px;
  background:
    radial-gradient(
      420px 180px at 10% 10%,
      color-mix(in srgb, var(--color-primary) 16%, transparent),
      transparent 65%
    ),
    radial-gradient(
      420px 180px at 88% 92%,
      color-mix(in srgb, var(--color-secondary) 16%, transparent),
      transparent 65%
    ),
    linear-gradient(
      140deg,
      color-mix(in srgb, var(--color-surface-2) 78%, transparent),
      var(--color-surface)
    );
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

export const HeroTop = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 14px;
  flex-wrap: wrap;
`;

export const HeroTitleWrap = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
`;

export const HeroIconWrap = styled.span`
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid color-mix(in srgb, var(--color-primary) 24%, var(--color-border));
  background: color-mix(in srgb, var(--color-surface-2) 80%, transparent);
  box-shadow: var(--shadow-sm);
  flex-shrink: 0;
`;

export const HeroTitle = styled.h2`
  margin: 0;
  font-size: clamp(24px, 2.2vw, 32px);
  line-height: 1.1;
`;

export const HeroSubtitle = styled.p`
  margin: 4px 0 0;
  color: var(--color-text-muted);
`;

export const HeroActions = styled(Space)`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

export const HeroRefreshButton = styled(Button)`
  border-radius: 999px;
`;

export const HeroDispatchButton = styled(Button)`
  border-radius: 999px;
`;

export const BodyCard = styled(Card)`
  overflow: visible;
  border: 1px solid color-mix(in srgb, var(--color-primary) 18%, var(--color-border));
  border-radius: var(--radius-lg);
  background:
    linear-gradient(
      140deg,
      color-mix(in srgb, var(--color-surface-2) 72%, transparent),
      var(--color-surface)
    );
  box-shadow: var(--shadow-sm);

  > .ant-card-body {
    padding: 0;
    display: block;
  }
`;

export const GrowthTabs = styled(Tabs)`
  .ant-tabs-nav {
    margin: 0;
    padding: 10px 14px 0;
  }

  .ant-tabs-content-holder {
    overflow: visible;
  }
`;

export const PaneShell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px;
`;

export const Toolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
`;

export const ToolbarSpacer = styled.div`
  flex: 1;
`;

export const TableWrap = styled.div`
  max-height: min(56vh, 560px);
  overflow: auto;
  border: 1px solid var(--color-divider);
  border-radius: var(--radius-md);
  background: color-mix(in srgb, var(--color-surface) 86%, transparent);
  padding: 8px;

  .ant-table {
    background: transparent;
  }

  .ant-table-container::before,
  .ant-table-container::after {
    display: none !important;
  }
`;

export const PlaybooksGrid = styled.div`
  overflow: visible;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
  }
`;

export const PlaybookCarouselShell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const PlaybookCarouselControls = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px;
  border: 1px solid color-mix(in srgb, var(--color-primary) 22%, var(--color-border));
  border-radius: 999px;
  background: color-mix(in srgb, var(--color-surface-2) 70%, transparent);
`;

export const PlaybookIndicator = styled.span`
  min-width: 70px;
  text-align: center;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  font-weight: 600;
`;

export const PlaybookDots = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

export const PlaybookDot = styled.button<{ $active?: boolean }>`
  width: ${({ $active }) => ($active ? "24px" : "10px")};
  height: 10px;
  border: 0;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${({ $active }) =>
    $active
      ? "var(--color-primary)"
      : "color-mix(in srgb, var(--color-text-muted) 35%, transparent)"};

  &:hover {
    filter: brightness(1.08);
  }
`;

export const PlaybookCard = styled(Card)`
  border: 1px solid color-mix(in srgb, var(--color-primary) 18%, var(--color-border));
  border-radius: var(--radius-md);
  background:
    linear-gradient(
      140deg,
      color-mix(in srgb, var(--color-surface-2) 72%, transparent),
      var(--color-surface)
    );

  .ant-card-body {
    display: flex;
    flex-direction: column;
    gap: 14px;
    min-height: 220px;
    padding: 16px;
  }
`;

export const PlaybookHead = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: flex-start;
`;

export const PlaybookTitle = styled.h3`
  margin: 0;
  font-size: 17px;
`;

export const PlaybookDescription = styled.p`
  margin: 4px 0 0;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
`;

export const AttributionGrid = styled.div`
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(4, minmax(0, 1fr));

  @media (max-width: 1120px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

export const AttributionDetailGrid = styled.div`
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(2, minmax(0, 1fr));

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

export const AttributionCard = styled(Card)`
  border: 1px solid color-mix(in srgb, var(--color-primary) 18%, var(--color-border));
  border-radius: var(--radius-md);
  background:
    linear-gradient(
      140deg,
      color-mix(in srgb, var(--color-surface-2) 72%, transparent),
      var(--color-surface)
    );

  > .ant-card-body {
    padding: 14px;
  }
`;

export const AttributionMeta = styled.div`
  margin-top: 8px;
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
`;

export const AttributionList = styled.ul`
  margin: 0;
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const AttributionListItem = styled.li`
  color: var(--color-text);
  font-size: var(--font-size-sm);

  > span {
    color: var(--color-text-muted);
    font-size: var(--font-size-xs);
    display: block;
    margin-top: 2px;
  }
`;

export const AttributionScroll = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const FooterHint = styled.div`
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
  margin-top: 2px;
`;
