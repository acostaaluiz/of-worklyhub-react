import styled, { createGlobalStyle } from "styled-components";
import { BaseTemplate } from "@shared/base/base.template";

export const ClientsHomeGlobal = createGlobalStyle`
  @import url("https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap");
`;

export const ClientsHomeShell = styled(BaseTemplate)`
  height: 100%;
  min-height: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  font-family: "Space Grotesk", var(--font-family-sans);
  overflow: hidden;

  > div {
    flex: 1;
    min-height: 0;
    display: flex;
  }

  > div > div {
    flex: 1;
    min-height: 0;
  }
`;

export const TemplateShell = styled.div`
  position: relative;
  height: 100%;
  max-height: 100%;
  min-height: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-5);
  border-radius: calc(var(--radius-lg) - 4px);
  background:
    radial-gradient(800px 380px at 10% -20%, rgba(30, 112, 255, 0.12), transparent 55%),
    radial-gradient(700px 340px at 90% 0%, rgba(0, 214, 160, 0.14), transparent 55%);
  overflow: hidden;

  @media (max-width: 1024px) {
    padding: var(--space-4);
  }

  @media (max-width: 768px) {
    padding: var(--space-3);
    gap: var(--space-3);
  }

  @media (max-height: 760px) {
    padding: var(--space-3);
    gap: var(--space-3);
  }
`;

export default TemplateShell;
