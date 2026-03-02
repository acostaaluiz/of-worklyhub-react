import { Button, Progress, Tag, Typography } from "antd";
import { motion } from "framer-motion";
import styled, { keyframes } from "styled-components";

const float = keyframes`
  0% { transform: translateY(0px) scale(1); }
  50% { transform: translateY(-10px) scale(1.04); }
  100% { transform: translateY(0px) scale(1); }
`;

const pulse = keyframes`
  0% { opacity: 0.45; transform: scale(0.95); }
  50% { opacity: 0.75; transform: scale(1.05); }
  100% { opacity: 0.45; transform: scale(0.95); }
`;

export const TutorialsRoot = styled.div`
  height: 100%;
  min-height: 0;
  padding: clamp(10px, 1.2vh, 16px) var(--space-4);
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    padding: var(--space-4);
    height: auto;
  }
`;

export const TutorialsSurface = styled(motion.section)`
  flex: 1;
  min-height: 0;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  background:
    radial-gradient(circle at 10% 0%, rgba(122, 44, 255, 0.16), transparent 40%),
    radial-gradient(circle at 90% 100%, rgba(0, 214, 160, 0.1), transparent 45%),
    var(--color-surface);
  box-shadow: var(--shadow-elevated);
  padding: clamp(10px, 1.4vh, 18px);
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: clamp(10px, 1.3vh, 16px);

  @media (max-width: 768px) {
    padding: var(--space-4);
    min-height: 0;
  }
`;

export const HeroSection = styled(motion.header)`
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-lg);
  border: 1px solid color-mix(in srgb, var(--color-primary) 22%, var(--color-border));
  padding: clamp(10px, 1.2vh, 16px);
  background:
    radial-gradient(circle at 20% 18%, rgba(77, 230, 211, 0.24), transparent 42%),
    radial-gradient(circle at 78% 84%, rgba(122, 44, 255, 0.24), transparent 46%),
    linear-gradient(130deg, color-mix(in srgb, var(--color-surface-2) 86%, transparent), var(--color-surface));

  @media (max-width: 768px) {
    padding: var(--space-4);
  }
`;

export const HeroAura = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;

  .orb {
    position: absolute;
    border-radius: 999px;
    filter: blur(1px);
    animation: ${float} 4.4s ease-in-out infinite;
  }

  .orb-a {
    width: 130px;
    height: 130px;
    top: -26px;
    right: 8%;
    background: rgba(77, 230, 211, 0.22);
  }

  .orb-b {
    width: 104px;
    height: 104px;
    left: -24px;
    bottom: -22px;
    background: rgba(122, 44, 255, 0.26);
    animation-delay: 0.9s;
  }

  .orb-c {
    width: 68px;
    height: 68px;
    top: 26%;
    left: 46%;
    background: rgba(30, 112, 255, 0.24);
    animation-duration: 5.2s;
  }
`;

export const HeroTopRow = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  flex-wrap: wrap;
`;

export const HeroIdentity = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-width: 0;
`;

export const HeroIconWrap = styled(motion.div)`
  width: clamp(40px, 4.6vh, 48px);
  height: clamp(40px, 4.6vh, 48px);
  border-radius: 12px;
  background: color-mix(in srgb, var(--color-surface-2) 76%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-primary) 22%, var(--color-border));
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text);
  box-shadow: var(--shadow-md);
`;

export const HeroTitleBlock = styled.div`
  min-width: 0;
`;

export const HeroTitle = styled(Typography.Title)`
  && {
    margin: 0;
    letter-spacing: -0.02em;
    font-size: clamp(24px, 2.5vh, 32px);
    line-height: 1.1;
  }
`;

export const HeroSubtitle = styled(Typography.Text)`
  && {
    color: var(--color-text-muted);
    font-size: clamp(12px, 1.45vh, 15px);
  }
`;

export const HeroActionRow = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
`;

export const FloatingTag = styled(Tag)`
  margin-inline-end: 0;
  border-radius: 999px;
  padding-inline: 10px;
  padding-block: 2px;
  border-color: color-mix(in srgb, var(--color-primary) 28%, var(--color-border));
  animation: ${pulse} 3.6s ease-in-out infinite;
`;

export const HeroMainButton = styled(Button)`
  border-radius: 999px;
  height: 34px;
  font-weight: 600;
  box-shadow: 0 10px 24px rgba(30, 112, 255, 0.28);
`;

export const CatalogGrid = styled(motion.div)`
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  grid-auto-rows: minmax(0, 1fr);
  gap: clamp(8px, 1vh, 12px);

  @media (max-width: 1400px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (max-width: 980px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-auto-rows: minmax(120px, 1fr);
  }

  @media (max-width: 680px) {
    grid-template-columns: 1fr;
    grid-auto-rows: auto;
    overflow: auto;
  }
`;

export const CatalogCard = styled(motion.button)<{ $active?: boolean }>`
  position: relative;
  width: 100%;
  border-radius: 14px;
  border: 1px solid
    ${({ $active }) =>
      $active ? "color-mix(in srgb, var(--color-primary) 70%, var(--color-border))" : "var(--color-border)"};
  background:
    ${({ $active }) =>
      $active
        ? "linear-gradient(145deg, rgba(30, 112, 255, 0.16), rgba(0, 214, 160, 0.1)), var(--color-surface)"
        : "linear-gradient(160deg, color-mix(in srgb, var(--color-surface-2) 78%, transparent), var(--color-surface))"};
  color: var(--color-text);
  padding: clamp(10px, 1.2vh, 14px);
  text-align: left;
  cursor: pointer;
  overflow: hidden;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: clamp(6px, 0.9vh, 10px);
  transform-style: preserve-3d;
  transition:
    border-color var(--motion-duration-fast) var(--motion-ease-standard),
    box-shadow var(--motion-duration-fast) var(--motion-ease-standard),
    transform var(--motion-duration-fast) var(--motion-ease-standard);

  &::before {
    content: "";
    position: absolute;
    inset: -120% 35% auto -20%;
    height: 200px;
    background: linear-gradient(120deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transform: rotate(8deg);
    opacity: 0;
    transition: opacity var(--motion-duration-fast) var(--motion-ease-standard);
  }

  &:hover {
    border-color: color-mix(in srgb, var(--color-primary) 65%, var(--color-border));
    box-shadow: var(--shadow-elevated);
    transform: translateY(-4px) rotateX(4deg) rotateY(-2deg);
  }

  &:hover::before {
    opacity: 1;
  }
`;

export const CatalogCardTop = styled.div`
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  min-height: 0;
`;

export const CatalogCardIcon = styled(motion.div)`
  width: clamp(32px, 3.7vh, 40px);
  height: clamp(32px, 3.7vh, 40px);
  border-radius: 10px;
  background: color-mix(in srgb, var(--color-surface-2) 72%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-primary) 26%, var(--color-border));
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

export const CatalogTitle = styled.div`
  font-weight: 700;
  line-height: 1.2;
  font-size: clamp(13px, 1.5vh, 18px);
`;

export const CatalogSubtitle = styled.div`
  font-size: clamp(11px, 1.2vh, 13px);
  color: var(--color-text-muted);
  line-height: 1.25;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
`;

export const CatalogFooter = styled.div`
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
`;

export const SlidesPill = styled(Tag)`
  margin-inline-end: 0;
  border-radius: 999px;
  font-size: 11px;
`;

export const CatalogStartButton = styled(Button)`
  border-radius: 999px;
  font-weight: 600;
  height: 28px;
  padding-inline: 10px;
`;

export const TourWorkspace = styled(motion.section)`
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  gap: var(--space-4);

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

export const Panel = styled(motion.div)`
  min-height: 0;
  border-radius: 14px;
  border: 1px solid var(--color-border);
  background: color-mix(in srgb, var(--color-surface) 88%, transparent);
  box-shadow: var(--shadow-md);
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

export const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-3) var(--space-2);
  border-bottom: 1px solid var(--color-divider);
  background: linear-gradient(180deg, color-mix(in srgb, var(--color-surface-2) 72%, transparent), transparent);
`;

export const PanelTitle = styled.div`
  font-weight: 700;
`;

export const IndexGrid = styled.div`
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  padding: var(--space-3);
  overflow: hidden;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    overflow: auto;
  }
`;

export const IndexButton = styled(motion.button)<{ $active?: boolean }>`
  width: 100%;
  border-radius: 12px;
  border: 1px solid
    ${({ $active }) =>
      $active ? "color-mix(in srgb, var(--color-primary) 64%, var(--color-border))" : "var(--color-border)"};
  background: ${({ $active }) =>
    $active
      ? "linear-gradient(145deg, rgba(30, 112, 255, 0.18), rgba(0, 214, 160, 0.08))"
      : "var(--color-surface)"};
  color: var(--color-text);
  padding: 8px 10px;
  min-height: 40px;
  text-align: left;
  cursor: pointer;
`;

export const IndexButtonRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

export const IndexButtonLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
`;

export const IndexButtonTitle = styled.span`
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const IndexProgressTag = styled(Tag)`
  margin-inline-end: 0;
  padding-inline: 4px;
  font-size: 11px;
  line-height: 16px;
`;

export const StageBody = styled.div`
  flex: 1;
  min-height: 0;
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
`;

export const StageTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  flex-wrap: wrap;
`;

export const StageIdentity = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-3);
`;

export const StageIconWrap = styled(motion.div)`
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: color-mix(in srgb, var(--color-surface-2) 72%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-primary) 26%, var(--color-border));
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const StageLabel = styled.div`
  font-size: 12px;
  color: var(--color-text-muted);
`;

export const StageTitle = styled.div`
  font-size: var(--font-size-md);
  font-weight: 700;
`;

export const StageProgressTag = styled(Tag)`
  margin-inline-end: 0;
  border-radius: 999px;
`;

export const StageProgress = styled(Progress)`
  .ant-progress-bg {
    box-shadow: 0 4px 14px rgba(30, 112, 255, 0.3);
  }
`;

export const SlideViewport = styled.div`
  position: relative;
  perspective: 900px;
  flex: 1;
  min-height: clamp(220px, 34vh, 340px);

  @media (max-width: 768px) {
    min-height: 360px;
  }
`;

export const SlideCard = styled(motion.article)`
  position: absolute;
  inset: 0;
  border-radius: 14px;
  border: 1px solid var(--color-border);
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  background:
    radial-gradient(circle at 85% 18%, rgba(122, 44, 255, 0.16), transparent 45%),
    radial-gradient(circle at 10% 85%, rgba(30, 112, 255, 0.16), transparent 42%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.02), transparent 35%),
    var(--color-surface);
  box-shadow: var(--shadow-md);
`;

export const SlideTitle = styled(Typography.Title)`
  && {
    margin: 0;
  }
`;

export const SlideSummary = styled(Typography.Paragraph)`
  && {
    margin: 8px 0 0;
    color: var(--color-text-muted);
  }
`;

export const FocusTitle = styled.div`
  font-weight: 700;
`;

export const FocusList = styled(motion.ul)`
  margin: 0;
  padding-left: 18px;
  line-height: 1.6;
  color: var(--color-text-muted);
`;

export const FocusItem = styled(motion.li)`
  margin-bottom: 4px;
`;

export const ResultBox = styled(motion.div)`
  margin-top: auto;
  border-radius: 12px;
  border: 1px solid color-mix(in srgb, var(--color-secondary) 26%, var(--color-border));
  padding: 12px;
  background: color-mix(in srgb, var(--color-surface-2) 82%, transparent);
`;

export const ResultLabel = styled.div`
  font-size: 12px;
  color: var(--color-text-muted);
`;

export const ResultValue = styled.div`
  font-weight: 700;
  margin-top: 4px;
`;

export const StageActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  flex-wrap: wrap;
  margin-top: auto;
`;

export const StageActionButtons = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
`;

export const GhostButton = styled(Button)`
  border-radius: 999px;
`;

export const PrimaryPillButton = styled(Button)`
  border-radius: 999px;
  font-weight: 600;
`;
