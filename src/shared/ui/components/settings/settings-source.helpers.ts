export type SettingsSource = "database" | "defaults";

export function getSettingsSourceTagColor(source: SettingsSource): "blue" | "default" {
  return source === "database" ? "blue" : "default";
}

export function getSettingsSourceText(source: SettingsSource): string {
  return source === "database" ? "Custom settings" : "Default settings";
}
