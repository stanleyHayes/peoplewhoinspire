interface SkeletonProps {
  className?: string;
  tone?: 'light' | 'dark' | 'gold';
}

const skeletonTones: Record<NonNullable<SkeletonProps['tone']>, string> = {
  light: 'bg-gray-200/80',
  dark: 'bg-white/15',
  gold: 'bg-gold-200/50',
};

const dashboardBarHeights = ['h-[45%]', 'h-[70%]', 'h-[52%]', 'h-[86%]', 'h-[62%]', 'h-[94%]', 'h-[58%]', 'h-[76%]'];

export function Skeleton({ className = '', tone = 'light' }: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={`block animate-pulse rounded-lg ${skeletonTones[tone]} ${className}`}
    />
  );
}

export function SkeletonText({
  lines = 3,
  tone = 'light',
  className = '',
}: {
  lines?: number;
  tone?: SkeletonProps['tone'];
  className?: string;
}) {
  return (
    <div className={`space-y-3 ${className}`} aria-hidden="true">
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          tone={tone}
          className={`h-3 ${index === lines - 1 ? 'w-2/3' : 'w-full'}`}
        />
      ))}
    </div>
  );
}

export function AdminTableSkeleton({
  rows = 6,
  columns = 5,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-navy-950/10 bg-white shadow-sm" aria-hidden="true">
      <div className="grid gap-4 border-b border-navy-950/10 bg-gray-50 px-5 py-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={index} className="h-3 w-24" />
        ))}
      </div>
      <div className="divide-y divide-navy-950/10">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="grid gap-4 px-5 py-5"
            style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: columns }).map((_, columnIndex) => (
              <Skeleton
                key={columnIndex}
                className={`h-4 ${columnIndex === 0 ? 'w-32' : columnIndex === columns - 1 ? 'w-20' : 'w-24'}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminCardGridSkeleton({
  count = 6,
  columnsClass = 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3',
}: {
  count?: number;
  columnsClass?: string;
}) {
  return (
    <div className={`grid ${columnsClass} gap-6`} aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="rounded-lg border border-navy-950/10 bg-white p-5 shadow-sm">
          <Skeleton className="mb-5 h-40 w-full" />
          <Skeleton className="mb-3 h-5 w-2/3" />
          <SkeletonText lines={3} />
          <div className="mt-5 flex gap-3">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-10" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function AdminStatsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4" aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="rounded-lg border border-navy-950/10 bg-white p-5 shadow-sm">
          <Skeleton className="mb-4 h-10 w-10 rounded-full" />
          <Skeleton className="mb-3 h-7 w-20" />
          <Skeleton className="h-3 w-28" />
        </div>
      ))}
    </div>
  );
}

export function AdminDashboardSkeleton() {
  return (
    <div className="pwi-admin-page space-y-6" aria-hidden="true">
      <div className="rounded-lg border border-navy-950/10 bg-white p-6 shadow-sm">
        <Skeleton className="mb-4 h-4 w-36" />
        <Skeleton className="mb-3 h-10 w-72 max-w-full" />
        <Skeleton className="h-4 w-full max-w-2xl" />
      </div>
      <AdminStatsSkeleton count={4} />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-lg border border-navy-950/10 bg-white p-6 shadow-sm">
          <Skeleton className="mb-6 h-5 w-44" />
          <div className="flex h-64 items-end gap-3">
            {dashboardBarHeights.map((heightClass) => (
              <Skeleton key={heightClass} className={`flex-1 ${heightClass}`} />
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-navy-950/10 bg-white p-6 shadow-sm">
          <Skeleton className="mb-6 h-5 w-36" />
          <SkeletonText lines={8} />
        </div>
      </div>
      <AdminTableSkeleton rows={5} columns={5} />
    </div>
  );
}

export function PublicCardGridSkeleton({
  count = 3,
  columnsClass = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
}: {
  count?: number;
  columnsClass?: string;
}) {
  return (
    <div className={`grid ${columnsClass} gap-8`} aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="rounded-lg border border-navy-950/10 bg-white p-5 shadow-sm">
          <Skeleton className="mb-5 h-52 w-full" />
          <Skeleton className="mb-3 h-4 w-24" />
          <Skeleton className="mb-3 h-7 w-4/5" />
          <SkeletonText lines={3} />
        </div>
      ))}
    </div>
  );
}

export function PublicArticleSkeleton() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-24 sm:px-6 lg:px-8" aria-hidden="true">
      <Skeleton className="mb-8 h-[360px] w-full" />
      <Skeleton className="mb-5 h-5 w-36" />
      <Skeleton className="mb-5 h-12 w-3/4" />
      <SkeletonText lines={8} />
    </div>
  );
}
