import type { Book } from "@culturando/types";

export const booksMock: Book[] = [
  {
    id: "book-il-nome-della-rosa",
    title: "Il nome della rosa",
    author: "Umberto Eco",
    isbn: "9788845292613",
    description:
      "Un romanzo storico e filosofico ambientato in un'abbazia medievale, tra mistero, libri proibiti e indagini.",
    ownerId: "user-demo-luigi",
    status: "available",
    visibility: "public",
    createdAt: "2026-06-01T10:00:00.000Z",
    updatedAt: "2026-06-01T10:00:00.000Z",
  },
  {
    id: "book-le-citta-invisibili",
    title: "Le citta invisibili",
    author: "Italo Calvino",
    isbn: "9788804664630",
    description:
      "Marco Polo racconta a Kublai Khan citta immaginarie che diventano riflessioni su memoria, desiderio e linguaggio.",
    ownerId: "user-demo-marta",
    status: "reserved",
    visibility: "public",
    createdAt: "2026-06-02T09:30:00.000Z",
    updatedAt: "2026-06-02T09:30:00.000Z",
  },
  {
    id: "book-se-questo-e-un-uomo",
    title: "Se questo e un uomo",
    author: "Primo Levi",
    isbn: "9788806219356",
    description:
      "Una testimonianza essenziale sulla deportazione e sulla necessita di preservare memoria, dignita e responsabilita.",
    ownerId: "user-demo-anna",
    status: "available",
    visibility: "public",
    createdAt: "2026-06-03T15:15:00.000Z",
    updatedAt: "2026-06-03T15:15:00.000Z",
  },
];
