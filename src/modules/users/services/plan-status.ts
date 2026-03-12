type ProfileLike = {
  planId?: number | null;
  planStatus?: string | null;
} | null | undefined;

export function isActivePlan(profile: ProfileLike): boolean {
  const status = String(profile?.planStatus ?? "").trim().toUpperCase();
  if (status === "ACTIVE-PLAN") return true;
  if (status === "INACTIVE-PLAN") return false;
  return typeof profile?.planId === "number" && Number.isFinite(profile.planId);
}

