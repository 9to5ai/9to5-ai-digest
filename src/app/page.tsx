import { getLatestDigest } from "@/lib/digests";
import Link from "next/link";

export const dynamic = "force-static";
export const revalidate = 3600;

export default async function Home() {
  const digest = await getLatestDigest();

  if (!digest) {
    return (
      <div className="text-center py-20">
        <h1 className="text-3xl font-bold mb-4">🚀 9to5 AI Daily Digest</h1>
        <p className="text-gray-500">No digests yet. Check back tomorrow at 6am AEDT.</p>
      </div>
    );
  }

  return (
    <article>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 font-mono">{digest.date}</p>
        </div>
        <Link href="/archive" className="text-sm text-gray-500 hover:text-blue-400 transition">
          View Archive →
        </Link>
      </div>
      <div
        className="digest-content"
        dangerouslySetInnerHTML={{ __html: digest.contentHtml }}
      />
    </article>
  );
}
