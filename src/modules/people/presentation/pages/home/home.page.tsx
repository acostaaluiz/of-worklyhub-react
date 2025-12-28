import React, { useEffect, useMemo, useState } from "react";
import { Button, Modal, message } from "antd";
import PeopleTemplate from "@modules/people/presentation/templates/people/people.template";
import EmployeeListComponent from "@modules/people/presentation/components/employee-list/employee-list.component";
import EmployeeFormComponent from "@modules/people/presentation/components/employee-form/employee-form.component";
import { PeopleService } from "@modules/people/services/people.service";
import type { EmployeeModel } from "@modules/people/interfaces/employee.model";
import { BasePage } from "@shared/base/base.page";

function PeopleHomePageContent(): JSX.Element {
  const service = useMemo(() => new PeopleService(), []);
  const [employees, setEmployees] = useState<EmployeeModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<EmployeeModel | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await service.listEmployees();
        setEmployees(res);
      } catch (e) {
        message.error("Erro ao carregar colaboradores");
      } finally {
        setLoading(false);
      }
    })();
  }, [service]);

  async function handleCreate(data: Omit<EmployeeModel, "id" | "createdAt">) {
    setLoading(true);
    try {
      await service.createEmployee(data);
      setShowForm(false);
      const res = await service.listEmployees();
      setEmployees(res);
      message.success("Colaborador criado");
    } catch (e) {
      message.error("Falha ao criar colaborador");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(id: string, patch: Partial<EmployeeModel>) {
    setLoading(true);
    try {
      await service.updateEmployee(id, patch);
      setEditing(null);
      const res = await service.listEmployees();
      setEmployees(res);
      message.success("Colaborador atualizado");
    } catch (e) {
      message.error("Falha ao atualizar colaborador");
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setShowForm(true);
  }

  function openEdit(e: EmployeeModel) {
    setEditing(e);
    setShowForm(true);
  }

  function openDeactivate(e: EmployeeModel) {
    Modal.confirm({
      title: `Inativar ${e.firstName} ${e.lastName}`,
      onOk: async () => {
        setLoading(true);
        try {
          await service.deactivateEmployee(e.id);
          const res = await service.listEmployees();
          setEmployees(res);
          message.success("Colaborador inativado");
        } catch (err) {
          message.error("Falha ao inativar colaborador");
        } finally {
          setLoading(false);
        }
      },
    });
  }

  return (
    <PeopleTemplate>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <div />
        <div>
          <Button type="primary" onClick={openCreate} style={{ marginRight: 8 }}>
            Novo colaborador
          </Button>
        </div>
      </div>

      <EmployeeListComponent employees={employees} onEdit={openEdit} onDeactivate={openDeactivate} />

      <Modal title={editing ? "Editar colaborador" : "Novo colaborador"} open={showForm} footer={null} onCancel={() => setShowForm(false)}>
        <EmployeeFormComponent initial={editing ?? undefined} onSubmit={(d) => (editing ? handleUpdate(editing.id, d as any) : handleCreate(d))} submitting={loading} />
      </Modal>
    </PeopleTemplate>
  );
}

export class PeopleHomePage extends BasePage {
  protected override options = {
    title: "People | WorklyHub",
    requiresAuth: true,
  };

  protected override renderPage(): React.ReactNode {
    return <PeopleHomePageContent />;
  }
}

export default PeopleHomePage;
