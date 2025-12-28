import React from "react";
import { Card, Button, Modal, message } from "antd";
import { CompanyServicesService } from "@modules/company/services/company-services.service";
import type { CompanyServiceModel } from "@modules/company/interfaces/service.model";
import ServiceListComponent from "./service-list.component";
import ServiceFormComponent from "./service-form.component";
import { BaseComponent } from "@shared/base/base.component";

type State = {
  items: CompanyServiceModel[];
  loading: boolean;
  editing: CompanyServiceModel | null;
  showForm: boolean;
};

export class ServiceManagerComponent extends BaseComponent<{}, State> {
  private service = new CompanyServicesService();

  public override state: State = { items: [], loading: false, editing: null, showForm: false };

  componentDidMount() {
    this.load();
  }

  private load = async () => {
    this.setState({ loading: true });
    try {
      const res = await this.service.list();
      this.setState({ items: res });
    } catch (e) {
      // ignore
    } finally {
      this.setState({ loading: false });
    }
  };

  private handleCreate = async (payload: Omit<CompanyServiceModel, "id" | "createdAt">) => {
    try {
      await this.service.create(payload);
      message.success("Serviço criado");
      this.setState({ showForm: false });
      this.load();
    } catch (e) {
      message.error("Erro ao criar serviço");
    }
  };

  private handleUpdate = async (id: string, patch: Partial<CompanyServiceModel>) => {
    try {
      await this.service.update(id, patch);
      message.success("Serviço atualizado");
      this.setState({ editing: null, showForm: false });
      this.load();
    } catch (e) {
      message.error("Erro ao atualizar serviço");
    }
  };

  private handleDeactivate = async (s: CompanyServiceModel) => {
    try {
      await this.service.deactivate(s.id);
      message.success("Serviço inativado");
      this.load();
    } catch (e) {
      message.error("Erro ao inativar");
    }
  };

  protected override renderView(): React.ReactNode {
    const { items, editing, showForm } = this.state;

    return (
      <Card bordered={false} style={{ marginTop: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h3>Serviços</h3>
          <Button type="primary" onClick={() => { this.setState({ editing: null, showForm: true }); }}>Novo serviço</Button>
        </div>

        <ServiceListComponent services={items} onEdit={(s) => { this.setState({ editing: s, showForm: true }); }} onDeactivate={this.handleDeactivate} />

        <Modal title={editing ? "Editar serviço" : "Novo serviço"} open={showForm} onCancel={() => this.setState({ showForm: false })} footer={null} destroyOnClose>
          <ServiceFormComponent initial={editing ?? undefined} onSubmit={(d) => (editing ? this.handleUpdate(editing.id, d as any) : this.handleCreate(d))} />
        </Modal>
      </Card>
    );
  }
}

export default ServiceManagerComponent;
