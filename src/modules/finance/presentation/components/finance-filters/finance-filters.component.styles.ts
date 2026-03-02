import styled from "styled-components";

export const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  min-width: 0;

  @media (max-width: 1024px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const Left = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-width: 0;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-2);
  }
`;

export const Right = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-width: 0;
  flex-wrap: wrap;

  @media (max-width: 1024px) {
    justify-content: flex-end;
  }

  @media (max-width: 768px) {
    width: 100%;
    justify-content: flex-start;
    align-items: stretch;
    flex-direction: column;
    gap: var(--space-2);

    .ant-btn {
      width: 100%;
    }
  }
`;

export const PeriodGroup = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-2);
  min-width: 0;

  .label {
    color: var(--color-text-muted);
    font-size: 12px;
    white-space: nowrap;
  }

  @media (max-width: 768px) {
    width: 100%;
    flex-wrap: wrap;
    gap: 6px;

    .label {
      width: 100%;
    }

    .ant-picker {
      width: 100%;
      min-width: 0;
    }
  }
`;

export const SegmentedRail = styled.div`
  min-width: 0;

  .ant-segmented {
    max-width: 100%;
  }

  @media (max-width: 768px) {
    width: 100%;

    .ant-segmented {
      width: 100%;
      min-width: 0;
    }
  }
`;

export const SelectGroup = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-2);
  min-width: 0;

  .label {
    color: var(--color-text-muted);
    font-size: 12px;
    white-space: nowrap;
  }

  @media (max-width: 768px) {
    width: 100%;
    flex-wrap: wrap;
    gap: 6px;

    .label {
      width: 100%;
    }

    .control {
      width: 100%;
      min-width: 0;
    }
  }
`;

export const MobileFiltersBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  min-width: 0;
`;

export const MobileFiltersSummary = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;

  .line {
    min-width: 0;
    font-size: 12px;
    color: var(--color-text-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

export const MobileFiltersActions = styled.div`
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  flex-shrink: 0;
`;

export const MobileDrawerStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  min-width: 0;

  .ant-btn {
    width: 100%;
  }
`;
