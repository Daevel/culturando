export const it = {
  auth: {
    login: {
      title: "Accedi a Culturando",
      description: "Entra nel tuo account per gestire i tuoi libri e scoprire collezioni vicine.",
      submitLabel: "Accedi",
      pendingLabel: "Accesso in corso...",
      alternativeLabel: "Non hai ancora un account?",
      secondaryActionLabel: "Registrati",
      successMessage: "Dati di accesso validati. Integrazione Auth.js da completare.",
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
} as const;
