import React from "react";
import { Button, Space } from "antd";
import SmartTable from "@shared/ui/components/smart-table/smart-table.component";
import type { EmployeeModel } from "@modules/people/interfaces/employee.model";

type Props = {
  employees: EmployeeModel[];
  onEdit: (e: EmployeeModel) => void;
  onDeactivate: (e: EmployeeModel) => void;
};

type PropsExt = Props & { toolbarLeft?: React.ReactNode; toolbarRight?: React.ReactNode };

export function EmployeeListComponent({ employees, onEdit, onDeactivate, toolbarLeft, toolbarRight }: PropsExt) {
  const cols = [
    { title: "Name", dataIndex: "firstName", key: "firstName", render: (_: any, r: EmployeeModel) => `${r.firstName} ${r.lastName}` },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Role", dataIndex: "role", key: "role" },
    { title: "Dept.", dataIndex: "department", key: "department" },
    { title: "Active", dataIndex: "active", key: "active", render: (v: boolean) => (v ? "Yes" : "No") },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: EmployeeModel) => (
        <Space>
          <Button onClick={() => onEdit(record)}>Edit</Button>
          <Button danger onClick={() => onDeactivate(record)}>Deactivate</Button>
        </Space>
      ),
    },
  ];

  return <SmartTable columns={cols} dataSource={employees} rowKey="id" pageSize={10} searchFields={["firstName", "lastName", "email", "role", "department"]} topLeft={toolbarLeft} topRight={toolbarRight} />;
}

export default EmployeeListComponent;
