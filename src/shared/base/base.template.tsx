import type { BaseTemplateSlots } from "./interfaces/base-template.interface";

export type BaseTemplateProps = BaseTemplateSlots & {
  className?: string;
};

export function BaseTemplate(props: BaseTemplateProps) {
  const { header, sidebar, footer, content, className } = props;

  return (
    <div className={className}>
      {header ? <div>{header}</div> : null}

      <div style={{ display: "flex", minHeight: "100%" }}>
        {sidebar ? <div>{sidebar}</div> : null}
        <div style={{ flex: 1 }}>{content}</div>
      </div>

      {footer ? <div>{footer}</div> : null}
    </div>
  );
}
