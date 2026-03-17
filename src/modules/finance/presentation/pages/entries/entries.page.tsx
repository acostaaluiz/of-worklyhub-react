import React from "react";

import { i18n as appI18n } from "@core/i18n";
import { BasePage } from "@shared/base/base.page";
import { EntriesTemplate } from "@modules/finance/presentation/templates/entries/entries.template";
import { companyService } from "@modules/company/services/company.service";

export class EntriesPage extends BasePage {
  protected override options = {
    title: `${appI18n.t("finance.pageTitles.entries")} | WorklyHub`,
    requiresAuth: true,
  };

  protected override renderPage(): React.ReactNode {
    const ws = companyService.getWorkspaceValue() as { workspaceId?: string; id?: string } | null;
    const workspaceId = (ws?.workspaceId ?? ws?.id) as string | undefined;
    return <EntriesTemplate workspaceId={workspaceId} />;
  }
}

export default EntriesPage;
