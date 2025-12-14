import styled from "styled-components";

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: var(--space-4);
  align-items: stretch;

  @media (max-width: 768px) {
    grid-template-columns: repeat(6, minmax(0, 1fr));
  }

  @media (max-width: 480px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`;

export const LeftPanel = styled.section`
  grid-column: span 7 / span 7;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  background: var(--gradient-auth-hero);
  box-shadow: var(--shadow-md);
  overflow: hidden;
  padding: var(--space-8);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 520px;

  @media (max-width: 768px) {
    grid-column: span 6 / span 6;
    min-height: 420px;
    padding: var(--space-7);
  }

  @media (max-width: 480px) {
    grid-column: span 4 / span 4;
    padding: var(--space-6);
  }
`;

export const RightPanel = styled.section`
  grid-column: span 5 / span 5;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 768px) {
    grid-column: span 6 / span 6;
  }

  @media (max-width: 480px) {
    grid-column: span 4 / span 4;
  }
`;

export const BrandRow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
`;

export const BrandMark = styled.div`
  width: 44px;
  height: 44px;
  border-radius: var(--radius-sm);
  background: var(--color-tertiary);
  color: var(--on-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  letter-spacing: 0.4px;
`;

export const BrandTitle = styled.div`
  font-size: var(--font-size-lg);
  font-weight: 900;
  line-height: var(--line-height-tight);
`;

export const BrandSubtitle = styled.div`
  margin-top: 2px;
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
`;

export const Hero = styled.div`
  margin-top: var(--space-6);
`;

export const HeroTitle = styled.h1`
  margin: 0;
  font-size: 30px;
  font-weight: 900;
  line-height: 1.15;
  color: var(--color-text);

  @media (max-width: 480px) {
    font-size: 24px;
  }
`;

export const HeroDescription = styled.p`
  margin: var(--space-3) 0 0;
  max-width: 520px;
  color: var(--color-text-muted);
  line-height: var(--line-height-relaxed);
`;

export const TipCard = styled.div`
  margin-top: var(--space-8);
  padding: var(--space-5);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-divider);
  background: var(--color-glass-surface);
`;

export const TipText = styled.div`
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
`;
