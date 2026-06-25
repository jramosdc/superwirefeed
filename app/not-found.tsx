import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <p className="text-6xl font-extrabold text-brand">404</p>
      <h1 className="mt-4 text-xl font-bold">Page not found</h1>
      <p className="mt-2 text-zinc-600">
        The feed or post you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link href="/feeds" className="btn-primary mt-6">
        Browse feeds
      </Link>
    </div>
  );
}
