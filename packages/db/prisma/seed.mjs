import { randomBytes, scrypt as scryptCallback } from "node:crypto";
import { promisify } from "node:util";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const scrypt = promisify(scryptCallback);
const seededEmails = [
  "admin@culturando.local",
  "maria.rossi@example.com",
  "antonio.bianchi@example.com",
  "giulia.verdi@example.com",
];

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = await scrypt(password, salt, 64);

  return `${salt}:${derivedKey.toString("hex")}`;
}

async function main() {
  const passwordHash = await hashPassword("Culturando123!");

  await prisma.user.deleteMany({
    where: {
      email: {
        in: seededEmails,
      },
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: "admin@culturando.local",
      name: "Admin Culturando",
      passwordHash,
      role: "admin",
      bio: "Account amministrativo demo per monitorare utenti, libri, richieste e statistiche del prototipo.",
      city: "Napoli",
      province: "NA",
      region: "Campania",
      isProfilePublic: false,
    },
  });

  const maria = await prisma.user.create({
    data: {
      email: "maria.rossi@example.com",
      name: "Maria Rossi",
      passwordHash,
      bio: "Docente e lettrice di narrativa contemporanea, con una piccola biblioteca domestica aperta alla consultazione.",
      city: "Napoli",
      province: "NA",
      region: "Campania",
      avatarUrl:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=256&h=256&fit=crop",
    },
  });

  const antonio = await prisma.user.create({
    data: {
      email: "antonio.bianchi@example.com",
      name: "Antonio Bianchi",
      passwordHash,
      bio: "Appassionato di storia locale, saggistica e libri su Napoli e il Mediterraneo.",
      city: "Pozzuoli",
      province: "NA",
      region: "Campania",
      avatarUrl:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=256&h=256&fit=crop",
    },
  });

  const giulia = await prisma.user.create({
    data: {
      email: "giulia.verdi@example.com",
      name: "Giulia Verdi",
      passwordHash,
      bio: "Studentessa e collezionista di classici, teatro e libri illustrati.",
      city: "Salerno",
      province: "SA",
      region: "Campania",
      avatarUrl:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&h=256&fit=crop",
    },
  });

  const books = await Promise.all([
    createBook({
      ownerId: maria.id,
      title: "Il nome della rosa",
      author: "Umberto Eco",
      isbn: "9788845292613",
      publisher: "Bompiani",
      publishedYear: 1980,
      language: "it",
      category: "Narrativa storica",
      description:
        "Romanzo storico e investigativo ambientato in un monastero medievale. Disponibile per consultazione concordata.",
      availability: "consultation_only",
      physicalCondition: "good",
      addressLabel: "Via Toledo, Napoli",
      city: "Napoli",
      province: "NA",
      region: "Campania",
      latitude: 40.8422,
      longitude: 14.2489,
      publicLatitude: 40.843,
      publicLongitude: 14.249,
      coverUrl: "https://covers.openlibrary.org/b/isbn/9788845292613-L.jpg",
      viewCount: 48,
    }),
    createBook({
      ownerId: maria.id,
      title: "Le città invisibili",
      author: "Italo Calvino",
      isbn: "9788804668233",
      publisher: "Mondadori",
      publishedYear: 1972,
      language: "it",
      category: "Letteratura italiana",
      description: "Raccolta di dialoghi e visioni urbane. Copia privata in buono stato.",
      availability: "loanable",
      physicalCondition: "good",
      addressLabel: "Quartiere Chiaia, Napoli",
      city: "Napoli",
      province: "NA",
      region: "Campania",
      latitude: 40.8331,
      longitude: 14.2405,
      publicLatitude: 40.834,
      publicLongitude: 14.241,
      coverUrl: "https://covers.openlibrary.org/b/isbn/9788804668233-L.jpg",
      viewCount: 36,
    }),
    createBook({
      ownerId: maria.id,
      title: "Cristo si è fermato a Eboli",
      author: "Carlo Levi",
      isbn: "9788806240963",
      publisher: "Einaudi",
      publishedYear: 1945,
      language: "it",
      category: "Memorialistica",
      description:
        "Testo centrale per comprendere Sud Italia, paesaggio culturale e memoria civile.",
      availability: "available",
      physicalCondition: "worn",
      addressLabel: "Centro storico, Napoli",
      city: "Napoli",
      province: "NA",
      region: "Campania",
      latitude: 40.8518,
      longitude: 14.2681,
      publicLatitude: 40.852,
      publicLongitude: 14.268,
      coverUrl: "https://covers.openlibrary.org/b/isbn/9788806240963-L.jpg",
      viewCount: 22,
    }),
    createBook({
      ownerId: antonio.id,
      title: "Storia del Regno di Napoli",
      author: "Benedetto Croce",
      isbn: "9788842029830",
      publisher: "Laterza",
      publishedYear: 1925,
      language: "it",
      category: "Storia locale",
      description: "Saggio storico utile per ricerche sul territorio campano e meridionale.",
      availability: "consultation_only",
      physicalCondition: "good",
      addressLabel: "Rione Terra, Pozzuoli",
      city: "Pozzuoli",
      province: "NA",
      region: "Campania",
      latitude: 40.8267,
      longitude: 14.1213,
      publicLatitude: 40.827,
      publicLongitude: 14.122,
      coverUrl: "https://covers.openlibrary.org/b/isbn/9788842029830-L.jpg",
      viewCount: 61,
    }),
    createBook({
      ownerId: antonio.id,
      title: "Gomorra",
      author: "Roberto Saviano",
      isbn: "9788806187770",
      publisher: "Mondadori",
      publishedYear: 2006,
      language: "it",
      category: "Reportage",
      description:
        "Libro di inchiesta utile per discussioni su territorio, società e criminalità organizzata.",
      availability: "loanable",
      physicalCondition: "good",
      addressLabel: "Lungomare di Pozzuoli",
      city: "Pozzuoli",
      province: "NA",
      region: "Campania",
      latitude: 40.823,
      longitude: 14.119,
      publicLatitude: 40.823,
      publicLongitude: 14.12,
      coverUrl: "https://covers.openlibrary.org/b/isbn/9788806187770-L.jpg",
      viewCount: 44,
    }),
    createBook({
      ownerId: antonio.id,
      title: "Napoli milionaria!",
      author: "Eduardo De Filippo",
      isbn: "9788806227599",
      publisher: "Einaudi",
      publishedYear: 1945,
      language: "it",
      category: "Teatro",
      description: "Classico del teatro napoletano disponibile per consultazione e studio.",
      availability: "available",
      physicalCondition: "worn",
      addressLabel: "Via Campana, Pozzuoli",
      city: "Pozzuoli",
      province: "NA",
      region: "Campania",
      latitude: 40.8336,
      longitude: 14.1198,
      publicLatitude: 40.834,
      publicLongitude: 14.12,
      coverUrl: "https://covers.openlibrary.org/b/isbn/9788806227599-L.jpg",
      viewCount: 29,
    }),
    createBook({
      ownerId: giulia.id,
      title: "La coscienza di Zeno",
      author: "Italo Svevo",
      isbn: "9788807901450",
      publisher: "Feltrinelli",
      publishedYear: 1923,
      language: "it",
      category: "Classici",
      description: "Classico del Novecento italiano, consigliato per studio universitario.",
      availability: "loanable",
      physicalCondition: "good",
      addressLabel: "Corso Vittorio Emanuele, Salerno",
      city: "Salerno",
      province: "SA",
      region: "Campania",
      latitude: 40.6782,
      longitude: 14.7594,
      publicLatitude: 40.678,
      publicLongitude: 14.76,
      coverUrl: "https://covers.openlibrary.org/b/isbn/9788807901450-L.jpg",
      viewCount: 31,
    }),
    createBook({
      ownerId: giulia.id,
      title: "L'amica geniale",
      author: "Elena Ferrante",
      isbn: "9788866320326",
      publisher: "E/O",
      publishedYear: 2011,
      language: "it",
      category: "Narrativa contemporanea",
      description: "Primo volume della tetralogia napoletana. Copia prestabile previa richiesta.",
      availability: "loanable",
      physicalCondition: "good",
      addressLabel: "Centro, Salerno",
      city: "Salerno",
      province: "SA",
      region: "Campania",
      latitude: 40.6806,
      longitude: 14.7599,
      publicLatitude: 40.681,
      publicLongitude: 14.76,
      coverUrl: "https://covers.openlibrary.org/b/isbn/9788866320326-L.jpg",
      viewCount: 57,
    }),
    createBook({
      ownerId: giulia.id,
      title: "Il barone rampante",
      author: "Italo Calvino",
      isbn: "9788804668234",
      publisher: "Mondadori",
      publishedYear: 1957,
      language: "it",
      category: "Letteratura italiana",
      description: "Romanzo di formazione e fantasia, disponibile per consultazione.",
      availability: "consultation_only",
      physicalCondition: "good",
      addressLabel: "Via Roma, Salerno",
      city: "Salerno",
      province: "SA",
      region: "Campania",
      latitude: 40.6778,
      longitude: 14.7537,
      publicLatitude: 40.678,
      publicLongitude: 14.754,
      coverUrl: "https://covers.openlibrary.org/b/isbn/9788804668234-L.jpg",
      viewCount: 18,
    }),
    createBook({
      ownerId: admin.id,
      title: "Designing Data-Intensive Applications",
      author: "Martin Kleppmann",
      isbn: "9781449373320",
      publisher: "O'Reilly Media",
      publishedYear: 2017,
      language: "en",
      category: "Informatica",
      description:
        "Testo tecnico usato come esempio di libro privato consultabile da studenti di informatica.",
      availability: "available",
      physicalCondition: "new",
      addressLabel: "Università Federico II, Napoli",
      city: "Napoli",
      province: "NA",
      region: "Campania",
      latitude: 40.8459,
      longitude: 14.2566,
      publicLatitude: 40.846,
      publicLongitude: 14.257,
      coverUrl: "https://covers.openlibrary.org/b/isbn/9781449373320-L.jpg",
      viewCount: 39,
    }),
    createBook({
      ownerId: admin.id,
      title: "Don't Make Me Think",
      author: "Steve Krug",
      isbn: "9780321965516",
      publisher: "New Riders",
      publishedYear: 2014,
      language: "en",
      category: "UX e accessibilità",
      description:
        "Manuale UX utile per giustificare scelte di usabilità e interfaccia nel progetto.",
      availability: "available",
      visibility: "private",
      physicalCondition: "good",
      addressLabel: "Napoli centro direzionale",
      city: "Napoli",
      province: "NA",
      region: "Campania",
      latitude: 40.8582,
      longitude: 14.2805,
      publicLatitude: 40.858,
      publicLongitude: 14.281,
      coverUrl: "https://covers.openlibrary.org/b/isbn/9780321965516-L.jpg",
      viewCount: 12,
    }),
  ]);

  const byTitle = new Map(books.map((book) => [book.title, book]));

  await prisma.loanRequest.createMany({
    data: [
      {
        bookId: byTitle.get("Il nome della rosa").id,
        requesterId: antonio.id,
        ownerId: maria.id,
        type: "consultation",
        status: "pending",
        message: "Vorrei consultarlo per una ricerca sui romanzi storici.",
      },
      {
        bookId: byTitle.get("Le città invisibili").id,
        requesterId: giulia.id,
        ownerId: maria.id,
        type: "loan",
        status: "accepted",
        message: "Mi servirebbe per un seminario universitario.",
      },
      {
        bookId: byTitle.get("Storia del Regno di Napoli").id,
        requesterId: maria.id,
        ownerId: antonio.id,
        type: "info",
        status: "rejected",
        message: "Vorrei sapere se contiene un capitolo sulla Napoli borbonica.",
      },
      {
        bookId: byTitle.get("L'amica geniale").id,
        requesterId: maria.id,
        ownerId: giulia.id,
        type: "loan",
        status: "cancelled",
        message: "Richiesta annullata per indisponibilità temporanea.",
      },
      {
        bookId: byTitle.get("Designing Data-Intensive Applications").id,
        requesterId: giulia.id,
        ownerId: admin.id,
        type: "consultation",
        status: "pending",
        message: "Vorrei usarlo per confrontare alcune scelte architetturali del progetto.",
      },
    ],
  });

  console.info("Seed completato.");
  console.info("Credenziali demo: admin@culturando.local / Culturando123!");
  console.info(
    "Utenti demo: maria.rossi@example.com, antonio.bianchi@example.com, giulia.verdi@example.com",
  );
}

async function createBook(input) {
  return prisma.book.create({
    data: {
      ownerId: input.ownerId,
      title: input.title,
      author: input.author,
      isbn: input.isbn,
      publisher: input.publisher,
      publishedYear: input.publishedYear,
      language: input.language,
      category: input.category,
      description: input.description,
      availability: input.availability,
      visibility: input.visibility ?? "public",
      physicalCondition: input.physicalCondition,
      location: {
        create: {
          addressLabel: input.addressLabel,
          city: input.city,
          province: input.province,
          region: input.region,
          country: "Italia",
          latitude: input.latitude,
          longitude: input.longitude,
          publicLatitude: input.publicLatitude,
          publicLongitude: input.publicLongitude,
          accuracyRadiusMeters: 750,
        },
      },
      images: {
        create: {
          url: input.coverUrl,
          source: "external_api",
          alt: `${input.title} - copertina`,
          isPrimary: true,
        },
      },
      stats: {
        create: {
          viewCount: input.viewCount,
        },
      },
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
