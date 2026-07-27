'use client';

import { HTMLAttributes, ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

export function Card({ className, ...props }: HTMLMotionProps<'div'>) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      whileHover={{ y: -1 }}
      className={cn('surface-card p-5', className)}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('mb-4 flex items-start justify-between', className)}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('text-subtitle text-foreground', className)} {...props} />
  );
}

export function CardDescription({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-body', className)} {...props} />;
}

export function CardContent({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('space-y-3', className)} {...props} />;
}

export function MetricCard({
  title,
  value,
  trend,
  icon,
  tone = 'default',
}: {
  title: string;
  value: string;
  trend?: string;
  icon?: ReactNode;
  tone?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}) {
  const toneClass = {
    default: 'bg-muted text-muted-foreground',
    success: 'bg-success/15 text-success',
    warning: 'bg-warning/15 text-warning',
    danger: 'bg-danger/15 text-danger',
    info: 'bg-info/15 text-info',
  }[tone];

  return (
    <Card className="p-4">
      <CardHeader className="mb-3 items-center">
        <CardDescription className="text-caption">{title}</CardDescription>
        {icon && (
          <span
            className={cn(
              'inline-flex size-8 items-center justify-center rounded-md',
              toneClass,
            )}
          >
            {icon}
          </span>
        )}
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold tracking-tight text-foreground">
          {value}
        </p>
        {trend && <p className="text-caption">{trend}</p>}
      </CardContent>
    </Card>
  );
}
