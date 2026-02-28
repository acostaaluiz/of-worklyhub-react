import { useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Col, Progress, Row, Space, Tag, Typography } from "antd";
import {
  BookOpen,
  Box,
  Briefcase,
  Calendar,
  ClipboardList,
  CreditCard,
  DollarSign,
  LayoutDashboard,
  Users,
} from "lucide-react";

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
    subtitle: "Team members and staff access",
    route: "/people/landing",
    icon: <Users size={18} />,
    slides: [
      {
        title: "Organize your workforce",
        summary: "Manage collaborators with clear ownership and visibility.",
        bullets: [
          "Keep staff records up to date",
          "Define who is responsible for each operation",
          "Support growth with structured onboarding",
        ],
        expectedResult: "You improve team coordination.",
      },
      {
        title: "Assign work with clarity",
        summary: "Use people data to allocate tasks and capacity better.",
        bullets: [
          "Map roles to real execution responsibilities",
          "Balance workload across available staff",
          "Reduce ambiguity in assignment flow",
        ],
        expectedResult: "Execution quality improves with less rework.",
      },
      {
        title: "Create performance rhythm",
        summary: "Use team visibility to guide coaching and process evolution.",
        bullets: [
          "Review output and blockers regularly",
          "Align team priorities to business goals",
          "Capture learning and update routines",
        ],
        expectedResult: "Your team matures operationally month after month.",
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

export default function TutorialsTemplate() {
  const navigate = useNavigate();
  const tutorials = useMemo(() => tutorialsCatalog, []);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [slidesByModule, setSlidesByModule] = useState<Record<string, number>>({});

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

  const activateModule = (moduleId: string, slideIndex = 0) => {
    const module = tutorials.find((item) => item.id === moduleId);
    if (!module) return;

    const safeIndex = ensureSlideIndex(slideIndex, module.slides.length);
    setSelectedModuleId(moduleId);
    setSlidesByModule((prev) => ({ ...prev, [moduleId]: safeIndex }));
  };

  const goToPreviousSlide = () => {
    if (!selectedModule) return;
    if (currentSlideIndex > 0) {
      activateModule(selectedModule.id, currentSlideIndex - 1);
      return;
    }
    if (selectedModuleIndex > 0) {
      const previousModule = tutorials[selectedModuleIndex - 1];
      activateModule(previousModule.id, previousModule.slides.length - 1);
    }
  };

  const goToNextSlide = () => {
    if (!selectedModule) return;
    if (currentSlideIndex < selectedModule.slides.length - 1) {
      activateModule(selectedModule.id, currentSlideIndex + 1);
      return;
    }
    if (selectedModuleIndex < tutorials.length - 1) {
      const nextModule = tutorials[selectedModuleIndex + 1];
      activateModule(nextModule.id, 0);
    }
  };

  return (
    <div className="container" style={{ padding: "var(--space-6)" }}>
      <div className="surface" style={{ padding: "var(--space-6)", borderRadius: "var(--radius-xl)" }}>
        <div
          style={{
            borderRadius: 16,
            padding: "18px 18px 16px",
            marginBottom: 20,
            border: "1px solid var(--color-border)",
            background:
              "radial-gradient(circle at 20% 15%, rgba(78, 241, 221, 0.18), transparent 52%), var(--color-surface)",
          }}
        >
          <Space style={{ width: "100%", justifyContent: "space-between" }} wrap>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 10,
                  background: "var(--color-surface-2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <BookOpen size={20} />
              </div>
              <div>
                <Typography.Title level={3} style={{ margin: 0 }}>
                  Product tutorials
                </Typography.Title>
                <Typography.Text type="secondary">
                  Friendly guided tour. Select a module and move slide by slide.
                </Typography.Text>
              </div>
            </div>
            <Space wrap>
              <Tag color="geekblue">{tutorials.length} modules</Tag>
              <Tag color="cyan">
                {tutorials.reduce((sum, module) => sum + module.slides.length, 0)} total slides
              </Tag>
              <Button type="primary" onClick={() => activateModule(tutorials[0].id, 0)}>
                Start full tour
              </Button>
            </Space>
          </Space>
        </div>

        {!selectedModule ? (
          <Row gutter={[14, 14]}>
            {tutorials.map((module) => (
              <Col key={module.id} xs={24} sm={12} lg={8}>
                <Card
                  className="surface"
                  bodyStyle={{ padding: 14 }}
                  style={{ height: "100%", borderRadius: 12, border: "1px solid var(--color-border)" }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, height: "100%" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          background: "var(--color-surface-2)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {module.icon}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 700 }}>{module.title}</div>
                        <div style={{ color: "var(--color-text-muted)", fontSize: 12 }}>{module.subtitle}</div>
                      </div>
                    </div>
                    <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Tag>{module.slides.length} slides</Tag>
                      <Button size="small" type="primary" onClick={() => activateModule(module.id, 0)}>
                        Start
                      </Button>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={8}>
              <Card
                className="surface"
                bodyStyle={{ padding: 14 }}
                style={{ borderRadius: 12, border: "1px solid var(--color-border)" }}
                title="Tutorial index"
                extra={
                  <Button size="small" onClick={() => setSelectedModuleId(null)}>
                    Back to modules
                  </Button>
                }
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    gap: 6,
                    maxHeight: "min(40vh, 340px)",
                    overflowY: "auto",
                    paddingRight: 2,
                  }}
                >
                  {tutorials.map((module) => {
                    const active = module.id === selectedModule.id;
                    return (
                      <button
                        key={module.id}
                        onClick={() => activateModule(module.id, slidesByModule[module.id] ?? 0)}
                        style={{
                          width: "100%",
                          borderRadius: 10,
                          border: `1px solid ${active ? "var(--color-primary)" : "var(--color-border)"}`,
                          background: active ? "rgba(78, 241, 221, 0.15)" : "var(--color-surface)",
                          color: "var(--color-text)",
                          padding: "6px 8px",
                          minHeight: 38,
                          cursor: "pointer",
                          textAlign: "left",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
                            {module.icon}
                            <span style={{ fontWeight: 600, fontSize: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {module.title}
                            </span>
                          </div>
                          <Tag style={{ marginInlineEnd: 0, paddingInline: 4, fontSize: 11, lineHeight: "16px" }}>
                            {(slidesByModule[module.id] ?? 0) + 1}/{module.slides.length}
                          </Tag>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </Card>
            </Col>

            <Col xs={24} lg={16}>
              <Card
                className="surface"
                bodyStyle={{ padding: 16 }}
                style={{ borderRadius: 12, border: "1px solid var(--color-border)" }}
              >
                <Space direction="vertical" size={14} style={{ width: "100%" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 10,
                          background: "var(--color-surface-2)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {selectedModule.icon}
                      </div>
                      <div>
                        <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Now learning</div>
                        <div style={{ fontWeight: 700 }}>{selectedModule.title}</div>
                      </div>
                    </div>
                    <Tag color="cyan" style={{ marginInlineEnd: 0 }}>
                      Slide {currentSlideIndex + 1} of {selectedModule.slides.length}
                    </Tag>
                  </div>

                  <Progress
                    percent={progressPercent}
                    size="small"
                    strokeColor="var(--color-primary)"
                    trailColor="var(--color-surface-2)"
                    showInfo={false}
                  />

                  {currentSlide ? (
                    <div
                      style={{
                        borderRadius: 12,
                        border: "1px solid var(--color-border)",
                        padding: 14,
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                        background: "linear-gradient(180deg, rgba(78, 241, 221, 0.08), rgba(78, 241, 221, 0.01))",
                      }}
                    >
                      <div>
                        <Typography.Title level={4} style={{ margin: 0 }}>
                          {currentSlide.title}
                        </Typography.Title>
                        <Typography.Paragraph style={{ margin: "8px 0 0", color: "var(--color-text-muted)" }}>
                          {currentSlide.summary}
                        </Typography.Paragraph>
                      </div>

                      <div>
                        <div style={{ fontWeight: 600, marginBottom: 8 }}>What to focus on</div>
                        <ul style={{ margin: 0, paddingLeft: 18, color: "var(--color-text-muted)", lineHeight: 1.55 }}>
                          {currentSlide.bullets.map((bullet) => (
                            <li key={bullet}>{bullet}</li>
                          ))}
                        </ul>
                      </div>

                      <div
                        style={{
                          borderRadius: 10,
                          border: "1px solid var(--color-border)",
                          padding: "10px 12px",
                          background: "var(--color-surface)",
                        }}
                      >
                        <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Expected result</div>
                        <div style={{ fontWeight: 600 }}>{currentSlide.expectedResult}</div>
                      </div>
                    </div>
                  ) : null}

                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                    <Space>
                      <Button onClick={goToPreviousSlide} disabled={selectedModuleIndex === 0 && currentSlideIndex === 0}>
                        Previous
                      </Button>
                      <Button
                        type="primary"
                        onClick={goToNextSlide}
                        disabled={
                          selectedModuleIndex === tutorials.length - 1 &&
                          currentSlideIndex === selectedModule.slides.length - 1
                        }
                      >
                        Next
                      </Button>
                    </Space>
                    <Button onClick={() => navigate(selectedModule.route)}>Open module</Button>
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>
        )}
      </div>
    </div>
  );
}
