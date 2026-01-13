import styled from "styled-components";

export const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
`;

export const DateStrip = styled.div`
  display: grid;
  grid-template-columns: 36px 1fr 36px;
  gap: var(--space-2);
  align-items: center;
`;

export const DateRail = styled.div`
  display: flex;
  gap: var(--space-2);
  justify-content: center;
  align-items: center;
  overflow: hidden;
`;

export const DateChip = styled.button<{ $active?: boolean }>`
  border: 1px solid var(--color-border);
  background: ${(p) => (p.$active ? "var(--color-tertiary)" : "var(--color-surface)")};
  color: ${(p) => (p.$active ? "var(--on-tertiary)" : "var(--color-text)")};
  border-radius: var(--radius-sm);
  padding: 6px 8px;
  min-width: 60px;
  text-align: center;
  cursor: pointer;
  box-shadow: ${(p) => (p.$active ? "var(--shadow-sm)" : "none")};

  display: flex;
  flex-direction: column;
  gap: 6px;

  &:hover {
    border-color: rgba(122, 44, 255, 0.55);
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .dow {
    font-size: var(--font-size-sm);
    opacity: ${(p) => (p.$active ? 0.92 : 0.85)};
  }

  .day {
    font-size: 14px;
    font-weight: 700;
    line-height: 1;
  }

  .dot {
    width: 12px;
    height: 3px;
    border-radius: 999px;
    background: ${(p) =>
      p.$active ? "rgba(255,255,255,0.75)" : "var(--color-tertiary)"};
    opacity: ${(p) => (p.$active ? 0.9 : 0.65)};
    margin: 0 auto;
  }
`;

export const RoundIconButton = styled.button`
  width: 44px;
  height: 44px;
  border-radius: 999px;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &:hover {
    border-color: rgba(122, 44, 255, 0.55);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const Separator = styled.div`
  width: 100%;
  height: 1px;
  background: var(--color-divider);
`;

export const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
`;

export const CenterRow = styled.div`
  display: flex;
  justify-content: center;
`;

export const TimeTabsRow = styled.div`
  display: flex;
  justify-content: center;

  .ant-segmented {
    height: 34px;
    padding: 2px;
    border-radius: var(--radius-sm);
  }

  .ant-segmented-item-label {
    height: 30px;
    line-height: 30px;
    padding-inline: 12px;
  }
`;

export const SlotsRow = styled.div`
  display: grid;
  grid-template-columns: 44px 1fr 44px;
  gap: var(--space-3);
  align-items: center;
`;

export const SlotsRail = styled.div`
  display: flex;
  gap: var(--space-2);
  justify-content: center;
  align-items: center;
  overflow: hidden;
`;

export const TimeChip = styled.button<{ $active?: boolean }>`
  border: 1px solid var(--color-border);
  background: ${(p) => (p.$active ? "var(--color-tertiary)" : "var(--color-surface)")};
  color: ${(p) => (p.$active ? "var(--on-tertiary)" : "var(--color-text)")};
  border-radius: var(--radius-sm);
  padding: 6px 10px;
  min-width: 64px;
  text-align: center;
  cursor: pointer;

  &:hover {
    border-color: rgba(122, 44, 255, 0.55);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const FormStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-2);

  .ant-input,
  .ant-input-affix-wrapper,
  .ant-select-selector {
    border-radius: var(--radius-sm) !important;
  }
`;

export const FieldRow = styled.div`
  display: grid;
  grid-template-columns: 1.35fr 1fr;
  gap: var(--space-3);

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const FieldRow3 = styled.div`
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: var(--space-3);

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const SlotCard = styled.div`
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  border-radius: var(--radius-md);
  padding: calc(var(--space-2) + 6px);
  box-shadow: var(--shadow-sm);

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const SlotLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  .title {
    font-weight: 800;
    font-size: 15px;
    letter-spacing: -0.01em;
  }

  .meta {
    color: var(--color-text-muted);
    font-size: var(--font-size-sm);
  }
`;

export const SlotRight = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;

  @media (max-width: 768px) {
    align-items: flex-start;
  }
`;

export const AddServiceLink = styled.button`
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  border: none;
  background: transparent;
  color: var(--color-link);
  cursor: pointer;
  padding: 0;
  width: fit-content;

  &:hover {
    color: var(--color-link-hover);
  }
`;

export const FooterBar = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-4);

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const FooterTotal = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;

  @media (max-width: 768px) {
    align-items: flex-start;
  }

  .label {
    color: var(--color-text-muted);
    font-size: var(--font-size-sm);
  }

  .value {
    font-weight: 900;
    font-size: 24px;
    letter-spacing: -0.02em;
  }

  .sub {
    color: var(--color-text-muted);
    font-size: var(--font-size-sm);
  }
`;

export const ContinueWrap = styled.div`
  margin-top: var(--space-2);

  .ant-btn {
    height: 48px;
    border-radius: var(--radius-md);
    font-weight: 700;
    font-size: 16px;
  }
`;

export const ModalRoot = styled.div``;

export const ModalOverrides = styled.div`
  .wh-schedule-modal .ant-modal-content {
    border-radius: var(--radius-lg);
    background: var(--color-surface);
  }
  .wh-schedule-modal .ant-modal-content {
    max-height: 72vh;
    overflow: hidden;
  }
  .wh-schedule-modal .ant-modal-body {
    padding: var(--space-2) !important;
    max-height: calc(72vh - 120px);
    overflow: auto;
  }
`;

export const StatusRow = styled.div`
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
  align-items: center;
`;

export const StatusCard = styled.button<{ $active?: boolean }>`
  border: 1px solid var(--color-border);
  background: ${(p) => (p.$active ? 'var(--color-primary)' : 'var(--color-surface)')};
  color: ${(p) => (p.$active ? 'var(--on-primary)' : 'var(--color-text)')};
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  min-width: 120px;
  text-align: left;
  display: inline-flex;
  flex-direction: column;
  gap: 4px;

  &:hover {
    border-color: rgba(122,44,255,0.55);
  }
`;

export const Label = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 6px 0;
`;

