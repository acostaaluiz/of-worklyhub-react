import { Form, Input, DatePicker, InputNumber, Button } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { centsToMoney, getDateFormat, getMoneyInput, maskPhone, moneyToCents, unmaskPhone } from "@core/utils/mask";
import type { EmployeeModel } from "@modules/people/interfaces/employee.model";

type EmployeeFormValues = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: string;
  department?: string;
  hiredAt?: Dayjs | null;
  salaryCents?: number;
  active?: boolean;
};

type Props = {
  initial?: Partial<EmployeeModel>;
  onSubmit: (data: Omit<EmployeeModel, "id" | "createdAt">) => Promise<void> | void;
  submitting?: boolean;
};

export function EmployeeFormComponent({ initial, onSubmit, submitting }: Props) {
  const [form] = Form.useForm<EmployeeFormValues>();
  const moneyInput = getMoneyInput();
  const dateFormat = getDateFormat();

  return (
    <Form<EmployeeFormValues>
      form={form}
      layout="vertical"
      initialValues={{
        active: true,
        ...initial,
        hiredAt: initial?.hiredAt ? dayjs(initial.hiredAt) : undefined,
        salaryCents:
          typeof initial?.salaryCents === "number"
            ? centsToMoney(initial.salaryCents)
            : undefined,
        phone: maskPhone(initial?.phone),
      }}
      onFinish={(values) => {
        const prepared: Omit<EmployeeModel, "id" | "createdAt"> = {
          firstName: values.firstName?.trim() ?? "",
          lastName: values.lastName?.trim() ?? "",
          email: values.email,
          phone: values.phone ? unmaskPhone(values.phone) : undefined,
          role: values.role,
          department: values.department,
          hiredAt: values.hiredAt ? values.hiredAt.format("YYYY-MM-DD") : undefined,
          salaryCents:
            typeof values.salaryCents === "number" && Number.isFinite(values.salaryCents)
              ? moneyToCents(values.salaryCents)
              : undefined,
          active: values.active ?? true,
        };
        onSubmit(prepared);
      }}
    >
      <Form.Item name="firstName" label="First name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      <Form.Item name="lastName" label="Last name">
        <Input />
      </Form.Item>

      <Form.Item name="email" label="Email">
        <Input />
      </Form.Item>

      <Form.Item name="phone" label="Phone" normalize={(value) => maskPhone(String(value ?? ""))}>
        <Input />
      </Form.Item>

      <Form.Item name="role" label="Role">
        <Input />
      </Form.Item>

      <Form.Item name="department" label="Department">
        <Input />
      </Form.Item>

      <Form.Item name="hiredAt" label="Hired at">
        <DatePicker style={{ width: "100%" }} format={dateFormat} />
      </Form.Item>

      <Form.Item name="salaryCents" label="Salary">
        <InputNumber style={{ width: "100%" }} min={0} step={moneyInput.step} formatter={moneyInput.formatter} parser={moneyInput.parser} precision={moneyInput.precision} />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={submitting}>Save</Button>
      </Form.Item>
    </Form>
  );
}

export default EmployeeFormComponent;
