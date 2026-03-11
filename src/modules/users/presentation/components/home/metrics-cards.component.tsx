import { Col } from "antd";
import { AlertTriangle, Bell, ClipboardList } from "lucide-react";
import {
  MetricCard,
  MetricContent,
  MetricIcon,
  MetricLabel,
  MetricMeta,
  MetricsRow,
  MetricValue,
} from "./metrics-cards.component.styles";

type Props = {
  overdueWorkOrders?: number;
  inventoryAlerts?: number;
  unreadNotifications?: number;
  highPriorityUnreadNotifications?: number;
};

export default function MetricsCards({
  overdueWorkOrders = 0,
  inventoryAlerts = 0,
  unreadNotifications = 0,
  highPriorityUnreadNotifications = 0,
}: Props) {
  return (
    <MetricsRow gutter={[12, 12]}>
      <Col xs={24} sm={8}>
        <MetricCard className="surface">
          <MetricContent>
            <MetricIcon>
              <ClipboardList size={18} />
            </MetricIcon>
            <MetricMeta>
              <MetricLabel>Overdue work orders</MetricLabel>
              <MetricValue>{overdueWorkOrders}</MetricValue>
            </MetricMeta>
          </MetricContent>
        </MetricCard>
      </Col>

      <Col xs={24} sm={8}>
        <MetricCard className="surface">
          <MetricContent>
            <MetricIcon>
              <AlertTriangle size={18} />
            </MetricIcon>
            <MetricMeta>
              <MetricLabel>Inventory alerts</MetricLabel>
              <MetricValue>{inventoryAlerts}</MetricValue>
            </MetricMeta>
          </MetricContent>
        </MetricCard>
      </Col>

      <Col xs={24} sm={8}>
        <MetricCard className="surface">
          <MetricContent>
            <MetricIcon>
              <Bell size={18} />
            </MetricIcon>
            <MetricMeta>
              <MetricLabel>
                Unread notifications
                {highPriorityUnreadNotifications > 0
                  ? ` (${highPriorityUnreadNotifications} high priority)`
                  : ""}
              </MetricLabel>
              <MetricValue>{unreadNotifications}</MetricValue>
            </MetricMeta>
          </MetricContent>
        </MetricCard>
      </Col>
    </MetricsRow>
  );
}
