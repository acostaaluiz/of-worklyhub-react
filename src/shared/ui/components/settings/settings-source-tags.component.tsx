import React from "react";
import { Space, Tag } from "antd";
import { useTranslation } from "react-i18next";

import { normalizeAppLanguage } from "@core/i18n";
import {
  getSettingsSourceTagColor,
  type SettingsSource,
} from "./settings-source.helpers";

type SettingsSourceTagsProps = {
  source: SettingsSource;
  updatedAt?: string;
  formatUpdatedAt?: (value: string) => string;
  updatedPrefix?: string;
  emptyLabel?: string;
};

export function SettingsSourceTags({
  source,
  updatedAt,
  formatUpdatedAt,
  updatedPrefix,
  emptyLabel,
}: SettingsSourceTagsProps): React.ReactElement {
  const { i18n } = useTranslation();
  const isPtBR = normalizeAppLanguage(i18n.resolvedLanguage ?? i18n.language) === "pt-BR";
  const tr = (en: string, pt: string) => (isPtBR ? pt : en);

  const resolvedUpdatedPrefix = updatedPrefix ?? tr("Updated", "Atualizado");
  const resolvedEmptyLabel = emptyLabel ?? tr("Not saved yet", "Ainda nao salvo");
  const sourceLabel =
    source === "database"
      ? tr("Custom settings", "Configuracoes personalizadas")
      : tr("Default settings", "Configuracoes padrao");

  const updatedLabel = updatedAt
    ? `${resolvedUpdatedPrefix} ${formatUpdatedAt ? formatUpdatedAt(updatedAt) : updatedAt}`
    : resolvedEmptyLabel;

  return (
    <Space size={8}>
      <Tag color={getSettingsSourceTagColor(source)}>{sourceLabel}</Tag>
      <Tag>{updatedLabel}</Tag>
    </Space>
  );
}

export default SettingsSourceTags;
