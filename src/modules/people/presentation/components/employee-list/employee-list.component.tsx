import type { ReactNode } from "react";
import { Button, Space } from "antd";
import type { ColumnsType } from "antd/es/table";
import SmartTable from "@shared/ui/components/smart-table/smart-table.component";
import type { EmployeeModel } from "@modules/people/interfaces/employee.model";

type Props = {
  employees: EmployeeModel[];
  onEdit: (e: EmployeeModel) => void;
  onDeactivate: (e: EmployeeModel) => void;
};

type PropsExt = Props & { toolbarLeft?: ReactNode; toolbarRight?: ReactNode };

export function EmployeeListComponent({ employees, onEdit, onDeactivate, toolbarLeft, toolbarRight }: PropsExt) {
  const cols: ColumnsType<EmployeeModel> = [
    { title: "Name", dataIndex: "firstName", key: "firstName", render: (_: DataMap, r: EmployeeModel) => `${r.firstName} ${r.lastName}` },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Role", dataIndex: "role", key: "role" },
    { title: "Dept.", dataIndex: "department", key: "department" },
    {
      title: "Profile",
      dataIndex: "accessProfileUid",
      key: "accessProfileUid",
      render: (value?: string | null) => (value ? value : "-"),
    },
    {
      title: "Invite",
      dataIndex: "invitationStatus",
      key: "invitationStatus",
      render: (value?: string) => (value === "pending_activation" ? "Pending activation" : "Active"),
    },
    { title: "Active", dataIndex: "active", key: "active", render: (v: boolean) => (v ? "Yes" : "No") },
    {
      title: "Actions",
      key: "actions",
      render: (_: DataMap, record: EmployeeModel) => (
        <Space>
          <Button onClick={() => onEdit(record)}>Edit</Button>
          <Button danger onClick={() => onDeactivate(record)}>Deactivate</Button>
        </Space>
      ),
    },
  ];

  return <SmartTable<EmployeeModel> columns={cols} dataSource={employees} rowKey="id" pageSize={10} searchFields={["firstName", "lastName", "email", "role", "department", "accessProfileUid"]} topLeft={toolbarLeft} topRight={toolbarRight} />;
}

export default EmployeeListComponent;
