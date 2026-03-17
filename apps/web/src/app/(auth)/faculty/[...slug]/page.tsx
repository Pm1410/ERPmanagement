import Link from 'next/link';

export default function FacultyCatchAllPage({ params }: { params: { slug?: string[] } }) {
  const slug = params.slug?.join('/') ?? '';
  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">Coming soon</h1>
      <p className="text-sm text-muted-foreground">
        This Faculty page isn’t implemented yet.
        {slug ? <> (<span className="font-mono">/faculty/{slug}</span>)</> : null}
      </p>
      <Link href="/faculty/dashboard" className="text-sm font-medium text-primary hover:underline">
        Back to dashboard
      </Link>
    </div>
  );
}

