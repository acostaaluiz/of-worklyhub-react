import { css, keyframes } from "styled-components";
import styled from "styled-components";

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
  100% { transform: translateY(0px); }
`;

export const HomeShell = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  height: 100%;
  min-height: 0;
  overflow: hidden;
  animation: motion-fade-up var(--motion-duration-enter)
    var(--motion-ease-standard) both;

  @media (max-width: 1024px) {
    height: auto;
    overflow: visible;
    gap: var(--space-4);
  }

  @media (max-height: 900px) {
    gap: 8px;
  }
`;

export const HeroSection = styled.section`
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-lg);
  border: 1px solid color-mix(in srgb, var(--color-primary) 25%, var(--color-border));
  background:
    radial-gradient(circle at 14% 20%, rgba(30, 112, 255, 0.24), transparent 42%),
    radial-gradient(circle at 82% 82%, rgba(0, 214, 160, 0.2), transparent 46%),
    linear-gradient(
      140deg,
      color-mix(in srgb, var(--color-surface-2) 84%, transparent),
      var(--color-surface)
    );
  padding: var(--space-3);
  flex-shrink: 0;

  @media (max-height: 900px) {
    padding: 10px;
  }
`;

export const HeroBackdrop = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;

  span {
    position: absolute;
    border-radius: 999px;
    opacity: 0.5;
    animation: ${float} 4.8s ease-in-out infinite;
  }

  .orb-a {
    width: 84px;
    height: 84px;
    right: 8%;
    top: -20px;
    background: rgba(122, 44, 255, 0.3);
  }

  .orb-b {
    width: 62px;
    height: 62px;
    left: -18px;
    bottom: -16px;
    background: rgba(0, 214, 160, 0.34);
    animation-delay: 0.8s;
  }
`;

export const HeroMainRow = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: var(--space-3);

  @media (max-width: 768px) {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  @media (max-height: 900px) {
    gap: 10px;
  }
`;

export const HeroIdentity = styled.div`
  width: 58px;
  height: 58px;
  border-radius: 12px;
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--color-surface-2) 86%, transparent),
    var(--color-surface)
  );
  border: 1px solid color-mix(in srgb, var(--color-primary) 25%, var(--color-border));
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-sm);
  flex-shrink: 0;
`;

export const HeroInitials = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: var(--color-surface);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
`;

export const HeroCopy = styled.div`
  flex: 1;
  min-width: 0;
`;

export const HeroTitle = styled.h2`
  margin: 0;
  letter-spacing: -0.02em;
  font-size: clamp(24px, 2.35vh, 32px);
`;

export const HeroDescription = styled.p`
  margin-top: 6px;
  margin-bottom: 0;
  color: var(--color-text-muted);
  max-width: 720px;
  font-size: clamp(12px, 1.35vh, 15px);

  @media (max-height: 900px) {
    margin-top: 4px;
    font-size: 12px;
  }
`;

export const HeroActions = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
  align-items: center;
  flex-wrap: nowrap;

  @media (max-width: 768px) {
    width: 100%;
    flex-direction: row;
    flex-wrap: wrap;
  }
`;

export const HeroButton = styled.button<{ $variant?: "primary" | "ghost" }>`
  border: 1px solid
    ${({ $variant }) =>
      $variant === "primary" ? "transparent" : "var(--color-border)"};
  background: ${({ $variant }) =>
    $variant === "primary" ? "var(--color-primary)" : "transparent"};
  color: ${({ $variant }) =>
    $variant === "primary" ? "var(--on-primary)" : "var(--color-text)"};
  padding: 7px 11px;
  border-radius: 999px;
  cursor: pointer;
  font: inherit;
  font-weight: 600;
  transition:
    transform var(--motion-duration-fast) var(--motion-ease-standard),
    box-shadow var(--motion-duration-fast) var(--motion-ease-standard);

  &:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
  }

  @media (max-width: 768px) {
    flex: 1 0 170px;
  }
`;

export const HeroHighlights = styled.div`
  position: relative;
  z-index: 1;
  margin-top: var(--space-3);
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }

  @media (max-height: 900px) {
    margin-top: 8px;
  }
`;

export const HeroHighlightCard = styled.div`
  border-radius: var(--radius-sm);
  border: 1px solid color-mix(in srgb, var(--color-primary) 18%, var(--color-border));
  background: color-mix(in srgb, var(--color-surface) 88%, transparent);
  padding: 8px 10px;
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-height: 900px) {
    padding: 6px 8px;
  }
`;

export const HeroHighlightIcon = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: var(--color-surface-2);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

export const HeroHighlightMeta = styled.div`
  min-width: 0;
`;

export const HeroHighlightLabel = styled.div`
  font-size: 11px;
  color: var(--color-text-muted);
`;

export const HeroHighlightValue = styled.div`
  margin-top: 1px;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const ContentSection = styled.section<{ $delay?: "none" | "1" | "2" | "3"; $grow?: boolean }>`
  padding: 9px 12px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: color-mix(in srgb, var(--color-surface) 92%, transparent);
  animation: motion-fade-up var(--motion-duration-slow)
    var(--motion-ease-standard) both;
  animation-delay: ${({ $delay }) => {
    if ($delay === "1") return "var(--motion-delay-1)";
    if ($delay === "2") return "var(--motion-delay-2)";
    if ($delay === "3") return "var(--motion-delay-3)";
    return "0ms";
  }};

  ${({ $grow }) =>
    $grow
      ? css`
          flex: 1;
          min-height: 0;
          display: flex;
          flex-direction: column;
        `
      : css`
          flex-shrink: 0;
        `}

  @media (max-width: 1024px) {
    animation-delay: 0ms;
  }

  @media (max-height: 900px) {
    padding: 8px 10px;
  }
`;

export const SectionTitle = styled.h3`
  margin: 0;
  font-size: clamp(16px, 1.8vh, 20px);
`;

export const SectionDescription = styled.p`
  margin: 4px 0 0;
  color: var(--color-text-muted);
  font-size: clamp(12px, 1.2vh, 14px);

  @media (max-height: 900px) {
    margin-top: 2px;
    font-size: 12px;
  }
`;

export const SectionDivider = styled.div`
  height: 1px;
  background: var(--color-divider);
  margin: 10px 0;

  @media (max-height: 900px) {
    margin: 8px 0;
  }
`;

export const MetricsWrap = styled.div`
  margin-top: 8px;
`;

export const MetricsFallback = styled.div`
  min-height: 84px;
`;

export const CompanyCards = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin-top: 8px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

export const CompanyCard = styled.article`
  padding: 10px;
  min-width: 0;
  display: flex;
  gap: 8px;
  align-items: center;
  transition:
    transform var(--motion-duration-fast) var(--motion-ease-standard),
    box-shadow var(--motion-duration-fast) var(--motion-ease-standard);

  &:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }
`;

export const CompanyIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--color-surface-2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

export const CompanyMeta = styled.div`
  min-width: 0;
`;

export const CompanyLabel = styled.div`
  font-size: 11px;
  color: var(--color-text-muted);
  margin-bottom: 2px;
`;

export const CompanyValue = styled.div`
  font-weight: 700;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const CompanyText = styled.div`
  font-size: 11px;
  color: var(--color-text-muted);
  margin-top: 3px;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;

  @media (max-height: 900px) {
    display: none;
  }
`;

export const ServicesArea = styled.div`
  margin-top: 8px;
  padding-top: 2px;
  flex: 1;
  min-height: 0;
  overflow: visible;

  @media (max-width: 1024px) {
    overflow: visible;
  }
`;
