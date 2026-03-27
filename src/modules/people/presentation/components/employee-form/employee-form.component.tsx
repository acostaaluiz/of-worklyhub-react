import React from "react";
import { Form, Input, DatePicker, Button, Row, Col, Select } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { getDateFormat, getMoneyMaskAdapter, maskPhone, unmaskPhone } from "@core/utils/mask";
import type { EmployeeModel } from "@modules/people/interfaces/employee.model";
import type { PeopleWorkspaceSettings } from "@modules/people/interfaces/people-settings.model";
import {
  FieldLabel,
  FieldPrefixIcon,
  FormActions,
  SectionCard,
  SectionTitle,
  SectionTitleIcon,
  SectionTitleInline,
} from "./employee-form.component.styles";
import {
  AtSign,
  BadgeDollarSign,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Phone,
  UserRound,
  Users,
  ShieldUser,
} from "lucide-react";

type EmployeeFormValues = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: string;
  department?: string;
  accessProfileUid?: string | null;
  hiredAt?: Dayjs | null;
  salaryCents?: string;
  active?: boolean;
};

const moneyMask = getMoneyMaskAdapter({ fromCents: true });

type Props = {
  initial?: Partial<EmployeeModel>;
  onSubmit: (data: Omit<EmployeeModel, "id" | "createdAt">) => Promise<void> | void;
  submitting?: boolean;
  settings?: PeopleWorkspaceSettings;
  onCancel?: () => void;
};

function getInitialValues(
  initial: Partial<EmployeeModel> | undefined,
  settings: PeopleWorkspaceSettings | undefined
): EmployeeFormValues {
  const editing = typeof initial?.id === "string" && initial.id.length > 0;
  const fallbackRole = !editing ? settings?.defaultRole ?? undefined : undefined;
  const fallbackDepartment = !editing
    ? settings?.defaultDepartment ?? undefined
    : undefined;
  const fallbackAccessProfileUid = !editing
    ? settings?.employeeAccess?.defaultProfileUid ?? undefined
    : undefined;
  const fallbackSalary = !editing
    ? typeof settings?.defaultSalaryCents === "number"
      ? moneyMask.format(settings.defaultSalaryCents)
      : undefined
    : undefined;

  return {
    active: true,
    ...initial,
    role: initial?.role ?? fallbackRole,
    department: initial?.department ?? fallbackDepartment,
    accessProfileUid: initial?.accessProfileUid ?? fallbackAccessProfileUid,
    hiredAt: initial?.hiredAt ? dayjs(initial.hiredAt) : undefined,
    salaryCents:
      typeof initial?.salaryCents === "number"
        ? moneyMask.format(initial.salaryCents)
        : fallbackSalary,
    phone: maskPhone(initial?.phone),
  };
}

export function EmployeeFormComponent({ initial, onSubmit, submitting, settings, onCancel }: Props) {
  const [form] = Form.useForm<EmployeeFormValues>();
  const dateFormat = getDateFormat();

  React.useEffect(() => {
    form.setFieldsValue(getInitialValues(initial, settings));
  }, [form, initial, settings]);

  const emailRules = settings?.requireEmail
    ? [{ required: true, message: "Email is required by workspace settings." }]
    : [];
  const phoneRules = settings?.requirePhone
    ? [{ required: true, message: "Phone is required by workspace settings." }]
    : [];
  const departmentRules = settings?.requireDepartment
    ? [{ required: true, message: "Department is required by workspace settings." }]
    : [];
  const salaryRules = settings?.requireSalary
    ? [{ required: true, message: "Salary is required by workspace settings." }]
    : [];

  return (
    <Form<EmployeeFormValues>
      form={form}
      layout="vertical"
      initialValues={getInitialValues(initial, settings)}
      onFinish={(values) => {
        const prepared: Omit<EmployeeModel, "id" | "createdAt"> = {
          firstName: values.firstName?.trim() ?? "",
          lastName: values.lastName?.trim() ?? "",
          email: values.email,
          phone: values.phone ? unmaskPhone(values.phone) : undefined,
          role: values.role,
          department: values.department,
          accessProfileUid: values.accessProfileUid ?? undefined,
          hiredAt: values.hiredAt ? values.hiredAt.format("YYYY-MM-DD") : undefined,
          salaryCents: moneyMask.parse(values.salaryCents),
          active: values.active ?? true,
        };
        onSubmit(prepared);
      }}
      data-cy="people-employee-form"
    >
      <SectionCard>
        <SectionTitle>
          <SectionTitleInline>
            <SectionTitleIcon>
              <Users size={14} />
            </SectionTitleIcon>
            Personal info
          </SectionTitleInline>
        </SectionTitle>
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="firstName"
              label={
                <FieldLabel>
                  <UserRound size={14} />
                  First name
                </FieldLabel>
              }
              rules={[{ required: true }]}
            >
              <Input
                prefix={
                  <FieldPrefixIcon>
                    <UserRound size={14} />
                  </FieldPrefixIcon>
                }
                data-cy="people-employee-first-name-input"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="lastName"
              label={
                <FieldLabel>
                  <UserRound size={14} />
                  Last name
                </FieldLabel>
              }
            >
              <Input
                prefix={
                  <FieldPrefixIcon>
                    <UserRound size={14} />
                  </FieldPrefixIcon>
                }
                data-cy="people-employee-last-name-input"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="email"
              label={
                <FieldLabel>
                  <AtSign size={14} />
                  Email
                </FieldLabel>
              }
              rules={emailRules}
            >
              <Input
                prefix={
                  <FieldPrefixIcon>
                    <AtSign size={14} />
                  </FieldPrefixIcon>
                }
                data-cy="people-employee-email-input"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="phone"
              label={
                <FieldLabel>
                  <Phone size={14} />
                  Phone
                </FieldLabel>
              }
              rules={phoneRules}
              normalize={(value) => maskPhone(String(value ?? ""))}
            >
              <Input
                prefix={
                  <FieldPrefixIcon>
                    <Phone size={14} />
                  </FieldPrefixIcon>
                }
                data-cy="people-employee-phone-input"
              />
            </Form.Item>
          </Col>
        </Row>
      </SectionCard>

      <SectionCard>
        <SectionTitle>
          <SectionTitleInline>
            <SectionTitleIcon>
              <BriefcaseBusiness size={14} />
            </SectionTitleIcon>
            Work details
          </SectionTitleInline>
        </SectionTitle>
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="role"
              label={
                <FieldLabel>
                  <BriefcaseBusiness size={14} />
                  Role
                </FieldLabel>
              }
            >
              <Input
                prefix={
                  <FieldPrefixIcon>
                    <BriefcaseBusiness size={14} />
                  </FieldPrefixIcon>
                }
                data-cy="people-employee-role-input"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="department"
              label={
                <FieldLabel>
                  <Building2 size={14} />
                  Department
                </FieldLabel>
              }
              rules={departmentRules}
            >
              <Input
                prefix={
                  <FieldPrefixIcon>
                    <Building2 size={14} />
                  </FieldPrefixIcon>
                }
                data-cy="people-employee-department-input"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="accessProfileUid"
              label={
                <FieldLabel>
                  <ShieldUser size={14} />
                  Access profile
                </FieldLabel>
              }
            >
              <Select
                allowClear
                options={(settings?.employeeAccess?.profiles ?? []).map((profile) => ({
                  value: profile.uid,
                  label: profile.name,
                }))}
                placeholder="Select hierarchy profile"
                data-cy="people-employee-access-profile-select"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="hiredAt"
              label={
                <FieldLabel>
                  <CalendarDays size={14} />
                  Hired at
                </FieldLabel>
              }
            >
              <DatePicker
                style={{ width: "100%" }}
                format={dateFormat}
                data-cy="people-employee-hired-at-input"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="salaryCents"
              label={
                <FieldLabel>
                  <BadgeDollarSign size={14} />
                  Salary
                </FieldLabel>
              }
              rules={salaryRules}
              normalize={(value) => moneyMask.normalize(value)}
            >
              <Input
                style={{ width: "100%" }}
                inputMode="numeric"
                data-cy="people-employee-salary-input"
              />
            </Form.Item>
          </Col>
        </Row>
      </SectionCard>

      <FormActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button
          type="primary"
          htmlType="submit"
          loading={submitting}
          data-cy="people-employee-save-button"
        >
          Save
        </Button>
      </FormActions>
    </Form>
  );
}

export default EmployeeFormComponent;
