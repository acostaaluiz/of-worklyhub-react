$BaseDir=".\src\modules\finance";

$ErrorActionPreference="Stop";

function Ensure-Dir([string]$Path){ if(-not (Test-Path -LiteralPath $Path)){ New-Item -ItemType Directory -Path $Path | Out-Null } }
function Ensure-File([string]$Path){ $dir=Split-Path -Parent $Path; Ensure-Dir $dir; if(-not (Test-Path -LiteralPath $Path)){ New-Item -ItemType File -Path $Path | Out-Null } }

Write-Host "Creating Finance module structure at: $BaseDir";

Ensure-Dir $BaseDir;

@(
  "interfaces\finance-groupby.model.ts",
  "interfaces\finance-kpi.model.ts",
  "interfaces\finance-query.model.ts",
  "interfaces\finance-response.model.ts",
  "interfaces\finance-series.model.ts",
  "interfaces\finance-table.model.ts",

  "services\finance.service.ts",

  "presentation\components\finance-filters\finance-filters.component.styles.ts",
  "presentation\components\finance-filters\finance-filters.component.tsx",

  "presentation\components\finance-kpi-row\finance-kpi-row.component.styles.ts",
  "presentation\components\finance-kpi-row\finance-kpi-row.component.tsx",

  "presentation\components\widgets\finance-widgets.shared.styles.ts",
  "presentation\components\widgets\revenue-trend\revenue-trend.widget.tsx",
  "presentation\components\widgets\expenses-breakdown\expenses-breakdown.widget.tsx",
  "presentation\components\widgets\profit-trend\profit-trend.widget.tsx",
  "presentation\components\widgets\cashflow-table\cashflow-table.widget.tsx",
  "presentation\components\widgets\top-services-table\top-services-table.widget.tsx",

  "pages\finance\finance.page.tsx",

  "stacks\finance.stack.tsx",

  "templates\finance\finance.template.styles.ts",
  "templates\finance\finance.template.tsx"
) | ForEach-Object { Ensure-File (Join-Path $BaseDir $_) };

Write-Host "Done.";
Write-Host "Created folders and empty files under: $BaseDir";
