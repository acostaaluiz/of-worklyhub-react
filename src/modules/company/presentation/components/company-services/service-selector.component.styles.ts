import styled from "styled-components";

export const SelectorShell = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

export const SelectorFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0 0 0;

  @media (max-width: 768px) {
    flex-wrap: wrap;
    gap: var(--space-2);
  }
`;

export default SelectorShell;
