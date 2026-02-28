import styled from "styled-components";
import { Link } from "react-router-dom";

export const ServicesWrap = styled.section`
  height: 100%;
  min-height: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  overflow: visible;

  @media (max-height: 760px) {
    gap: var(--space-3);
  }
`;

export const HeroRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr);
  gap: var(--space-4);

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

export const HeroCard = styled.div`
  padding: var(--space-4);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background:
    linear-gradient(135deg, rgba(30, 112, 255, 0.18), rgba(0, 214, 160, 0.1)),
    var(--color-surface);
  box-shadow: var(--shadow-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);

  @media (max-height: 760px) {
    padding: var(--space-3);
    gap: var(--space-2);
  }
`;

export const HeroTitle = styled.h2`
  margin: 0;
  font-size: clamp(22px, 2.4vw, 30px);
  line-height: var(--line-height-tight);
  letter-spacing: -0.02em;
`;

export const HeroSubtitle = styled.p`
  margin: 0;
  color: var(--color-text-muted);
  font-size: var(--font-size-md);
`;

export const HeroStats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-2);

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-height: 760px) {
    display: none;
  }
`;

export const StatCard = styled.div`
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  gap: var(--space-2);
  min-height: 56px;
`;

export const StatIcon = styled.span`
  width: 34px;
  height: 34px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--color-surface-2);
  color: var(--color-primary);
`;

export const StatMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const StatValue = styled.span`
  font-size: var(--font-size-lg);
  font-weight: 700;
`;

export const StatLabel = styled.span`
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
`;

export const SearchCard = styled.div`
  padding: var(--space-4);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  box-shadow: var(--shadow-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);

  @media (max-height: 760px) {
    padding: var(--space-3);
    gap: var(--space-2);
  }
`;

export const SearchHint = styled.p`
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);

  @media (max-height: 760px) {
    display: none;
  }
`;

export const TitleWithIcon = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 10px;
`;

export const TitleIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 12px;
  background: var(--color-surface);
  color: var(--color-primary);
  border: 1px solid var(--color-border);
`;

export const CardActionIcon = styled.span`
  width: 28px;
  height: 28px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--color-surface-2, var(--color-glass-surface));
  border: 1px solid var(--color-border);
  color: var(--color-text);
`;

export const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

export const CategoryFilterRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  align-items: center;
  margin-top: var(--space-2);
  margin-bottom: var(--space-2);
  overflow: visible;
`;

export const CategoryLabel = styled.span`
  font-size: var(--font-size-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
  margin-right: var(--space-2);
`;

export const CategoryFilterButton = styled.button<{ $active?: boolean; $color?: string }>`
  border: 1px solid var(--color-border);
  background: ${(p) => (p.$active ? (p.$color ?? "var(--color-primary)") : "var(--color-surface)")};
  color: ${(p) => (p.$active ? "var(--on-primary)" : "var(--color-text)")};
  padding: 8px 14px;
  border-radius: 999px;
  cursor: pointer;
  font-size: var(--font-size-sm);
  font-weight: 600;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: transform 120ms ease, box-shadow 120ms ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
  }
`;

export const SearchWrap = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  gap: var(--space-2);

  .ant-btn {
    flex: 0 0 auto;
  }

  .ant-input-affix-wrapper {
    border-radius: 999px;
    background: var(--color-glass-surface);
    border: 1px solid var(--color-border);
    transition: box-shadow 0.15s, transform 0.12s;
    flex: 1;
    min-width: 0;
  }
  .ant-input-affix-wrapper:focus,
  .ant-input-affix-wrapper:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-1px);
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const ListShell = styled.div`
  flex: 1;
  min-height: 0;
  overflow: visible;

  .ant-list {
    height: 100%;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: visible;
  }

  .ant-spin-nested-loading,
  .ant-spin-container {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .ant-list-items {
    flex: 1;
    min-height: 0;
    overflow: visible;
  }

  .ant-list-items > .ant-row {
    align-content: flex-start;
  }

  .ant-pagination {
    margin-top: var(--space-2);
  }
`;

export const CardLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  height: 100%;
  display: block;
  cursor: pointer;
`;

export const ServiceCard = styled.div`
  height: clamp(220px, 27vh, 300px);
  animation: fadeUp 420ms ease both;

  .ant-card {
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 10px 28px rgba(6, 22, 33, 0.24);
    border: 1px solid rgba(255, 255, 255, 0.08);
    background-clip: padding-box;
    height: 100%;
    transition: transform 180ms ease, box-shadow 180ms ease;
  }

  .ant-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 16px 32px rgba(6, 22, 33, 0.35);
  }

  .ant-card-body {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .service-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: var(--space-3);
    gap: 6px;
  }

  .service-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .service-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-2);
  }

  .service-title,
  .service-address,
  .service-description {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .service-title {
    -webkit-line-clamp: 1;
  }

  .service-address {
    -webkit-line-clamp: 1;
  }

  .service-description {
    -webkit-line-clamp: 2;
    min-height: 2.6em;
  }

  @keyframes fadeUp {
    from {
      opacity: 0;
      transform: translateY(12px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export const ImageWrap = styled.div`
  height: clamp(120px, 18vh, 150px);
  background-size: cover;
  background-position: center;
  position: relative;

  &::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 60%;
    background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(7, 13, 18, 0.6) 60%);
    pointer-events: none;
  }
`;

export const RatingBadge = styled.div`
  position: absolute;
  right: 10px;
  top: 10px;
  background: rgba(0, 0, 0, 0.68);
  color: #fff;
  padding: 6px 8px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-weight: 700;
  line-height: 1.1;
  font-size: 12px;
`;

export const RatingRow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
`;

export const ServiceMeta = styled.div`
  color: var(--color-text-muted, #6b7280);
  font-size: 13px;
  display: block;
`;

export const ActionsRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
`;

export const PriceTag = styled.span`
  font-weight: 700;
  font-size: var(--font-size-md);
`;

export const HeartWrap = styled.span`
  color: var(--color-text-muted, #9ca3af);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 999px;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  transition: all 120ms ease-in-out;
`;

export const FeaturedTag = styled.span`
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.4);
`;

export default ServicesWrap;
