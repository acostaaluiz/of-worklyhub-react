import styled from "styled-components";

export const ServicesPageStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: 16px;
  animation: motion-fade-up var(--motion-duration-enter)
    var(--motion-ease-standard) both;

  @media (max-width: 1024px) {
    padding: 12px;
    gap: var(--space-3);
  }
`;
