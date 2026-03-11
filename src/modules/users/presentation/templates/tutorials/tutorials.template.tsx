import { useMemo, useState, type ReactNode } from "react";
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

type TutorialSlide = {
  title: string;
  summary: string;
  bullets: string[];
  expectedResult: string;
};

type ModuleTutorial = {
  id: string;
  title: string;
  subtitle: string;
  route: string;
  icon: ReactNode;
  slides: TutorialSlide[];
};

const tutorialsCatalog: ModuleTutorial[] = [
  {
    id: "billing",
    title: "Billing",
    subtitle: "Plans, subscriptions, and payments",
    route: "/billing/landing",
    icon: <CreditCard size={18} />,
    slides: [
      {
        title: "Set your pricing strategy",
        summary: "Configure plans, renewal logic, and payment rules aligned to your business model.",
        bullets: [
          "Define plan tiers and entitlements clearly",
          "Set billing cycles and grace periods",
          "Align payment methods to your customer profile",
        ],
        expectedResult: "You create a predictable recurring revenue base.",
      },
      {
        title: "Monitor account health",
        summary: "Track subscription status and payment events before churn happens.",
        bullets: [
          "Review active, pending, and overdue subscriptions",
          "Track failed payments and retry cadence",
          "Identify at-risk accounts for proactive action",
        ],
        expectedResult: "You reduce involuntary churn and revenue leakage.",
      },
      {
        title: "Operate with confidence",
        summary: "Use billing operations as a stable backbone for all modules.",
        bullets: [
          "Keep plan access synchronized with features",
          "Standardize billing support processes",
          "Create routines for monthly revenue checkpoints",
        ],
        expectedResult: "Your operation scales with fewer revenue surprises.",
      },
    ],
  },
  {
    id: "clients",
    title: "Clients",
    subtitle: "Manage clients and relationships",
    route: "/clients/landing",
    icon: <Users size={18} />,
    slides: [
      {
        title: "Build a clean customer base",
        summary: "Centralize contact and profile data to support sales and service delivery.",
        bullets: [
          "Register complete customer identity data",
          "Maintain updated communication channels",
          "Segment customers by profile and value",
        ],
        expectedResult: "Your team works from a single source of truth.",
      },
      {
        title: "Improve follow-up quality",
        summary: "Turn client records into actionable workflows for your team.",
        bullets: [
          "Track service history and interactions",
          "Flag priority customers and open issues",
          "Set clear next actions per account",
        ],
        expectedResult: "You improve retention and reduce response time.",
      },
      {
        title: "Connect clients to operations",
        summary: "Link customers with schedule, work orders, and finance outputs.",
        bullets: [
          "Associate appointments with client records",
          "Connect work orders to the requesting customer",
          "Relate billing outcomes to account history",
        ],
        expectedResult: "You gain end-to-end customer visibility.",
      },
    ],
  },
  {
    id: "company",
    title: "Company",
    subtitle: "Profile and business setup",
    route: "/company/landing",
    icon: <Briefcase size={18} />,
    slides: [
      {
        title: "Set your business foundation",
        summary: "Configure company identity and operational baseline once and reuse everywhere.",
        bullets: [
          "Keep legal and trade data consistent",
          "Define core business attributes",
          "Maintain profile quality for team clarity",
        ],
        expectedResult: "Your account starts with consistent structure.",
      },
      {
        title: "Standardize service context",
        summary: "Use company settings to align service language and scope across teams.",
        bullets: [
          "Define your primary service lines",
          "Set clear positioning for the team",
          "Document baseline operational assumptions",
        ],
        expectedResult: "Your team executes with less ambiguity.",
      },
      {
        title: "Support growth readiness",
        summary: "Keep profile and setup current as your operation grows.",
        bullets: [
          "Review profile changes monthly",
          "Reflect team and scope expansion quickly",
          "Use setup data to support better reporting",
        ],
        expectedResult: "You avoid operational drift while scaling.",
      },
    ],
  },
  {
    id: "dashboard",
    title: "Dashboard",
    subtitle: "Business KPIs and insights",
    route: "/dashboard/landing",
    icon: <LayoutDashboard size={18} />,
    slides: [
      {
        title: "Get your operational pulse",
        summary: "Use KPIs to understand performance at a glance.",
        bullets: [
          "Track execution, demand, and throughput",
          "Watch trend shifts over time windows",
          "Identify risk signals early",
        ],
        expectedResult: "You prioritize what needs action now.",
      },
      {
        title: "Drive daily decisions",
        summary: "Translate numbers into practical priorities for each day.",
        bullets: [
          "Review the highest-impact indicators first",
          "Align team workload using visible bottlenecks",
          "Create short loops for corrective actions",
        ],
        expectedResult: "Your operation reacts faster with better focus.",
      },
      {
        title: "Align leadership and execution",
        summary: "Use shared KPIs for consistent communication between tactical and strategic levels.",
        bullets: [
          "Use the same definitions across teams",
          "Run recurring KPI review rituals",
          "Connect module actions back to outcomes",
        ],
        expectedResult: "You improve accountability and execution quality.",
      },
    ],
  },
  {
    id: "finance",
    title: "Finance",
    subtitle: "Payments, cashflow, and reporting",
    route: "/finance/landing",
    icon: <DollarSign size={18} />,
    slides: [
      {
        title: "Understand financial reality",
        summary: "Visualize revenue, expenses, and margin in one place.",
        bullets: [
          "Track inflows and outflows consistently",
          "Compare current period against baseline",
          "Spot margin pressure drivers quickly",
        ],
        expectedResult: "You make financial decisions with confidence.",
      },
      {
        title: "Control cashflow proactively",
        summary: "Use forecasting and insights to reduce short-term risk.",
        bullets: [
          "Monitor due-soon obligations",
          "Prioritize actions for cash preservation",
          "Coordinate finance with operations cadence",
        ],
        expectedResult: "You reduce cash stress and planning surprises.",
      },
      {
        title: "Close the loop with operations",
        summary: "Connect financial outcomes with services, clients, and work execution.",
        bullets: [
          "Analyze profitability by service mix",
          "Track cost behavior by execution patterns",
          "Use insights to refine pricing and process",
        ],
        expectedResult: "You improve profitability over time.",
      },
    ],
  },
  {
    id: "growth",
    title: "Growth",
    subtitle: "Retention, reactivation, and revenue recovery",
    route: "/growth/landing",
    icon: <Sparkles size={18} />,
    slides: [
      {
        title: "Prioritize the right opportunities",
        summary: "Use Growth Autopilot to rank opportunities from schedule, work-order, and finance signals.",
        bullets: [
          "Review new and queued opportunities with expected value",
          "Filter by status and source module before dispatch",
          "Select priority opportunities in batch for faster action",
        ],
        expectedResult: "You focus team effort on the highest commercial impact first.",
      },
      {
        title: "Configure playbooks by objective",
        summary: "Set goal, channel mix, and cadence once and apply it consistently.",
        bullets: [
          "Enable reactivation, upsell, and recovery playbooks",
          "Set channels (WhatsApp, email, SMS) per objective",
          "Define delay and max touches to avoid message fatigue",
        ],
        expectedResult: "Campaign execution becomes repeatable and less dependent on manual follow-up.",
      },
      {
        title: "Track conversion and recovered revenue",
        summary: "Use attribution indicators to validate campaign impact over the selected window.",
        bullets: [
          "Monitor dispatched vs converted opportunities",
          "Measure recovered revenue tied to growth actions",
          "Adjust playbooks based on conversion rate trends",
        ],
        expectedResult: "You shorten time from execution to billing and improve cashflow predictability.",
      },
    ],
  },
  {
    id: "inventory",
    title: "Inventory",
    subtitle: "Stock and supplies control",
    route: "/inventory/landing",
    icon: <Box size={18} />,
    slides: [
      {
        title: "Structure your inventory",
        summary: "Create a clean catalog with stock semantics your team can trust.",
        bullets: [
          "Register items with clear identifiers",
          "Define categories and stock locations",
          "Keep minimum levels updated",
        ],
        expectedResult: "Your stock base becomes reliable.",
      },
      {
        title: "Avoid service interruptions",
        summary: "Use stock visibility to prevent shortages during execution.",
        bullets: [
          "Track planned and consumed quantities",
          "Monitor critical low-stock items",
          "Create replenishment routines",
        ],
        expectedResult: "You reduce delays caused by missing materials.",
      },
      {
        title: "Link stock to profitability",
        summary: "Connect inventory usage with finance and work orders.",
        bullets: [
          "Understand material cost impact per order",
          "Reduce waste with usage discipline",
          "Improve planning using historical consumption",
        ],
        expectedResult: "You gain tighter cost control.",
      },
    ],
  },
  {
    id: "people",
    title: "People",
    subtitle: "Team capacity and availability",
    route: "/people",
    icon: <Users size={18} />,
    slides: [
      {
        title: "Set weekly availability",
        summary: "Define the weekly capacity baseline for each collaborator in one shared flow.",
        bullets: [
          "Open People and use the Capacity & availability tab",
          "Set minutes per weekday for each collaborator",
          "Save once and keep backend persistence for multi-user visibility",
        ],
        expectedResult: "Your team works from a single source of truth for availability.",
      },
      {
        title: "Register availability blocks",
        summary: "Capture exceptions such as PTO, training, and meetings to prevent unrealistic planning.",
        bullets: [
          "Create date and time blocks directly from the capacity panel",
          "Use blocks to reduce effective daily availability automatically",
          "Keep updates visible for managers and auditors",
        ],
        expectedResult: "Planned load reflects real available hours.",
      },
      {
        title: "Track load and over-allocation",
        summary: "Review operational indicators and collaborator load before assignment conflicts escalate.",
        bullets: [
          "Monitor conflict rate, productive hours, and planned workload",
          "Compare schedule load and work-order load per collaborator",
          "Act on over-allocation alerts before dispatching new work",
        ],
        expectedResult: "You reduce schedule conflicts and improve productivity planning.",
      },
    ],
  },
  {
    id: "sla",
    title: "SLA",
    subtitle: "Service-level agreements and targets",
    route: "/company/slas",
    icon: <Briefcase size={18} />,
    slides: [
      {
        title: "Define service commitments",
        summary: "Set target times and standards for predictable service delivery.",
        bullets: [
          "Establish realistic response and resolution targets",
          "Document agreement rules clearly",
          "Align SLA by service criticality",
        ],
        expectedResult: "You set clear expectations with your customers.",
      },
      {
        title: "Monitor compliance in real time",
        summary: "Track fulfillment status before issues escalate.",
        bullets: [
          "Watch due and overdue execution windows",
          "Identify recurring breach patterns",
          "Escalate at-risk items early",
        ],
        expectedResult: "You reduce missed commitments.",
      },
      {
        title: "Improve operational discipline",
        summary: "Use SLA results to refine process and planning.",
        bullets: [
          "Review breach root causes",
          "Adjust staffing and prioritization logic",
          "Continuously calibrate targets to reality",
        ],
        expectedResult: "You increase reliability and customer trust.",
      },
    ],
  },
  {
    id: "schedule",
    title: "Schedule",
    subtitle: "Appointments and calendar planning",
    route: "/schedule/landing",
    icon: <Calendar size={18} />,
    slides: [
      {
        title: "Plan your execution window",
        summary: "Organize activities in calendar format for predictable delivery.",
        bullets: [
          "Book appointments with clear timing",
          "Avoid overlaps and hidden conflicts",
          "Coordinate resources across days and weeks",
        ],
        expectedResult: "Your operation runs with less schedule friction.",
      },
      {
        title: "React to change fast",
        summary: "Update schedules quickly while preserving team alignment.",
        bullets: [
          "Reschedule with impact awareness",
          "Communicate changes to relevant roles",
          "Keep the calendar as source of execution truth",
        ],
        expectedResult: "You maintain service quality under variability.",
      },
      {
        title: "Connect schedule with delivery",
        summary: "Bridge planning with work orders, people, and inventory consumption.",
        bullets: [
          "Link events to actual execution records",
          "Track throughput by calendar periods",
          "Use schedule history to improve forecasting",
        ],
        expectedResult: "Planning becomes a strategic advantage.",
      },
    ],
  },
  {
    id: "services",
    title: "Services",
    subtitle: "Catalog and pricing",
    route: "/company/landing",
    icon: <Briefcase size={18} />,
    slides: [
      {
        title: "Build a structured catalog",
        summary: "Define services with clear scope, pricing, and duration assumptions.",
        bullets: [
          "Standardize service naming and categories",
          "Define price and effort references",
          "Keep active offerings curated",
        ],
        expectedResult: "Your commercial and operational teams stay aligned.",
      },
      {
        title: "Protect margin with consistency",
        summary: "Use catalog quality to avoid underpricing and scope drift.",
        bullets: [
          "Review cost-to-deliver versus pricing regularly",
          "Document add-ons and optional work clearly",
          "Update catalog based on real execution data",
        ],
        expectedResult: "You improve financial performance per service.",
      },
      {
        title: "Use catalog as decision engine",
        summary: "Connect services to finance, schedule, and work order modules.",
        bullets: [
          "Measure service mix impact on revenue",
          "Plan capacity based on service demand",
          "Adjust portfolio to market response",
        ],
        expectedResult: "Your service strategy becomes data-driven.",
      },
    ],
  },
  {
    id: "work-order",
    title: "Work order",
    subtitle: "Execution lifecycle and controls",
    route: "/work-order/landing",
    icon: <ClipboardList size={18} />,
    slides: [
      {
        title: "Control execution from start to finish",
        summary: "Create, assign, and monitor work orders in a single flow.",
        bullets: [
          "Track status transitions with clarity",
          "Assign workers, lines, and deadlines",
          "Centralize activity history in each order",
        ],
        expectedResult: "You gain predictability in daily operations.",
      },
      {
        title: "Reduce operational risk",
        summary: "Use overview signals to act on overdue and high-priority work early.",
        bullets: [
          "Monitor due soon and overdue queues",
          "Spot checklist and priority risks",
          "Trigger quick corrective actions",
        ],
        expectedResult: "You reduce delays and improve service quality.",
      },
      {
        title: "Connect execution to business outcomes",
        summary: "Bridge work order data with finance, inventory, and customer experience.",
        bullets: [
          "Measure cycle and completion performance",
          "Track cost and material impact per order",
          "Improve process using real work evidence",
        ],
        expectedResult: "Execution drives measurable business value.",
      },
    ],
  },
];

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
  const tutorials = useMemo(() => tutorialsCatalog, []);
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

  const isFirstSlide =
    selectedModuleIndex === 0 && currentSlideIndex === 0;
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
                <HeroTitle level={3}>Product tutorials</HeroTitle>
                <HeroSubtitle>
                  Immersive guided tour. Pick a module and navigate with animated
                  story cards.
                </HeroSubtitle>
              </HeroTitleBlock>
            </HeroIdentity>

            <HeroActionRow>
              <FloatingTag color="geekblue">{tutorials.length} modules</FloatingTag>
              <FloatingTag color="cyan">
                {tutorials.reduce((sum, module) => sum + module.slides.length, 0)} total slides
              </FloatingTag>
              <HeroMainButton
                type="primary"
                icon={<Play size={16} />}
                onClick={() => {
                  if (tutorials.length) activateModule(tutorials[0].id, 0, 1);
                }}
              >
                Start full tour
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
                    <SlidesPill>{module.slides.length} slides</SlidesPill>
                    <CatalogStartButton
                      size="small"
                      type="primary"
                      onClick={(event) => {
                        event.stopPropagation();
                        activateModule(module.id, 0, 1);
                      }}
                    >
                        Start
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
                  <PanelTitle>Tutorial index</PanelTitle>
                  <GhostButton size="small" onClick={() => setSelectedModuleId(null)}>
                    Back to modules
                  </GhostButton>
                </PanelHeader>
                <IndexGrid>
                  {tutorials.map((module) => {
                    const active = module.id === selectedModule.id;
                    const targetIndex = tutorials.findIndex(
                      (item) => item.id === module.id
                    );
                    const direction: 1 | -1 =
                      targetIndex >= selectedModuleIndex ? 1 : -1;
                    const moduleSlide = ensureSlideIndex(
                      slidesByModule[module.id] ?? 0,
                      module.slides.length
                    );
                    return (
                      <IndexButton
                        key={module.id}
                        $active={active}
                        whileHover={
                          prefersReducedMotion
                            ? undefined
                            : { scale: 1.02, y: -1 }
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
                        <StageLabel>Now learning</StageLabel>
                        <StageTitle>{selectedModule.title}</StageTitle>
                      </div>
                    </StageIdentity>
                    <StageProgressTag color="cyan">
                      Slide {currentSlideIndex + 1} of {selectedModule.slides.length}
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
                            <FocusTitle>What to focus on</FocusTitle>
                            <FocusList>
                              {currentSlide.bullets.map((bullet, index) => (
                                <FocusItem
                                  key={bullet}
                                  initial={{
                                    opacity: 0,
                                    x: prefersReducedMotion ? 0 : -10,
                                  }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{
                                    duration: prefersReducedMotion ? 0.01 : 0.28,
                                    delay: prefersReducedMotion
                                      ? 0
                                      : 0.08 + index * 0.06,
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
                            <ResultLabel>Expected result</ResultLabel>
                            <ResultValue>{currentSlide.expectedResult}</ResultValue>
                          </ResultBox>
                        </SlideCard>
                      ) : null}
                    </AnimatePresence>
                  </SlideViewport>

                  <StageActions>
                    <StageActionButtons>
                      <GhostButton icon={<ArrowLeft size={16} />} onClick={goToPreviousSlide} disabled={isFirstSlide}>
                        Previous
                      </GhostButton>
                      <PrimaryPillButton
                        type="primary"
                        icon={<ArrowRight size={16} />}
                        onClick={goToNextSlide}
                        disabled={isLastSlide}
                      >
                        Next
                      </PrimaryPillButton>
                    </StageActionButtons>
                    <GhostButton icon={<ExternalLink size={16} />} onClick={() => navigate(selectedModule.route)}>
                      Open module
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
