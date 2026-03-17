import React from "react";
import { GlobalOutlined } from "@ant-design/icons";
import { Select } from "antd";
import { useTranslation } from "react-i18next";
import { normalizeAppLanguage, setAppLanguage, type AppLanguage } from "@core/i18n";

export function AuthLanguageSelect() {
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = React.useState<AppLanguage>(() =>
    normalizeAppLanguage(i18n.resolvedLanguage ?? i18n.language)
  );

  React.useEffect(() => {
    const handleLanguageChanged = (nextLanguage: string) => {
      setLanguage(normalizeAppLanguage(nextLanguage));
    };

    i18n.on("languageChanged", handleLanguageChanged);
    return () => {
      i18n.off("languageChanged", handleLanguageChanged);
    };
  }, [i18n]);

  const handleChangeLanguage = async (nextLanguage: AppLanguage) => {
    await setAppLanguage(nextLanguage);
    setLanguage(nextLanguage);
  };

  return (
    <Select
      value={language}
      onChange={(value) => void handleChangeLanguage(value as AppLanguage)}
      size="middle"
      style={{ minWidth: 170 }}
      options={[
        { value: "en-US", label: t("settings.language.english") },
        { value: "pt-BR", label: t("settings.language.portuguese") },
      ]}
      suffixIcon={<GlobalOutlined />}
      aria-label={t("users.auth.language.selectAriaLabel")}
      data-cy="auth-language-select"
    />
  );
}

export default AuthLanguageSelect;
