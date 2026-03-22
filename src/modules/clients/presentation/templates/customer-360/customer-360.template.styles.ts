import styled from "styled-components";

export const Customer360Root = styled.div`
  height: 100%;
  max-height: calc(100dvh - 190px);
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const HeroCard = styled.section`
  border: 1px solid color-mix(in srgb, var(--color-primary) 24%, var(--color-border));
  border-radius: var(--radius-lg);
  padding: 14px;
  background:
    radial-gradient(
      420px 180px at 8% 10%,
      color-mix(in srgb, var(--color-primary) 16%, transparent),
      transparent 65%
    ),
    linear-gradient(
      140deg,
      color-mix(in srgb, var(--color-surface-2) 78%, transparent),
      var(--color-surface)
    );
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const HeroTop = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
`;

export const HeroTitleWrap = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
`;

export const HeroTitle = styled.h2`
  margin: 0;
  font-size: clamp(24px, 2.2vw, 32px);
  line-height: 1.1;
`;

export const HeroSubtitle = styled.p`
  margin: 4px 0 0;
  color: var(--color-text-muted);
`;

export const HeroStats = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

export const HeroActions = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
`;

export const ContentGrid = styled.div`
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(260px, 360px) minmax(0, 1fr);
  gap: 12px;

  @media (max-width: 1080px) {
    grid-template-columns: 1fr;
  }
`;

export const CardShell = styled.section`
  border: 1px solid color-mix(in srgb, var(--color-primary) 18%, var(--color-border));
  border-radius: var(--radius-lg);
  background:
    linear-gradient(
      140deg,
      color-mix(in srgb, var(--color-surface-2) 72%, transparent),
      var(--color-surface)
    );
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
`;

export const CardHeader = styled.div`
  padding: 12px;
  border-bottom: 1px solid var(--color-divider);
  display: flex;
  justify-content: space-between;
  gap: 8px;
  align-items: center;
`;

export const CardFooter = styled.div`
  padding: 8px 12px;
  border-top: 1px solid var(--color-divider);
  display: flex;
  justify-content: flex-end;
`;

export const CardTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  line-height: 1.1;
`;

export const CardSubtitle = styled.span`
  color: var(--color-text-muted);
  font-size: 12px;
`;

export const ScrollBody = styled.div`
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 10px;
`;

export const ProfilesScrollBody = styled(ScrollBody)`
  flex: 1;
  max-height: none;
`;

export const ProfileItem = styled.button<{ $active?: boolean }>`
  width: 100%;
  border: 1px solid
    ${({ $active }) =>
      $active
        ? "color-mix(in srgb, var(--color-primary) 52%, var(--color-border))"
        : "var(--color-divider)"};
  border-radius: var(--radius-md);
  background: ${({ $active }) =>
    $active
      ? "color-mix(in srgb, var(--color-primary) 10%, var(--color-surface))"
      : "color-mix(in srgb, var(--color-surface) 86%, transparent)"};
  padding: 10px;
  min-height: 128px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.16s ease, transform 0.16s ease, box-shadow 0.16s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
  }
`;

export const ProfileName = styled.div`
  font-weight: 700;
`;

export const ProfileMeta = styled.div`
  font-size: 12px;
  color: var(--color-text-muted);
`;

export const TimelineItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: baseline;
  flex-wrap: wrap;
`;

export const TimelineItemTitle = styled.div`
  font-weight: 600;
`;

export const TimelineItemMeta = styled.div`
  font-size: 12px;
  color: var(--color-text-muted);
`;

export const TimelineItemDescription = styled.p`
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--color-text-muted);
`;
