import React from "react";
import { Button, message } from "antd";
import { Trash2, Edit, User, Clock, Tag } from "lucide-react";

import { i18n as appI18n } from "@core/i18n";
import { loadingService } from "@shared/ui/services/loading.service";
import { useScheduleApi } from "../../../services/schedule.service";
import type { ScheduleCategory } from "../../../interfaces/schedule-category.model";

type PopupWorker = {
  email?: string;
  fullName?: string;
  userUid?: string;
};

type PopupStatus = {
  label?: string;
  code?: string;
};

type PopupCategory = {
  label?: string;
};

type PopupRaw = {
  workers?: PopupWorker[] | null;
  inventoryInputsText?: string | null;
  inventoryOutputsText?: string | null;
  category?: PopupCategory | null;
  categoryColor?: string;
  statusColor?: string;
  status?: PopupStatus | null;
  startTime?: string;
  endTime?: string;
  description?: string;
};

export type SchedulePopupEvent = {
  id: string;
  title: string;
  calendarId?: string;
  backgroundColor?: string;
  raw?: PopupRaw;
  onEdit?: () => void;
  onRequestEdit?: () => void;
  onOpenEditor?: () => void;
};

type Props = {
  event: SchedulePopupEvent;
  position: { left: number; top: number };
  onClose: () => void;
  onDeleted?: () => void | Promise<void>;
  onEdit?: () => void;
  loadMonthEventsFromInstance?: () => Promise<void>;
  categories?: ScheduleCategory[] | null;
};

function escapeHtml(input?: string | null) {
  if (!input) return "";
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export const ScheduleEventPopup: React.FC<Props> = ({
  event,
  position,
  onClose,
  onDeleted,
  loadMonthEventsFromInstance,
}) => {
        const api = useScheduleApi();

  if (!event) return null;

  const handleDelete = async () => {
    try {
      loadingService.show();
      const ok = await api.removeEvent(event.id);
      if (ok) {
        try {
          if (loadMonthEventsFromInstance) await loadMonthEventsFromInstance();
        } catch (error) {
          void error;
        }
        message.success(appI18n.t("legacyInline.schedule.presentation_components_schedule_calendar_schedule_event_popup_component.k001"));
        if (onDeleted) onDeleted();
      } else {
        message.error(appI18n.t("legacyInline.schedule.presentation_components_schedule_calendar_schedule_event_popup_component.k002"));
      }
    } catch (error) {
      void error;
      message.error(appI18n.t("legacyInline.schedule.presentation_components_schedule_calendar_schedule_event_popup_component.k003"));
    } finally {
      loadingService.hide();
      onClose();
    }
  };

  const workersText =
    Array.isArray(event.raw?.workers) && event.raw.workers.length > 0
      ? event.raw.workers
          .map((w) => w.email || w.fullName || w.userUid || "")
          .filter(Boolean)
          .join(", ")
      : "--";

  const consumesText = event.raw?.inventoryInputsText || "";
  const producesText = event.raw?.inventoryOutputsText || "";

  const categoryLabel =
    (event.raw && event.raw.category && event.raw.category.label) ||
    event.calendarId ||
    "";

  const popupBg =
    event?.raw?.categoryColor ||
    event?.backgroundColor ||
    event?.raw?.statusColor ||
    "var(--color-surface)";
  const statusColor = event?.raw?.statusColor || undefined;
  const viewportWidth =
    typeof window !== "undefined" ? window.innerWidth : 1024;
  const isMobileViewport = viewportWidth <= 640;
  const popupWidth = Math.max(220, Math.min(250, viewportWidth - 24));

  return (
    <div
      className="tui-react-popup"
      style={{
        position: "absolute",
        left: position.left,
        top: position.top,
        transform: "translate(-50%, -8px)",
        zIndex: 2147483647,
        pointerEvents: "auto",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="tui-custom-popup"
        style={{
          background: popupBg,
          padding: 16,
          width: popupWidth,
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 8,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                className="tui-custom-popup-title"
                style={{
                  fontWeight: 800,
                  flex: 1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: isMobileViewport ? "normal" : "nowrap",
                  overflowWrap: "anywhere",
                }}
              >
                {event.title}
              </div>
              <div
                className="tui-custom-popup-status"
                style={{
                  flex: "0 0 auto",
                  marginLeft: 8,
                  padding: "4px 8px",
                  borderRadius: 12,
                  background: statusColor
                    ? statusColor
                    : "rgba(255,255,255,0.06)",
                  color: "var(--color-text)",
                  fontSize: 12,
                }}
              >
                {(event.raw?.status &&
                  (event.raw?.status.label || event.raw?.status.code)) ||
                  ""}
              </div>
            </div>
            <div
              className="tui-custom-popup-time"
              style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}
            >
              <Clock size={14} />
              <span style={{ color: "var(--color-text-muted)" }}>
                {event.raw?.startTime && event.raw?.endTime
                  ? `${event.raw.startTime} - ${event.raw.endTime}`
                  : ""}
              </span>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            marginBottom: 8,
          }}
        >
          <div
            className="tui-custom-popup-body"
            style={{ color: "var(--color-text)", lineHeight: 1.3, overflow: "hidden" }}
            dangerouslySetInnerHTML={{
              __html: `<div>${escapeHtml(event.raw?.description ?? "")}</div>`,
            }}
          />
          <div
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
              fontSize: 12,
              color: "var(--color-text-muted)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                minWidth: 0,
                flex: 1,
                overflow: "hidden",
              }}
            >
              <User size={14} />
              <div
                style={{
                  minWidth: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {workersText}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                flex: "0 0 auto",
              }}
            >
              <Tag size={14} />
              <div style={{ color: "var(--color-text-muted)" }}>
                {escapeHtml(categoryLabel)}
              </div>
            </div>
          </div>
          {consumesText || producesText ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
                fontSize: 12,
                color: "var(--color-text-muted)",
              }}
            >
              {consumesText ? (
                <div>
                  <strong style={{ color: "var(--color-text)" }}>{appI18n.t("legacyInline.schedule.presentation_components_schedule_calendar_schedule_event_popup_component.k004")}:</strong>{" "}
                  {escapeHtml(consumesText)}
                </div>
              ) : null}
              {producesText ? (
                <div>
                  <strong style={{ color: "var(--color-text)" }}>{appI18n.t("legacyInline.schedule.presentation_components_schedule_calendar_schedule_event_popup_component.k005")}:</strong>{" "}
                  {escapeHtml(producesText)}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <div
          className="tui-custom-popup-footer"
          style={{
            display: "flex",
            gap: 8,
            justifyContent: "flex-end",
            marginTop: 6,
          }}
        >
          <Button size="small" onClick={handleDelete}>
            <Trash2 size={14} />
          </Button>
          <Button
            type="primary"
            size="small"
            onClick={() => {
              event.onEdit?.();
              event.onRequestEdit?.();
              event.onOpenEditor?.();
            }}
            icon={<Edit size={14} />}
          >
            {appI18n.t("legacyInline.schedule.presentation_components_schedule_calendar_schedule_event_popup_component.k006")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleEventPopup;
