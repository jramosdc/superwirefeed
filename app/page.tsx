import Link from "next/link";

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="border-b border-zinc-200 bg-gradient-to-b from-white to-zinc-50">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            A wire service{" "}
            <span className="text-brand">anyone</span> can publish to.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-zinc-600">
            Sell your content for republication with clear legal rights, fast
            payments, and ratings that surface reliable sources.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link
              href="/register"
              className="rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-dark"
            >
              Start your feed
            </Link>
            <Link
              href="/feeds"
              className="rounded-full border border-zinc-300 px-6 py-3 text-sm font-semibold hover:bg-zinc-100"
            >
              Browse feeds
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-5xl px-4 py-16">
        <div className="grid gap-8 sm:grid-cols-3">
          {[
            {
              t: "Publish content",
              d: "Post articles, datasets, images and documents to your own feed under the license you choose.",
            },
            {
              t: "Set the rights",
              d: "From free Creative Commons to paid attribution or exclusive licenses — buyers always know their rights.",
            },
            {
              t: "Get paid & rated",
              d: "Buyers pay securely to unlock downloads. Reviews and follows surface the most reliable sources.",
            },
          ].map((c) => (
            <div key={c.t} className="rounded-xl border border-zinc-200 bg-white p-6">
              <h3 className="text-lg font-bold">{c.t}</h3>
              <p className="mt-2 text-sm text-zinc-600">{c.d}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
