import React from "react";
import { Col } from "antd";
import { AlertTriangle, Bell, ClipboardList, Info, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  MetricBack,
  MetricBackDetail,
  MetricBackFooter,
  MetricBackHeader,
  MetricBackLabel,
  MetricCard,
  MetricContent,
  MetricFace,
  MetricIcon,
  MetricLabel,
  MetricMeta,
  MetricsRow,
  MetricFlipCard,
  MetricFlipInner,
  MetricHint,
  MetricLabelRow,
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
  const { t } = useTranslation();
  const [activeCard, setActiveCard] = React.useState<string | null>(null);
  const [supportsTouchToggle, setSupportsTouchToggle] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;

    const mediaQuery = window.matchMedia("(hover: none), (pointer: coarse)");
    const sync = () => setSupportsTouchToggle(mediaQuery.matches);
    sync();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", sync);
      return () => mediaQuery.removeEventListener("change", sync);
    }

    mediaQuery.addListener(sync);
    return () => mediaQuery.removeListener(sync);
  }, []);

  const cards = [
    {
      id: "overdue-work-orders",
      label: t("home.metrics.overdueWorkOrders"),
      value: overdueWorkOrders,
      icon: <ClipboardList size={18} />,
      detailLabel: t("home.metrics.overdueWorkOrdersDetailLabel"),
      detail: t("home.metrics.overdueWorkOrdersDetail", { count: overdueWorkOrders }),
      footer: overdueWorkOrders > 0
        ? t("home.metrics.overdueWorkOrdersFooterRisk")
        : t("home.metrics.overdueWorkOrdersFooterClear"),
    },
    {
      id: "inventory-alerts",
      label: t("home.metrics.inventoryAlerts"),
      value: inventoryAlerts,
      icon: <AlertTriangle size={18} />,
      detailLabel: t("home.metrics.inventoryAlertsDetailLabel"),
      detail: t("home.metrics.inventoryAlertsDetail", { count: inventoryAlerts }),
      footer: inventoryAlerts > 0
        ? t("home.metrics.inventoryAlertsFooterRisk")
        : t("home.metrics.inventoryAlertsFooterClear"),
    },
    {
      id: "unread-notifications",
      label: t("home.metrics.unreadNotifications"),
      value: unreadNotifications,
      icon: <Bell size={18} />,
      detailLabel: t("home.metrics.unreadNotificationsDetailLabel"),
      detail: t("home.metrics.unreadNotificationsDetail", {
        unread: unreadNotifications,
        highPriority: highPriorityUnreadNotifications,
      }),
      footer:
        highPriorityUnreadNotifications > 0
          ? t("home.metrics.unreadNotificationsFooterPriority", {
              count: highPriorityUnreadNotifications,
            })
          : t("home.metrics.unreadNotificationsFooterCalm"),
    },
  ] as const;

  const toggleCard = React.useCallback(
    (id: string) => {
      if (!supportsTouchToggle) return;
      setActiveCard((current) => (current === id ? null : id));
    },
    [supportsTouchToggle]
  );

  const handleKeyboardToggle = React.useCallback((event: React.KeyboardEvent, id: string) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    setActiveCard((current) => (current === id ? null : id));
  }, []);

  return (
    <MetricsRow gutter={[12, 12]}>
      {cards.map((card) => {
        const isFlipped = activeCard === card.id;

        return (
          <Col xs={24} sm={8} key={card.id}>
            <MetricFlipCard
              type="button"
              aria-pressed={isFlipped}
              aria-label={t("home.metrics.flipCardAriaLabel", { label: card.label })}
              onClick={() => toggleCard(card.id)}
              onKeyDown={(event) => handleKeyboardToggle(event, card.id)}
              onMouseLeave={() => {
                if (!supportsTouchToggle) {
                  setActiveCard((current) => (current === card.id ? null : current));
                }
              }}
              data-touch-toggle={supportsTouchToggle ? "true" : "false"}
            >
              <MetricFlipInner $flipped={isFlipped}>
                <MetricFace $side="front" aria-hidden={isFlipped}>
                  <MetricCard>
                    <MetricContent>
                      <MetricIcon>
                        {card.icon}
                      </MetricIcon>
                      <MetricMeta>
                        <MetricLabelRow>
                          <MetricLabel>{card.label}</MetricLabel>
                          <MetricHint>
                            <RotateCcw size={12} />
                          </MetricHint>
                        </MetricLabelRow>
                        <MetricValue>{card.value}</MetricValue>
                      </MetricMeta>
                    </MetricContent>
                  </MetricCard>
                </MetricFace>

                <MetricFace $side="back" aria-hidden={!isFlipped}>
                  <MetricBack>
                    <MetricBackHeader>
                      <MetricBackLabel>
                        <Info size={14} />
                        <span>{card.detailLabel}</span>
                      </MetricBackLabel>
                    </MetricBackHeader>
                    <MetricBackDetail>{card.detail}</MetricBackDetail>
                    <MetricBackFooter>{card.footer}</MetricBackFooter>
                  </MetricBack>
                </MetricFace>
              </MetricFlipInner>
            </MetricFlipCard>
          </Col>
        );
      })}
    </MetricsRow>
  );
}
