export const it = {
  home: {
    hero: {
      eyebrow: "Patrimonio librario privato geolocalizzato",
      title: "Culturando",
      description:
        "Scopri, condividi e valorizza libri, collezioni e biblioteche private vicino a te attraverso una piattaforma web geolocalizzata, accessibile e attenta alla privacy.",
      primaryActionLabel: "Esplora libri",
      secondaryActionLabel: "Pubblica un libro",
    },
    highlights: {
      map: {
        title: "Mappa 3D",
        description:
          "Esplora disponibilità librarie e luoghi culturali vicini tramite una mappa interattiva.",
      },
      cataloging: {
        title: "Catalogazione assistita",
        description: "Carica una copertina e usa OCR e ISBN per precompilare i dati del libro.",
      },
      privacy: {
        title: "Privacy",
        description:
          "La posizione precisa non viene mostrata pubblicamente: vengono usate zone approssimate.",
      },
    },
  },
  auth: {
    login: {
      title: "Accedi a Culturando",
      description: "Entra nel tuo account per gestire i tuoi libri e scoprire collezioni vicine.",
      submitLabel: "Accedi",
      pendingLabel: "Accesso in corso...",
      alternativeLabel: "Non hai ancora un account?",
      secondaryActionLabel: "Registrati",
      successMessage: "Accesso effettuato correttamente.",
      invalidCredentialsMessage: "Credenziali non valide.",
      fields: {
        email: {
          label: "Email",
          placeholder: "nome@email.com",
        },
        password: {
          label: "Password",
          placeholder: "••••••••",
        },
        rememberMe: {
          label: "Remember me",
        },
      },
    },
    signup: {
      title: "Crea il tuo account",
      description:
        "Registrati per pubblicare i tuoi libri, creare la tua biblioteca personale e scoprire volumi vicini.",
      submitLabel: "Registrati",
      pendingLabel: "Registrazione in corso...",
      alternativeLabel: "Hai già un account?",
      secondaryActionLabel: "Accedi",
      successMessage: "Account creato correttamente. Ora puoi accedere.",
      emailAlreadyExistsMessage: "Esiste già un account con questa email.",
      genericErrorMessage: "Non è stato possibile creare l'account.",
      fields: {
        name: {
          label: "Nome",
          placeholder: "Luigi Avitabile",
        },
        email: {
          label: "Email",
          placeholder: "nome@email.com",
        },
        password: {
          label: "Password",
          placeholder: "••••••••",
        },
        confirmPassword: {
          label: "Conferma password",
          placeholder: "••••••••",
        },
      },
    },
  },
  dashboard: {
    eyebrow: "Area personale",
    title: "Dashboard",
    description:
      "Gestisci il tuo profilo, prepara la pubblicazione dei tuoi libri e verifica lo stato della sessione.",
    logoutLabel: "Esci",
    userFallback: "Utente Culturando",
    sessionCard: {
      title: "Sessione attiva",
      description: "Questi dati arrivano dalla sessione Auth.js corrente.",
      nameLabel: "Nome",
      emailLabel: "Email",
      emptyValue: "Non disponibile",
    },
    quickActions: {
      title: "Azioni rapide",
      description: "I prossimi flussi partiranno da qui.",
      newBookLabel: "Aggiungi libro",
      booksLabel: "Esplora libri",
    },
  },
  books: {
    catalog: {
      eyebrow: "Catalogo libri",
      title: "Scopri i primi libri condivisi dalla comunita",
      description:
        "Questi dati demo preparano il flusso principale di Culturando: pubblicare, consultare e rendere ricercabili collezioni private.",
      dashboardLabel: "Torna alla dashboard",
      newBookLabel: "Aggiungi libro",
      searchLabel: "Cerca nel catalogo",
      searchPlaceholder: "Titolo, autore, ISBN, editore, città, categoria o descrizione",
      availabilityFilterLabel: "Disponibilita",
      visibilityFilterLabel: "Visibilita",
      allAvailabilitiesLabel: "Tutte le disponibilita",
      allVisibilitiesLabel: "Tutte le visibilita",
      resultsLabel: "risultati",
      clearFiltersLabel: "Cancella filtri",
    },
    grid: {
      emptyState: "Non ci sono ancora libri da mostrare.",
    },
    card: {
      emptyDescription: "Descrizione non disponibile.",
      isbnLabel: "ISBN",
      detailLabel: "Dettaglio",
    },
    detail: {
      eyebrow: "Scheda libro",
      backToCatalogLabel: "Torna al catalogo",
      descriptionTitle: "Descrizione",
      ownerLabel: "Proprietario",
      categoryLabel: "Categoria",
      publisherLabel: "Editore",
      publishedYearLabel: "Anno",
      languageLabel: "Lingua",
      locationLabel: "Area pubblica",
      areaLabel: "Zona",
      imagesLabel: "Immagini",
      approximateLocationValue: "Posizione approssimata disponibile",
      emptyValue: "Non disponibile",
    },
    availability: {
      available: "Disponibile",
      consultationOnly: "Solo consultazione",
      loanable: "Prestabile",
      unavailable: "Non disponibile",
    },
    visibility: {
      public: "Pubblico",
      private: "Privato",
    },
    physicalCondition: {
      new: "Nuovo",
      good: "Buono",
      worn: "Usurato",
      damaged: "Danneggiato",
    },
    new: {
      eyebrow: "Nuovo libro",
      title: "Prepara una nuova scheda libro",
      description:
        "Compila una scheda libro reale: verrà associata al tuo account e salvata nel database locale.",
      backToDashboardLabel: "Dashboard",
      backToCatalogLabel: "Catalogo",
      formTitle: "Dati principali",
      formDescription: "Compila una scheda libro salvata nel database PostgreSQL locale.",
      locationTitle: "Indirizzo del libro",
      locationDescription:
        "Inserisci un indirizzo leggibile: in seguito verrà geocodificato automaticamente e mostrato solo in forma approssimata.",
      imagesHelpText:
        "Per ora puoi indicare URL immagine, uno per riga. Upload foto e ricerca automatica copertina arriveranno con storage e API esterne.",
      submitLabel: "Salva libro",
      pendingLabel: "Salvataggio in corso...",
      successMessage: "Libro salvato correttamente nel database.",
      unauthorizedMessage: "Devi accedere per aggiungere un libro.",
      genericErrorMessage: "Non è stato possibile salvare il libro.",
      fields: {
        title: {
          label: "Titolo",
          placeholder: "Il nome della rosa",
        },
        author: {
          label: "Autore",
          placeholder: "Umberto Eco",
        },
        isbn: {
          label: "ISBN",
          placeholder: "9788845292613",
        },
        publisher: {
          label: "Editore",
          placeholder: "Einaudi",
        },
        publishedYear: {
          label: "Anno pubblicazione",
          placeholder: "1980",
        },
        language: {
          label: "Lingua",
          placeholder: "Italiano",
        },
        category: {
          label: "Categoria",
          placeholder: "Romanzo storico",
        },
        description: {
          label: "Descrizione",
          placeholder: "Aggiungi una breve descrizione del libro.",
        },
        availability: {
          label: "Disponibilita",
        },
        visibility: {
          label: "Visibilita",
        },
        physicalCondition: {
          label: "Condizione fisica",
        },
        addressLabel: {
          label: "Indirizzo",
          placeholder: "Via Roma 1, Napoli",
        },
        city: {
          label: "Città",
          placeholder: "Napoli",
        },
        province: {
          label: "Provincia",
          placeholder: "Napoli",
        },
        region: {
          label: "Regione",
          placeholder: "Campania",
        },
        country: {
          label: "Paese",
          placeholder: "Italia",
        },
        imageUrls: {
          label: "Immagini",
          placeholder: "https://example.com/copertina.jpg",
        },
      },
    },
  },
} as const;
