import { useEffect, useState } from "react";
import { Button, Tabs, message } from "antd";
import {
  Building2,
  CalendarDays,
  CalendarPlus,
  Clock3,
  FileText,
  ImageIcon,
  MapPin,
  MessageCircleMore,
  ShieldCheck,
  Sparkles,
  Star,
  Tag,
} from "lucide-react";
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
  BookingHeader,
  BookingHeaderIcon,
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
  HeroOverlay,
  HeroOverlayChip,
  HeroOverlayChips,
  HeroOverlayMeta,
  HeroOverlaySubtitle,
  HeroOverlayTitle,
  InfoAddress,
  InfoCard,
  InfoHeader,
  InfoSubtitle,
  InfoTitle,
  MetaChip,
  MetaRow,
  PhotoGrid,
  PhotoItem,
  QuickFactCard,
  QuickFactIcon,
  QuickFactLabel,
  QuickFactMeta,
  QuickFactsGrid,
  QuickFactValue,
  ServiceDetailShell,
  TabLabel,
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
  const reviewsCountLabel = service.reviewsCount
    ? formatCount(service.reviewsCount)
    : "0";
  const tags = service.tags ?? [];
  const gallery = service.imageUrl ? [service.imageUrl] : [];

  return (
    <BaseTemplate
      content={
        <>
          <ServiceDetailShell>
            <HeroCover $image={service.imageUrl}>
              <HeroOverlay>
                <HeroOverlayMeta>
                  <HeroOverlayTitle>{service.providerName}</HeroOverlayTitle>
                  <HeroOverlaySubtitle>{service.title}</HeroOverlaySubtitle>
                </HeroOverlayMeta>
                <HeroOverlayChips>
                  <HeroOverlayChip>
                    <Star size={14} /> {ratingValue}
                  </HeroOverlayChip>
                  <HeroOverlayChip>
                    <Tag size={14} /> {formattedPrice}
                  </HeroOverlayChip>
                </HeroOverlayChips>
              </HeroOverlay>
            </HeroCover>

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

                <QuickFactsGrid>
                  <QuickFactCard>
                    <QuickFactIcon>
                      <MessageCircleMore size={14} />
                    </QuickFactIcon>
                    <QuickFactMeta>
                      <QuickFactLabel>Avaliacoes</QuickFactLabel>
                      <QuickFactValue>{reviewsCountLabel} feedbacks</QuickFactValue>
                    </QuickFactMeta>
                  </QuickFactCard>
                  <QuickFactCard>
                    <QuickFactIcon>
                      <Building2 size={14} />
                    </QuickFactIcon>
                    <QuickFactMeta>
                      <QuickFactLabel>Parceiro</QuickFactLabel>
                      <QuickFactValue>{service.providerName}</QuickFactValue>
                    </QuickFactMeta>
                  </QuickFactCard>
                  <QuickFactCard>
                    <QuickFactIcon>
                      <Sparkles size={14} />
                    </QuickFactIcon>
                    <QuickFactMeta>
                      <QuickFactLabel>Categorias</QuickFactLabel>
                      <QuickFactValue>
                        {tags.length ? `${tags.length} tags` : "Nao informado"}
                      </QuickFactValue>
                    </QuickFactMeta>
                  </QuickFactCard>
                </QuickFactsGrid>

                <TabsShell>
                  <Tabs
                    defaultActiveKey="details"
                    items={[
                      {
                        key: "details",
                        label: (
                          <TabLabel>
                            <FileText size={14} />
                            Detalhes
                          </TabLabel>
                        ),
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
                        label: (
                          <TabLabel>
                            <MessageCircleMore size={14} />
                            Avaliacoes
                          </TabLabel>
                        ),
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
                        label: (
                          <TabLabel>
                            <ImageIcon size={14} />
                            Fotos
                          </TabLabel>
                        ),
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
                <BookingHeader>
                  <BookingHeaderIcon>
                    <CalendarDays size={18} />
                  </BookingHeaderIcon>
                  <BookingTitle>Agende agora</BookingTitle>
                </BookingHeader>
                <BookingPriceLabel>Preco a partir de</BookingPriceLabel>
                <BookingPriceValue>{formattedPrice}</BookingPriceValue>
                <Button type="primary" size="large" onClick={() => setIsOpen(true)} block>
                  <CalendarPlus size={16} style={{ marginRight: 8 }} />
                  Agendar servico
                </Button>
                <BookingHint>Escolha data, horario e pronto.</BookingHint>
                <BookingList>
                  <BookingListItem>
                    <span className="icon">
                      <CalendarDays size={14} />
                    </span>
                    Selecione o melhor dia
                  </BookingListItem>
                  <BookingListItem>
                    <span className="icon">
                      <Clock3 size={14} />
                    </span>
                    Ajuste o horario ideal
                  </BookingListItem>
                  <BookingListItem>
                    <span className="icon">
                      <ShieldCheck size={14} />
                    </span>
                    Receba confirmacao do parceiro
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
