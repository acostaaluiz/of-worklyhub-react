import styled from "styled-components";

export const TemplateShell = styled.div`
  padding: var(--space-6);

  @media (max-width: 768px) {
    padding: var(--space-5);
  }

  @media (max-width: 480px) {
    padding: var(--space-4);
  }
`;

export default TemplateShell;
