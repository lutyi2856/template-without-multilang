/**
 * Skeleton для карточки поста/новости
 * 
 * Используется при загрузке данных постов
 */

import { 
  Skeleton, 
  SkeletonImage, 
  SkeletonText,
  SkeletonAvatar,
} from '@/components/ui/skeleton';

export function PostCardSkeleton() {
  return (
    <article className="overflow-hidden rounded-lg border border-unident-borderGray bg-white transition-shadow hover:shadow-lg">
      {/* Featured Image */}
      <SkeletonImage aspectRatio="video" />
      
      {/* Content */}
      <div className="p-6">
        {/* Category Badge */}
        <Skeleton className="mb-3 h-6 w-24 rounded-full" />
        
        {/* Title */}
        <Skeleton className="mb-3 h-7 w-full" />
        <Skeleton className="mb-3 h-7 w-3/4" />
        
        {/* Excerpt */}
        <SkeletonText lines={3} className="mb-4" />
        
        {/* Meta Info */}
        <div className="flex items-center justify-between border-t border-unident-borderGray pt-4">
          {/* Author */}
          <div className="flex items-center gap-2">
            <SkeletonAvatar size="sm" />
            <div className="space-y-1">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          
          {/* Read More Link */}
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </article>
  );
}

/**
 * Skeleton для списка постов
 */
interface PostsSkeletonProps {
  count?: number;
  layout?: 'grid' | 'list';
}

export function PostsSkeleton({ 
  count = 6, 
  layout = 'grid' 
}: PostsSkeletonProps) {
  return (
    <div className={
      layout === 'grid' 
        ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3'
        : 'space-y-6'
    }>
      {Array.from({ length: count }).map((_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  );
}

