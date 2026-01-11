import React from "react";
import { Button, Modal, message } from "antd";
import PeopleTemplate from "@modules/people/presentation/templates/people/people.template";
import EmployeeListComponent from "@modules/people/presentation/components/employee-list/employee-list.component";
import EmployeeFormComponent from "@modules/people/presentation/components/employee-form/employee-form.component";
import { PeopleService } from "@modules/people/services/people.service";
import { loadingService } from "@shared/ui/services/loading.service";
import type { EmployeeModel } from "@modules/people/interfaces/employee.model";
import { BasePage } from "@shared/base/base.page";

type State = {
  employees: EmployeeModel[];
  showForm: boolean;
  editing: EmployeeModel | null;
} & import("@shared/base/interfaces/base-page.state.interface").BasePageState;

export class PeopleHomePage extends BasePage<{}, State> {
  protected override options = {
    title: "People | WorklyHub",
    requiresAuth: true,
  };

  private readonly service = new PeopleService();

  public state: State = {
    isLoading: false,
    initialized: false,
    employees: [],
    showForm: false,
    editing: null,
  } as State;

  protected override async onInit(): Promise<void> {
    await this.runAsync(async () => {
      try {
        const res = await this.service.listEmployees();
        this.setSafeState({ employees: res });
      } catch (err) {
        message.error("Error loading employees");
      }
    });
  }

  private handleOpenCreate = () => this.setSafeState({ editing: null, showForm: true });

  private handleOpenEdit = (e: EmployeeModel) => this.setSafeState({ editing: e, showForm: true });

  private handleCloseForm = () => this.setSafeState({ showForm: false, editing: null });

  private handleCreate = async (data: Omit<EmployeeModel, "id" | "createdAt">) => {
    loadingService.show();
    try {
      const created = await this.runAsync(async () => {
        return await this.service.createEmployee(data);
      }, { setLoading: false });

      if (created) {
        this.setSafeState({ showForm: false, employees: [created as EmployeeModel, ...(this.state.employees ?? [])] });
        message.success("Employee created");
      }
    } catch (err) {
      message.error("Failed to create employee");
    } finally {
      loadingService.hide();
    }
  };

  private handleUpdate = async (id: string, patch: Partial<EmployeeModel>) => {
    loadingService.show();
    try {
      const updated = await this.runAsync(async () => {
        return await this.service.updateEmployee(id, patch);
      }, { setLoading: false });

      if (updated) {
        this.setSafeState({ editing: null, employees: (this.state.employees ?? []).map((e) => (e.id === (updated as EmployeeModel).id ? (updated as EmployeeModel) : e)) });
        message.success("Employee updated");
      }
    } catch (err) {
      message.error("Failed to update employee");
    } finally {
      loadingService.hide();
    }
  };

  private handleDeactivate = (e: EmployeeModel) => {
    Modal.confirm({
      title: `Deactivate ${e.firstName} ${e.lastName}`,
      onOk: async () => {
        loadingService.show();
        try {
          await this.runAsync(async () => {
            await this.service.deactivateEmployee(e.id);
            this.setSafeState({ employees: (this.state.employees ?? []).map((it) => (it.id === e.id ? { ...it, active: false } : it)) });
            message.success("Employee deactivated");
          }, { setLoading: false });
        } catch (err) {
          message.error("Failed to deactivate employee");
        } finally {
          loadingService.hide();
        }
      },
    });
  };

  protected override renderPage(): React.ReactNode {
    return (
      <PeopleTemplate>
        <EmployeeListComponent
          employees={this.state.employees ?? []}
          onEdit={this.handleOpenEdit}
          onDeactivate={this.handleDeactivate}
          toolbarRight={<Button type="primary" onClick={this.handleOpenCreate} style={{ marginRight: 8 }}>New employee</Button>}
        />

        <Modal title={this.state.editing ? "Edit employee" : "New employee"} open={!!this.state.showForm} footer={null} onCancel={this.handleCloseForm}>
          <EmployeeFormComponent initial={this.state.editing ?? undefined} onSubmit={(d) => (this.state.editing ? this.handleUpdate(this.state.editing!.id, d as Partial<EmployeeModel>) : this.handleCreate(d))} submitting={!!this.state.isLoading} />
        </Modal>
      </PeopleTemplate>
    );
  }
}

export default PeopleHomePage;
