import { cn } from '@/lib/utils';

export function ProgressDots({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  return (
    <div
      role="progressbar"
      aria-valuenow={current}
      aria-valuemin={1}
      aria-valuemax={total}
      aria-label={`Paso ${current} de ${total}`}
      className="flex gap-2 justify-center mb-6"
    >
      {Array.from({ length: total }, (_, i) => i + 1).map((n) => (
        <span
          key={n}
          data-state={n === current ? 'current' : n < current ? 'done' : 'pending'}
          className={cn(
            'h-2 w-2 rounded-full',
            n === current
              ? 'bg-luma-700'
              : n < current
                ? 'bg-luma-400'
                : 'bg-luma-200',
          )}
        />
      ))}
    </div>
  );
}
