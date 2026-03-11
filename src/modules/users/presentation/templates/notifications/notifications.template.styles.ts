import { motion } from "framer-motion";
import styled from "styled-components";

export const NotificationsTemplateRoot = styled.div`
  flex: 1;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  display: flex;

  @media (max-width: 1024px) {
    height: auto;
    overflow: visible;
  }
`;

export const NotificationsShell = styled.section`
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  gap: var(--space-4);

  @media (max-width: 1024px) {
    overflow: visible;
    gap: var(--space-3);
  }
`;

export const HeroCard = styled(motion.div)`
  position: relative;
  border-radius: var(--radius-lg);
  border: 1px solid color-mix(in srgb, var(--color-primary) 24%, var(--color-border));
  background:
    radial-gradient(
      circle at 8% 18%,
      color-mix(in srgb, var(--color-secondary) 28%, transparent),
      transparent 42%
    ),
    radial-gradient(
      circle at 84% 18%,
      color-mix(in srgb, var(--color-primary) 22%, transparent),
      transparent 44%
    ),
    linear-gradient(
      112deg,
      color-mix(in srgb, var(--color-surface-2) 88%, var(--color-surface)),
      color-mix(in srgb, var(--color-surface) 92%, var(--color-secondary) 8%)
    );
  padding: clamp(14px, 1.8vw, 20px);
  box-shadow: var(--shadow-sm);
  overflow: hidden;

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: linear-gradient(
      140deg,
      transparent 34%,
      color-mix(in srgb, var(--color-primary) 12%, transparent),
      transparent 72%
    );
  }
`;

export const HeroHeader = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-3);

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

export const HeroTitleGroup = styled.div`
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
`;

export const HeroIcon = styled.span`
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid color-mix(in srgb, var(--color-primary) 35%, var(--color-border));
  background: color-mix(in srgb, var(--color-surface) 62%, transparent);
  color: var(--color-text);
  box-shadow: var(--shadow-sm);
`;

export const HeroTitle = styled.h2`
  margin: 0;
  line-height: 1.15;
`;

export const HeroSubtitle = styled.p`
  margin: 6px 0 0;
  color: var(--color-text-muted);
`;

export const HeroStats = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
  justify-content: flex-end;
`;

export const HeroStat = styled.span`
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--color-primary) 30%, var(--color-border));
  background: color-mix(in srgb, var(--color-surface) 78%, transparent);
  color: var(--color-text);
  font-size: 12px;
  line-height: 1;
  padding: 8px 11px;
  font-weight: 600;
`;

export const ControlsRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  flex-wrap: wrap;

  @media (max-width: 640px) {
    align-items: stretch;
  }
`;

export const FiltersGroup = styled.div`
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  border: 1px solid var(--color-divider);
  background: color-mix(in srgb, var(--color-surface-2) 86%, transparent);
  padding: 4px;
  gap: 4px;
`;

export const FilterButton = styled.button<{ $active?: boolean }>`
  border: 0;
  border-radius: 999px;
  background: ${({ $active }) =>
    $active
      ? "linear-gradient(120deg, color-mix(in srgb, var(--color-primary) 82%, var(--color-surface)), color-mix(in srgb, var(--color-primary) 66%, var(--color-secondary)))"
      : "transparent"};
  color: ${({ $active }) => ($active ? "var(--color-surface)" : "var(--color-text-muted)")};
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.16s ease, color 0.16s ease, background 0.16s ease;

  &:hover {
    transform: translateY(-1px);
    color: ${({ $active }) => ($active ? "var(--color-surface)" : "var(--color-text)")};
  }
`;

export const ActionsGroup = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;

  @media (max-width: 640px) {
    width: 100%;
    justify-content: flex-end;
  }
`;

export const FeedWrap = styled.div`
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-divider);
  background: linear-gradient(
    140deg,
    color-mix(in srgb, var(--color-surface-2) 72%, transparent),
    color-mix(in srgb, var(--color-surface) 90%, transparent)
  );
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

export const FeedHeader = styled.div`
  padding: 12px 14px;
  border-bottom: 1px solid var(--color-divider);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
`;

export const FeedTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  line-height: 1.2;
`;

export const FeedHint = styled.span`
  font-size: 12px;
  color: var(--color-text-muted);
`;

export const FeedBody = styled.div`
  flex: 0 0 auto;
  min-height: calc((132px * 3) + 22px);
  height: calc((132px * 3) + 22px);
  max-height: calc((132px * 3) + 22px);
  overflow: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;

  @media (max-width: 1024px) {
    min-height: 280px;
    height: min(calc((124px * 3) + 20px), 52vh);
    max-height: min(calc((124px * 3) + 20px), 52vh);
  }
`;

export const EmptyState = styled.div`
  margin: auto;
  width: min(460px, 100%);
  border-radius: var(--radius-lg);
  border: 1px dashed color-mix(in srgb, var(--color-primary) 36%, var(--color-border));
  background: color-mix(in srgb, var(--color-surface-2) 86%, transparent);
  padding: 20px;
  text-align: center;
  color: var(--color-text-muted);
`;

export const NotificationCard = styled(motion.article)<{ $read?: boolean; $priority?: "high" | "medium" | "low" }>`
  border-radius: var(--radius-md);
  border: 1px solid
    ${({ $priority }) =>
      $priority === "high"
        ? "color-mix(in srgb, var(--color-danger) 55%, var(--color-border))"
        : $priority === "medium"
          ? "color-mix(in srgb, var(--color-warning) 45%, var(--color-border))"
          : "color-mix(in srgb, var(--color-primary) 24%, var(--color-divider))"};
  background:
    ${({ $read }) =>
      $read
        ? "linear-gradient(130deg, color-mix(in srgb, var(--color-surface) 92%, transparent), color-mix(in srgb, var(--color-surface-2) 70%, transparent))"
        : "linear-gradient(130deg, color-mix(in srgb, var(--color-surface-2) 78%, transparent), color-mix(in srgb, var(--color-surface) 66%, transparent))"};
  padding: 12px;
  box-shadow: ${({ $read }) => ($read ? "none" : "var(--shadow-sm)")};
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 132px;

  @media (max-width: 1024px) {
    min-height: 120px;
  }
`;

export const NotificationMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  flex-wrap: wrap;
`;

export const MetaChips = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
`;

export const Chip = styled.span<{ $variant?: "module" | "priority" | "read"; $priority?: "high" | "medium" | "low" }>`
  border-radius: 999px;
  padding: 4px 9px;
  font-size: 11px;
  line-height: 1;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: capitalize;
  border: 1px solid transparent;

  ${({ $variant, $priority }) => {
    if ($variant === "priority") {
      if ($priority === "high") {
        return `
          color: color-mix(in srgb, var(--color-danger) 86%, var(--color-text));
          border-color: color-mix(in srgb, var(--color-danger) 50%, transparent);
          background: color-mix(in srgb, var(--color-danger) 18%, transparent);
        `;
      }
      if ($priority === "medium") {
        return `
          color: color-mix(in srgb, var(--color-warning) 86%, var(--color-text));
          border-color: color-mix(in srgb, var(--color-warning) 50%, transparent);
          background: color-mix(in srgb, var(--color-warning) 18%, transparent);
        `;
      }
      return `
        color: color-mix(in srgb, var(--color-primary) 84%, var(--color-text));
        border-color: color-mix(in srgb, var(--color-primary) 42%, transparent);
        background: color-mix(in srgb, var(--color-primary) 14%, transparent);
      `;
    }

    if ($variant === "read") {
      return `
        color: var(--color-text-muted);
        border-color: var(--color-divider);
        background: color-mix(in srgb, var(--color-surface) 85%, transparent);
      `;
    }

    return `
      color: color-mix(in srgb, var(--color-secondary) 84%, var(--color-text));
      border-color: color-mix(in srgb, var(--color-secondary) 35%, transparent);
      background: color-mix(in srgb, var(--color-secondary) 16%, transparent);
    `;
  }}
`;

export const MetaTime = styled.time`
  font-size: 12px;
  color: var(--color-text-muted);
`;

export const NotificationTitle = styled.h4`
  margin: 0;
  font-size: 15px;
  line-height: 1.25;
`;

export const NotificationMessage = styled.p`
  margin: 0;
  color: var(--color-text-muted);
  font-size: 13px;
  line-height: 1.45;
`;

export const NotificationActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-2);
  flex-wrap: wrap;

  @media (max-width: 640px) {
    justify-content: flex-start;
  }
`;

export const FeedFooter = styled.div`
  padding: 10px 14px;
  border-top: 1px solid var(--color-divider);
  font-size: 12px;
  color: var(--color-text-muted);
  text-align: center;
`;
