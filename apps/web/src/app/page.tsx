import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 py-20 text-center">
        <Badge variant="secondary">Patrimonio librario privato geolocalizzato</Badge>

        <h1 className="mt-6 max-w-4xl text-4xl font-bold tracking-tight md:text-6xl">Culturando</h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
          Scopri, condividi e valorizza libri, collezioni e biblioteche private vicino a te
          attraverso una piattaforma web geolocalizzata, accessibile e attenta alla privacy.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Button asChild size="lg">
            <a href="/books">Esplora libri</a>
          </Button>

          <Button asChild size="lg" variant="outline">
            <a href="/dashboard/books/new">Pubblica un libro</a>
          </Button>
        </div>

        <div className="mt-16 grid w-full gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <h2 className="font-semibold">Mappa 3D</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Esplora disponibilità librarie e luoghi culturali vicini tramite una mappa
                interattiva.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="font-semibold">Catalogazione assistita</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Carica una copertina e usa OCR e ISBN per precompilare i dati del libro.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="font-semibold">Privacy</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                La posizione precisa non viene mostrata pubblicamente: vengono usate zone
                approssimate.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
