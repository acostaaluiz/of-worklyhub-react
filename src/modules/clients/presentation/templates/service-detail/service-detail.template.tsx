import { useEffect, useState } from "react";
import { Button, Tabs, message } from "antd";
import { CalendarDays, CheckCircle2, Clock, MapPin, Star, Tag } from "lucide-react";
import { BaseTemplate } from "@shared/base/base.template";
import { formatMoneyFromCents } from "@core/utils/mask";
import type { ServiceModel } from "@modules/clients/interfaces/service.model";
import type { ScheduleEvent } from "@modules/schedule/interfaces/schedule-event.model";
import { ScheduleEventModal } from "@modules/schedule/presentation/components/schedule-event-modal/schedule-event-modal.component";
import { useScheduleApi } from "@modules/schedule/services/schedule.service";
import type {
  ScheduleEventDraft,
  ScheduleEventModalProps,
} from "@modules/schedule/presentation/components/schedule-event-modal/schedule-event-modal.form.types";
import {
  BookingCard,
  AccentChip,
  BookingHint,
  BookingList,
  BookingListItem,
  BookingPriceLabel,
  BookingPriceValue,
  BookingTitle,
  DetailGrid,
  DetailMuted,
  DetailText,
  HeaderStack,
  HeroCover,
  InfoAddress,
  InfoCard,
  InfoHeader,
  InfoSubtitle,
  InfoTitle,
  MetaChip,
  MetaRow,
  PhotoGrid,
  PhotoItem,
  ServiceDetailShell,
  TabsShell,
  TagPill,
  TagRow,
} from "./service-detail.template.styles";

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

  const formatCount = (value: number) => new Intl.NumberFormat("pt-BR").format(value);
  const formattedPrice =
    service.priceFormatted ??
    (typeof service.priceCents === "number"
      ? formatMoneyFromCents(service.priceCents, { locale: "pt-BR", currency: "BRL" })
      : "Sob consulta");
  const ratingValue = typeof service.rating === "number" ? service.rating.toFixed(1) : "--";
  const reviewsLabel = service.reviewsCount
    ? `${formatCount(service.reviewsCount)} avaliacoes`
    : "Sem avaliacoes";
  const tags = service.tags ?? [];
  const gallery = service.imageUrl ? [service.imageUrl] : [];

  return (
    <BaseTemplate
      content={
        <>
          <ServiceDetailShell>
            <HeroCover $image={service.imageUrl} />

            <DetailGrid>
              <InfoCard>
                <InfoHeader>
                  <HeaderStack>
                    <InfoTitle>{service.providerName}</InfoTitle>
                    <InfoSubtitle>{service.title}</InfoSubtitle>
                    {service.address ? (
                      <InfoAddress>
                        <MapPin size={14} />
                        {service.address}
                      </InfoAddress>
                    ) : null}
                  </HeaderStack>
                  {service.featured ? <AccentChip>Destaque</AccentChip> : null}
                </InfoHeader>

                <MetaRow>
                  <MetaChip>
                    <Star size={14} /> {ratingValue} - {reviewsLabel}
                  </MetaChip>
                  <MetaChip>
                    <Tag size={14} /> {formattedPrice}
                  </MetaChip>
                </MetaRow>

                <TabsShell>
                  <Tabs
                    defaultActiveKey="details"
                    items={[
                      {
                        key: "details",
                        label: "Detalhes",
                        children: (
                          <div>
                            <DetailText>
                              {service.description ?? "Descricao nao informada."}
                            </DetailText>
                            {tags.length ? (
                              <TagRow>
                                {tags.slice(0, 6).map((tag) => (
                                  <TagPill key={tag}>{tag}</TagPill>
                                ))}
                              </TagRow>
                            ) : null}
                          </div>
                        ),
                      },
                      {
                        key: "reviews",
                        label: "Avaliacoes",
                        children: (
                          <div>
                            <DetailText>
                              {ratingValue} - {reviewsLabel}
                            </DetailText>
                            <DetailMuted>
                              Em breve: comentarios e notas detalhadas.
                            </DetailMuted>
                          </div>
                        ),
                      },
                      {
                        key: "photos",
                        label: "Fotos",
                        children: (
                          <div>
                            <PhotoGrid>
                              {gallery.length ? (
                                gallery.map((photo, index) => (
                                  <PhotoItem key={`${photo}-${index}`} $image={photo} />
                                ))
                              ) : (
                                <DetailMuted>Nenhuma foto disponivel.</DetailMuted>
                              )}
                            </PhotoGrid>
                            {gallery.length ? (
                              <DetailMuted>Mais fotos em breve.</DetailMuted>
                            ) : null}
                          </div>
                        ),
                      },
                    ]}
                  />
                </TabsShell>
              </InfoCard>

              <BookingCard>
                <BookingTitle>Agende agora</BookingTitle>
                <BookingPriceLabel>Preco a partir de</BookingPriceLabel>
                <BookingPriceValue>{formattedPrice}</BookingPriceValue>
                <Button type="primary" size="large" onClick={() => setIsOpen(true)} block>
                  Agendar servico
                </Button>
                <BookingHint>Escolha data, horario e pronto.</BookingHint>
                <BookingList>
                  <BookingListItem>
                    <CalendarDays size={16} /> Selecione o melhor dia
                  </BookingListItem>
                  <BookingListItem>
                    <Clock size={16} /> Ajuste o horario ideal
                  </BookingListItem>
                  <BookingListItem>
                    <CheckCircle2 size={16} /> Receba confirmacao do parceiro
                  </BookingListItem>
                </BookingList>
              </BookingCard>
            </DetailGrid>

            <ScheduleEventModal
              open={isOpen}
              onClose={() => setIsOpen(false)}
              onConfirm={handleConfirm}
              categories={categories}
              initialDate={undefined}
            />
          </ServiceDetailShell>
        </>
      }
    />
  );
}

export default ServiceDetailTemplate;
