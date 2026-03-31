import type { CSSProperties, ReactNode } from "react";

type LabeledFieldProps = {
  label: string;
  icon?: ReactNode;
  children: ReactNode;
  style?: CSSProperties;
};

const fieldContainerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
  minWidth: 0,
};

const fieldLabelStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  fontSize: 12,
  fontWeight: 600,
  color: "var(--color-text-muted)",
  lineHeight: 1.1,
};

export function LabeledField({ label, icon, children, style }: LabeledFieldProps) {
  return (
    <div style={{ ...fieldContainerStyle, ...style }}>
      <span style={fieldLabelStyle}>
        {icon}
        {label}
      </span>
      {children}
    </div>
  );
}

export default LabeledField;
