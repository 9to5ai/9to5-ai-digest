import { getAllDigests } from "@/lib/digests";
import Link from "next/link";

export const dynamic = "force-static";

export default function Archive() {
  const digests = getAllDigests();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">📚 Archive</h1>
      {digests.length === 0 ? (
        <p className="text-gray-500">No digests yet.</p>
      ) : (
        <div className="space-y-3">
          {digests.map((d) => (
            <Link
              key={d.slug}
              href={`/digest/${d.slug}`}
              className="block p-4 rounded-lg border border-gray-800 hover:border-blue-500/50 hover:bg-gray-900/50 transition group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-sm text-gray-500">{d.date}</p>
                  <p className="text-white group-hover:text-blue-400 transition mt-1">{d.title}</p>
                </div>
                <span className="text-gray-600 group-hover:text-blue-400 transition">→</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
