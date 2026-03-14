/**
 * Card - универсальный компонент карточки с preset стилями УниДент
 * 
 * Обертка над shadcn/ui Card с предустановленными вариантами
 * для стиля УниДент (скругления, границы, тени).
 * 
 * @example Карточка с границей (default)
 * <Card variant="bordered">
 *   <Heading level={3}>Заголовок</Heading>
 *   <Text>Содержимое карточки</Text>
 * </Card>
 * 
 * @example Карточка без границы
 * <Card variant="default">
 *   Содержимое
 * </Card>
 * 
 * @example Карточка с тенью
 * <Card variant="elevated">
 *   Содержимое с тенью
 * </Card>
 * 
 * @example С дополнительными стилями
 * <Card variant="bordered" className="hover:shadow-lg transition-shadow">
 *   Интерактивная карточка
 * </Card>
 */

import { Card as ShadcnCard } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface CardProps extends React.ComponentProps<typeof ShadcnCard> {
  variant?: 'default' | 'bordered' | 'elevated';
}

const cardVariants = {
  default: 'bg-white rounded-[25px] p-6',
  bordered: 'bg-white border-2 border-unident-borderGray rounded-[25px] p-6',
  elevated: 'bg-white rounded-[25px] p-6 shadow-lg',
};

export function Card({ variant = 'bordered', className, ...props }: CardProps) {
  return (
    <ShadcnCard className={cn(cardVariants[variant], className)} {...props} />
  );
}
