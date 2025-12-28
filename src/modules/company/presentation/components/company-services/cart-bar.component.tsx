import React from "react";
import { Button } from "antd";
import styled from "styled-components";

const Bar = styled.div`
  position: fixed;
  right: 24px;
  left: 24px;
  bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-radius: 12px;
  background: var(--surface-3, rgba(6,22,33,0.8));
  box-shadow: 0 8px 30px rgba(6,22,33,0.24);
  z-index: 999;
`;

type Props = {
  count: number;
  totalCents: number;
  onOpen: () => void;
};

export function CartBar({ count, totalCents, onOpen }: Props) {
  return (
    <Bar>
      <div>
        <div style={{ fontWeight: 700 }}>{count} serviços selecionados</div>
        <div style={{ color: "var(--color-text-muted)" }}>{(totalCents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</div>
      </div>

      <div>
        <Button type="primary" onClick={onOpen} disabled={count === 0}>
          Ver seleção
        </Button>
      </div>
    </Bar>
  );
}

export default CartBar;
