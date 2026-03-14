import styled from "styled-components";

export const EmployeeModalOverrides = styled.div`
  .wh-employee-modal .ant-modal-content {
    border-radius: var(--radius-lg);
    border: 1px solid color-mix(in srgb, var(--color-primary) 24%, var(--color-border));
    background:
      radial-gradient(circle at 8% 4%, rgba(30, 112, 255, 0.08), transparent 36%),
      radial-gradient(circle at 96% 94%, rgba(0, 214, 160, 0.07), transparent 38%),
      var(--color-surface);
    box-shadow: var(--shadow-md);
  }

  .wh-employee-modal .ant-modal-header {
    background: transparent;
    margin-bottom: 0;
    border-bottom: 1px solid var(--color-divider);
    padding-bottom: var(--space-3);
  }

  .wh-employee-modal .ant-modal-title {
    font-size: var(--font-size-lg);
    font-weight: 700;
  }

  .wh-employee-modal .ant-modal-body {
    max-height: min(74vh, 780px);
    overflow: auto;
    padding-top: var(--space-4);
  }

  .wh-employee-modal .ant-form-item {
    margin-bottom: var(--space-3);
  }

  .wh-employee-modal .ant-input,
  .wh-employee-modal .ant-input-affix-wrapper,
  .wh-employee-modal .ant-input-number,
  .wh-employee-modal .ant-picker {
    border-radius: var(--radius-sm);
  }
`;

export const SectionCard = styled.div`
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: color-mix(in srgb, var(--color-surface-2) 78%, transparent);
  padding: var(--space-3) var(--space-3) var(--space-1);
  margin-bottom: var(--space-3);
`;

export const SectionTitle = styled.h4`
  margin: 0 0 var(--space-3);
  font-size: var(--font-size-md);
  font-weight: 700;
  color: var(--color-text);
`;

export const SectionTitleInline = styled.span`
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
`;

export const SectionTitleIcon = styled.span`
  width: 22px;
  height: 22px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
  background: color-mix(in srgb, var(--color-primary) 12%, transparent);
`;

export const FieldLabel = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--color-text);
`;

export const FieldPrefixIcon = styled.span`
  display: inline-flex;
  align-items: center;
  color: var(--color-text-muted);
`;

export const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);

  .ant-btn {
    min-width: 96px;
    border-radius: var(--radius-sm);
  }
`;
