/**
 * Типы для компонента Case (До/После)
 */

export interface CaseData {
  id: string;
  title: string;
  beforeImage: {
    url: string;
    alt: string;
    width: number;
    height: number;
  };
  afterImage: {
    url: string;
    alt: string;
    width: number;
    height: number;
  };
  doctors: Array<{
    id: string;
    name: string;
    specialty: string;
    avatar?: string;
  }>;
  services: Array<{
    id: string;
    name: string;
  }>;
  clinic: {
    id: string;
    name: string;
  };
}

export interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeAlt?: string;
  afterAlt?: string;
  width?: number;
  height?: number;
  className?: string;
}
