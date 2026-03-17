import Link from 'next/link';

export default function StudentCatchAllPage({ params }: { params: { slug?: string[] } }) {
  const slug = params.slug?.join('/') ?? '';
  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">Coming soon</h1>
      <p className="text-sm text-muted-foreground">
        This Student page isn’t implemented yet.
        {slug ? <> (<span className="font-mono">/student/{slug}</span>)</> : null}
      </p>
      <Link href="/student/dashboard" className="text-sm font-medium text-primary hover:underline">
        Back to dashboard
      </Link>
    </div>
  );
}

