import PublicPageClient from './PublicPageClient';

export async function generateStaticParams() {
  return [];
}

export const dynamic = 'force-dynamic';

export default function PublicPage() {
  return <PublicPageClient />;
}
