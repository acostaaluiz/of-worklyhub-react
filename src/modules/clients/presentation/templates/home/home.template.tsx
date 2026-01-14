
import { BaseTemplate } from "@shared/base/base.template";
import { ServicesList } from "@modules/clients/presentation/components/services-list/services-list.component";
import { TemplateShell } from "./home.template.styles";


export function ClientsHomeTemplate() {
  return (
    <BaseTemplate
      content={
        <>
          <TemplateShell>
            <h2>Serviços disponíveis</h2>
            <p>Consulte os serviços oferecidos pelas empresas cadastradas.</p>
            <ServicesList />
          </TemplateShell>
        </>
      }
    />
  );
}

export default ClientsHomeTemplate;
