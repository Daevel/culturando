import type { Book } from "@culturando/types";

export const booksMock: Book[] = [
  {
    id: "book-il-nome-della-rosa",
    title: "Il nome della rosa",
    author: "Umberto Eco",
    isbn: "9788845292613",
    category: "Romanzo storico",
    description:
      "Un romanzo storico e filosofico ambientato in un'abbazia medievale, tra mistero, libri proibiti e indagini.",
    ownerId: "user-demo-luigi",
    availability: "loanable",
    visibility: "public",
    physicalCondition: "good",
    approximateLocation: {
      latitude: 40.8518,
      longitude: 14.2681,
      radiusMeters: 750,
    },
    createdAt: "2026-06-01T10:00:00.000Z",
    updatedAt: "2026-06-01T10:00:00.000Z",
  },
  {
    id: "book-le-citta-invisibili",
    title: "Le citta invisibili",
    author: "Italo Calvino",
    isbn: "9788804664630",
    category: "Narrativa",
    description:
      "Marco Polo racconta a Kublai Khan citta immaginarie che diventano riflessioni su memoria, desiderio e linguaggio.",
    ownerId: "user-demo-marta",
    availability: "consultation_only",
    visibility: "public",
    physicalCondition: "worn",
    approximateLocation: {
      latitude: 41.9028,
      longitude: 12.4964,
      radiusMeters: 1000,
    },
    createdAt: "2026-06-02T09:30:00.000Z",
    updatedAt: "2026-06-02T09:30:00.000Z",
  },
  {
    id: "book-se-questo-e-un-uomo",
    title: "Se questo e un uomo",
    author: "Primo Levi",
    isbn: "9788806219356",
    category: "Memorialistica",
    description:
      "Una testimonianza essenziale sulla deportazione e sulla necessita di preservare memoria, dignita e responsabilita.",
    ownerId: "user-demo-anna",
    availability: "available",
    visibility: "public",
    physicalCondition: "good",
    approximateLocation: {
      latitude: 45.0703,
      longitude: 7.6869,
      radiusMeters: 900,
    },
    createdAt: "2026-06-03T15:15:00.000Z",
    updatedAt: "2026-06-03T15:15:00.000Z",
  },
];
