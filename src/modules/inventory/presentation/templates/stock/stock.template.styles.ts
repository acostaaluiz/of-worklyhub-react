import styled from "styled-components";
import { BaseTemplate } from "@shared/base/base.template";

export const StockTemplateShell = styled(BaseTemplate)`
  height: 100%;
  max-height: 100%;
  min-height: 0;
  min-width: 0;
  overflow: hidden;

  > div {
    min-height: 0;
  }

  > div:last-child {
    height: 100%;
    min-height: 0;
  }

  > div:last-child > div:last-child {
    display: flex;
    flex-direction: column;
    min-height: 0;
    min-width: 0;
  }
`;

export const TemplateShell = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: 16px;
  height: 100%;
  min-height: 0;
  overflow: hidden;

  @media (max-width: 1024px) {
    height: auto;
    overflow: visible;
    padding: 14px;
    gap: var(--space-3);
  }

  @media (max-width: 640px) {
    padding: 10px;
  }
`;

export const HeaderRow = styled.div`
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  border-radius: var(--radius-lg);
  border: 1px solid color-mix(in srgb, var(--color-primary) 24%, var(--color-border));
  padding: 14px 16px;
  background:
    radial-gradient(circle at 12% 18%, rgba(30, 112, 255, 0.14), transparent 38%),
    radial-gradient(circle at 86% 86%, rgba(0, 214, 160, 0.12), transparent 42%),
    linear-gradient(
      140deg,
      color-mix(in srgb, var(--color-surface-2) 80%, transparent),
      var(--color-surface)
    );
  box-shadow: var(--shadow-sm);

  @media (max-width: 640px) {
    align-items: flex-start;
    padding: 12px;
  }
`;

export const HeaderMain = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;

  @media (max-width: 640px) {
    align-items: flex-start;
  }
`;

export const HeaderIcon = styled.span`
  width: 40px;
  height: 40px;
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

export const HeaderTitle = styled.h2`
  margin: 0;
`;

export const HeaderSubtitle = styled.p`
  margin: 0;
  color: var(--color-text-muted);
`;

export const FilterWrap = styled.div`
  margin-top: 2px;
`;

export const ContentWrap = styled.div`
  margin-top: 2px;
  min-width: 0;
  min-height: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  @media (max-width: 1024px) {
    overflow: visible;
  }
`;

export const TabsHost = styled.div`
  flex: 1;
  min-height: 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .ant-tabs {
    flex: 1;
    min-height: 0;
    min-width: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .ant-tabs-nav {
    margin-bottom: 8px;
    flex-shrink: 0;
    min-width: 0;
    overflow: hidden;
  }

  .ant-tabs-nav-wrap,
  .ant-tabs-nav-list {
    min-width: 0;
  }

  .ant-tabs-content-holder {
    flex: 1;
    min-height: 0;
    min-width: 0;
    overflow: hidden;
    overflow-x: hidden;
  }

  .ant-tabs-content,
  .ant-tabs-tabpane {
    height: 100%;
    min-height: 0;
    min-width: 0;
    overflow: hidden;
    overflow-x: hidden;
  }

  @media (max-width: 1024px) {
    overflow: visible;

    .ant-tabs,
    .ant-tabs-content-holder,
    .ant-tabs-content,
    .ant-tabs-tabpane {
      overflow: visible;
      height: auto;
      min-height: 0;
    }

    .ant-tabs-tab {
      margin-inline-end: 8px;
      padding-inline: 6px;
    }
  }
`;
