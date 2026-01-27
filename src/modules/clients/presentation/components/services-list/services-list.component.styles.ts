import styled from "styled-components";

export const ServicesWrap = styled.div`
  margin-top: 16px;
`;

export const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
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
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: var(--color-surface-2, var(--color-glass-surface));
  color: var(--color-text);
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

export const CategoryFilterRow = styled.div`
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
  align-items: center;
  margin-top: 12px;
  margin-bottom: 16px;
`;

export const CategoryFilterButton = styled.button<{ $active?: boolean; $color?: string }>`
  border: 1px solid var(--color-border);
  background: ${(p) => (p.$active ? (p.$color ?? "var(--color-primary)") : "var(--color-surface)")};
  color: ${(p) => (p.$active ? "var(--on-primary)" : "var(--color-text)")};
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  min-width: 120px;
  text-align: left;
  display: inline-flex;
  align-items: center;
  gap: 6px;

  &:hover {
    border-color: rgba(122,44,255,0.55);
  }
`;

export const SearchWrap = styled.div`
  width: 100%;
  max-width: 420px;
  display: flex;
  align-items: center;
  gap: 8px;

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
    width: 100%;
    flex-direction: column;
    align-items: stretch;
    margin-top: 12px;
  }
`;

export const ServiceCard = styled.div`
  height: 360px;
  .ant-card {
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 6px 18px rgba(6, 22, 33, 0.24);
    border: 1px solid rgba(255,255,255,0.03);
    background-clip: padding-box;
    height: 100%;
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
  }
  .service-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
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
    -webkit-line-clamp: 2;
  }
  .service-description {
    -webkit-line-clamp: 2;
    min-height: 2.6em;
  }
`;

export const ImageWrap = styled.div`
  height: 160px;
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
    background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(7,13,18,0.6) 60%);
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
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-weight: 700;
  line-height: 1;
  font-size: 12px;
`;

export const ServiceMeta = styled.div`
  color: var(--color-text-muted, #6b7280);
  margin-top: 6px;
  font-size: 13px;
  display: block;
`;

export const ActionsRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  margin-top: auto;
`;

export const HeartWrap = styled.div`
  color: var(--color-text-muted, #9ca3af);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 999px;
  transition: all 120ms ease-in-out;
  cursor: pointer;
  &:hover { color: var(--color-primary, #1890ff); transform: scale(1.03); }
`;

export default ServicesWrap;
