import { Button, Tag, Typography } from "antd";
import { motion } from "framer-motion";
import styled, { keyframes } from "styled-components";

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
  100% { transform: translateY(0px); }
`;

export const ModulesShowcase = styled(motion.section)`
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-5);
  height: calc(100vh - 232px);
  min-height: 0;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: var(--space-4);
    gap: var(--space-3);
    height: auto;
    overflow: visible;
  }

  @media (max-height: 860px) and (min-width: 769px) {
    gap: var(--space-3);
    padding: var(--space-4);
    height: calc(100vh - 220px);
  }
`;

export const ShowcaseHero = styled(motion.header)`
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-lg);
  border: 1px solid color-mix(in srgb, var(--color-primary) 28%, var(--color-border));
  padding: var(--space-4);
  background:
    radial-gradient(circle at 15% 18%, rgba(30, 112, 255, 0.26), transparent 42%),
    radial-gradient(circle at 82% 85%, rgba(0, 214, 160, 0.24), transparent 46%),
    linear-gradient(
      130deg,
      color-mix(in srgb, var(--color-surface-2) 84%, transparent),
      var(--color-surface)
    );
  flex-shrink: 0;

  @media (max-height: 860px) and (min-width: 769px) {
    padding: var(--space-3);
  }
`;

export const HeroOrbs = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;

  span {
    position: absolute;
    border-radius: 999px;
    filter: blur(0.5px);
    animation: ${float} 4.4s ease-in-out infinite;
    opacity: 0.5;
  }

  .orb-a {
    width: 110px;
    height: 110px;
    top: -30px;
    right: 4%;
    background: rgba(122, 44, 255, 0.34);
  }

  .orb-b {
    width: 72px;
    height: 72px;
    left: -14px;
    bottom: -12px;
    background: rgba(0, 214, 160, 0.35);
    animation-delay: 0.8s;
  }
`;

export const HeroMainRow = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  flex-wrap: wrap;

  @media (max-width: 640px) {
    gap: var(--space-3);
  }
`;

export const HeroIdentity = styled.div`
  min-width: 0;
  display: flex;
  align-items: center;
  gap: var(--space-3);
`;

export const HeroIcon = styled(motion.div)`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--color-surface-2) 76%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-primary) 30%, var(--color-border));
  box-shadow: var(--shadow-sm);
  flex-shrink: 0;
`;

export const HeroTitleBlock = styled.div`
  min-width: 0;
`;

export const HeroTitle = styled(Typography.Title)`
  && {
    margin: 0;
    letter-spacing: -0.02em;
    font-size: clamp(22px, 2.2vh, 30px);
    line-height: 1.1;
  }
`;

export const HeroText = styled(Typography.Text)`
  && {
    color: var(--color-text-muted);
    font-size: clamp(12px, 1.4vh, 15px);
  }
`;

export const HeroStats = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;

  @media (max-width: 640px) {
    width: 100%;
  }
`;

export const HeroTag = styled(Tag)`
  margin-inline-end: 0;
  border-radius: 999px;
  padding-inline: 10px;
  border-color: color-mix(in srgb, var(--color-primary) 25%, var(--color-border));
`;

export const HeroActions = styled.div`
  margin-top: var(--space-3);
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
  flex-shrink: 0;

  @media (max-height: 860px) and (min-width: 769px) {
    margin-top: var(--space-2);
  }

  @media (max-width: 640px) {
    width: 100%;
  }
`;

export const HeroPrimaryButton = styled(Button)`
  border-radius: 999px;
  font-weight: 600;
`;

export const HeroGhostButton = styled(Button)`
  border-radius: 999px;
`;

export const ModulesGrid = styled(motion.div)`
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  grid-auto-rows: minmax(0, 1fr);
  gap: var(--space-3);
  overflow: hidden;

  @media (max-width: 1280px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    grid-auto-rows: auto;
    overflow: auto;
  }

  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    overflow: auto;
    padding-right: 2px;
  }
`;

export const ModuleCard = styled(motion.div)<{ $disabled?: boolean }>`
  width: 100%;
  appearance: none;
  border: 1px solid
    ${({ $disabled }) => ($disabled ? "var(--color-divider)" : "var(--color-border)")};
  border-radius: 14px;
  background:
    linear-gradient(
      140deg,
      color-mix(in srgb, var(--color-surface-2) 80%, transparent),
      var(--color-surface)
    );
  color: var(--color-text);
  text-align: left;
  cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};
  padding: var(--space-3);
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  opacity: ${({ $disabled }) => ($disabled ? 0.6 : 1)};
  transition:
    box-shadow var(--motion-duration-fast) var(--motion-ease-standard),
    border-color var(--motion-duration-fast) var(--motion-ease-standard);

  &:hover {
    box-shadow: ${({ $disabled }) => ($disabled ? "none" : "var(--shadow-md)")};
    border-color: ${({ $disabled }) =>
      $disabled ? "var(--color-divider)" : "var(--color-primary)"};
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }

  @media (max-height: 860px) and (min-width: 769px) {
    padding: 10px;
  }

  @media (max-width: 768px) {
    min-height: 108px;
    padding: 10px;
  }
`;

export const ModuleTop = styled.div`
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
`;

export const ModuleIcon = styled(motion.div)`
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--color-surface-2) 72%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-primary) 24%, var(--color-border));
  flex-shrink: 0;
`;

export const ModuleTitle = styled.div`
  font-weight: 700;
  line-height: 1.2;
  font-size: clamp(14px, 1.5vh, 18px);
`;

export const ModuleDescription = styled.div`
  margin-top: 2px;
  color: var(--color-text-muted);
  font-size: clamp(11px, 1.2vh, 14px);
  line-height: 1.3;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;

  @media (max-height: 860px) and (min-width: 769px) {
    display: none;
  }
`;

export const ModuleFooter = styled.div`
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);

  @media (max-width: 768px) {
    margin-top: 6px;
    justify-content: flex-start;
  }
`;

export const ModuleTag = styled(Tag)`
  margin-inline-end: 0;
  border-radius: 999px;
`;

export const EmptyState = styled.div`
  padding: var(--space-7);
  border-radius: var(--radius-lg);
  border: 1px dashed var(--color-divider);
  text-align: center;
  background: var(--color-surface);
`;

export const EmptyTitle = styled.h3`
  margin: 0 0 var(--space-2);
`;

export const EmptyText = styled.p`
  margin: 0;
  color: var(--color-text-muted);
`;
