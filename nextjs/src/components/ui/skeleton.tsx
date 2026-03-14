/**
 * Skeleton компонент для loading states
 * 
 * Используется для отображения заглушек во время загрузки контента
 */

import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-unident-bgLight',
        className
      )}
      {...props}
    />
  );
}

/**
 * Skeleton для текста
 */
interface SkeletonTextProps {
  lines?: number;
  className?: string;
}

export function SkeletonText({ lines = 3, className }: SkeletonTextProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-4',
            i === lines - 1 ? 'w-3/4' : 'w-full'
          )}
        />
      ))}
    </div>
  );
}

/**
 * Skeleton для изображения
 */
interface SkeletonImageProps {
  aspectRatio?: 'square' | 'video' | 'portrait';
  className?: string;
}

export function SkeletonImage({ 
  aspectRatio = 'video', 
  className 
}: SkeletonImageProps) {
  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
  };

  return (
    <Skeleton 
      className={cn(
        'w-full',
        aspectClasses[aspectRatio],
        className
      )} 
    />
  );
}

/**
 * Skeleton для кнопки
 */
interface SkeletonButtonProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function SkeletonButton({ 
  size = 'md', 
  className 
}: SkeletonButtonProps) {
  const sizeClasses = {
    sm: 'h-8 w-20',
    md: 'h-10 w-24',
    lg: 'h-12 w-32',
  };

  return (
    <Skeleton 
      className={cn(
        'rounded-lg',
        sizeClasses[size],
        className
      )} 
    />
  );
}

/**
 * Skeleton для аватара
 */
interface SkeletonAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function SkeletonAvatar({ 
  size = 'md', 
  className 
}: SkeletonAvatarProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24',
  };

  return (
    <Skeleton 
      className={cn(
        'rounded-full',
        sizeClasses[size],
        className
      )} 
    />
  );
}

/**
 * Skeleton для карточки
 */
interface SkeletonCardProps {
  className?: string;
}

export function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <div className={cn('rounded-lg border border-unident-borderGray bg-white p-4', className)}>
      <SkeletonImage className="mb-4" />
      <Skeleton className="mb-2 h-6 w-3/4" />
      <SkeletonText lines={2} />
      <div className="mt-4 flex gap-2">
        <SkeletonButton />
        <SkeletonButton />
      </div>
    </div>
  );
}

