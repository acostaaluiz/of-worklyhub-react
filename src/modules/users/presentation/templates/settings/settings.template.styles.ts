import styled from "styled-components";
import { Tabs } from "antd";

export const SettingsTemplateRoot = styled.div`
  height: 100%;
  max-height: 100%;
  min-height: 0;
  display: flex;
  overflow: hidden;
`;

export const SettingsShell = styled.div`
  height: 100%;
  max-height: 100%;
  min-height: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  overflow: hidden;
`;

export const HeroCard = styled.div`
  flex-shrink: 0;
  border: 1px solid color-mix(in srgb, var(--color-primary) 35%, var(--color-border));
  border-radius: var(--radius-lg);
  background:
    radial-gradient(
      circle at 12% 18%,
      color-mix(in srgb, var(--color-primary) 20%, transparent),
      transparent 42%
    ),
    radial-gradient(
      circle at 90% 82%,
      color-mix(in srgb, var(--color-secondary) 16%, transparent),
      transparent 48%
    ),
    color-mix(in srgb, var(--color-surface) 92%, transparent);
  box-shadow: var(--shadow-sm);
  padding: var(--space-2) var(--space-3);
`;

export const HeroTitle = styled.h1`
  margin: 0;
  font-size: clamp(20px, 1.9vh, 28px);
  font-weight: 700;
`;

export const HeroSubtitle = styled.p`
  margin: 2px 0 0;
  color: var(--color-text-muted);
  font-size: 12px;
`;

export const MetaRow = styled.div`
  margin-top: 8px;
  display: flex;
  flex-wrap: nowrap;
  gap: 6px;
  overflow: auto hidden;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: 768px) {
    flex-wrap: wrap;
    overflow: visible;
  }
`;

export const MetaPill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 8px;
  border-radius: 999px;
  border: 1px solid var(--color-border);
  background: color-mix(in srgb, var(--color-surface) 92%, transparent);
  font-size: 11px;
  line-height: 1.2;
  color: var(--color-text-muted);
  max-width: 300px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const TabsFrame = styled.div`
  flex: 1;
  min-height: 0;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-glass-surface);
  box-shadow: var(--shadow-xs);
  padding: var(--space-2);
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .ant-tabs {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }

  .ant-tabs-nav {
    margin-bottom: 8px;
    flex-shrink: 0;
  }

  .ant-tabs-nav::before {
    border-bottom: 1px solid var(--color-divider);
  }

  .ant-tabs-tab-btn {
    font-weight: 600;
    font-size: 14px;
  }

  .ant-tabs-ink-bar {
    height: 3px;
    border-radius: 999px;
    background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
  }

  .ant-tabs-content-holder {
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  .ant-tabs-content,
  .ant-tabs-tabpane {
    height: 100%;
    min-height: 0;
  }
`;

export const TabPaneBody = styled.div`
  height: 100%;
  min-height: 0;
  display: flex;
  gap: var(--space-2);

  @media (max-width: 980px) {
    flex-direction: column;
  }
`;

export const Card = styled.div`
  flex: 1;
  min-height: 0;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-2);
  background: color-mix(in srgb, var(--color-surface) 95%, transparent);
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow: hidden;

  .ant-form {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }

  .ant-form-item {
    margin-bottom: 8px;
  }
`;

export const CardTitle = styled.h2`
  margin: 0;
  font-size: 15px;
  font-weight: 700;
`;

export const CardSubtitle = styled.p`
  margin: 0;
  color: var(--color-text-muted);
  font-size: 12px;
`;

export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px var(--space-2);
  align-content: start;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }

  .span-full {
    grid-column: 1 / -1;
  }
`;

export const EmissionGrid = styled(FormGrid)`
  grid-template-columns: repeat(4, minmax(0, 1fr));

  @media (max-width: 1480px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (max-width: 1280px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }

  .span-two {
    grid-column: span 2;

    @media (max-width: 980px) {
      grid-column: 1 / -1;
    }
  }

  .span-three {
    grid-column: span 3;

    @media (max-width: 1280px) {
      grid-column: span 2;
    }

    @media (max-width: 980px) {
      grid-column: 1 / -1;
    }
  }
`;

export const AdvancedGrid = styled(FormGrid)`
  grid-template-columns: repeat(3, minmax(0, 1fr));

  @media (max-width: 1280px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }

  .ant-input-textarea textarea {
    min-height: 42px !important;
  }
`;

export const ModuleToggleList = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

export const ModuleToggleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
  padding: 8px 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: color-mix(in srgb, var(--color-surface-2) 75%, transparent);
`;

export const ModuleTitle = styled.div`
  font-weight: 600;
  font-size: 14px;
`;

export const ModuleDescription = styled.div`
  margin-top: 2px;
  font-size: 11px;
  color: var(--color-text-muted);
`;

export const ActionsRow = styled.div`
  margin-top: auto;
  padding-top: 8px;
  display: flex;
  justify-content: flex-end;
`;

export const AppearanceTabs = styled(Tabs)`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;

  .ant-tabs-nav {
    margin-bottom: 8px;
    flex-shrink: 0;
  }

  .ant-tabs-tab-btn {
    font-weight: 600;
  }

  .ant-tabs-content-holder {
    flex: 1;
    min-height: 0;
    overflow: auto;
  }

  .ant-tabs-content,
  .ant-tabs-tabpane {
    min-height: 0;
  }
`;

export const AppearanceTabContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
`;

export const PresetPaletteGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 10px;
`;

export const PresetPaletteButton = styled.button<{ $selected?: boolean }>`
  width: 100%;
  border: 1px solid
    ${({ $selected }) =>
      $selected
        ? "color-mix(in srgb, var(--color-primary) 65%, var(--color-border))"
        : "var(--color-border)"};
  border-radius: var(--radius-sm);
  background: ${({ $selected }) =>
    $selected
      ? "color-mix(in srgb, var(--color-primary) 10%, var(--color-surface))"
      : "color-mix(in srgb, var(--color-surface-2) 72%, transparent)"};
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: left;
  cursor: pointer;
  transition:
    transform 0.16s ease,
    border-color 0.16s ease,
    box-shadow 0.16s ease,
    background-color 0.16s ease;
  box-shadow: ${({ $selected }) => ($selected ? "var(--shadow-sm)" : "none")};

  &:hover {
    border-color: color-mix(in srgb, var(--color-primary) 48%, var(--color-border));
    transform: translateY(-1px);
  }

  &:focus-visible {
    outline: 2px solid color-mix(in srgb, var(--color-primary) 70%, transparent);
    outline-offset: 2px;
  }
`;

export const PresetPaletteSwatches = styled.div`
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  min-height: 18px;
  border-radius: 999px;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--color-border) 75%, transparent);
`;

export const PresetPaletteSwatch = styled.span<{ $color: string }>`
  display: block;
  width: 100%;
  min-height: 18px;
  background: ${({ $color }) => $color};
`;

export const PresetPaletteMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
`;

export const PresetPaletteTitle = styled.span`
  display: block;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.2;
`;

export const PresetPaletteBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--color-primary) 55%, transparent);
  color: var(--color-primary);
  background: color-mix(in srgb, var(--color-primary) 12%, transparent);
  padding: 2px 8px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: uppercase;
`;
