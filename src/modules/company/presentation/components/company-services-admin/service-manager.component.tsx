import React from "react";
import { Card, Button, Modal } from "antd";
import type { CompanyServiceModel } from "@modules/company/interfaces/service.model";
import { i18n as appI18n } from "@core/i18n";
import ServiceListComponent from "./service-list.component";
import ServiceFormComponent from "./service-form.component";
import { ModalOverrides } from "@modules/schedule/presentation/components/schedule-event-modal/schedule-calendar.component.styles";
import { X } from "lucide-react";

type Props = {
  services: CompanyServiceModel[];
  loading?: boolean;
  onCreate: (p: Omit<CompanyServiceModel, "id" | "createdAt">) => Promise<void> | void;
  onUpdate: (id: string, patch: Partial<CompanyServiceModel>) => Promise<void> | void;
  onDeactivate: (s: CompanyServiceModel) => Promise<void> | void;
};

export function ServiceManagerComponent({ services, loading, onCreate, onUpdate, onDeactivate }: Props) {
  const [editing, setEditing] = React.useState<CompanyServiceModel | null>(null);
  const [showForm, setShowForm] = React.useState(false);

  return (
    <Card bordered={false} loading={loading} style={{ marginTop: 12 }} data-cy="company-services-manager-card">
      <ServiceListComponent
        services={services}
        onEdit={(s) => {
          setEditing(s);
          setShowForm(true);
        }}
        onDeactivate={onDeactivate}
        toolbarRight={
          <Button
            type="primary"
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
            data-cy="company-services-new-button"
          >
            {appI18n.t("company.admin.manager.newService")}
          </Button>
        }
      />

      <ModalOverrides>
        <Modal
          title={editing ? appI18n.t("company.admin.manager.modal.editTitle") : appI18n.t("company.admin.manager.modal.newTitle")}
          open={showForm}
          onCancel={() => setShowForm(false)}
          footer={null}
          destroyOnClose
          centered
          width={760}
          closeIcon={<X size={18} />}
          className="wh-service-modal"
          data-cy="company-services-form-modal"
        >
          <ServiceFormComponent
          initial={editing ?? undefined}
          onSubmit={(d) => {
            if (editing) {
              onUpdate(editing.id, d);
            } else {
              onCreate(d);
            }
            setShowForm(false);
          }}
          />
        </Modal>
      </ModalOverrides>
    </Card>
  );
}

export default ServiceManagerComponent;
