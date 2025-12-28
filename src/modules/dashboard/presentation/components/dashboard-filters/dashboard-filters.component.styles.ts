import styled from "styled-components";
import { Segmented } from "antd";

export const FiltersCard = styled.div`
  padding: var(--space-4);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  min-width: 0;

  @media (max-width: 1024px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const FiltersLeft = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-wrap: wrap;
  min-width: 0;

  .ant-picker {
    height: 36px;
    border-radius: var(--radius-sm);
  }
`;

export const ViewSegment = styled(Segmented)`
  height: 36px;
  padding: 2px;
  border-radius: var(--radius-sm);

  .ant-segmented-item-label {
    height: 32px;
    line-height: 32px;
    padding-inline: 12px;
  }
`;

export const FiltersRight = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-2);
  flex-wrap: wrap;

  .ant-segmented {
    height: 36px;
    padding: 2px;
    border-radius: var(--radius-sm);
  }

  .ant-segmented-item-label {
    height: 32px;
    line-height: 32px;
    padding-inline: 12px;
  }

  .ant-btn {
    height: 36px;
    border-radius: var(--radius-sm);
  }
`;
