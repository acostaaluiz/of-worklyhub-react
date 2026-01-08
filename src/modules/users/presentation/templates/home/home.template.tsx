import React from "react";
import { PrivateFrameLayout } from "@shared/ui/layout/private-frame/private-frame.component";
import ServicesCards from "@modules/users/presentation/components/home/services-cards.component";
import MetricsCards from "@modules/users/presentation/components/home/metrics-cards.component";
import { Briefcase, Box, Calendar } from "lucide-react";

type ServiceItem = { id: string; title: string; subtitle?: string; icon?: React.ReactNode };

type Props = {
  name?: string;
  companyName?: string;
  services: ServiceItem[];
  metrics?: { appointmentsToday: number; revenueThisMonthCents?: number | null; nextAppointment?: { title?: string; date?: string; time?: string } };
  description?: string;
  onEditCompany?: () => void;
};

function initialsFrom(name?: string) {
  if (!name) return "—";
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function UsersHomeTemplate({ name, companyName, services, metrics, description, onEditCompany }: Props) {
  const initials = initialsFrom(companyName);

  return (
    <PrivateFrameLayout>
      <div style={{ padding: 12, marginBottom: 12, borderBottom: "1px solid var(--color-divider)", display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 64, height: 64, borderRadius: 12, background: "linear-gradient(135deg,var(--color-surface-2),var(--color-surface))", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ width: 48, height: 48, borderRadius: 10, background: "var(--color-surface)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>{initials}</div>
        </div>

        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0 }}>{name ? `Welcome, ${name}` : "Welcome"}</h2>
          <p style={{ marginTop: 8, marginBottom: 0, color: "var(--color-text-muted)" }}>
            Use the quick modules below to start managing your business. You can view clients, handle
            payments, manage your schedule and keep your services catalog up to date.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button onClick={onEditCompany} style={{ background: "var(--color-primary)", color: "var(--on-primary)", border: "none", padding: "8px 12px", borderRadius: 8, cursor: "pointer" }}>
            Edit company
          </button>
        </div>
      </div>

      {/* Metrics section */}
      <div style={{ padding: 12, marginBottom: 16 }}>
        <div>
          <h3 style={{ margin: 0 }}>Indicators</h3>
          <p style={{ margin: "8px 0 0", color: "var(--color-text-muted)" }}>Key metrics for today and upcoming appointments.</p>
        </div>

        <div style={{ marginBottom: 12, marginTop: 12 }}>
          {metrics ? (
            <MetricsCards
              appointmentsToday={metrics.appointmentsToday}
              revenueThisMonthCents={metrics.revenueThisMonthCents}
              nextAppointment={metrics.nextAppointment}
            />
          ) : (
            <div style={{ minHeight: 84 }} />
          )}
        </div>
        <div style={{ height: 1, background: "var(--color-divider)", margin: "12px 0" }} />
      </div>

      {/* Company info section */}
      <div style={{ padding: 12, marginBottom: 16 }}>
        <div>
          <h3 style={{ margin: 0 }}>Company</h3>
          <p style={{ margin: "8px 0 0", color: "var(--color-text-muted)" }}>Overview of your company and quick actions.</p>
        </div>

        <div style={{ display: "flex", gap: 12, marginBottom: 12, flexWrap: "wrap", marginTop: 12 }}>
          <div className="surface" style={{ padding: 12, minWidth: 220, flex: "1 0 220px", display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "var(--color-surface-2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Briefcase size={18} />
            </div>
            <div>
              <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginBottom: 6 }}>Company</div>
              <div style={{ fontWeight: 600 }}>{companyName ?? "—"}</div>
              {description ? <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 6 }}>{description}</div> : null}
            </div>
          </div>

          <div className="surface" style={{ padding: 12, minWidth: 180, flex: "1 0 180px", display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "var(--color-surface-2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Box size={18} />
            </div>
            <div>
              <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginBottom: 6 }}>Available modules</div>
              <div style={{ fontWeight: 600 }}>{services?.length ?? 0}</div>
            </div>
          </div>

          <div className="surface" style={{ padding: 12, minWidth: 180, flex: "1 0 180px", display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "var(--color-surface-2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Calendar size={18} />
            </div>
            <div>
              <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginBottom: 6 }}>Next steps</div>
              <div style={{ fontWeight: 600 }}>Finish company setup</div>
            </div>
          </div>
        </div>
        <div style={{ height: 1, background: "var(--color-divider)", margin: "12px 0" }} />
      </div>

      <div style={{ padding: 12, paddingTop: 18 }}>
        <h3 style={{ margin: 0 }}>Choose a module to start</h3>
        <p style={{ margin: "8px 0 12px", color: "var(--color-text-muted)" }}>Select a module to begin managing parts of your business.</p>

        <ServicesCards services={services ?? []} />
      </div>
    </PrivateFrameLayout>
  );
}
