import styled from "styled-components";

export const SuggestionsRoot = styled.div`
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: hidden;
`;

export const HeroCard = styled.section`
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: stretch;
  justify-content: space-between;
  gap: 12px;
  border-radius: var(--radius-lg);
  border: 1px solid color-mix(in srgb, var(--color-primary) 24%, var(--color-border));
  padding: 14px 16px;
  background:
    radial-gradient(circle at 14% 18%, rgba(30, 112, 255, 0.14), transparent 38%),
    radial-gradient(circle at 86% 86%, rgba(0, 214, 160, 0.12), transparent 42%),
    linear-gradient(
      140deg,
      color-mix(in srgb, var(--color-surface-2) 80%, transparent),
      var(--color-surface)
    );
  box-shadow: var(--shadow-sm);
`;

export const HeroTop = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
`;

export const HeroTitleWrap = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
`;

export const HeroTitleIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: 1px solid color-mix(in srgb, var(--color-primary) 24%, var(--color-border));
  background: color-mix(in srgb, var(--color-surface-2) 78%, transparent);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-sm);
  flex-shrink: 0;
`;

export const HeroText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

export const HeroStats = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

export const ContentGrid = styled.div`
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(280px, 1fr);
  gap: 12px;
  align-items: start;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
  }
`;

export const MainColumn = styled.div`
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const AsideColumn = styled.div`
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const CardShell = styled.section`
  border-radius: var(--radius-lg);
  border: 1px solid color-mix(in srgb, var(--color-primary) 18%, var(--color-border));
  background:
    linear-gradient(
      140deg,
      color-mix(in srgb, var(--color-surface-2) 72%, transparent),
      var(--color-surface)
    );
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
`;

export const CardHeader = styled.div`
  padding: 12px;
  border-bottom: 1px solid var(--color-divider);
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const SectionTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const SectionIcon = styled.span`
  width: 26px;
  height: 26px;
  border-radius: 8px;
  border: 1px solid color-mix(in srgb, var(--color-primary) 20%, var(--color-border));
  background: color-mix(in srgb, var(--color-surface-2) 78%, transparent);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

export const CardBody = styled.div`
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 12px;
`;

export const KpiCardBody = styled(CardBody)`
  .ant-row {
    margin-bottom: 0 !important;
  }
`;

export const GuideList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const GuideItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  color: var(--color-text-muted);
  font-size: 13px;
  line-height: 1.35;
`;

export const GuideBullet = styled.span`
  width: 18px;
  height: 18px;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--color-primary) 26%, var(--color-border));
  background: color-mix(in srgb, var(--color-primary) 10%, transparent);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;
