import { lusitana } from '@/app/fonts';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

export function AuthFormPanel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-lg border border-gray-100 bg-gray-50 px-6 pb-4 pt-8 shadow-sm',
        className
      )}
    >
      {children}
    </div>
  );
}

export function AuthFormTitle({ children }: { children: React.ReactNode }) {
  return <h1 className={`${lusitana.className} mb-1 text-2xl text-gray-900`}>{children}</h1>;
}

export function AuthFormDescription({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 text-sm text-muted-foreground">{children}</p>;
}

export function AuthFormFooterText({ children }: { children: React.ReactNode }) {
  return <p className="mt-4 text-center text-sm text-muted-foreground">{children}</p>;
}

export function AuthFormError({ message }: { message: string }) {
  return (
    <div className="mt-4 flex items-start gap-2 text-sm text-red-500">
      <ExclamationCircleIcon className="mt-0.5 h-5 w-5 shrink-0" />
      <p>{message}</p>
    </div>
  );
}

export const authFieldLabelClassName = 'text-xs font-medium text-gray-900';
export const authFieldInputClassName =
  'peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500';
