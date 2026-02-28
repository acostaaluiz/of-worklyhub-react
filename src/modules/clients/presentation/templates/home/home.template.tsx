import { ServicesList } from "@modules/clients/presentation/components/services-list/services-list.component";
import {
  ClientsHomeGlobal,
  ClientsHomeShell,
  TemplateShell,
} from "./home.template.styles";

export function ClientsHomeTemplate() {
  return (
    <>
      <ClientsHomeGlobal />
      <ClientsHomeShell
        content={
          <TemplateShell>
            <ServicesList />
          </TemplateShell>
        }
      />
    </>
  );
}

export default ClientsHomeTemplate;
