import styled from "styled-components";

export const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
`;

export const DateStrip = styled.div`
  display: grid;
  grid-template-columns: 44px 1fr 44px;
  gap: var(--space-3);
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
  background: ${(p) =>
    p.$active ? "var(--color-tertiary)" : "var(--color-surface)"};
  color: ${(p) => (p.$active ? "var(--on-tertiary)" : "var(--color-text)")};
  border-radius: var(--radius-sm);
  padding: 10px 12px;
  min-width: 84px;
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
    font-size: var(--font-size-lg);
    font-weight: 700;
    line-height: 1;
  }

  .dot {
    width: 18px;
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
  gap: var(--space-3);
`;

export const CenterRow = styled.div`
  display: flex;
  justify-content: center;
`;

export const TimeTabsRow = styled.div`
  display: flex;
  justify-content: center;

  .ant-segmented {
    height: 40px;
    padding: 3px;
    border-radius: var(--radius-sm);
  }

  .ant-segmented-item-label {
    height: 34px;
    line-height: 34px;
    padding-inline: 18px;
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
  background: ${(p) =>
    p.$active ? "var(--color-tertiary)" : "var(--color-surface)"};
  color: ${(p) => (p.$active ? "var(--on-tertiary)" : "var(--color-text)")};
  border-radius: var(--radius-sm);
  padding: 10px 14px;
  min-width: 96px;
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
  gap: var(--space-3);

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
  padding: var(--space-4);
  box-shadow: var(--shadow-sm);

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);

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
    font-size: 18px;
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
    font-size: 28px;
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
    height: 56px;
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
`;
