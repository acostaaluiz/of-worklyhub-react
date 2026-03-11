import React from "react";
import { Button, Modal, Tabs, message } from "antd";
import PeopleTemplate from "@modules/people/presentation/templates/people/people.template";
import EmployeeListComponent from "@modules/people/presentation/components/employee-list/employee-list.component";
import EmployeeFormComponent from "@modules/people/presentation/components/employee-form/employee-form.component";
import { PeopleService } from "@modules/people/services/people.service";
import EmployeeCapacityComponent from "@modules/people/presentation/components/employee-capacity/employee-capacity.component";
import {
  getWeekStartDate,
  WorkforceCapacityService,
} from "@modules/people/services/workforce-capacity.service";
import type {
  CreateEmployeeAvailabilityBlockInput,
  UpsertEmployeeWeeklyAvailabilityInput,
  WorkforceCapacitySnapshot,
} from "@modules/people/interfaces/workforce-capacity.model";
import { companyService } from "@modules/company/services/company.service";
import { loadingService } from "@shared/ui/services/loading.service";
import type { EmployeeModel } from "@modules/people/interfaces/employee.model";
import { BasePage } from "@shared/base/base.page";
import type { BasePageState } from "@shared/base/interfaces/base-page.state.interface";

type State = {
  employees: EmployeeModel[];
  showForm: boolean;
  editing: EmployeeModel | null;
  activeTab: "employees" | "capacity";
  capacityWeekStart: string;
  capacitySnapshot: WorkforceCapacitySnapshot | null;
  capacityLoading: boolean;
} & BasePageState;

export class PeopleHomePage extends BasePage<{}, State> {
  protected override options = {
    title: "People | WorklyHub",
    requiresAuth: true,
  };

  private readonly service = new PeopleService();
  private readonly capacityService = new WorkforceCapacityService();

  public state: State = {
    isLoading: false,
    initialized: false,
    employees: [],
    showForm: false,
    editing: null,
    activeTab: "employees",
    capacityWeekStart: getWeekStartDate(),
    capacitySnapshot: null,
    capacityLoading: false,
  } as State;

  protected override async onInit(): Promise<void> {
    await this.runAsync(async () => {
      try {
        const res = await this.service.listEmployees();
        const capacitySnapshot = await this.loadCapacitySnapshot(
          res,
          this.state.capacityWeekStart
        );
        this.setSafeState({ employees: res, capacitySnapshot });
      } catch (err) {
        message.error("Error loading employees");
      }
    });
  }

  private handleOpenCreate = () => this.setSafeState({ editing: null, showForm: true });

  private handleOpenEdit = (e: EmployeeModel) => this.setSafeState({ editing: e, showForm: true });

  private handleCloseForm = () => this.setSafeState({ showForm: false, editing: null });

  private getWorkspaceId(): string | null {
    const workspace = companyService.getWorkspaceValue() as { workspaceId?: string; id?: string } | null;
    return (workspace?.workspaceId ?? workspace?.id) ?? null;
  }

  private async loadCapacitySnapshot(
    employees: EmployeeModel[],
    weekStart: string
  ): Promise<WorkforceCapacitySnapshot | null> {
    const workspaceId = this.getWorkspaceId();
    if (!workspaceId) return null;
    if ((employees ?? []).filter((employee) => employee.active).length === 0) return null;

    return this.capacityService.getSnapshot({
      workspaceId,
      employees,
      weekStart,
    });
  }

  private refreshCapacitySnapshot = async (weekStart?: string, employees?: EmployeeModel[]) => {
    const targetWeekStart = weekStart ?? this.state.capacityWeekStart;
    const targetEmployees = employees ?? this.state.employees;

    this.setSafeState({ capacityLoading: true, capacityWeekStart: targetWeekStart });
    try {
      const capacitySnapshot = await this.loadCapacitySnapshot(targetEmployees, targetWeekStart);
      this.setSafeState({ capacitySnapshot });
    } catch {
      message.error("Failed to load capacity snapshot.");
    } finally {
      this.setSafeState({ capacityLoading: false });
    }
  };

  private handleChangeCapacityWeek = async (weekStart: string) => {
    await this.refreshCapacitySnapshot(weekStart);
  };

  private handleSaveAvailability = async (input: UpsertEmployeeWeeklyAvailabilityInput) => {
    const workspaceId = this.getWorkspaceId();
    if (!workspaceId) {
      message.info("Select a workspace to manage team availability.");
      return;
    }

    try {
      await this.capacityService.saveWeeklyAvailability(workspaceId, input);
      await this.refreshCapacitySnapshot();
      message.success("Availability updated.");
    } catch {
      message.error("Failed to update availability.");
    }
  };

  private handleCreateBlock = async (input: CreateEmployeeAvailabilityBlockInput) => {
    const workspaceId = this.getWorkspaceId();
    if (!workspaceId) {
      message.info("Select a workspace to manage team availability.");
      return;
    }

    try {
      await this.capacityService.createBlock(workspaceId, input);
      await this.refreshCapacitySnapshot();
      message.success("Block created.");
    } catch {
      message.error("Failed to create block.");
    }
  };

  private handleDeleteBlock = async (blockId: string) => {
    const workspaceId = this.getWorkspaceId();
    if (!workspaceId) {
      message.info("Select a workspace to manage team availability.");
      return;
    }

    try {
      await this.capacityService.deleteBlock(workspaceId, blockId);
      await this.refreshCapacitySnapshot();
      message.success("Block removed.");
    } catch {
      message.error("Failed to remove block.");
    }
  };

  private handleCreate = async (data: Omit<EmployeeModel, "id" | "createdAt">) => {
    loadingService.show();
    try {
      const created = await this.runAsync(async () => {
        return await this.service.createEmployee(data);
      }, { setLoading: false });

      if (created) {
        const nextEmployees = [created as EmployeeModel, ...(this.state.employees ?? [])];
        this.setSafeState({ showForm: false, employees: nextEmployees });
        await this.refreshCapacitySnapshot(undefined, nextEmployees);
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
        const nextEmployees = (this.state.employees ?? []).map((e) => (e.id === (updated as EmployeeModel).id ? (updated as EmployeeModel) : e));
        this.setSafeState({ editing: null, employees: nextEmployees });
        await this.refreshCapacitySnapshot(undefined, nextEmployees);
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
            const nextEmployees = (this.state.employees ?? []).map((it) => (it.id === e.id ? { ...it, active: false } : it));
            this.setSafeState({ employees: nextEmployees });
            await this.refreshCapacitySnapshot(undefined, nextEmployees);
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
    const employeesContent = (
      <EmployeeListComponent
        employees={this.state.employees ?? []}
        onEdit={this.handleOpenEdit}
        onDeactivate={this.handleDeactivate}
        toolbarRight={<Button type="primary" onClick={this.handleOpenCreate} style={{ marginRight: 8 }}>New employee</Button>}
      />
    );

    const capacityContent = (
      <EmployeeCapacityComponent
        employees={this.state.employees ?? []}
        weekStart={this.state.capacityWeekStart}
        snapshot={this.state.capacitySnapshot}
        loading={this.state.capacityLoading}
        onChangeWeek={this.handleChangeCapacityWeek}
        onRefresh={() => this.refreshCapacitySnapshot()}
        onSaveAvailability={this.handleSaveAvailability}
        onCreateBlock={this.handleCreateBlock}
        onDeleteBlock={this.handleDeleteBlock}
      />
    );

    return (
      <PeopleTemplate>
        <Tabs
          activeKey={this.state.activeTab}
          onChange={(activeTab) => this.setSafeState({ activeTab: activeTab as "employees" | "capacity" })}
          items={[
            { key: "employees", label: "Employees", children: employeesContent },
            { key: "capacity", label: "Capacity & availability", children: capacityContent },
          ]}
        />

        <Modal title={this.state.editing ? "Edit employee" : "New employee"} open={!!this.state.showForm} footer={null} onCancel={this.handleCloseForm}>
          <EmployeeFormComponent initial={this.state.editing ?? undefined} onSubmit={(d) => (this.state.editing ? this.handleUpdate(this.state.editing!.id, d as Partial<EmployeeModel>) : this.handleCreate(d))} submitting={!!this.state.isLoading} />
        </Modal>
      </PeopleTemplate>
    );
  }
}

export default PeopleHomePage;
