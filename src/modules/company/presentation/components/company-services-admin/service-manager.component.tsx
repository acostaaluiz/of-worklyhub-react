import React from "react";
import { Card, Button, Modal } from "antd";
import type { CompanyServiceModel } from "@modules/company/interfaces/service.model";
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
    <Card bordered={false} loading={loading} style={{ marginTop: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h3>Services</h3>
        <Button type="primary" onClick={() => { setEditing(null); setShowForm(true); }}>New service</Button>
      </div>

      <ServiceListComponent services={services} onEdit={(s) => { setEditing(s); setShowForm(true); }} onDeactivate={onDeactivate} />

      <ModalOverrides>
        <Modal
          title={editing ? "Edit service" : "New service"}
          open={showForm}
          onCancel={() => setShowForm(false)}
          footer={null}
          destroyOnClose
          centered
          width={760}
          closeIcon={<X size={18} />}
          className="wh-service-modal"
        >
          <ServiceFormComponent
          initial={editing ?? undefined}
          onSubmit={(d) => {
            if (editing) {
              onUpdate(editing.id, d as any);
            } else {
              onCreate(d as any);
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
