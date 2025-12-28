import React, { useEffect, useState } from "react";
import { Row, Col, Input, Select, Radio, InputNumber, Button } from "antd";
import type { CategoryModel } from "@modules/inventory/interfaces/category.model";

export type InventoryFilterState = {
  q?: string;
  categoryId?: string | undefined;
  stockStatus?: "all" | "in" | "out";
  minStock?: number | undefined;
};

type Props = {
  categories?: CategoryModel[];
  value?: InventoryFilterState;
  onChange?: (s: InventoryFilterState) => void;
};

export function InventoryFilterComponent({ categories = [], value, onChange }: Props) {
  const [state, setState] = useState<InventoryFilterState>(value ?? { q: "", stockStatus: "all" });

  useEffect(() => setState(value ?? { q: "", stockStatus: "all" }), [value]);

  function apply(next: Partial<InventoryFilterState>) {
    const merged = { ...state, ...next };
    setState(merged);
    onChange?.(merged);
  }

  return (
    <>
      <Row gutter={12} align="middle">
        <Col xs={24} sm={24} md={12} lg={12}>
          <Input.Search placeholder="Pesquisar produto, sku ou barcode" allowClear onSearch={(v) => apply({ q: v })} enterButton />
        </Col>

        <Col xs={24} sm={12} md={6} lg={6}>
          <Select allowClear placeholder="Categoria" style={{ width: "100%" }} value={state.categoryId} onChange={(v) => apply({ categoryId: v })}>
            {categories.map((c) => (
              <Select.Option key={c.id} value={c.id}>
                {c.name}
              </Select.Option>
            ))}
          </Select>
        </Col>

        <Col xs={12} sm={8} md={4} lg={4}>
          <InputNumber placeholder="Min estoque" style={{ width: "100%" }} min={0} value={state.minStock} onChange={(v) => apply({ minStock: v ?? undefined })} />
        </Col>

        <Col xs={12} sm={4} md={2} lg={2} style={{ textAlign: "right" }}>
          <Button onClick={() => apply({ q: "", categoryId: undefined, stockStatus: "all", minStock: undefined })}>Limpar</Button>
        </Col>
      </Row>

      <Row gutter={12} style={{ marginTop: 12 }} align="middle">
        <Col xs={24} sm={24} md={12} lg={10}>
          <Radio.Group value={state.stockStatus ?? "all"} onChange={(e) => apply({ stockStatus: e.target.value })}>
            <Radio.Button value="all">Todos</Radio.Button>
            <Radio.Button value="in">Com estoque</Radio.Button>
            <Radio.Button value="out">Sem estoque</Radio.Button>
          </Radio.Group>
        </Col>

        <Col xs={24} sm={24} md={12} lg={14} />
      </Row>
    </>
  );
}

export default InventoryFilterComponent;
