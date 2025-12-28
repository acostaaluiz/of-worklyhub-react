import { toAppError } from "@core/errors/to-app-error";
import type { EmployeeModel } from "@modules/people/interfaces/employee.model";

function nowIso() {
  return new Date().toISOString();
}

function makeId(prefix = "e") {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;
}

export class PeopleService {
  private employees: EmployeeModel[] = [
    { id: makeId(), firstName: "Mariana", lastName: "Silva", email: "mariana@demo.com", phone: "(11) 99999-0001", role: "Recepção", department: "Operações", hiredAt: nowIso(), salaryCents: 350000, active: true, createdAt: nowIso() },
    { id: makeId(), firstName: "João", lastName: "Pereira", email: "joao@demo.com", phone: "(11) 99999-0002", role: "Barbeiro", department: "Serviços", hiredAt: nowIso(), salaryCents: 220000, active: true, createdAt: nowIso() },
  ];

  async listEmployees(): Promise<EmployeeModel[]> {
    try {
      await new Promise((r) => setTimeout(r, 80));
      return this.employees.slice();
    } catch (err) {
      throw toAppError(err);
    }
  }

  async getEmployee(id: string): Promise<EmployeeModel | null> {
    try {
      await new Promise((r) => setTimeout(r, 40));
      return this.employees.find((e) => e.id === id) ?? null;
    } catch (err) {
      throw toAppError(err);
    }
  }

  async createEmployee(payload: Omit<EmployeeModel, "id" | "createdAt">): Promise<EmployeeModel> {
    try {
      await new Promise((r) => setTimeout(r, 80));
      const emp: EmployeeModel = { ...payload, id: makeId(), createdAt: nowIso() } as EmployeeModel;
      this.employees.unshift(emp);
      return emp;
    } catch (err) {
      throw toAppError(err);
    }
  }

  async updateEmployee(id: string, patch: Partial<EmployeeModel>): Promise<EmployeeModel> {
    try {
      await new Promise((r) => setTimeout(r, 80));
      const idx = this.employees.findIndex((e) => e.id === id);
      if (idx === -1) throw new Error("Employee not found");
      this.employees[idx] = { ...this.employees[idx], ...patch };
      return this.employees[idx];
    } catch (err) {
      throw toAppError(err);
    }
  }

  async deactivateEmployee(id: string): Promise<void> {
    try {
      await new Promise((r) => setTimeout(r, 60));
      const emp = this.employees.find((e) => e.id === id);
      if (!emp) throw new Error("Employee not found");
      emp.active = false;
    } catch (err) {
      throw toAppError(err);
    }
  }
}

export default PeopleService;
