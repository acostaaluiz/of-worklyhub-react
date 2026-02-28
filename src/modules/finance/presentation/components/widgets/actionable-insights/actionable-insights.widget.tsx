import { List, Skeleton, Tag } from "antd";
import styled from "styled-components";
import { Lightbulb } from "lucide-react";
import type { FinanceInsightModel } from "@modules/finance/interfaces/finance-insights.model";
import {
  WidgetBody,
  WidgetCard,
  WidgetHeader,
} from "../finance-widgets.shared.styles";

type Props = {
  className?: string;
  items: FinanceInsightModel[];
  loading?: boolean;
  subtitle?: string;
};

const Wrap = styled.div`
  min-width: 0;
  min-height: 0;
  height: 100%;
  max-height: 100%;
  overflow: auto;

  .ant-list-item {
    align-items: flex-start;
  }
`;

const InsightMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`;

const InsightTitle = styled.div`
  font-weight: 700;
  font-size: 13px;
  margin-bottom: 4px;
`;

const InsightDescription = styled.div`
  font-size: 12px;
  color: var(--color-text-muted);
  line-height: 1.35;
  margin-bottom: 8px;
`;

const ActionsList = styled.ul`
  margin: 0;
  padding-left: 18px;
  color: var(--color-text-muted);
  font-size: 12px;
  line-height: 1.35;
`;

const priorityColor = (priority: FinanceInsightModel["priority"]) => {
  if (priority === "high") return "red";
  if (priority === "medium") return "gold";
  return "blue";
};

export function ActionableInsightsWidget({
  className,
  items,
  loading,
  subtitle,
}: Props) {
  const displayItems = (items ?? []).slice(0, 4);

  return (
    <WidgetCard className={className}>
      <WidgetHeader>
        <div className="titleRow">
          <div className="title">Actionable Insights</div>
          <div className="titleIcon">
            <Lightbulb size={16} />
          </div>
        </div>
        <div className="subtitle">
          {subtitle ?? "Prioritized recommendations generated from finance data."}
        </div>
      </WidgetHeader>

      <WidgetBody>
        {loading ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : (
          <Wrap>
            <List
              dataSource={displayItems}
              locale={{ emptyText: "No actionable insights for this period." }}
              renderItem={(item) => (
                <List.Item key={item.id}>
                  <div style={{ width: "100%" }}>
                    <InsightMeta>
                      <Tag color={priorityColor(item.priority)}>
                        {item.priority.toUpperCase()}
                      </Tag>
                      <Tag>{item.category}</Tag>
                    </InsightMeta>
                    <InsightTitle>{item.title}</InsightTitle>
                    <InsightDescription>{item.description}</InsightDescription>
                    <ActionsList>
                      {(item.actions ?? []).slice(0, 2).map((action) => (
                        <li key={action.id}>{action.label}</li>
                      ))}
                    </ActionsList>
                  </div>
                </List.Item>
              )}
            />
          </Wrap>
        )}
      </WidgetBody>
    </WidgetCard>
  );
}

export default ActionableInsightsWidget;
