import styled from "styled-components";

export const FormStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-3);

  .ant-input,
  .ant-input-affix-wrapper,
  .ant-select-selector,
  .ant-input-number,
  .ant-input-number-input,
  .ant-input-number-group-addon,
  .ant-input-number-group-wrapper,
  .ant-input-number-affix-wrapper,
  .ant-input-number-handler-wrap,
  textarea.ant-input {
    border-radius: var(--radius-sm) !important;
  }
`;

export const SectionCard = styled.section`
  border: 1px solid color-mix(in srgb, var(--color-primary) 14%, var(--color-border));
  border-radius: var(--radius-lg);
  padding: 14px;
  background:
    linear-gradient(
      140deg,
      color-mix(in srgb, var(--color-surface-2) 62%, transparent),
      var(--color-surface)
    );
`;

export const FieldRow = styled.div`
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: var(--space-3);

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

export const FieldRow3 = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 1fr 1fr;
  gap: var(--space-3);

  @media (max-width: 1080px) {
    grid-template-columns: 1fr;
  }
`;

export const DurationFieldShell = styled.div`
  border: 1px solid color-mix(in srgb, var(--color-primary) 12%, var(--color-border));
  border-radius: var(--radius-sm);
  padding: 8px;
  min-height: 46px;
  display: flex;
  align-items: center;
`;

export const ToggleRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);
`;

export const ContinueWrap = styled.div`
  margin-top: var(--space-2);

  .ant-btn {
    height: 46px;
    border-radius: var(--radius-md);
    font-weight: 700;
    letter-spacing: 0.01em;
  }
`;

export const ModalOverrides = styled.div`
  .wh-service-modal .ant-modal-content {
    border-radius: var(--radius-lg);
    border: 1px solid color-mix(in srgb, var(--color-primary) 14%, var(--color-border));
    background:
      radial-gradient(circle at 14% 10%, rgba(30, 112, 255, 0.08), transparent 30%),
      linear-gradient(
        140deg,
        color-mix(in srgb, var(--color-surface-2) 78%, transparent),
        var(--color-surface)
      );
    box-shadow: var(--shadow-lg);
    overflow: hidden;
  }

  .wh-service-modal .ant-modal-header {
    border-bottom: 1px solid color-mix(in srgb, var(--color-primary) 12%, var(--color-border));
    margin-bottom: 0;
    padding: 14px 16px;
    background: transparent;
  }

  .wh-service-modal .ant-modal-body {
    padding: 14px 16px 16px !important;
    max-height: min(72vh, 720px);
    overflow: auto;
  }

  .wh-service-modal .ant-modal-close {
    top: 12px;
  }
`;
