import { useEffect, useState } from "react";
import { BaseTemplate } from "@shared/base/base.template";
import type { ServiceModel } from "@modules/clients/interfaces/service.model";
import type { ScheduleEvent } from "@modules/schedule/interfaces/schedule-event.model";
import { TemplateShell } from "../home/home.template.styles";
import { ScheduleEventModal } from "@modules/schedule/presentation/components/schedule-event-modal/schedule-event-modal.component";
import { useScheduleApi } from "@modules/schedule/services/schedule.service";
import { Button, Tabs, message } from "antd";
import type { ScheduleEventDraft, ScheduleEventModalProps } from "@modules/schedule/presentation/components/schedule-event-modal/schedule-event-modal.form.types";

type ModalCategory = ScheduleEventModalProps["categories"][number];

type Props = {
  service: ServiceModel;
  onBooked?: (ev: ScheduleEvent) => void;
};

export function ServiceDetailTemplate({ service, onBooked }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<ScheduleEventModalProps["categories"]>([]);
  const api = useScheduleApi();

  useEffect(() => {
    (async () => {
      try {
        const cats = await api.getCategories();
        const mapped = (cats ?? []).map<ModalCategory>((c) => ({
          id: c.id,
          label: c.label,
          color: c.color ?? "var(--color-primary)",
        }));
        setCategories(mapped);
      } catch (err) {
        // ignore
      }
    })();
  }, [api]);

  const handleConfirm = async (draft: ScheduleEventDraft) => {
    try {
      const payload: Omit<ScheduleEvent, "id"> = {
        title: draft.title,
        description: draft.description,
        categoryId: draft.categoryId,
        date: draft.date,
        startTime: draft.startTime,
        endTime: draft.endTime,
        durationMinutes: draft.durationMinutes,
      };

      const created = await api.createEvent(payload);
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
        <>
          <TemplateShell>
            <div
              style={{
                height: 220,
                borderRadius: 16,
                backgroundImage: `linear-gradient(180deg, rgba(6,16,22,0.1), rgba(6,16,22,0.7)), url(${service.imageUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                marginBottom: 20,
              }}
            />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 24 }}>
              <div>
                <h2>{service.providerName}</h2>
                <h3 style={{ marginTop: 4 }}>{service.title}</h3>
                <p style={{ color: "var(--muted)" }}>{service.address}</p>
                <Tabs
                  defaultActiveKey="details"
                  items={[
                    {
                      key: "details",
                      label: "Detalhes",
                      children: (
                        <div>
                          <p>{service.description}</p>
                        </div>
                      ),
                    },
                    {
                      key: "reviews",
                      label: "Avaliações",
                      children: (
                        <div>
                          <p>
                            {service.rating?.toFixed(1) ?? "--"} · {service.reviewsCount ?? 0} avaliações
                          </p>
                          <p>Em breve: comentários e notas detalhadas.</p>
                        </div>
                      ),
                    },
                    {
                      key: "photos",
                      label: "Fotos",
                      children: (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                          {service.imageUrl ? (
                            <div
                              style={{
                                height: 120,
                                borderRadius: 10,
                                backgroundImage: `url(${service.imageUrl})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                gridColumn: "span 2",
                              }}
                            />
                          ) : (
                            <p>Nenhuma foto disponÃ­vel.</p>
                          )}
                        </div>
                      ),
                    },
                  ]}
                />
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
        </>
      }
    />
  );
}

export default ServiceDetailTemplate;
