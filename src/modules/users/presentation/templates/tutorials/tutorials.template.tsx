import { useMemo, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, type Variants, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Box,
  Briefcase,
  Calendar,
  ClipboardList,
  CreditCard,
  DollarSign,
  ExternalLink,
  LayoutDashboard,
  Play,
  Sparkles,
  Users,
} from "lucide-react";
import { normalizeAppLanguage } from "@core/i18n";

import { tutorialsCatalogEnUS } from "./tutorials.catalog.en";
import { tutorialsCatalogPtBR } from "./tutorials.catalog.pt-br";
import type {
  TutorialModuleId,
  TutorialSlideContent,
} from "./tutorials.catalog.types";
import {
  CatalogCard,
  CatalogCardIcon,
  CatalogCardTop,
  CatalogFooter,
  CatalogGrid,
  CatalogStartButton,
  CatalogSubtitle,
  CatalogTitle,
  FloatingTag,
  FocusItem,
  FocusList,
  FocusTitle,
  GhostButton,
  HeroActionRow,
  HeroAura,
  HeroIconWrap,
  HeroIdentity,
  HeroMainButton,
  HeroSection,
  HeroSubtitle,
  HeroTitle,
  HeroTitleBlock,
  HeroTopRow,
  IndexButton,
  IndexButtonLeft,
  IndexButtonRow,
  IndexButtonTitle,
  IndexGrid,
  IndexProgressTag,
  Panel,
  PanelHeader,
  PanelTitle,
  PrimaryPillButton,
  ResultBox,
  ResultLabel,
  ResultValue,
  SlideCard,
  SlideSummary,
  SlideTitle,
  SlidesPill,
  StageActionButtons,
  StageActions,
  StageBody,
  StageIconWrap,
  StageIdentity,
  StageLabel,
  StageProgress,
  StageProgressTag,
  StageTitle,
  StageTop,
  SlideViewport,
  TourWorkspace,
  TutorialsRoot,
  TutorialsSurface,
} from "./tutorials.template.styles";

type TutorialSlide = TutorialSlideContent;

type ModuleTutorial = {
  id: TutorialModuleId;
  title: string;
  subtitle: string;
  route: string;
  icon: ReactNode;
  slides: TutorialSlide[];
};

const MODULE_META: Record<TutorialModuleId, { route: string; icon: ReactNode }> = {
  billing: { route: "/billing/landing", icon: <CreditCard size={18} /> },
  clients: { route: "/clients/landing", icon: <Users size={18} /> },
  company: { route: "/company/landing", icon: <Briefcase size={18} /> },
  dashboard: { route: "/dashboard/landing", icon: <LayoutDashboard size={18} /> },
  finance: { route: "/finance/landing", icon: <DollarSign size={18} /> },
  growth: { route: "/growth/landing", icon: <Sparkles size={18} /> },
  inventory: { route: "/inventory/landing", icon: <Box size={18} /> },
  people: { route: "/people/landing", icon: <Users size={18} /> },
  sla: { route: "/company/landing", icon: <Briefcase size={18} /> },
  schedule: { route: "/schedule/landing", icon: <Calendar size={18} /> },
  services: { route: "/company/landing", icon: <Briefcase size={18} /> },
  "work-order": { route: "/work-order/landing", icon: <ClipboardList size={18} /> },
};

function resolveTutorialsCatalog(language: string): ModuleTutorial[] {
  const normalizedLanguage = normalizeAppLanguage(language);
  const localizedCatalog =
    normalizedLanguage === "pt-BR" ? tutorialsCatalogPtBR : tutorialsCatalogEnUS;

  return localizedCatalog.map((module) => ({
    ...module,
    route: MODULE_META[module.id].route,
    icon: MODULE_META[module.id].icon,
  }));
}

function ensureSlideIndex(index: number, slidesTotal: number): number {
  if (slidesTotal <= 0) return 0;
  if (index < 0) return 0;
  if (index >= slidesTotal) return slidesTotal - 1;
  return index;
}

const catalogGridVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.07, delayChildren: 0.08 },
  },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2 } },
};

const catalogCardVariants: Variants = {
  hidden: { opacity: 0, y: 20, rotateX: -6 },
  visible: { opacity: 1, y: 0, rotateX: 0, transition: { duration: 0.48 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

const slideVariants: Variants = {
  enter: (direction: 1 | -1) => ({
    opacity: 0,
    x: direction > 0 ? 56 : -56,
    rotateX: direction > 0 ? -3 : 3,
    filter: "blur(4px)",
  }),
  center: {
    opacity: 1,
    x: 0,
    rotateX: 0,
    filter: "blur(0px)",
  },
  exit: (direction: 1 | -1) => ({
    opacity: 0,
    x: direction > 0 ? -56 : 56,
    rotateX: direction > 0 ? 3 : -3,
    filter: "blur(4px)",
  }),
};

export default function TutorialsTemplate() {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();
  const { t, i18n } = useTranslation();
  const tutorials = useMemo(
    () => resolveTutorialsCatalog(i18n.resolvedLanguage ?? i18n.language),
    [i18n.language, i18n.resolvedLanguage]
  );
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [slidesByModule, setSlidesByModule] = useState<Record<string, number>>({});
  const [slideDirection, setSlideDirection] = useState<1 | -1>(1);

  const selectedModule = useMemo(
    () => tutorials.find((module) => module.id === selectedModuleId) ?? null,
    [tutorials, selectedModuleId]
  );

  const selectedModuleIndex = selectedModule
    ? tutorials.findIndex((module) => module.id === selectedModule.id)
    : -1;

  const currentSlideIndex = selectedModule
    ? ensureSlideIndex(slidesByModule[selectedModule.id] ?? 0, selectedModule.slides.length)
    : 0;

  const currentSlide = selectedModule ? selectedModule.slides[currentSlideIndex] : null;
  const progressPercent = selectedModule
    ? Math.round(((currentSlideIndex + 1) / selectedModule.slides.length) * 100)
    : 0;

  const activateModule = (
    moduleId: string,
    slideIndex = 0,
    direction: 1 | -1 = 1
  ) => {
    const module = tutorials.find((item) => item.id === moduleId);
    if (!module) return;

    const safeIndex = ensureSlideIndex(slideIndex, module.slides.length);
    setSlideDirection(direction);
    setSelectedModuleId(moduleId);
    setSlidesByModule((prev) => ({ ...prev, [moduleId]: safeIndex }));
  };

  const goToPreviousSlide = () => {
    if (!selectedModule) return;
    if (currentSlideIndex > 0) {
      activateModule(selectedModule.id, currentSlideIndex - 1, -1);
      return;
    }
    if (selectedModuleIndex > 0) {
      const previousModule = tutorials[selectedModuleIndex - 1];
      activateModule(previousModule.id, previousModule.slides.length - 1, -1);
    }
  };

  const goToNextSlide = () => {
    if (!selectedModule) return;
    if (currentSlideIndex < selectedModule.slides.length - 1) {
      activateModule(selectedModule.id, currentSlideIndex + 1, 1);
      return;
    }
    if (selectedModuleIndex < tutorials.length - 1) {
      const nextModule = tutorials[selectedModuleIndex + 1];
      activateModule(nextModule.id, 0, 1);
    }
  };

  const isFirstSlide = selectedModuleIndex === 0 && currentSlideIndex === 0;
  const isLastSlide =
    !!selectedModule &&
    selectedModuleIndex === tutorials.length - 1 &&
    currentSlideIndex === selectedModule.slides.length - 1;

  return (
    <TutorialsRoot className="container">
      <TutorialsSurface
        initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: prefersReducedMotion ? 0.01 : 0.6,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <HeroSection
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0.01 : 0.55 }}
        >
          <HeroAura aria-hidden>
            <span className="orb orb-a" />
            <span className="orb orb-b" />
            <span className="orb orb-c" />
          </HeroAura>

          <HeroTopRow>
            <HeroIdentity>
              <HeroIconWrap
                animate={
                  prefersReducedMotion
                    ? undefined
                    : {
                        rotate: [0, -4, 3, 0],
                        y: [0, -2, 0],
                      }
                }
                transition={{
                  duration: 5.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <BookOpen size={20} />
              </HeroIconWrap>
              <HeroTitleBlock>
                <HeroTitle level={3}>{t("tutorials.heroTitle")}</HeroTitle>
                <HeroSubtitle>{t("tutorials.heroSubtitle")}</HeroSubtitle>
              </HeroTitleBlock>
            </HeroIdentity>

            <HeroActionRow>
              <FloatingTag color="geekblue">
                {t("tutorials.totalModulesTag", { count: tutorials.length })}
              </FloatingTag>
              <FloatingTag color="cyan">
                {t("tutorials.totalSlidesTag", {
                  count: tutorials.reduce((sum, module) => sum + module.slides.length, 0),
                })}
              </FloatingTag>
              <HeroMainButton
                type="primary"
                icon={<Play size={16} />}
                onClick={() => {
                  if (tutorials.length) activateModule(tutorials[0].id, 0, 1);
                }}
              >
                {t("tutorials.startFullTour")}
              </HeroMainButton>
            </HeroActionRow>
          </HeroTopRow>
        </HeroSection>

        <AnimatePresence mode="wait" initial={false}>
          {!selectedModule ? (
            <CatalogGrid
              key="catalog"
              variants={catalogGridVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {tutorials.map((module, index) => (
                <CatalogCard
                  key={module.id}
                  variants={catalogCardVariants}
                  whileHover={
                    prefersReducedMotion
                      ? undefined
                      : { y: -7, scale: 1.01, rotateX: 5, rotateY: -3 }
                  }
                  whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
                  transition={{
                    duration: prefersReducedMotion ? 0.01 : 0.35,
                    ease: [0.22, 1, 0.36, 1],
                    delay: prefersReducedMotion ? 0 : index * 0.02,
                  }}
                  onClick={() => activateModule(module.id, 0, 1)}
                >
                  <CatalogCardTop>
                    <CatalogCardIcon
                      animate={
                        prefersReducedMotion
                          ? undefined
                          : { rotate: [0, -6, 4, 0], scale: [1, 1.06, 1] }
                      }
                      transition={{
                        duration: 3 + (index % 3) * 0.6,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      {module.icon}
                    </CatalogCardIcon>
                    <div>
                      <CatalogTitle>{module.title}</CatalogTitle>
                      <CatalogSubtitle>{module.subtitle}</CatalogSubtitle>
                    </div>
                  </CatalogCardTop>

                  <CatalogFooter>
                    <SlidesPill>
                      {t("tutorials.slidesCount", { count: module.slides.length })}
                    </SlidesPill>
                    <CatalogStartButton
                      size="small"
                      type="primary"
                      onClick={(event) => {
                        event.stopPropagation();
                        activateModule(module.id, 0, 1);
                      }}
                    >
                      {t("tutorials.start")}
                    </CatalogStartButton>
                  </CatalogFooter>
                </CatalogCard>
              ))}
            </CatalogGrid>
          ) : (
            <TourWorkspace
              key={`tour-${selectedModule.id}`}
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: prefersReducedMotion ? 0 : -12 }}
              transition={{ duration: prefersReducedMotion ? 0.01 : 0.35 }}
            >
              <Panel
                initial={{ opacity: 0, x: prefersReducedMotion ? 0 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: prefersReducedMotion ? 0.01 : 0.35 }}
              >
                <PanelHeader>
                  <PanelTitle>{t("tutorials.tutorialIndexTitle")}</PanelTitle>
                  <GhostButton size="small" onClick={() => setSelectedModuleId(null)}>
                    {t("tutorials.backToModules")}
                  </GhostButton>
                </PanelHeader>
                <IndexGrid>
                  {tutorials.map((module) => {
                    const active = module.id === selectedModule.id;
                    const targetIndex = tutorials.findIndex((item) => item.id === module.id);
                    const direction: 1 | -1 = targetIndex >= selectedModuleIndex ? 1 : -1;
                    const moduleSlide = ensureSlideIndex(
                      slidesByModule[module.id] ?? 0,
                      module.slides.length
                    );

                    return (
                      <IndexButton
                        key={module.id}
                        $active={active}
                        whileHover={
                          prefersReducedMotion ? undefined : { scale: 1.02, y: -1 }
                        }
                        whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
                        onClick={() => activateModule(module.id, moduleSlide, direction)}
                      >
                        <IndexButtonRow>
                          <IndexButtonLeft>
                            {module.icon}
                            <IndexButtonTitle>{module.title}</IndexButtonTitle>
                          </IndexButtonLeft>
                          <IndexProgressTag>
                            {moduleSlide + 1}/{module.slides.length}
                          </IndexProgressTag>
                        </IndexButtonRow>
                      </IndexButton>
                    );
                  })}
                </IndexGrid>
              </Panel>

              <Panel
                initial={{ opacity: 0, x: prefersReducedMotion ? 0 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: prefersReducedMotion ? 0.01 : 0.35 }}
              >
                <StageBody>
                  <StageTop>
                    <StageIdentity>
                      <StageIconWrap
                        animate={
                          prefersReducedMotion
                            ? undefined
                            : { rotate: [0, -5, 5, 0], scale: [1, 1.04, 1] }
                        }
                        transition={{
                          duration: 4.2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        {selectedModule.icon}
                      </StageIconWrap>
                      <div>
                        <StageLabel>{t("tutorials.nowLearning")}</StageLabel>
                        <StageTitle>{selectedModule.title}</StageTitle>
                      </div>
                    </StageIdentity>
                    <StageProgressTag color="cyan">
                      {t("tutorials.slideProgress", {
                        current: currentSlideIndex + 1,
                        total: selectedModule.slides.length,
                      })}
                    </StageProgressTag>
                  </StageTop>

                  <StageProgress
                    percent={progressPercent}
                    size="small"
                    strokeColor="var(--color-primary)"
                    trailColor="var(--color-surface-2)"
                    showInfo={false}
                  />

                  <SlideViewport>
                    <AnimatePresence mode="wait" custom={slideDirection}>
                      {currentSlide ? (
                        <SlideCard
                          key={`${selectedModule.id}-${currentSlideIndex}`}
                          custom={slideDirection}
                          variants={slideVariants}
                          initial="enter"
                          animate="center"
                          exit="exit"
                          transition={{
                            duration: prefersReducedMotion ? 0.01 : 0.45,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                        >
                          <div>
                            <SlideTitle level={4}>{currentSlide.title}</SlideTitle>
                            <SlideSummary>{currentSlide.summary}</SlideSummary>
                          </div>

                          <div>
                            <FocusTitle>{t("tutorials.focusTitle")}</FocusTitle>
                            <FocusList>
                              {currentSlide.bullets.map((bullet, index) => (
                                <FocusItem
                                  key={`${bullet}-${index}`}
                                  initial={{
                                    opacity: 0,
                                    x: prefersReducedMotion ? 0 : -10,
                                  }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{
                                    duration: prefersReducedMotion ? 0.01 : 0.28,
                                    delay: prefersReducedMotion ? 0 : 0.08 + index * 0.06,
                                  }}
                                >
                                  {bullet}
                                </FocusItem>
                              ))}
                            </FocusList>
                          </div>

                          <ResultBox
                            initial={{
                              opacity: 0,
                              y: prefersReducedMotion ? 0 : 8,
                            }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              duration: prefersReducedMotion ? 0.01 : 0.25,
                              delay: prefersReducedMotion ? 0 : 0.16,
                            }}
                          >
                            <ResultLabel>{t("tutorials.expectedResultLabel")}</ResultLabel>
                            <ResultValue>{currentSlide.expectedResult}</ResultValue>
                          </ResultBox>
                        </SlideCard>
                      ) : null}
                    </AnimatePresence>
                  </SlideViewport>

                  <StageActions>
                    <StageActionButtons>
                      <GhostButton
                        icon={<ArrowLeft size={16} />}
                        onClick={goToPreviousSlide}
                        disabled={isFirstSlide}
                      >
                        {t("tutorials.previous")}
                      </GhostButton>
                      <PrimaryPillButton
                        type="primary"
                        icon={<ArrowRight size={16} />}
                        onClick={goToNextSlide}
                        disabled={isLastSlide}
                      >
                        {t("tutorials.next")}
                      </PrimaryPillButton>
                    </StageActionButtons>
                    <GhostButton
                      icon={<ExternalLink size={16} />}
                      onClick={() => navigate(selectedModule.route)}
                    >
                      {t("tutorials.openModule")}
                    </GhostButton>
                  </StageActions>
                </StageBody>
              </Panel>
            </TourWorkspace>
          )}
        </AnimatePresence>
      </TutorialsSurface>
    </TutorialsRoot>
  );
}
