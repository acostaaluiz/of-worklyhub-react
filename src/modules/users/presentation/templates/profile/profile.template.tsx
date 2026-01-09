import React from "react";
import { BaseTemplate } from "@shared/base/base.template";
import { PrivateFrameLayout } from "@shared/ui/layout/private-frame/private-frame.component";
import { Tabs, Row, Col, Avatar, Button, Form, Input, Radio, InputNumber } from "antd";
import styled from "styled-components";

const { TabPane } = Tabs;

const AvatarWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
`;

export type PersonalModel = {
  fullName: string;
  email: string;
  phone?: string;
  photoUrl?: string;
  planId?: number;
  planName?: string;
  planPrice?: string;
};

export type CompanyModel = {
  accountType: "individual" | "company";
  companyName?: string;
  employees?: number;
  primaryService?: string;
  industry?: string;
  description?: string;
  tradeName?: string;
  wallpaperUrl?: string;
};

export type ProfileTemplateProps = {
  personal: PersonalModel;
  company?: CompanyModel;
  isSavingPersonal?: boolean;
  isSavingCompany?: boolean;
  onOpenAvatar: () => void;
  onOpenWallpaper?: () => void;
  onSavePersonal: (values: PersonalModel) => void;
  onSaveCompany: (values: CompanyModel) => void;
};

const FormStackStyle: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 12 };

export const ProfileTemplate: React.FC<ProfileTemplateProps> = ({ personal, company, onOpenAvatar, onOpenWallpaper, onSavePersonal, onSaveCompany, isSavingPersonal, isSavingCompany }) => {
  const [personalForm] = Form.useForm();
  const [companyForm] = Form.useForm();

  React.useEffect(() => {
    // schedule update after render to avoid "not connected to any Form" warning
    Promise.resolve().then(() => {
      try {
        personalForm.setFieldsValue(personal ?? {});
      } catch {
        // ignore
      }
    });
  }, [personal, personalForm]);

  React.useEffect(() => {
    // always set company form values (use sensible defaults) so fields render filled when possible
    const defaults = { accountType: "individual" } as Partial<import(".").CompanyModel>;
    Promise.resolve().then(() => {
      try {
        companyForm.setFieldsValue(company ?? defaults);
      } catch {
        // ignore
      }
    });
  }, [company, companyForm]);

  const content = (
    <Row gutter={24} style={{ marginTop: 8 }}>
      <Col xs={24} md={8}>
        <AvatarWrap>
          <Avatar size={120} src={personal?.photoUrl} />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontWeight: 600 }}>{personal?.fullName}</div>
            <div style={{ color: "var(--color-text-muted)", fontSize: 14 }}>{personal?.email}</div>
          </div>
          <div style={{ textAlign: "center", marginTop: 8 }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{personal?.planName ?? "No plan"}</div>
            {personal?.planPrice ? <div style={{ color: "var(--color-text-muted)", fontSize: 13 }}>{personal.planPrice}</div> : null}
          </div>
          <Button type="default" onClick={onOpenAvatar}>Change photo</Button>
        </AvatarWrap>
      </Col>
      <Col xs={24} md={16}>
        {company?.wallpaperUrl ? (
          <div style={{ marginBottom: 12, borderRadius: 8, overflow: "hidden" }}>
            <div style={{ height: 160, backgroundSize: "cover", backgroundPosition: "center", backgroundImage: `url(${company.wallpaperUrl})` }} />
          </div>
        ) : null}
        <Tabs defaultActiveKey="personal">
          <TabPane tab="Personal info" key="personal">
            <Form form={personalForm} initialValues={personal} layout="vertical" style={FormStackStyle} onFinish={(v) => onSavePersonal(v as PersonalModel)}>
              <Form.Item name="fullName" label="Full name" rules={[{ required: true, message: "Please enter your full name" }]}>
                <Input placeholder="Full name" />
              </Form.Item>
              <Form.Item name="email" label="Email">
                <Input disabled />
              </Form.Item>
              <Form.Item name="phone" label="Phone">
                <Input placeholder="Phone" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={isSavingPersonal}>Save personal</Button>
              </Form.Item>
            </Form>
          </TabPane>

          <TabPane tab="Company info" key="company" forceRender>
            <Form form={companyForm} initialValues={company ?? { accountType: "individual" }} layout="vertical" style={FormStackStyle} onFinish={(v) => onSaveCompany(v as CompanyModel)}>
              <Form.Item name="accountType" label="Account type">
                <Radio.Group>
                  <Radio value="individual">Individual</Radio>
                  <Radio value="company">Company</Radio>
                </Radio.Group>
              </Form.Item>

              <Form.Item name="companyName" label="Company name">
                <Input placeholder="Company name" />
              </Form.Item>

              <Form.Item name="tradeName" label="Trade name">
                <Input placeholder="Trade name" />
              </Form.Item>

              <Form.Item name="employees" label="Employees">
                <InputNumber style={{ width: 160 }} min={0} />
              </Form.Item>

              <Form.Item name="primaryService" label="Primary service">
                <Input placeholder="Primary service" />
              </Form.Item>

              <Form.Item name="industry" label="Industry">
                <Input placeholder="Industry" />
              </Form.Item>

              <Form.Item name="description" label="Description">
                <Input.TextArea rows={4} />
              </Form.Item>

              <Form.Item>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <Button type="default" onClick={onOpenWallpaper}>Change wallpaper</Button>
                  <Button type="primary" htmlType="submit" loading={isSavingCompany}>Save company</Button>
                </div>
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>
      </Col>
    </Row>
  );

  return <BaseTemplate content={<PrivateFrameLayout>{content}</PrivateFrameLayout>} />;
};

export default ProfileTemplate;

