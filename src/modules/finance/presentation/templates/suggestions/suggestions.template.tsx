import { BaseTemplate } from "@shared/base/base.template";
import { ServicesFinanceList } from "@modules/finance/presentation/components/services-finance-list/services-finance-list.component";
import { Grid } from "@modules/users/presentation/templates/login/login.template.styles";
import { FinanceKpis } from "@modules/finance/presentation/components/finance-kpis/finance-kpis.component";
import { Typography } from "antd";
import { Shell, HeaderRow, HeaderText, MainColumn, AsideColumn } from "./suggestions.template.styles";

export function SuggestionsTemplate() {
  return (
    <BaseTemplate
      content={
        <>
          <Shell className="surface">
            <HeaderRow>
              <HeaderText>
                <Typography.Title level={2} style={{ margin: 0 }}>
                  Sugestões de Preço
                </Typography.Title>
                <Typography.Text type="secondary">
                  Recomendações baseadas nos serviços cadastrados.
                </Typography.Text>
              </HeaderText>
            </HeaderRow>

            <Grid>
              <MainColumn>
                <div style={{ margin: "32px 0 24px 0" }}>
                  <FinanceKpis />
                </div>

                <Typography.Title level={5} style={{ marginBottom: 12 }}>
                  Serviços sugeridos
                </Typography.Title>

                <ServicesFinanceList />
              </MainColumn>

              <AsideColumn />
            </Grid>
          </Shell>
        </>
      }
    />
  );
}

export default SuggestionsTemplate;
