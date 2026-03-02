import { getDigest, getAllDigests } from "@/lib/digests";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-static";

export async function generateStaticParams() {
  return getAllDigests().map((d) => ({ slug: d.slug }));
}

export default async function DigestPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const digest = await getDigest(slug);
  if (!digest) notFound();

  return (
    <article>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/archive" className="text-sm text-gray-500 hover:text-blue-400 transition">← Archive</Link>
          <p className="text-sm text-gray-500 font-mono mt-2">{digest.date}</p>
        </div>
        <Link href="/" className="text-sm text-gray-500 hover:text-blue-400 transition">Latest →</Link>
      </div>
      <div
        className="digest-content"
        dangerouslySetInnerHTML={{ __html: digest.contentHtml }}
      />
    </article>
  );
}
