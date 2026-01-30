import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface MobileCardItemProps {
  title: string;
  subtitle?: string;
  metadata?: ReactNode;
  badges?: ReactNode;
  actions?: ReactNode;
  className?: string;
  onClick?: () => void;
  children?: ReactNode;
}

export function MobileCardItem({
  title,
  subtitle,
  metadata,
  badges,
  actions,
  className,
  onClick,
  children,
}: MobileCardItemProps) {
  return (
    <Card
      className={cn(
        "p-4 space-y-3",
        onClick && "cursor-pointer hover:shadow-md transition-shadow",
        className
      )}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground truncate">{title}</h3>
          {subtitle && (
            <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
          )}
        </div>
        {metadata && (
          <div className="text-sm text-muted-foreground shrink-0">
            {metadata}
          </div>
        )}
      </div>

      {/* Badges */}
      {badges && (
        <div className="flex flex-wrap gap-2">
          {badges}
        </div>
      )}

      {/* Custom content */}
      {children}

      {/* Actions */}
      {actions && (
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
          {actions}
        </div>
      )}
    </Card>
  );
}
