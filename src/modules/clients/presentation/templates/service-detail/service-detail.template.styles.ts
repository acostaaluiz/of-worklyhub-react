import styled from "styled-components";
import { TemplateShell } from "../home/home.template.styles";

export const ServiceDetailShell = styled(TemplateShell)`
  gap: var(--space-4);
  overflow: hidden;
`;

export const HeroCover = styled.div<{ $image?: string }>`
  position: relative;
  min-height: clamp(220px, 30vh, 300px);
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
      linear-gradient(180deg, rgba(7, 13, 18, 0.05) 0%, rgba(7, 13, 18, 0.4) 80%),
      linear-gradient(120deg, rgba(30, 112, 255, 0.18), rgba(0, 214, 160, 0.08));
  }
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
  grid-template-columns: minmax(0, 1.35fr) minmax(0, 0.85fr);
  gap: var(--space-4);
  align-items: start;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

export const InfoCard = styled.section`
  padding: var(--space-4);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
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
  .ant-tabs-nav {
    margin-bottom: var(--space-3);
  }

  .ant-tabs-tab {
    font-weight: 600;
    color: var(--color-text-muted);
  }

  .ant-tabs-tab-active .ant-tabs-tab-btn {
    color: var(--color-text);
  }

  .ant-tabs-ink-bar {
    background: var(--color-primary);
  }
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
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
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

  svg {
    color: var(--color-primary);
  }
`;
