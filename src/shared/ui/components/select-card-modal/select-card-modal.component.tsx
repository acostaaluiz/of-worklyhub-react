import React, { useMemo, useState } from "react";
import { Modal, Button } from "antd";

export type SelectCardItem = {
  id: string;
  title: string;
  subtitle?: string;
  right?: string;
};

export type SelectCardModalProps = {
  open: boolean;
  title?: string;
  items: SelectCardItem[];
  multiple?: boolean;
  initialSelected?: string[];
  onCancel: () => void;
  onConfirm: (selectedIds: string[]) => void;
};

export default function SelectCardModal({
  open,
  title = "Select",
  items,
  multiple = true,
  initialSelected = [],
  onCancel,
  onConfirm,
}: SelectCardModalProps) {
  const [selected, setSelected] = useState<string[]>(initialSelected.slice());

  // keep initialSelected when modal opens
  React.useEffect(() => {
    if (open) setSelected(initialSelected.slice());
  }, [open, initialSelected]);

  const toggle = (id: string) => {
    if (selected.includes(id)) setSelected((s) => s.filter((x) => x !== id));
    else setSelected((s) => (multiple ? [...s, id] : [id]));
  };

  const rendered = useMemo(() => items, [items]);

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title={title}
      footer={
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" onClick={() => onConfirm(selected)}>
            Confirm
          </Button>
        </div>
      }
      centered
      width={720}
    >
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        {rendered.map((it) => {
          const active = selected.includes(it.id);
          return (
            <div
              key={it.id}
              role="button"
              onClick={() => toggle(it.id)}
              style={{
                minWidth: 200,
                maxWidth: 260,
                borderRadius: 8,
                padding: 12,
                border: `1px solid ${active ? "var(--color-primary)" : "var(--color-border)"}`,
                background: active ? "var(--color-glass-surface)" : "transparent",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontWeight: 600 }}>{it.title}</div>
                {it.right ? <div style={{ color: "var(--color-text-muted)" }}>{it.right}</div> : null}
              </div>
              {it.subtitle ? <div style={{ color: "var(--color-text-muted)", fontSize: 13 }}>{it.subtitle}</div> : null}
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
