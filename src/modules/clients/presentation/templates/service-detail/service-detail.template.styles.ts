import styled from "styled-components";
import { TemplateShell } from "../home/home.template.styles";

export const ServiceDetailShell = styled(TemplateShell)`
  gap: var(--space-4);
  overflow: hidden;

  @media (max-width: 768px) {
    overflow-y: auto;
  }
`;

export const HeroCover = styled.div<{ $image?: string }>`
  position: relative;
  min-height: clamp(230px, 31vh, 320px);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  background-color: var(--color-surface-2);
  background-image: ${({ $image }) => ($image ? `url(${$image})` : "none")};
  background-size: cover;
  background-position: center;
  overflow: hidden;
  box-shadow: var(--shadow-elevated);

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background:
      linear-gradient(180deg, rgba(7, 13, 18, 0.02) 10%, rgba(7, 13, 18, 0.58) 95%),
      linear-gradient(120deg, rgba(30, 112, 255, 0.24), rgba(0, 214, 160, 0.12));
  }
`;

export const HeroOverlay = styled.div`
  position: absolute;
  left: 14px;
  right: 14px;
  bottom: 14px;
  z-index: 1;
  border-radius: var(--radius-md);
  border: 1px solid rgba(255, 255, 255, 0.22);
  background: linear-gradient(
    120deg,
    color-mix(in srgb, rgba(7, 13, 18, 0.74) 86%, transparent),
    color-mix(in srgb, rgba(7, 13, 18, 0.58) 80%, transparent)
  );
  backdrop-filter: blur(4px);
  padding: 10px 12px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 10px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

export const HeroOverlayMeta = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const HeroOverlayTitle = styled.h2`
  margin: 0;
  color: #fff;
  font-size: clamp(18px, 2.2vw, 24px);
  letter-spacing: -0.01em;
`;

export const HeroOverlaySubtitle = styled.p`
  margin: 0;
  color: rgba(255, 255, 255, 0.85);
  font-size: 13px;
`;

export const HeroOverlayChips = styled.div`
  display: inline-flex;
  flex-wrap: wrap;
  gap: 8px;
`;

export const HeroOverlayChip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.25);
  background: rgba(255, 255, 255, 0.14);
`;

export const TagRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: var(--space-2);
`;

export const TagPill = styled.span`
  padding: 4px 12px;
  border-radius: 999px;
  background: var(--color-surface-2);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  font-size: 12px;
  font-weight: 600;
`;

export const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(0, 0.9fr);
  gap: var(--space-4);
  align-items: stretch;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

export const InfoCard = styled.section`
  padding: var(--space-4);
  border-radius: var(--radius-md);
  background: linear-gradient(
    145deg,
    color-mix(in srgb, var(--color-surface-2) 82%, transparent),
    var(--color-surface)
  );
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  height: 100%;
`;

export const InfoHeader = styled.div`
  display: flex;
  justify-content: space-between;
  gap: var(--space-3);
  align-items: flex-start;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

export const HeaderStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const InfoTitle = styled.h3`
  margin: 0;
  font-size: clamp(20px, 2.2vw, 26px);
`;

export const InfoSubtitle = styled.p`
  margin: 4px 0 0;
  font-size: var(--font-size-md);
  font-weight: 600;
`;

export const InfoAddress = styled.p`
  margin: var(--space-1) 0 0;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  display: inline-flex;
  align-items: center;
  gap: 6px;
`;

export const MetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: var(--space-1);
`;

export const MetaChip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 999px;
  background: var(--color-surface-2);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  font-size: 12px;
  font-weight: 600;
`;

export const QuickFactsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const QuickFactCard = styled.div`
  border-radius: 12px;
  border: 1px solid var(--color-border);
  background: color-mix(in srgb, var(--color-surface) 92%, transparent);
  padding: 8px 10px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const QuickFactIcon = styled.span`
  width: 26px;
  height: 26px;
  border-radius: 8px;
  background: var(--color-surface-2);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
  flex-shrink: 0;
`;

export const QuickFactMeta = styled.div`
  min-width: 0;
`;

export const QuickFactLabel = styled.div`
  font-size: 11px;
  color: var(--color-text-muted);
`;

export const QuickFactValue = styled.div`
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const AccentChip = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(245, 158, 11, 0.16);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.4);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  align-self: flex-start;
  line-height: 1;
`;

export const TabsShell = styled.div`
  border-top: 1px solid var(--color-divider);
  padding-top: var(--space-2);

  .ant-tabs-nav {
    margin-bottom: var(--space-3);
  }

  .ant-tabs-tab {
    font-weight: 600;
    color: var(--color-text-muted);
    padding: 8px 0;
  }

  .ant-tabs-tab-active .ant-tabs-tab-btn {
    color: var(--color-text);
  }

  .ant-tabs-ink-bar {
    background: var(--color-primary);
  }
`;

export const TabLabel = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
`;

export const DetailText = styled.p`
  margin: 0;
  color: var(--color-text);
  line-height: 1.6;
`;

export const DetailMuted = styled.p`
  margin: var(--space-2) 0 0;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
`;

export const PhotoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-2);

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

export const PhotoItem = styled.div<{ $image?: string }>`
  height: 120px;
  border-radius: 12px;
  background-color: var(--color-surface-2);
  background-image: ${({ $image }) => ($image ? `url(${$image})` : "none")};
  background-size: cover;
  background-position: center;
  border: 1px solid var(--color-border);
`;

export const BookingCard = styled.aside`
  padding: var(--space-4);
  border-radius: var(--radius-md);
  background: linear-gradient(
    145deg,
    color-mix(in srgb, var(--color-surface-2) 74%, transparent),
    var(--color-surface)
  );
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  height: 100%;
`;

export const BookingHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const BookingHeaderIcon = styled.span`
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--color-surface-2);
  color: var(--color-primary);
`;

export const BookingTitle = styled.h4`
  margin: 0;
  font-size: var(--font-size-lg);
`;

export const BookingPriceLabel = styled.span`
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
`;

export const BookingPriceValue = styled.div`
  font-size: clamp(22px, 2.6vw, 28px);
  font-weight: 700;
`;

export const BookingHint = styled.p`
  margin: 0;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
`;

export const BookingList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const BookingListItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--font-size-sm);
  color: var(--color-text);

  .icon {
    width: 22px;
    height: 22px;
    border-radius: 999px;
    border: 1px solid var(--color-border);
    background: color-mix(in srgb, var(--color-surface-2) 82%, transparent);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .icon svg {
    color: var(--color-primary);
  }
`;
