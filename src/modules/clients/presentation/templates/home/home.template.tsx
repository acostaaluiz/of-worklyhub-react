
import { BaseTemplate } from "@shared/base/base.template";
import { ServicesList } from "@modules/clients/presentation/components/services-list/services-list.component";
import { TemplateShell } from "./home.template.styles";


export function ClientsHomeTemplate() {
  return (
    <BaseTemplate
      content={
        <>
          <TemplateShell>
            <ServicesList />
          </TemplateShell>
        </>
      }
    />
  );
}

export default ClientsHomeTemplate;
