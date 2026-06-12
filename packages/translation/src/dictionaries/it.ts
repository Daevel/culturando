export const it = {
  auth: {
    login: {
      title: "Accedi a Culturando",
      description: "Entra nel tuo account per gestire i tuoi libri e scoprire collezioni vicine.",
      submitLabel: "Accedi",
      pendingLabel: "Accesso in corso...",
      alternativeLabel: "Non hai ancora un account?",
      secondaryActionLabel: "Registrati",
      successMessage: "Accesso effettuato correttamente.",
      invalidCredentialsMessage: "Credenziali non valide o utente demo non configurato.",
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
      successMessage: "Dati di registrazione validati. Creazione utente da completare.",
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
    },
    grid: {
      emptyState: "Non ci sono ancora libri da mostrare.",
    },
    card: {
      emptyDescription: "Descrizione non disponibile.",
      isbnLabel: "ISBN",
    },
    status: {
      available: "Disponibile",
      reserved: "Prenotato",
      unavailable: "Non disponibile",
    },
    visibility: {
      public: "Pubblico",
      private: "Privato",
    },
    new: {
      eyebrow: "Nuovo libro",
      title: "Prepara una nuova scheda libro",
      description:
        "Il form e ancora non persistente: serve a definire il flusso utente prima di collegare database e CRUD reale.",
      backToDashboardLabel: "Dashboard",
      backToCatalogLabel: "Catalogo",
      formTitle: "Dati principali",
      formDescription: "Compila una scheda libro salvata nel mock JSON locale.",
      submitLabel: "Salva libro",
      pendingLabel: "Salvataggio in corso...",
      successMessage: "Libro salvato nel mock JSON locale.",
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
        description: {
          label: "Descrizione",
          placeholder: "Aggiungi una breve descrizione del libro.",
        },
        status: {
          label: "Stato",
        },
        visibility: {
          label: "Visibilita",
        },
      },
    },
  },
} as const;
