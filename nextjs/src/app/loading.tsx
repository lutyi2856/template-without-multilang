/**
 * Loading State для всего приложения
 * 
 * Отображается во время загрузки страниц
 * 
 * @see https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming
 */

export default function Loading() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        {/* Spinner */}
        <div className="relative h-16 w-16">
          <div className="absolute h-full w-full animate-spin rounded-full border-4 border-unident-bgLight border-t-unident-primary"></div>
        </div>
        
        {/* Loading Text */}
        <p className="font-gilroy text-lg text-unident-textGray">
          Загрузка...
        </p>
      </div>
    </div>
  );
}

