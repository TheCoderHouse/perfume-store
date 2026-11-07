import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-[100svh] place-items-center px-5 text-center">
      <div>
        <p className="eyebrow mb-6">Error 404</p>
        <h1 className="display text-7xl italic sm:text-9xl">Scent lost.</h1>
        <p className="mt-6 text-sm opacity-75">The page you were following has evaporated.</p>
        <Link href="/" className="btn mt-10">Return home</Link>
      </div>
    </div>
  );
}
