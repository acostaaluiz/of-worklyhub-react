import { Tabs } from "antd";
import styled from "styled-components";

export const ListRoot = styled.div`
  height: 100%;
  min-height: 0;
`;

export const StyledTabs = styled(Tabs)`
  height: 100%;

  .ant-tabs-nav {
    margin-bottom: 12px;
  }

  .ant-tabs-tab {
    padding: 6px 12px;
    transition:
      color var(--motion-duration-fast) var(--motion-ease-standard);
  }

  .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
    color: var(--color-primary);
  }

  .ant-tabs-content-holder {
    min-height: 0;
  }

  .ant-tabs-content,
  .ant-tabs-tabpane {
    height: 100%;
    min-height: 0;
  }
`;

export const WorkOrdersPane = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  min-height: 0;
`;

export const PaneToolbar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const PaneHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
`;

export const PaneTitle = styled.div`
  font-weight: 700;
  font-size: 16px;
  letter-spacing: -0.01em;
`;

export const PaneActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: 768px) {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;

    .ant-btn {
      width: 100%;
    }
  }
`;

export const FiltersRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    align-items: stretch;

    .ant-input,
    .ant-input-affix-wrapper,
    .ant-select,
    .ant-picker,
    .ant-btn {
      width: 100% !important;
    }

    .ant-btn {
      min-height: 34px;
    }
  }
`;

export const TableWrap = styled.div`
  flex: 1;
  min-height: 0;
  border: 1px solid color-mix(in srgb, var(--color-primary) 16%, var(--color-border));
  border-radius: 12px;
  overflow: hidden;
  background: color-mix(in srgb, var(--color-surface) 94%, transparent);
  box-shadow: var(--shadow-sm);

  .ant-table-wrapper,
  .ant-spin-nested-loading,
  .ant-spin-container {
    height: 100%;
  }

  .work-order-actions-col {
    padding-right: 20px !important;
  }

  .work-order-actions-col .ant-space {
    flex-wrap: nowrap;
  }
`;

export const MobileList = styled.div`
  height: 100%;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
`;

export const MobileCard = styled.article`
  border: 1px solid color-mix(in srgb, var(--color-primary) 14%, var(--color-border));
  border-radius: 10px;
  background: color-mix(in srgb, var(--color-surface-2) 78%, var(--color-surface));
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
`;

export const MobileCardHead = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
`;

export const MobileCardMeta = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;

  .title {
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .subtitle {
    color: var(--color-text-muted);
    font-size: 12px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

export const MobileCardDescription = styled.div`
  color: var(--color-text-muted);
  font-size: 12px;
  line-height: 1.35;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const MobileCardActions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;

  .ant-btn {
    width: 100%;
  }
`;

export const TableFooterState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 36px;
  border-top: 1px solid color-mix(in srgb, var(--color-primary) 14%, var(--color-border));
  color: var(--color-text-muted);
  font-size: 12px;
  background: color-mix(in srgb, var(--color-surface-2) 86%, transparent);
`;

export const OverviewCard = styled.div`
  border: 1px solid color-mix(in srgb, var(--color-primary) 22%, var(--color-border));
  border-radius: 12px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background:
    radial-gradient(circle at 8% 14%, rgba(30, 112, 255, 0.12), transparent 34%),
    radial-gradient(circle at 88% 86%, rgba(0, 214, 160, 0.1), transparent 40%),
    color-mix(in srgb, var(--color-surface-2) 86%, transparent);
  box-shadow: var(--shadow-sm);
`;

export const OverviewHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
`;

export const OverviewTitle = styled.div`
  font-weight: 700;
`;

export const OverviewUpdated = styled.div`
  color: var(--color-text-muted);
  font-size: 12px;
`;

export const OverviewTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

export const OverviewActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

export const InsightsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const InsightRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: flex-start;
`;

export const InsightMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const InsightTitle = styled.span`
  font-weight: 600;
`;

export const InsightDescription = styled.span`
  font-size: 12px;
  color: var(--color-text-muted);
`;

export const InsightAction = styled.span`
  font-size: 12px;
`;

export const OverviewEmpty = styled.div`
  color: var(--color-text-muted);
`;
