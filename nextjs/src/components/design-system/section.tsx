/**
 * Section - секция страницы с настраиваемым padding и background
 * 
 * @example
 * <Section>
 *   <h2>Section Title</h2>
 * </Section>
 * 
 * @example с вариантами
 * <Section variant="primary" spacing="lg">
 *   <h2>Section with primary background</h2>
 * </Section>
 */

import { cn } from '@/lib/utils';

interface SectionProps {
  children: React.ReactNode;
  variant?: 'default' | 'none' | 'primary' | 'secondary' | 'muted';
  spacing?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  as?: 'section' | 'div' | 'article' | 'aside';
  /** Якорь для навигации (например id="reviews" для /#reviews) */
  id?: string;
}

const variantClasses = {
  default: 'bg-background text-foreground',
  /** Без фона — для кастомного background через className (например градиент hero) */
  none: 'text-foreground',
  primary: 'bg-primary text-primary-foreground',
  secondary: 'bg-secondary text-secondary-foreground',
  muted: 'bg-muted text-muted-foreground',
};

const spacingClasses = {
  none: '',
  sm: 'py-8 md:py-12',
  md: 'py-12 md:py-16',
  lg: 'py-16 md:py-24',
  xl: 'py-24 md:py-32',
};

export function Section({
  children,
  variant = 'default',
  spacing = 'md',
  className,
  as: Component = 'section',
  id,
}: SectionProps) {
  return (
    <Component
      id={id}
      className={cn(
      variantClasses[variant],
      spacingClasses[spacing],
      className
    )}>
      {children}
    </Component>
  );
}

