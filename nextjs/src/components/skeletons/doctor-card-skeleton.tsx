/**
 * Skeleton для карточки врача
 * 
 * Используется при загрузке данных врачей
 */

import { 
  Skeleton, 
  SkeletonImage, 
  SkeletonText, 
  SkeletonButton 
} from '@/components/ui/skeleton';

export function DoctorCardSkeleton() {
  return (
    <div className="rounded-[25px] border border-unident-borderGray bg-white p-6">
      {/* Header with image and info */}
      <div className="mb-4 flex gap-4">
        {/* Doctor Image */}
        <SkeletonImage 
          aspectRatio="square"
          className="h-24 w-24 shrink-0 rounded-[15px]"
        />
        
        {/* Info */}
        <div className="flex-1 space-y-2">
          {/* Name */}
          <Skeleton className="h-6 w-full" />
          
          {/* Specialization */}
          <Skeleton className="h-4 w-3/4" />
          
          {/* Badges */}
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        </div>
      </div>

      {/* Description */}
      <SkeletonText lines={3} className="mb-4" />

      {/* Clinic */}
      <div className="mb-4 flex items-center gap-2">
        <Skeleton className="h-5 w-5 rounded" />
        <Skeleton className="h-4 flex-1" />
      </div>

      {/* Button */}
      <SkeletonButton size="lg" className="w-full" />
    </div>
  );
}

/**
 * Skeleton для списка врачей
 */
interface DoctorsSkeletonProps {
  count?: number;
}

export function DoctorsSkeleton({ count = 3 }: DoctorsSkeletonProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <DoctorCardSkeleton key={i} />
      ))}
    </div>
  );
}

