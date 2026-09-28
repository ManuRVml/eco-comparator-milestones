import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-surface-page flex flex-col items-center justify-center gap-4 p-8 text-center">
      <span className="text-sm font-semibold tracking-widest text-brand-primary">ERROR 404</span>
      <h1 className="text-3xl font-bold text-text-heading">Página no encontrada</h1>
      <p className="text-text-secondary">La página que buscas no existe o fue movida.</p>
      <Link href="/" className="rounded-control bg-brand-primary px-20 py-10 font-medium text-text-inverse hover:bg-brand-primary-dark">
        Volver al inicio
      </Link>
    </main>
  );
}