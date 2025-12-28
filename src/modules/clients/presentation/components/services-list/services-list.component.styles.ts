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

export const SearchWrap = styled.div`
  width: 320px;

  @media (max-width: 768px) {
    width: 100%;
    margin-top: 12px;
  }
`;

export const ServiceCard = styled.div`
  height: 100%;
  .ant-card {
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 6px 18px rgba(6, 22, 33, 0.24);
    border: 1px solid rgba(255,255,255,0.03);
    background-clip: padding-box;
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
