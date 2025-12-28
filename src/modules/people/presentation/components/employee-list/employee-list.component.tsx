import React from "react";
import { Table, Button, Space } from "antd";
import type { EmployeeModel } from "@modules/people/interfaces/employee.model";

type Props = {
  employees: EmployeeModel[];
  onEdit: (e: EmployeeModel) => void;
  onDeactivate: (e: EmployeeModel) => void;
};

export function EmployeeListComponent({ employees, onEdit, onDeactivate }: Props) {
  const cols = [
    { title: "Nome", dataIndex: "firstName", key: "firstName", render: (_: any, r: EmployeeModel) => `${r.firstName} ${r.lastName}` },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Cargo", dataIndex: "role", key: "role" },
    { title: "Depto.", dataIndex: "department", key: "department" },
    { title: "Ativo", dataIndex: "active", key: "active", render: (v: boolean) => (v ? "Sim" : "Não") },
    {
      title: "Ações",
      key: "actions",
      render: (_: any, record: EmployeeModel) => (
        <Space>
          <Button onClick={() => onEdit(record)}>Editar</Button>
          <Button danger onClick={() => onDeactivate(record)}>Inativar</Button>
        </Space>
      ),
    },
  ];

  return <Table rowKey="id" columns={cols} dataSource={employees} pagination={{ pageSize: 10 }} />;
}

export default EmployeeListComponent;
