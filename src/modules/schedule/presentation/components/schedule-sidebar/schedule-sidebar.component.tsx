import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Checkbox, Input, Modal, message } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { CheckSquare, Pencil, Plus, Tag, Trash2 } from "lucide-react";
import { i18n as appI18n } from "@core/i18n";

import { useScheduleApi } from "../../../services/schedule.service";

import {
  getStatusColorWithOverrides,
  normalizeStatusCode,
} from "../../../constants/colors";
import { normalizeCssColor } from "../schedule-calendar/schedule-calendar.factory";

import {
  Block,
  BlockHeader,
  CategoryListScroll,
  CategoryRow,
  List,
  NextBlock,
  NextCard,
  SidebarHeaderRow,
  SidebarTitle,
} from "./schedule-sidebar.component.styles";
import type { ScheduleCategory } from "@modules/schedule/interfaces/schedule-category.model";
import type { ScheduleEvent } from "@modules/schedule/interfaces/schedule-event.model";
import { ScheduleEventModal } from "../schedule-event-modal/schedule-event-modal.component";
import type { ScheduleEventDraft } from "../schedule-event-modal/schedule-event-modal.form.types";
import type { CompanyServiceModel } from "@modules/company/interfaces/service.model";
import type { EmployeeModel } from "@modules/people/interfaces/employee.model";
import type {
  NextScheduleItem,
  ScheduleStatus,
} from "@modules/schedule/services/schedules-api";
import type { ScheduleWorkspaceSettings } from "@modules/schedule/interfaces/schedule-settings.model";

type ScheduleSidebarProps = {
  availableServices?: CompanyServiceModel[];
  availableEmployees?: EmployeeModel[];
  workspaceId?: string | null;
  onCreate?: (draft: ScheduleEventDraft) => Promise<void>;
  categories?: ScheduleCategory[] | null;
  categoryCounts?: Record<string, number> | null;
  selectedCategoryIds?: Record<string, boolean> | null;
  onToggleCategory?: (id: string, checked: boolean) => void;
  onCreateCategory?: (input: {
    label: string;
    color?: string | null;
  }) => Promise<ScheduleCategory>;
  onUpdateCategory?: (input: {
    id: string;
    label: string;
    color?: string | null;
  }) => Promise<ScheduleCategory>;
  onDeleteCategory?: (id: string) => Promise<boolean>;
  nextSchedules?: NextScheduleItem[] | null;
  statuses?: ScheduleStatus[] | null;
  statusCounts?: Record<string, number> | null;
  selectedStatusIds?: Record<string, boolean> | null;
  onToggleStatus?: (id: string, checked: boolean) => void;
  onUpdateStatusColors?: (statusColorOverrides: Record<string, string>) => Promise<void>;
  settings?: ScheduleWorkspaceSettings;
};

function colorFromId(id: string, idx: number): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  const hue = Math.abs(hash) % 360;
  const sat = 64 + ((idx * 11) % 20);
  const light = 48 + ((idx * 7) % 6);
  return `hsl(${hue} ${sat}% ${light}%)`;
}

function mapCategoriesWithDisplayColor(
  input: ScheduleCategory[] | null | undefined
): ScheduleCategory[] {
  if (!input || input.length <= 0) return [];

  return input.map((category, idx) => {
    const normalized = normalizeCssColor(category.color);
    const fallback = colorFromId(category.id, idx);
    return {
      ...category,
      code: category.code ?? "",
      color: normalized ?? fallback,
    };
  });
}

function toColorInputValue(value: string | null | undefined): string {
  if (!value) return "#06B6D4";
  const normalized = value.trim();
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(normalized)) {
    return normalized.toUpperCase();
  }
  return "#06B6D4";
}

function toStatusColorKey(code?: string | null): string | null {
  const normalized = normalizeStatusCode(code);
  return normalized && normalized.trim().length > 0 ? normalized : null;
}

export function ScheduleSidebar(props: ScheduleSidebarProps) {
  const api = useScheduleApi();
  const [categories, setCategories] = useState<ScheduleCategory[]>([]);
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [localStatusSelection, setLocalStatusSelection] = useState<
    Record<string, boolean>
  >({});
  const [selectedDate] = useState<Dayjs>(dayjs());
  const [localCategorySelection, setLocalCategorySelection] = useState<
    Record<string, boolean>
  >({});
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryLabel, setCategoryLabel] = useState("");
  const [categoryColor, setCategoryColor] = useState("#06B6D4");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null
  );
  const [savingCategory, setSavingCategory] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusColorDraft, setStatusColorDraft] = useState<Record<string, string>>({});
  const [savingStatusColors, setSavingStatusColors] = useState(false);

  const nextSchedules = props.nextSchedules ?? null;
  const canManageCategories = Boolean(
    props.onCreateCategory && props.onUpdateCategory && props.onDeleteCategory
  );
  const canManageStatusColors = Boolean(
    props.workspaceId && props.onUpdateStatusColors
  );

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!mounted) return;

      try {
        if (props.categories && Array.isArray(props.categories)) {
          setCategories(mapCategoriesWithDisplayColor(props.categories));
          return;
        }

        const fetched = await api.getCategories(props.workspaceId ?? null);
        if (!mounted) return;
        setCategories(mapCategoriesWithDisplayColor(fetched));
      } catch {
        if (!mounted) return;
        setCategories([]);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [api, props.categories, props.workspaceId]);

  const countsByCategory = useMemo(() => {
    if (props.categoryCounts && Object.keys(props.categoryCounts).length > 0) {
      const out: Record<string, number> = {};
      for (const category of categories) {
        out[category.id] = props.categoryCounts[category.id] ?? 0;
      }
      return out;
    }

    const counts: Record<string, number> = {};
    for (const category of categories) {
      counts[category.id] = 0;
    }
    for (const event of events) {
      if (!event.categoryId) continue;
      counts[event.categoryId] = (counts[event.categoryId] ?? 0) + 1;
    }
    return counts;
  }, [categories, events, props.categoryCounts]);

  const onToggleCategory = useCallback(
    (id: string, checked: boolean) => {
      if (props.onToggleCategory) {
        props.onToggleCategory(id, checked);
        return;
      }

      setLocalCategorySelection((prev) => ({ ...prev, [id]: checked }));
    },
    [props]
  );

  const onToggleStatus = useCallback(
    (id: string, checked: boolean) => {
      if (props.onToggleStatus) {
        props.onToggleStatus(id, checked);
        return;
      }
      setLocalStatusSelection((prev) => ({ ...prev, [id]: checked }));
    },
    [props]
  );

  const resolveStatusColor = useCallback(
    (status: ScheduleStatus, idx: number): string => {
      const colorFromSettings = getStatusColorWithOverrides(
        status.code,
        props.settings?.statusColorOverrides
      );
      return colorFromSettings ?? colorFromId(status.id, idx);
    },
    [props.settings?.statusColorOverrides]
  );

  const openStatusModal = useCallback(() => {
    const nextDraft: Record<string, string> = {};
    (props.statuses ?? []).forEach((status, idx) => {
      const key = toStatusColorKey(status.code);
      if (!key) return;
      nextDraft[key] = toColorInputValue(resolveStatusColor(status, idx));
    });
    setStatusColorDraft(nextDraft);
    setIsStatusModalOpen(true);
  }, [props.statuses, resolveStatusColor]);

  const closeStatusModal = useCallback(() => {
    setIsStatusModalOpen(false);
    setStatusColorDraft({});
  }, []);

  const handleSaveStatusColors = useCallback(async () => {
    if (!canManageStatusColors || !props.onUpdateStatusColors) return;

    const payload: Record<string, string> = {};
    (props.statuses ?? []).forEach((status, idx) => {
      const key = toStatusColorKey(status.code);
      if (!key) return;

      const fallback = toColorInputValue(resolveStatusColor(status, idx));
      payload[key] = toColorInputValue(statusColorDraft[key] ?? fallback);
    });

    setSavingStatusColors(true);
    try {
      await props.onUpdateStatusColors(payload);
      closeStatusModal();
    } catch {
      message.error(
        appI18n.t(
          "legacyInline.schedule.presentation_components_schedule_sidebar_schedule_sidebar_component.k017"
        )
      );
    } finally {
      setSavingStatusColors(false);
    }
  }, [
    canManageStatusColors,
    closeStatusModal,
    props,
    resolveStatusColor,
    statusColorDraft,
  ]);

  const resetCategoryForm = useCallback(() => {
    setEditingCategoryId(null);
    setCategoryLabel("");
    setCategoryColor("#06B6D4");
  }, []);

  const openCategoryModal = useCallback(() => {
    resetCategoryForm();
    setIsCategoryModalOpen(true);
  }, [resetCategoryForm]);

  const closeCategoryModal = useCallback(() => {
    setIsCategoryModalOpen(false);
    resetCategoryForm();
  }, [resetCategoryForm]);

  const handleSaveCategory = useCallback(async () => {
    const normalizedLabel = categoryLabel.trim().replace(/\s+/g, " ");
    if (!normalizedLabel) {
      message.warning(
        appI18n.t(
          "legacyInline.schedule.presentation_components_schedule_sidebar_schedule_sidebar_component.k013"
        )
      );
      return;
    }

    if (normalizedLabel.length > 60) {
      message.warning(
        appI18n.t(
          "legacyInline.schedule.presentation_components_schedule_sidebar_schedule_sidebar_component.k014"
        )
      );
      return;
    }

    if (!canManageCategories) return;
    if (!props.onCreateCategory || !props.onUpdateCategory) return;

    setSavingCategory(true);
    try {
      if (editingCategoryId) {
        const updated = await props.onUpdateCategory({
          id: editingCategoryId,
          label: normalizedLabel,
          color: categoryColor,
        });
        setCategories((prev) =>
          mapCategoriesWithDisplayColor(
            prev.map((category) =>
              category.id === updated.id ? updated : category
            )
          )
        );
        message.success(
          appI18n.t(
            "legacyInline.schedule.presentation_components_schedule_sidebar_schedule_sidebar_component.k015"
          )
        );
      } else {
        const created = await props.onCreateCategory({
          label: normalizedLabel,
          color: categoryColor,
        });
        setCategories((prev) =>
          mapCategoriesWithDisplayColor([...(prev ?? []), created])
        );
        setLocalCategorySelection((prev) => ({ ...prev, [created.id]: true }));
        message.success(
          appI18n.t(
            "legacyInline.schedule.presentation_components_schedule_sidebar_schedule_sidebar_component.k016"
          )
        );
      }

      resetCategoryForm();
    } catch {
      message.error(
        appI18n.t(
          "legacyInline.schedule.presentation_components_schedule_sidebar_schedule_sidebar_component.k017"
        )
      );
    } finally {
      setSavingCategory(false);
    }
  }, [
    canManageCategories,
    categoryColor,
    categoryLabel,
    editingCategoryId,
    props,
    resetCategoryForm,
  ]);

  const handleDeleteCategory = useCallback(
    async (id: string) => {
      if (!canManageCategories || !props.onDeleteCategory) return;
      setSavingCategory(true);
      try {
        const ok = await props.onDeleteCategory(id);
        if (!ok) {
          throw new Error("delete_failed");
        }
        setCategories((prev) => prev.filter((category) => category.id !== id));
        setLocalCategorySelection((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
        if (editingCategoryId === id) {
          resetCategoryForm();
        }
        message.success(
          appI18n.t(
            "legacyInline.schedule.presentation_components_schedule_sidebar_schedule_sidebar_component.k018"
          )
        );
      } catch {
        message.error(
          appI18n.t(
            "legacyInline.schedule.presentation_components_schedule_sidebar_schedule_sidebar_component.k019"
          )
        );
      } finally {
        setSavingCategory(false);
      }
    },
    [canManageCategories, editingCategoryId, props, resetCategoryForm]
  );

  const handleCreate = async (payload: ScheduleEventDraft) => {
    if (props.onCreate) {
      await props.onCreate(payload);
    } else {
      const toCreate: Omit<ScheduleEvent, "id"> & {
        durationMinutes?: number | null;
      } = {
        title: payload.title,
        date: payload.date,
        startTime: payload.startTime,
        endTime: payload.endTime,
        categoryId: payload.categoryId,
        description: payload.description,
        durationMinutes: payload.durationMinutes ?? null,
      };

      await api.createSchedule({
        event: toCreate,
        serviceIds: payload.serviceIds,
        employeeIds: payload.employeeIds,
        totalPriceCents: payload.totalPriceCents,
        workspaceId: props.workspaceId ?? null,
      });
    }

    const start = selectedDate.startOf("month").format("YYYY-MM-DD");
    const end = selectedDate.endOf("month").format("YYYY-MM-DD");
    const loadedEvents = await api.getEvents({ from: start, to: end });

    setEvents(loadedEvents);
    setIsCreateOpen(false);
  };

  return (
    <div>
      <SidebarHeaderRow>
        <SidebarTitle>
          <div className="title">
            {appI18n.t(
              "legacyInline.schedule.presentation_components_schedule_sidebar_schedule_sidebar_component.k001"
            )}
          </div>
          <div className="subtitle">
            {appI18n.t(
              "legacyInline.schedule.presentation_components_schedule_sidebar_schedule_sidebar_component.k002"
            )}
          </div>
        </SidebarTitle>

        <Button
          size="small"
          type="primary"
          icon={<Plus size={14} />}
          onClick={() => setIsCreateOpen(true)}
        >
          {appI18n.t(
            "legacyInline.schedule.presentation_components_schedule_sidebar_schedule_sidebar_component.k003"
          )}
        </Button>
      </SidebarHeaderRow>

      <div style={{ height: 8 }} />

      <Block>
        <BlockHeader>
          <div className="label">
            <Tag size={14} style={{ marginRight: 8 }} />
            {appI18n.t(
              "legacyInline.schedule.presentation_components_schedule_sidebar_schedule_sidebar_component.k004"
            )}
          </div>
          <Button
            size="small"
            disabled={!canManageCategories}
            onClick={openCategoryModal}
          >
            {appI18n.t(
              "legacyInline.schedule.presentation_components_schedule_sidebar_schedule_sidebar_component.k005"
            )}
          </Button>
        </BlockHeader>

        <CategoryListScroll>
          <List>
            {categories.map((category) => (
              <CategoryRow
                key={category.id}
                $color={category.color ?? "var(--color-surface)"}
              >
                <div className="left">
                  <Checkbox
                    checked={
                      props.selectedCategoryIds?.[category.id] ??
                      localCategorySelection[category.id] ??
                      true
                    }
                    onChange={(event) =>
                      onToggleCategory(category.id, event.target.checked)
                    }
                  />
                  <span className="dot" />
                  <span className="name">{category.label}</span>
                </div>
                <span className="count">{countsByCategory[category.id] ?? 0}</span>
              </CategoryRow>
            ))}
          </List>
        </CategoryListScroll>
      </Block>

      <div style={{ height: 6 }} />

      <Block>
        <BlockHeader>
          <div className="label">
            <CheckSquare size={14} style={{ marginRight: 8 }} />
            {appI18n.t(
              "legacyInline.schedule.presentation_components_schedule_sidebar_schedule_sidebar_component.k006"
            )}
          </div>
          <Button
            size="small"
            disabled={!canManageStatusColors}
            onClick={openStatusModal}
          >
            {appI18n.t(
              "legacyInline.schedule.presentation_components_schedule_sidebar_schedule_sidebar_component.k005"
            )}
          </Button>
        </BlockHeader>

        <List>
          {(props.statuses ?? []).map((status, idx) => (
            <CategoryRow
              key={status.id}
              $color={resolveStatusColor(status, idx)}
            >
              <div className="left">
                <Checkbox
                  checked={
                    props.selectedStatusIds?.[status.id] ??
                    localStatusSelection[status.id] ??
                    true
                  }
                  onChange={(event) =>
                    onToggleStatus(status.id, event.target.checked)
                  }
                />
                <span className="dot" />
                <span className="name">{status.label}</span>
              </div>
              <span className="count">{props.statusCounts?.[status.id] ?? 0}</span>
            </CategoryRow>
          ))}
        </List>
      </Block>

      {nextSchedules && nextSchedules.length > 0 ? (
        <NextBlock>
          <BlockHeader>
            <div className="label">
              {appI18n.t(
                "legacyInline.schedule.presentation_components_schedule_sidebar_schedule_sidebar_component.k007"
              )}
            </div>
          </BlockHeader>
          <List>
            {nextSchedules.map((nextEvent) => (
              <NextCard key={nextEvent.id}>
                <div className="time">{dayjs(nextEvent.start).format("HH:mm")}</div>
                <div className="title">
                  {nextEvent.title ??
                    appI18n.t(
                      "legacyInline.schedule.presentation_components_schedule_sidebar_schedule_sidebar_component.k008"
                    )}
                </div>
                <div className="meta">
                  {nextEvent.startsIn ??
                    `${nextEvent.startsInMinutes} ${appI18n.t(
                      "legacyInline.schedule.presentation_components_schedule_sidebar_schedule_sidebar_component.k009"
                    )}`}
                </div>
                {props.settings?.reminderEnabled ? (
                  <div className="meta">
                    {`${appI18n.t(
                      "legacyInline.schedule.presentation_components_schedule_sidebar_schedule_sidebar_component.k010"
                    )}: ${dayjs(nextEvent.start)
                      .subtract(props.settings.reminderLeadMinutes, "minute")
                      .format("HH:mm")}`}
                  </div>
                ) : null}
              </NextCard>
            ))}
          </List>
        </NextBlock>
      ) : null}

      <ScheduleEventModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        categories={categories.map((category) => ({
          id: category.id,
          label: category.label,
          color: category.color ?? "var(--color-surface)",
        }))}
        initialDate={selectedDate.format("YYYY-MM-DD")}
        onConfirm={handleCreate}
        availableServices={props.availableServices}
        availableEmployees={props.availableEmployees}
        statuses={props.statuses ?? undefined}
        settings={props.settings}
      />

      <Modal
        title={appI18n.t(
          "legacyInline.schedule.presentation_components_schedule_sidebar_schedule_sidebar_component.k006"
        )}
        open={isStatusModalOpen}
        onCancel={closeStatusModal}
        footer={null}
        destroyOnHidden
      >
        <div
          style={{ display: "flex", flexDirection: "column", gap: 12 }}
          data-cy="schedule-status-colors-modal"
        >
          <List>
            {(props.statuses ?? []).length <= 0 ? (
              <div style={{ color: "var(--color-text-muted)", fontSize: 12 }}>
                {appI18n.t(
                  "legacyInline.schedule.presentation_components_schedule_sidebar_schedule_sidebar_component.k024"
                )}
              </div>
            ) : null}

            {(props.statuses ?? []).map((status, idx) => {
              const key = toStatusColorKey(status.code);
              const currentColor = toColorInputValue(
                key ? statusColorDraft[key] : resolveStatusColor(status, idx)
              );
              return (
                <CategoryRow
                  key={`status-modal-${status.id}`}
                  $color={currentColor}
                >
                  <div className="left">
                    <span className="dot" />
                    <span className="name">{status.label}</span>
                  </div>
                  <input
                    type="color"
                    value={currentColor}
                    disabled={!key}
                    onChange={(event) => {
                      if (!key) return;
                      setStatusColorDraft((prev) => ({
                        ...prev,
                        [key]: event.target.value.toUpperCase(),
                      }));
                    }}
                    aria-label={`${status.label}-color`}
                    style={{
                      width: 40,
                      height: 32,
                      border: "1px solid var(--color-border)",
                      borderRadius: 8,
                      padding: 0,
                      background: "transparent",
                    }}
                  />
                </CategoryRow>
              );
            })}
          </List>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Button size="small" onClick={closeStatusModal}>
              {appI18n.t(
                "legacyInline.schedule.presentation_components_schedule_sidebar_schedule_sidebar_component.k021"
              )}
            </Button>
            <Button
              size="small"
              type="primary"
              loading={savingStatusColors}
              onClick={() => void handleSaveStatusColors()}
              disabled={!canManageStatusColors}
            >
              {appI18n.t(
                "legacyInline.schedule.presentation_components_schedule_sidebar_schedule_sidebar_component.k022"
              )}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        title={appI18n.t(
          "legacyInline.schedule.presentation_components_schedule_sidebar_schedule_sidebar_component.k011"
        )}
        open={isCategoryModalOpen}
        onCancel={closeCategoryModal}
        footer={null}
        destroyOnHidden
      >
        <div
          style={{ display: "flex", flexDirection: "column", gap: 12 }}
          data-cy="schedule-categories-modal"
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8 }}>
            <Input
              value={categoryLabel}
              maxLength={60}
              onChange={(event) => setCategoryLabel(event.target.value)}
              placeholder={appI18n.t(
                "legacyInline.schedule.presentation_components_schedule_sidebar_schedule_sidebar_component.k012"
              )}
            />
            <input
              type="color"
              value={categoryColor}
              onChange={(event) => setCategoryColor(event.target.value)}
              aria-label={appI18n.t(
                "legacyInline.schedule.presentation_components_schedule_sidebar_schedule_sidebar_component.k020"
              )}
              style={{
                width: 40,
                height: 32,
                border: "1px solid var(--color-border)",
                borderRadius: 8,
                padding: 0,
                background: "transparent",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: 8,
            }}
          >
            {editingCategoryId ? (
              <Button size="small" onClick={resetCategoryForm}>
                {appI18n.t(
                  "legacyInline.schedule.presentation_components_schedule_sidebar_schedule_sidebar_component.k021"
                )}
              </Button>
            ) : null}
            <Button
              size="small"
              type="primary"
              loading={savingCategory}
              onClick={() => void handleSaveCategory()}
            >
              {editingCategoryId
                ? appI18n.t(
                    "legacyInline.schedule.presentation_components_schedule_sidebar_schedule_sidebar_component.k022"
                  )
                : appI18n.t(
                    "legacyInline.schedule.presentation_components_schedule_sidebar_schedule_sidebar_component.k023"
                  )}
            </Button>
          </div>

          <List>
            {categories.length <= 0 ? (
              <div style={{ color: "var(--color-text-muted)", fontSize: 12 }}>
                {appI18n.t(
                  "legacyInline.schedule.presentation_components_schedule_sidebar_schedule_sidebar_component.k024"
                )}
              </div>
            ) : null}

            {categories.map((category) => (
              <CategoryRow
                key={`modal-${category.id}`}
                $color={category.color ?? "var(--color-surface)"}
              >
                <div className="left">
                  <span className="dot" />
                  <span className="name">{category.label}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Button
                    size="small"
                    type={editingCategoryId === category.id ? "primary" : "default"}
                    icon={<Pencil size={12} />}
                    onClick={() => {
                      setEditingCategoryId(category.id);
                      setCategoryLabel(category.label);
                      setCategoryColor(toColorInputValue(category.color));
                    }}
                  />
                  <Button
                    size="small"
                    danger
                    icon={<Trash2 size={12} />}
                    loading={savingCategory}
                    onClick={() => void handleDeleteCategory(category.id)}
                  />
                </div>
              </CategoryRow>
            ))}
          </List>
        </div>
      </Modal>
    </div>
  );
}
