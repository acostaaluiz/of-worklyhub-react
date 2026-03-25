import React from "react";
import { Button, Modal } from "antd";
import { BriefcaseBusiness, Edit, Plus, X } from "lucide-react";

import type { CompanyServiceModel } from "@modules/company/interfaces/service.model";
import { i18n as appI18n } from "@core/i18n";
import { IconLabel } from "@shared/ui/components/settings/icon-label.component";
import { SettingsSurfaceCard } from "@shared/ui/components/settings/settings-surface-card.component";

import ServiceListComponent from "./service-list.component";
import ServiceFormComponent from "./service-form.component";
import { ModalOverrides } from "./service-manager.component.styles";

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

  const isEditing = Boolean(editing);

  return (
    <SettingsSurfaceCard bordered={false} loading={loading} data-cy="company-services-manager-card">
      <ServiceListComponent
        services={services}
        onEdit={(service) => {
          setEditing(service);
          setShowForm(true);
        }}
        onDeactivate={onDeactivate}
        toolbarRight={
          <Button
            type="primary"
            icon={<Plus size={16} />}
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
          title={
            <IconLabel
              icon={isEditing ? <Edit size={16} /> : <BriefcaseBusiness size={16} />}
              text={
                isEditing
                  ? appI18n.t("company.admin.manager.modal.editTitle")
                  : appI18n.t("company.admin.manager.modal.newTitle")
              }
            />
          }
          open={showForm}
          onCancel={() => setShowForm(false)}
          footer={null}
          destroyOnClose
          centered
          width={880}
          closeIcon={<X size={18} />}
          className="wh-service-modal"
          data-cy="company-services-form-modal"
        >
          <ServiceFormComponent
            initial={editing ?? undefined}
            onSubmit={(data) => {
              if (editing) {
                onUpdate(editing.id, data);
              } else {
                onCreate(data);
              }
              setShowForm(false);
            }}
          />
        </Modal>
      </ModalOverrides>
    </SettingsSurfaceCard>
  );
}

export default ServiceManagerComponent;
