import { User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

function getInitials(displayName: string): string {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return '?';
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

type UserAvatarProps = {
  imageUrl?: string | null;
  displayName: string;
  className?: string;
  fallbackClassName?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
};

export function UserAvatar({
  imageUrl,
  displayName,
  className,
  fallbackClassName,
  size = 'md',
}: UserAvatarProps) {
  const sizeClass =
    size === 'sm'
      ? 'h-8 w-8'
      : size === 'lg'
        ? 'h-16 w-16'
        : size === 'xl'
          ? 'h-24 w-24'
          : 'h-9 w-9';
  const iconSize = size === 'sm' ? 16 : size === 'xl' ? 32 : size === 'lg' ? 24 : 18;
  const initialsClass =
    size === 'xl' ? 'text-lg' : size === 'lg' ? 'text-sm' : 'text-xs';

  return (
    <Avatar className={cn(sizeClass, className)}>
      {imageUrl ? <AvatarImage src={imageUrl} alt={displayName} /> : null}
      <AvatarFallback className={cn('bg-white/20 text-white', fallbackClassName)}>
        {displayName.trim() ? (
          <span className={cn('font-semibold', initialsClass)}>
            {getInitials(displayName)}
          </span>
        ) : (
          <User size={iconSize} aria-hidden />
        )}
      </AvatarFallback>
    </Avatar>
  );
}
