export const it = {
  home: {
    hero: {
      eyebrow: "Patrimonio librario privato geolocalizzato",
      title: "Culturando",
      description:
        "Scopri, condividi e valorizza libri, collezioni e biblioteche private vicino a te attraverso una piattaforma web geolocalizzata, accessibile e attenta alla privacy.",
      primaryActionLabel: "Esplora libri",
      nearbyActionLabel: "Cerca vicino a te",
      secondaryActionLabel: "Pubblica un libro",
    },
    theme: {
      darkLabel: "Tema scuro",
      lightLabel: "Tema chiaro",
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
      successMessage:
        "Ti abbiamo inviato una mail di conferma. Aprila e conferma il tuo indirizzo per attivare l'account.",
      emailAlreadyExistsMessage: "Questo indirizzo email è stato già usato",
      genericErrorMessage: "Non è stato possibile creare l'account.",
      toast: {
        title: "Controlla la tua email",
      },
      wizard: {
        progressLabel: "Avanzamento registrazione",
        stepLabel: "Step",
        ofLabel: "di",
        previousLabel: "Indietro",
        nextLabel: "Continua",
        checkingEmailLabel: "Verifica della mail in corso...",
        emailAvailableMessage: "Email disponibile",
        steps: {
          account: {
            title: "Dati account",
            description: "Inserisci nome ed email per identificare il tuo profilo.",
          },
          security: {
            title: "Sicurezza",
            description: "Scegli una password sicura e confermala.",
          },
          confirm: {
            title: "Conferma",
            description: "Controlla i dati principali prima di creare l'account.",
          },
        },
        review: {
          nameLabel: "Nome",
          emailLabel: "Email",
          salutationPreferenceLabel: "Saluto",
          emptyValue: "Non compilato",
          notice: "La password non viene mostrata per motivi di sicurezza.",
        },
      },
      fields: {
        name: {
          label: "Nome",
          placeholder: "Luigi Avitabile",
        },
        salutationPreference: {
          label: "Come preferisci essere salutato/a?",
          options: {
            masculine: "Benvenuto",
            feminine: "Benvenuta",
            neutral: "Benvenuto/a",
          },
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
    confirmEmail: {
      loginLabel: "Vai al login",
      success: {
        title: "Account attivato correttamente",
        description:
          "Grazie per aver confermato il tuo indirizzo email. Ora puoi accedere a Culturando.",
        cardTitle: "Registrazione completata",
        cardDescription:
          "Il tuo account è stato verificato ed è pronto per essere utilizzato sul portale.",
      },
      invalid: {
        title: "Link di conferma non valido",
        description:
          "Il link potrebbe essere scaduto, già utilizzato o copiato in modo incompleto.",
        cardTitle: "Verifica non completata",
        cardDescription:
          "Per accedere devi usare il link di conferma ricevuto via email dopo la registrazione.",
      },
    },
  },
  dashboard: {
    eyebrow: "Area personale",
    title: "Dashboard",
    welcomeTitle: {
      masculine: "Benvenuto",
      feminine: "Benvenuta",
      neutral: "Benvenuto/a",
    },
    description:
      "Gestisci il tuo profilo, prepara la pubblicazione dei tuoi libri e verifica lo stato della sessione.",
    logoutLabel: "Esci",
    userFallback: "Utente Culturando",
    nav: {
      logoLabel: "Vai alla dashboard Culturando",
      primaryLabel: "Navigazione dashboard",
      dashboardLabel: "Dashboard",
      booksLabel: "Lista libri",
      newBookLabel: "Pubblica un libro",
      profileLabel: "Profilo",
      openMobileMenuLabel: "Apri menu",
      closeMobileMenuLabel: "Chiudi menu",
      themeLabel: "Tema interfaccia",
      activateDarkModeLabel: "Attiva dark mode",
      activateLightModeLabel: "Attiva light mode",
    },
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
      primaryGroupLabel: "Priorità alta",
      secondaryGroupLabel: "Gestione",
      adminGroupLabel: "Amministrazione",
      newBookLabel: "Aggiungi libro",
      profileLabel: "Modifica profilo",
      booksLabel: "Esplora libri",
      requestsLabel: "Le mie richieste",
      adminLabel: "Dashboard admin",
    },
    stats: {
      title: "Statistiche d'uso",
      description:
        "Metriche semplici sui tuoi libri pubblicati, sulle visualizzazioni e sulle richieste ricevute.",
      booksLabel: "Libri pubblicati",
      viewsLabel: "Visualizzazioni",
      requestsLabel: "Richieste ricevute",
      pendingRequestsLabel: "Richieste in attesa",
      visibilityTitle: "Riepilogo pubblicazione",
      publicBooksLabel: "Libri pubblici",
      privateBooksLabel: "Libri privati",
      acceptedRequestsLabel: "Richieste accettate",
      topBooksTitle: "Libri più visualizzati",
      emptyTopBooks: "Non ci sono ancora libri con statistiche da mostrare.",
    },
  },
  admin: {
    eyebrow: "Amministrazione",
    title: "Dashboard amministrativa",
    description:
      "Panoramica aggregata del prototipo Culturando: utenti, pubblicazioni, richieste e visualizzazioni.",
    backToDashboardLabel: "Dashboard",
    emptyName: "Nome non disponibile",
    stats: {
      usersLabel: "Utenti",
      booksLabel: "Libri",
      requestsLabel: "Richieste",
      viewsLabel: "Visualizzazioni",
    },
    publication: {
      title: "Pubblicazioni",
      description: "Distribuzione dei libri in base alla visibilità.",
      publicBooksLabel: "Libri pubblici",
      privateBooksLabel: "Libri privati",
    },
    requests: {
      title: "Richieste prestito/consultazione",
      description: "Stato globale delle richieste gestite dalla piattaforma.",
      pendingLabel: "In attesa",
      acceptedLabel: "Accettate",
      rejectedLabel: "Rifiutate",
      cancelledLabel: "Annullate",
    },
    latestUsers: {
      title: "Ultimi utenti registrati",
      description: "Account creati più di recente nel sistema.",
    },
    latestBooks: {
      title: "Ultimi libri pubblicati",
      description: "Schede libro aggiunte più di recente.",
      ownerLabel: "Proprietario:",
    },
  },
  profile: {
    eyebrow: "Profilo personale",
    title: "Gestisci il tuo profilo",
    description:
      "Aggiorna le informazioni che descrivono la tua biblioteca personale e scegli se rendere visibile il profilo.",
    backToDashboardLabel: "Dashboard",
    form: {
      title: "Informazioni profilo",
      description:
        "Questi dati aiutano gli altri utenti a capire il contesto culturale della tua raccolta, senza mostrare indirizzi precisi.",
      submitLabel: "Salva profilo",
      pendingLabel: "Salvataggio...",
      successMessage: "Profilo aggiornato correttamente.",
      unauthorizedMessage: "Devi accedere per modificare il profilo.",
      genericErrorMessage: "Non è stato possibile aggiornare il profilo.",
      fields: {
        name: {
          label: "Nome",
          placeholder: "Luigi Avitabile",
        },
        email: {
          label: "Email account",
        },
        avatarUrl: {
          label: "URL avatar",
          placeholder: "https://example.com/avatar.jpg",
        },
        bio: {
          label: "Biografia",
          placeholder: "Descrivi brevemente la tua biblioteca, i tuoi interessi o la tua raccolta.",
        },
        city: {
          label: "Città",
          placeholder: "Napoli",
        },
        province: {
          label: "Provincia",
          placeholder: "NA",
        },
        region: {
          label: "Regione",
          placeholder: "Campania",
        },
        isProfilePublic: {
          label: "Rendi visibile il profilo",
          description:
            "Il profilo pubblico mostra solo dati descrittivi e area generale, mai indirizzi o coordinate precise.",
        },
      },
    },
  },
  books: {
    catalog: {
      eyebrow: "Catalogo libri",
      title: "Scopri i primi libri condivisi dalla comunita",
      description:
        "Questi dati demo preparano il flusso principale di Culturando: pubblicare, consultare e rendere ricercabili collezioni private.",
      dashboardLabel: "Torna alla dashboard",
      nearbyLabel: "Cerca per zona",
      newBookLabel: "Aggiungi libro",
      searchLabel: "Cerca nel catalogo",
      searchPlaceholder: "Titolo, autore, ISBN, editore, città, categoria o descrizione",
      availabilityFilterLabel: "Disponibilita",
      visibilityFilterLabel: "Visibilita",
      allAvailabilitiesLabel: "Tutte le disponibilita",
      allVisibilitiesLabel: "Tutte le visibilita",
      pageSizeLabel: "Libri per pagina",
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
      nearbyLabel: "Trova disponibilita vicine",
      descriptionTitle: "Descrizione",
      ownerLabel: "Proprietario",
      categoryLabel: "Categoria",
      publisherLabel: "Editore",
      publishedYearLabel: "Anno",
      languageLabel: "Lingua",
      locationLabel: "Area pubblica",
      areaLabel: "Zona",
      imagesLabel: "Immagini",
      viewsLabel: "Visualizzazioni",
      approximateLocationValue: "Posizione approssimata disponibile",
      emptyValue: "Non disponibile",
    },
    nearby: {
      eyebrow: "Disponibilita vicine",
      title: "Libri disponibili nella stessa area",
      description: "Risultati ordinati per distanza approssimata rispetto a",
      mapTitle: "Mappa delle disponibilita",
      mapDescription:
        "I marker usano solo coordinate pubbliche approssimate, non la posizione precisa degli utenti.",
      mapEmptyState:
        "La mappa non e disponibile per questo libro perche manca una posizione pubblica.",
      emptyState:
        "Non ci sono ancora altri libri pubblici con posizione approssimata disponibile vicino a questo volume.",
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
      imagesTitle: "Copertina e immagini",
      imagesDescription:
        "Carica una copertina dal tuo dispositivo, aggiungi URL esterni o lascia che Culturando cerchi una copertina tramite ISBN.",
      imagesHelpText:
        "La copertina caricata diventa l'immagine principale. Se non carichi immagini e inserisci un ISBN, il sistema prova a usare Open Library come fallback.",
      catalogingPanelTitle: "Catalogazione guidata",
      catalogingPanelDescription:
        "Parti da una foto, da testo letto o da un ISBN: Culturando ti aiuta a riconoscere il libro e propone dati da applicare solo dopo conferma.",
      catalogingStepImageLabel: "1. Immagine",
      catalogingStepTextLabel: "2. Testo o ISBN",
      catalogingStepMetadataLabel: "3. Dati libro",
      isbnExtractionTitle: "Estrazione ISBN da testo",
      isbnExtractionDescription:
        "Incolla testo letto dal retro o da un futuro OCR: Culturando prova a riconoscere un ISBN valido e lo inserisce nel campo ISBN.",
      isbnExtractionPlaceholder: "ISBN 978-88-452-9261-3 oppure testo OCR del retro copertina...",
      isbnExtractionLabel: "Estrai ISBN",
      isbnExtractionFoundMessage: "ISBN riconosciuto e inserito nel form.",
      isbnExtractionNotFoundMessage: "Nessun ISBN valido riconosciuto nel testo.",
      ocrLookupTitle: "OCR da immagine",
      ocrLookupDescription:
        "Carica una foto del retro o della copertina: Culturando prova a leggere titolo, ISBN e altri dati utili per compilare il form.",
      ocrLookupLabel: "Leggi immagine",
      ocrLookupPendingLabel: "Lettura immagine...",
      ocrLookupFoundMessage: "Dati riconosciuti dall'immagine e inseriti nel form.",
      ocrLookupEmptyResponseMessage: "L'OCR ha risposto, ma non ha restituito testo leggibile.",
      ocrLookupHttpErrorMessage: "La Worker OCR ha restituito un errore. Riprova tra poco.",
      ocrLookupNotFoundMessage: "Testo letto, ma nessun titolo o ISBN utile riconosciuto.",
      ocrLookupMissingImageMessage: "Carica un'immagine prima di avviare l'OCR.",
      ocrLookupNetworkErrorMessage: "Non è stato possibile raggiungere la Worker OCR.",
      ocrLookupNotConfiguredMessage:
        "OCR Cloudflare non configurato. Imposta CLOUDFLARE_OCR_ENDPOINT per abilitarlo.",
      ocrLookupTimeoutMessage:
        "La lettura dell'immagine sta richiedendo troppo tempo. Prova con una foto più nitida o ritagliata.",
      ocrLookupTooLargeMessage: "Immagine troppo grande. Usa un file fino a 6 MB.",
      ocrLookupUnsupportedTypeMessage: "Formato non supportato. Usa JPG, PNG o WebP.",
      ocrLookupErrorMessage: "Non è stato possibile leggere l'immagine.",
      ocrTextPreviewLabel: "Testo letto dall'immagine",
      metadataLookupTitle: "Catalogazione assistita",
      metadataLookupDescription:
        "Usa l'ISBN per cercare titolo, autore e altri metadati prima di compilare la scheda.",
      metadataLookupLabel: "Cerca dati libro",
      metadataLookupPendingLabel: "Ricerca dati...",
      metadataLookupFoundMessage: "Dati trovati. Controllali e applicali al form se sono corretti.",
      metadataLookupNotFoundMessage: "Nessun dato trovato per questo ISBN.",
      metadataLookupErrorMessage: "Non è stato possibile cercare i dati del libro.",
      metadataLookupMissingIsbnMessage: "Inserisci un ISBN prima di cercare i dati del libro.",
      metadataPreviewTitle: "Campi che verranno aggiornati",
      metadataSourceLabel: "Fonte:",
      metadataSourceOpenLibrary: "Open Library",
      metadataSourceOcr: "OCR immagine",
      metadataCoverAvailableLabel: "Copertina disponibile",
      metadataOverwriteWarningLabel: "Valore attuale",
      metadataApplyLabel: "Applica al form",
      coverLookupTitle: "Ricerca automatica",
      coverLookupDescription: "Usa l'ISBN inserito per cercare una copertina su Open Library.",
      coverLookupLabel: "Cerca copertina",
      coverLookupPendingLabel: "Ricerca in corso...",
      coverLookupFoundMessage: "Copertina trovata e pronta per il salvataggio.",
      coverLookupNotFoundMessage: "Nessuna copertina trovata per questo ISBN.",
      coverLookupErrorMessage: "Non è stato possibile cercare la copertina.",
      coverLookupMissingIsbnMessage: "Inserisci un ISBN prima di cercare la copertina.",
      coverPreviewAlt: "Anteprima copertina libro",
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
        coverImage: {
          label: "Copertina",
        },
        imageUrls: {
          label: "URL immagini aggiuntive",
          placeholder: "https://example.com/copertina.jpg",
        },
      },
    },
  },
  nearby: {
    search: {
      eyebrow: "Ricerca territoriale",
      title: "Trova libri vicino a una zona",
      description:
        "Inserisci una citta o un indirizzo: Culturando mostra libri pubblici usando solo posizioni approssimate.",
      formTitle: "Zona di ricerca",
      queryLabel: "Citta o indirizzo",
      queryPlaceholder: "Napoli, Roma Prati, Torino centro...",
      radiusLabel: "Raggio",
      radius5Label: "5 km",
      radius10Label: "10 km",
      radius25Label: "25 km",
      radius50Label: "50 km",
      submitLabel: "Cerca libri vicini",
      originLabel: "Area cercata",
      mapTitle: "Mappa dei risultati",
      mapDescription:
        "La mappa mostra l'area cercata e i libri trovati tramite coordinate pubbliche approssimate.",
      mapEmptyState: "Cerca una zona per visualizzare la mappa dei risultati.",
      resultsLabel: "risultati vicino alla zona cercata",
      emptyState: "Non ci sono ancora libri pubblici disponibili vicino a questa zona.",
      geocodingFailedMessage:
        "Non e stato possibile trovare questa zona. Prova con una citta o un indirizzo piu specifico.",
    },
  },
  requests: {
    page: {
      eyebrow: "Area personale",
      title: "Le mie richieste",
      description:
        "Controlla le richieste inviate ai proprietari dei libri e annulla quelle ancora in attesa.",
      backToDashboardLabel: "Torna alla dashboard",
    },
    type: {
      consultation: "Consultazione",
      loan: "Prestito",
      info: "Informazioni",
    },
    status: {
      pending: "In attesa",
      accepted: "Accettata",
      rejected: "Rifiutata",
      cancelled: "Annullata",
      completed: "Completata",
    },
    form: {
      title: "Richiedi contatto",
      description:
        "Invia una richiesta al proprietario del libro. La posizione precisa resta privata.",
      typeLabel: "Tipo richiesta",
      messageLabel: "Messaggio",
      messagePlaceholder: "Presentati e spiega brevemente cosa vorresti consultare o chiedere.",
      submitLabel: "Invia richiesta",
      pendingLabel: "Invio in corso...",
      successMessage: "Richiesta inviata correttamente.",
      unauthorizedMessage: "Devi accedere per inviare una richiesta.",
      unavailableBookMessage: "Questo libro non può ricevere richieste.",
      ownerMessage: "Non puoi inviare una richiesta per un tuo libro.",
      genericErrorMessage: "Non è stato possibile inviare la richiesta.",
    },
    received: {
      title: "Richieste ricevute",
      description: "Richieste di consultazione, prestito o informazioni sui tuoi libri.",
      emptyState: "Non hai ancora ricevuto richieste.",
      requesterLabel: "Richiedente",
      messageLabel: "Messaggio",
      acceptLabel: "Accetta",
      rejectLabel: "Rifiuta",
    },
    sent: {
      title: "Richieste inviate",
      description:
        "Richieste che hai inviato per consultare, prendere in prestito o ricevere informazioni.",
      emptyState: "Non hai ancora inviato richieste.",
      ownerLabel: "Proprietario",
      messageLabel: "Messaggio inviato",
      cancelLabel: "Annulla richiesta",
    },
  },
  maps: {
    controls: {
      pauseRotationLabel: "Pausa rotazione",
      resetCameraLabel: "Ripristina vista",
      resumeRotationLabel: "Riprendi rotazione",
      switchTo2dLabel: "Vista 2D",
      switchTo3dLabel: "Vista 3D",
    },
    legend: {
      originLabel: "Area cercata",
      nearbyLabel: "Libro disponibile",
    },
  },
} as const;
