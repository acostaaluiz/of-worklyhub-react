import styled from "styled-components";

export const LaunchServicesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-3);

  .ant-form-item {
    margin-bottom: 0;
  }

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;
