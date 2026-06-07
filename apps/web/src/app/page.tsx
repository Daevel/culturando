export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 py-20 text-center">
        <p className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-muted-foreground">
          Patrimonio librario privato geolocalizzato
        </p>

        <h1 className="max-w-4xl text-4xl font-bold tracking-tight md:text-6xl">
          Culturando
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
          Scopri, condividi e valorizza libri, collezioni e biblioteche private
          vicino a te attraverso una piattaforma web geolocalizzata, accessibile
          e attenta alla privacy.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <a
            href="/books"
            className="rounded-md bg-foreground px-6 py-3 text-sm font-medium text-background"
          >
            Esplora libri
          </a>

          <a
            href="/dashboard/books/new"
            className="rounded-md border px-6 py-3 text-sm font-medium"
          >
            Pubblica un libro
          </a>
        </div>
      </section>
    </main>
  );
}