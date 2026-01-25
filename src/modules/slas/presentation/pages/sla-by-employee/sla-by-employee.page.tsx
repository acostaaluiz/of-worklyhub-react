import dayjs from "dayjs";
import { Alert } from "antd";

import { BasePage } from "@shared/base/base.page";
import type { BasePageState } from "@shared/base/interfaces/base-page.state.interface";
import type { BaseProps } from "@shared/base/interfaces/base-props.interface";
import PageSkeleton from "@shared/ui/components/page-skeleton/page-skeleton.component";

import { companyService } from "@modules/company/services/company.service";
import { PeopleService } from "@modules/people/services/people.service";
import type { EmployeeModel } from "@modules/people/interfaces/employee.model";

import { SlasService } from "@modules/slas/services/slas.service";
import type { SlaEmployeeOption, SlaFilters, SlaRow } from "@modules/slas/interfaces/sla-report.model";
import type { SlaSummary } from "@modules/slas/interfaces/sla.model";
import { SlaByEmployeeTemplate } from "@modules/slas/presentation/templates/sla-by-employee/sla-by-employee.template";

const defaultFilters = (): SlaFilters => {
  const start = dayjs().startOf("month").format("YYYY-MM-DD");
  const end = dayjs().endOf("month").format("YYYY-MM-DD");
  return { from: start, to: end };
};

type SlaByEmployeePageState = BasePageState & {
  employees: EmployeeModel[];
  rows: SlaRow[];
  filters: SlaFilters;
};

type WorkspaceRef = { workspaceId?: string; id?: string } | null;

export class SlaByEmployeePage extends BasePage<BaseProps, SlaByEmployeePageState> {
  protected override options = {
    title: "Employee SLA | WorklyHub",
    requiresAuth: true,
  };

  public state: SlaByEmployeePageState = {
    isLoading: true,
    initialized: false,
    error: undefined,
    employees: [],
    rows: [],
    filters: defaultFilters(),
  };

  private slasService = new SlasService();
  private peopleService = new PeopleService();

  protected override renderPage(): React.ReactNode {
    const employees = this.mapEmployeesToOptions(this.state.employees);

    return (
      <SlaByEmployeeTemplate
        employees={employees}
        filters={this.state.filters}
        rows={this.state.rows}
        loading={this.state.isLoading}
        onChangeFilters={this.handleChangeFilters}
        onApplyFilters={this.handleApplyFilters}
        onResetFilters={this.handleResetFilters}
      />
    );
  }

  protected override renderLoading(): React.ReactNode {
    function Wrapper() {
      return <PageSkeleton mainRows={3} sideRows={3} height="100%" />;
    }

    return <Wrapper />;
  }

  protected override renderError(error: { message?: string } | string | null | undefined): React.ReactNode {
    const description = this.describeError(error);
    return (
      <div style={{ padding: "var(--space-4)" }}>
        <Alert
          type="error"
          message="Unable to load the SLA report"
          description={description}
          showIcon
        />
      </div>
    );
  }

  protected override async onInit(): Promise<void> {
    await this.runAsync(async () => {
      await super.onInit?.();

      const filters = defaultFilters();
      const employees = await this.peopleService.listEmployees();
      const rows = await this.fetchRows(filters, employees);

      this.setSafeState({ employees, rows, filters });
    }, { setLoading: true });
  }

  private handleChangeFilters = (patch: Partial<SlaFilters>) => {
    this.setSafeState({ filters: { ...this.state.filters, ...patch } });
  };

  private handleApplyFilters = async () => {
    await this.loadRows(this.state.filters);
  };

  private handleResetFilters = async () => {
    const filters = defaultFilters();
    this.setSafeState({ filters });
    await this.loadRows(filters);
  };

  private async loadRows(filters: SlaFilters): Promise<void> {
    this.clearError();

    await this.runAsync(async () => {
      const rows = await this.fetchRows(filters, this.state.employees);
      this.setSafeState({ rows });
    }, { setLoading: true });
  }

  private async fetchRows(filters: SlaFilters, employees: EmployeeModel[]): Promise<SlaRow[]> {
    const workspaceId = this.getWorkspaceId();
    if (!workspaceId) return [];

    const summary = await this.slasService.getSummary(workspaceId, {
      userUid: filters.userUid,
      from: filters.from,
      to: filters.to,
    });

    return this.mapSummaryToRows(summary, employees);
  }

  private getWorkspaceId(): string | null {
    const ws = companyService.getWorkspaceValue() as WorkspaceRef;
    return (ws?.workspaceId ?? ws?.id) ?? null;
  }

  private mapEmployeesToOptions(employees: EmployeeModel[]): SlaEmployeeOption[] {
    return employees.map((employee) => ({
      value: employee.id,
      label: this.formatEmployeeName(employee),
    }));
  }

  private mapSummaryToRows(summary: SlaSummary[], employees: EmployeeModel[]): SlaRow[] {
    const nameMap = new Map<string, string>();
    for (const employee of employees) {
      nameMap.set(employee.id, this.formatEmployeeName(employee));
    }

    return summary.map((item) => ({
      key: `${item.userUid}-${item.workDate}`,
      userUid: item.userUid,
      employeeName: nameMap.get(item.userUid) ?? "Unknown employee",
      workDate: item.workDate,
      totalMinutes: item.totalMinutes,
      totalHours: item.totalHours,
    }));
  }

  private formatEmployeeName(employee: EmployeeModel): string {
    const name = `${employee.firstName ?? ""} ${employee.lastName ?? ""}`.trim();
    if (name.length > 0) return name;
    if (employee.email) return employee.email;
    return employee.id;
  }

  private describeError(error: { message?: string } | string | null | undefined): string {
    if (!error) return "Please try again or adjust the filters.";
    if (typeof error === "string") return error;
    if (error.message) return error.message;
    return "Please try again or adjust the filters.";
  }
}

export default SlaByEmployeePage;
