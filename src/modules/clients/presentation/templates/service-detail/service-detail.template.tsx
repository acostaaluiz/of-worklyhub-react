import { useEffect, useState } from "react";
import { BaseTemplate } from "@shared/base/base.template";
import { PrivateFrameLayout } from "@shared/ui/layout/private-frame/private-frame.component";
import type { ServiceModel } from "@modules/clients/interfaces/service.model";
import { TemplateShell } from "../home/home.template.styles";
import { ScheduleEventModal } from "@modules/schedule/presentation/components/schedule-event-modal/schedule-event-modal.component";
import { useScheduleApi } from "@modules/schedule/services/schedule.service";
import { Button, message } from "antd";

type Props = {
  service: ServiceModel;
  onBooked?: (ev: any) => void;
};

export function ServiceDetailTemplate({ service, onBooked }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const api = useScheduleApi();

  useEffect(() => {
    (async () => {
      try {
        const cats = await api.getCategories();
        setCategories(cats);
      } catch (err) {
        // ignore
      }
    })();
  }, [api]);

  const handleConfirm = async (draft: any) => {
    try {
      const created = await api.createEvent(draft);
      message.success("Agendamento criado");
      setIsOpen(false);
      onBooked?.(created);
    } catch (err) {
      message.error("Erro ao criar agendamento");
    }
  };

  return (
    <BaseTemplate
      content={
        <PrivateFrameLayout>
          <TemplateShell>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 24 }}>
              <div>
                <h2>{service.providerName}</h2>
                <h3 style={{ marginTop: 4 }}>{service.title}</h3>
                <p style={{ color: "var(--muted)" }}>{service.address}</p>
                <p>{service.description}</p>
              </div>

              <div>
                <div style={{ marginBottom: 8, fontWeight: 600 }}>Agendar</div>
                <div style={{ display: "flex", gap: 8, flexDirection: "column" }}>
                  <Button type="primary" onClick={() => setIsOpen(true)}>Agendar</Button>
                </div>
              </div>
            </div>

            <ScheduleEventModal
              open={isOpen}
              onClose={() => setIsOpen(false)}
              onConfirm={handleConfirm}
              categories={categories}
              initialDate={undefined}
            />
          </TemplateShell>
        </PrivateFrameLayout>
      }
    />
  );
}

export default ServiceDetailTemplate;
