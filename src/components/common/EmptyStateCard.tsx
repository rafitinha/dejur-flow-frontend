import Link from 'next/link';
import { Inbox } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { buttonVariants } from '@/components/ui/Button';

export function EmptyStateCard({
  title,
  description,
  ctaHref,
  ctaLabel,
}: {
  title: string;
  description: string;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  return (
    <Card className="border-dashed p-8 text-center">
      <CardHeader className="mb-3 flex flex-col items-center justify-center gap-3">
        <span className="inline-flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Inbox size={18} />
        </span>
        <CardTitle className="text-title">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <CardDescription>{description}</CardDescription>
        {ctaHref && ctaLabel && (
          <Link
            href={ctaHref}
            className={buttonVariants({ variant: 'outline', size: 'md' })}
          >
            {ctaLabel}
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
