import type { TutorialModuleContent } from "./tutorials.catalog.types";

export const tutorialsCatalogEnUS: TutorialModuleContent[] = [
  {
    id: "billing",
    title: "Billing",
    subtitle: "Plans, subscriptions, and payments",
    slides: [
      {
        title: "Start in Billing landing",
        summary: "Use Billing landing as the main entry point for plan and payment decisions.",
        bullets: [
          "In header search (`Search modules`), type `Billing`, open the landing page, and choose `Plans`.",
          "Review recommended and available plans before selecting an upgrade path.",
          "Align plan scope with team size, operation complexity, and growth stage.",
        ],
        expectedResult: "You start billing decisions with clear context and fewer mistakes.",
      },
      {
        title: "Compare plans with operational criteria",
        summary: "Evaluate each plan using real operational needs instead of price only.",
        bullets: [
          "Prioritize features that are critical to your current delivery workflow.",
          "Estimate near-term growth to avoid under-sizing the selected plan.",
          "Use predictable cost vs expected value as the final selection criterion.",
        ],
        expectedResult: "Plan selection becomes strategic and reduces rework.",
      },
      {
        title: "Execute checkout with discipline",
        summary: "Use Checkout to complete billing updates with order and payment validation.",
        bullets: [
          "From Billing landing, choose `Checkout` after confirming plan selection.",
          "Review order summary and payment details before confirming.",
          "Avoid duplicate submissions by waiting for final checkout status feedback.",
        ],
        expectedResult: "Payment flow completes with lower risk of billing errors.",
      },
      {
        title: "Validate entitlement activation",
        summary: "Confirm that access changes are active right after checkout.",
        bullets: [
          "Re-open Billing and verify the current plan state after payment.",
          "Open Users profile and confirm plan and token-related indicators are updated.",
          "Validate that key module access reflects the selected plan scope.",
        ],
        expectedResult: "Your team starts using the purchased plan without activation gaps.",
      },
      {
        title: "Handle payment issues without confusion",
        summary: "Apply a simple fallback routine whenever checkout or confirmation fails.",
        bullets: [
          "If checkout fails, review payment data and retry once with corrected inputs.",
          "Refresh Billing state before reattempting to avoid duplicated operations.",
          "Escalate unresolved payment inconsistencies with timestamped evidence.",
        ],
        expectedResult: "Payment incidents are resolved faster with less operational impact.",
      },
      {
        title: "Run a monthly billing governance routine",
        summary: "Review plan fit and cost efficiency every month.",
        bullets: [
          "Check if current plan still matches team usage and business goals.",
          "Track token and feature adoption to anticipate upgrades with lead time.",
          "Document billing decisions and align stakeholders on next-cycle adjustments.",
        ],
        expectedResult: "Billing becomes predictable and aligned with sustainable growth.",
      },
    ],
  },
  {
    id: "clients",
    title: "Clients",
    subtitle: "Manage clients and relationships",
    slides: [
      {
        title: "Build a clean customer base",
        summary: "Centralize contact and profile data to support sales and service delivery.",
        bullets: [
          "In header search (`Search modules`), type `Clients`, open the landing page, and choose `Services catalog`.",
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
    slides: [
      {
        title: "Set your business foundation",
        summary: "Configure company identity and operational baseline once and reuse everywhere.",
        bullets: [
          "In header search (`Search modules`), type `Company`, open the landing page, and choose `Company setup`.",
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
    slides: [
      {
        title: "Get your operational pulse",
        summary: "Use KPIs to understand performance at a glance.",
        bullets: [
          "In header search (`Search modules`), type `Dashboard`, open the landing page, and choose `Overview`.",
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
    slides: [
      {
        title: "Start in Finance overview",
        summary: "Start from Finance landing and open Overview to read KPI direction before operational details.",
        bullets: [
          "In header search (`Search modules`), type `Finance`, open the landing page, and choose `Overview`.",
          "Define period and grouping filters in the overview screen.",
          "Switch views to compare overview cards, services, cashflow, and insights.",
          "Validate revenue, expense, profit, and margin before taking action.",
        ],
        expectedResult: "Your analysis starts from a reliable financial baseline.",
      },
      {
        title: "Register transactions in Entries",
        summary: "Use Entries to keep inflows and outflows updated with operational reality.",
        bullets: [
          "From Finance landing, open `Entries` and create income/expense records with clear descriptions.",
          "Review list history to confirm amount, type, and date consistency.",
          "Correct wrong entries quickly to avoid dashboard distortion.",
        ],
        expectedResult: "Cashflow and reports stay trustworthy for decision making.",
      },
      {
        title: "Analyze services performance",
        summary: "Use Services performance to identify which services are driving revenue and margin pressure.",
        bullets: [
          "From Finance landing, open `Services performance` to compare top services by financial outcome.",
          "Prioritize high-volume services when testing pricing adjustments.",
          "Cross-check low-margin services with work-order execution complexity.",
        ],
        expectedResult: "You focus optimization efforts where impact is higher.",
      },
      {
        title: "Apply pricing suggestions with context",
        summary: "Use Suggestions to convert recommendations into controlled pricing changes.",
        bullets: [
          "From Finance landing, open `Suggestions` and review recommendation rationale before applying.",
          "Use confidence and impact clues to avoid aggressive margin reductions.",
          "Roll out changes by priority and monitor post-change behavior in entries.",
        ],
        expectedResult: "Pricing changes become safer and more data-driven.",
      },
      {
        title: "Turn insights into an action queue",
        summary: "Use actionable insights to decide what to execute this week first.",
        bullets: [
          "From Finance overview, switch the view to `Insights` for prioritized recommendations.",
          "Translate each insight into a concrete owner and deadline.",
          "Track whether each action improved margin, cashflow, or cost behavior.",
        ],
        expectedResult: "Insights stop being static reports and become execution tasks.",
      },
      {
        title: "Run a weekly finance operating ritual",
        summary: "Close the loop with work-order, schedule, and growth modules every week.",
        bullets: [
          "Compare cashflow risks with due work in Work order and Schedule modules.",
          "Align campaign decisions in Growth with available margin and capacity.",
          "Document decisions and revisit KPI trend movement in the next cycle.",
        ],
        expectedResult: "Finance becomes a steering system for all operational modules.",
      },
    ],
  },
  {
    id: "growth",
    title: "Growth",
    subtitle: "Retention, reactivation, and revenue recovery",
    slides: [
      {
        title: "Open Growth Autopilot as your execution board",
        summary: "Start from Growth landing and open Growth autopilot to centralize operational signals.",
        bullets: [
          "In header search (`Search modules`), type `Growth`, open the landing page, and choose `Growth autopilot`.",
          "Confirm opportunities, playbooks, and source tags in the hero section.",
          "Use this board as the default place to plan retention and reactivation actions.",
          "Refresh data before dispatch to avoid acting on stale opportunity status.",
        ],
        expectedResult: "Your team works from one prioritized growth queue.",
      },
      {
        title: "Prioritize opportunities before dispatch",
        summary: "Use the Opportunities tab to filter, select, and dispatch only high-impact opportunities.",
        bullets: [
          "In `Opportunities`, filter by status and source module to reduce noise.",
          "Use search to find specific clients before sending campaigns.",
          "Select opportunities in batch and dispatch with an enabled playbook.",
        ],
        expectedResult: "Dispatch volume increases without sacrificing prioritization quality.",
      },
      {
        title: "Configure playbooks by objective",
        summary: "Define goals, channels, and cadence in Playbooks for repeatable campaigns.",
        bullets: [
          "In Growth autopilot, switch to the `Playbooks` tab to configure retention, upsell, and recovery logic.",
          "Set channels (WhatsApp, email, SMS), delay, and max touches per playbook.",
          "Keep only high-quality enabled playbooks to avoid poor dispatch outcomes.",
        ],
        expectedResult: "Campaign execution becomes standardized and easier to scale.",
      },
      {
        title: "Measure impact in Attribution",
        summary: "Use Attribution to validate dispatch performance and revenue recovery.",
        bullets: [
          "In Growth autopilot, switch to the `Attribution` tab to monitor dispatched, converted, and recovered revenue.",
          "Check conversion rate and pipeline mix before changing playbook rules.",
          "Track average recovery timing to improve campaign cadence decisions.",
        ],
        expectedResult: "You optimize growth tactics with measurable outcome feedback.",
      },
      {
        title: "Use cross-module context before contacting clients",
        summary: "Validate client and operational context to avoid generic or mistimed campaigns.",
        bullets: [
          "Use header search to open `Clients` landing and then choose `Client 360` for relationship timeline context.",
          "Use header search to open `Schedule` and `Work order` landings before reviewing each module execution menu.",
          "Validate financial relevance in Finance overview before prioritizing upsell or recovery.",
        ],
        expectedResult: "Campaigns become more relevant and conversion quality improves.",
      },
      {
        title: "Run a weekly growth review cycle",
        summary: "Create a repeatable process to update pipeline, playbooks, and attribution targets.",
        bullets: [
          "Start with Opportunities, then tune Playbooks, and close on Attribution results.",
          "Define thresholds for conversion rate and recovered revenue by period.",
          "Capture learnings and apply updates to the next dispatch cycle.",
        ],
        expectedResult: "Growth performance improves with consistent operating cadence.",
      },
    ],
  },
  {
    id: "inventory",
    title: "Inventory",
    subtitle: "Stock and supplies control",
    slides: [
      {
        title: "Structure your inventory",
        summary: "Create a clean catalog with stock semantics your team can trust.",
        bullets: [
          "In header search (`Search modules`), type `Inventory`, open the landing page, and choose `Stock items`.",
          "Register items with clear identifiers",
          "Define categories and stock locations",
          "Keep minimum levels updated",
        ],
        expectedResult: "Your stock base becomes reliable.",
      },
      {
        title: "Manage products as an operational catalog",
        summary: "Use the Products tab to maintain item quality and actionability.",
        bullets: [
          "Create and edit products with SKU, category, stock, and minimum stock data.",
          "Use entry/exit actions directly on each product row for fast corrections.",
          "Keep inactive or obsolete items controlled to avoid reporting noise.",
        ],
        expectedResult: "Catalog quality improves and operational errors decrease.",
      },
      {
        title: "Track critical indicators and alerts",
        summary: "Use indicators and alert tabs to prevent stock-related disruptions.",
        bullets: [
          "Monitor low stock, out-of-stock, and total stock value indicators.",
          "Review operational alerts with severity to prioritize response.",
          "Use purchase suggestions to plan replenishment before shortages escalate.",
        ],
        expectedResult: "You reduce stockouts and improve replenishment timing.",
      },
      {
        title: "Use movement ledger for auditing",
        summary: "Inspect stock movement history to validate quantity changes and root causes.",
        bullets: [
          "Open Movement Ledger and review date windows for recent stock activity.",
          "Check direction, source, balance, and reason fields for each movement.",
          "Use ledger evidence to correct process gaps and improve traceability.",
        ],
        expectedResult: "Inventory control becomes auditable and easier to govern.",
      },
      {
        title: "Organize categories and naming standards",
        summary: "Use Categories to keep catalog grouping and reporting consistency.",
        bullets: [
          "From Inventory landing, open `Categories` to create and maintain taxonomy.",
          "Apply naming standards so teams classify items consistently.",
          "Deactivate categories carefully to avoid orphaned product context.",
        ],
        expectedResult: "Classification consistency improves analytics and daily execution.",
      },
      {
        title: "Configure policy in Inventory settings",
        summary: "Set workspace defaults and validation rules once for all users.",
        bullets: [
          "From Inventory landing, open `Settings` to configure required fields and defaults.",
          "Adjust movement policy and alert thresholds according to operation reality.",
          "Review settings after process changes to keep behavior consistent across teams.",
        ],
        expectedResult: "Inventory operations scale with fewer manual corrections.",
      },
      {
        title: "Connect inventory with service execution and finance",
        summary: "Use cross-module context to convert stock data into margin protection.",
        bullets: [
          "Cross-check high-consumption items with Work order execution patterns.",
          "Validate consumption impact against finance trends before changing pricing.",
          "Use weekly review cycles to refine replenishment and usage discipline.",
        ],
        expectedResult: "Inventory decisions protect service continuity and profitability.",
      },
    ],
  },
  {
    id: "people",
    title: "People",
    subtitle: "Team capacity and availability",
    slides: [
      {
        title: "Set weekly availability",
        summary: "Define the weekly capacity baseline for each collaborator in one shared flow.",
        bullets: [
          "In header search (`Search modules`), type `People`, open the landing page, and choose `Team`.",
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
    slides: [
      {
        title: "Start from Company landing to SLA view",
        summary: "Use the SLA report as a structured view of completed schedule workload.",
        bullets: [
          "In header search (`Search modules`), type `Company`, open the landing page, and choose `SLAs`.",
          "Use this report to review employee-level SLA output by selected period.",
          "Treat SLA as an operational monitoring routine, not only a monthly report.",
        ],
        expectedResult: "You establish a reliable starting point for SLA governance.",
      },
      {
        title: "Apply filters with intent",
        summary: "Use employee and date filters to isolate actionable SLA patterns.",
        bullets: [
          "Choose employee scope when validating individual execution consistency.",
          "Set date range windows that match your review cycle cadence.",
          "Use Apply and Reset controls to compare scenarios quickly.",
        ],
        expectedResult: "SLA analysis becomes focused and easier to act on.",
      },
      {
        title: "Interpret the table beyond totals",
        summary: "Use day entries, total hours, and employee distribution to find anomalies.",
        bullets: [
          "Review date and employee concentration to identify overload periods.",
          "Compare total hours across periods to detect sudden execution shifts.",
          "Use empty states as signal to validate filter quality and workflow completeness.",
        ],
        expectedResult: "You extract decision-ready insights instead of raw numbers.",
      },
      {
        title: "Link SLA performance to root causes",
        summary: "Investigate cross-module drivers behind SLA deterioration or volatility.",
        bullets: [
          "Open Schedule module to inspect completion behavior and timeline pressure.",
          "Open Work order module to evaluate queue, priority, and delay concentration.",
          "Open People module to verify capacity and allocation constraints.",
        ],
        expectedResult: "You move from symptom tracking to root-cause resolution.",
      },
      {
        title: "Design corrective actions by employee cluster",
        summary: "Prioritize interventions where SLA variance is highest.",
        bullets: [
          "Group employees by stable, improving, and at-risk SLA patterns.",
          "Define focused actions: training, reallocation, or process simplification.",
          "Track post-action movement in the next reporting cycle.",
        ],
        expectedResult: "SLA improvement actions become measurable and targeted.",
      },
      {
        title: "Run a weekly SLA review ritual",
        summary: "Create a lightweight cadence to prevent SLA drift.",
        bullets: [
          "Review SLA report with leadership and operations at fixed weekly checkpoints.",
          "Register top risks, owners, and due dates for each corrective action.",
          "Revisit outcomes in the next cycle and adjust standards progressively.",
        ],
        expectedResult: "SLA control becomes continuous, consistent, and auditable.",
      },
    ],
  },
  {
    id: "schedule",
    title: "Schedule",
    subtitle: "Appointments and calendar planning",
    slides: [
      {
        title: "Start from the operational calendar",
        summary: "Start from Schedule landing and use Calendar as the source of truth for appointments.",
        bullets: [
          "In header search (`Search modules`), type `Schedule`, open the landing page, and choose `Calendar`.",
          "Pick the right calendar view for your planning horizon.",
          "Check side panel and next events before creating new appointments.",
          "Review today's workload to avoid hidden capacity conflicts.",
        ],
        expectedResult: "You start planning from a realistic and shared agenda.",
      },
      {
        title: "Create events with complete context",
        summary: "Use the event modal to register all critical fields before confirmation.",
        bullets: [
          "Set clear title, time window, and service context when creating an appointment.",
          "Assign collaborators and include details needed for execution handoff.",
          "Use description and additional fields to reduce back-and-forth communication.",
        ],
        expectedResult: "Appointments are actionable and easier for teams to execute.",
      },
      {
        title: "Manage rescheduling and status transitions",
        summary: "Keep schedule quality high when plans change during the day.",
        bullets: [
          "Update time slots quickly when clients or teams request changes.",
          "Use status updates to reflect real execution progress in the calendar.",
          "Avoid duplicated or stale slots by cleaning obsolete events immediately.",
        ],
        expectedResult: "The calendar remains reliable under operational variability.",
      },
      {
        title: "Configure defaults in Schedule settings",
        summary: "Define module behavior once so event creation remains consistent across users.",
        bullets: [
          "From Schedule landing, open `Settings` to configure booking defaults and validation rules.",
          "Set required fields that must exist before confirming an appointment.",
          "Review defaults after process changes to keep teams aligned.",
        ],
        expectedResult: "Event quality improves without extra supervision.",
      },
      {
        title: "Connect schedule with work execution",
        summary: "Bridge appointments with delivery and financial outcomes.",
        bullets: [
          "Use header search to open `Work order` landing and then `Work orders` for execution lifecycle tracking.",
          "Use header search to open `People` landing and then `Team` before confirming high-load days.",
          "Use header search to open `Finance` landing and then `Overview` for planning refinement.",
        ],
        expectedResult: "Planning and execution become one continuous workflow.",
      },
      {
        title: "Adopt a daily calendar review ritual",
        summary: "Use a fixed review cadence to prevent cascading delays.",
        bullets: [
          "Run a start-of-day review for conflicts, priorities, and missing information.",
          "Run an end-of-day review to clean backlog and re-plan blocked items.",
          "Track recurring bottlenecks and adjust scheduling rules proactively.",
        ],
        expectedResult: "You reduce no-shows, rework, and late-day firefighting.",
      },
    ],
  },
  {
    id: "services",
    title: "Services",
    subtitle: "Catalog and pricing",
    slides: [
      {
        title: "Build a structured catalog",
        summary: "Define services with clear scope, pricing, and duration assumptions.",
        bullets: [
          "In header search (`Search modules`), type `Company`, open the landing page, and choose `Services`.",
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
    slides: [
      {
        title: "Start from the Work Orders execution board",
        summary: "Start from Work order landing and use Work orders to filter backlog and prioritize execution.",
        bullets: [
          "In header search (`Search modules`), type `Work order`, open the landing page, and choose `Work orders`.",
          "Use search, risk, status, priority, and date filters in the execution board.",
          "Check `Work orders` and `Operations overview` tabs before dispatching new work.",
          "Use Refresh and Reset controls to keep queue decisions based on current data.",
        ],
        expectedResult: "You prioritize the queue with better operational clarity.",
      },
      {
        title: "Create and edit in the Work Order modal",
        summary: "Use the New work order action or row click to open the full editor modal.",
        bullets: [
          "Click `New work order` to create a new order from scratch.",
          "Click any existing row to open the same modal in edit mode.",
          "Use Clear and Close safely to avoid carrying stale draft values.",
        ],
        expectedResult: "Order creation and editing become faster and standardized.",
      },
      {
        title: "Complete the General tab with execution essentials",
        summary: "Ensure core fields are complete before assigning people and costs.",
        bullets: [
          "Fill title, description, priority, status, requester, and metadata JSON.",
          "Set realistic due dates to avoid hidden SLA pressure later.",
          "Confirm status and requester are correct before saving.",
        ],
        expectedResult: "Each work order has clean baseline data for downstream steps.",
      },
      {
        title: "Assign team and service/inventory lines",
        summary: "Use Team and Lines tabs to define who executes and what will be consumed.",
        bullets: [
          "In `Team`, assign collaborators, roles, and allocated minutes.",
          "In `Lines`, add service lines and inventory lines with quantities and values.",
          "Remove wrong lines early to keep cost and effort calculations reliable.",
        ],
        expectedResult: "Execution capacity and cost structure become explicit per order.",
      },
      {
        title: "Use advanced actions in the editor header",
        summary: "Handle supporting artifacts and automation controls directly from the modal.",
        bullets: [
          "Use `Attachments` after first save to upload evidence files.",
          "Open `Finance entries` when linking execution to billing records.",
          "Open `Billing settings` when automation behavior needs adjustment.",
        ],
        expectedResult: "Operational, documentary, and financial traces stay connected.",
      },
      {
        title: "Configure workflow and guardrails",
        summary: "Maintain status model and module settings so the team follows the same lifecycle.",
        bullets: [
          "From Work order landing, open `Statuses` to create and order workflow stages.",
          "From Work order landing, open `Settings` to review automation and validation rules.",
          "Align terminal statuses with finance automation to avoid duplicate actions.",
        ],
        expectedResult: "Status transitions become predictable and auditable.",
      },
      {
        title: "Monitor execution on timeline and overview",
        summary: "Track delivery risk continuously using calendar and operational summaries.",
        bullets: [
          "From Work order landing, open `Calendar` to visualize workload distribution over time.",
          "Use `Operations overview` to monitor due-soon, overdue, and completion signals.",
          "Run a daily review cycle to rebalance priority before delays escalate.",
        ],
        expectedResult: "You reduce missed deadlines and improve completion discipline.",
      },
    ],
  },
];
