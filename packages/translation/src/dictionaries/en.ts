export const en = {
  auth: {
    login: {
      title: "Sign in to Culturando",
      description: "Access your account to manage your books and discover nearby collections.",
      submitLabel: "Sign in",
      pendingLabel: "Signing in...",
      alternativeLabel: "Don't have an account yet?",
      secondaryActionLabel: "Sign up",
      successMessage: "Signed in successfully.",
      invalidCredentialsMessage: "Invalid credentials or demo user not configured.",
      fields: {
        email: {
          label: "Email",
          placeholder: "name@email.com",
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
      title: "Create your account",
      description:
        "Sign up to publish your books, build your personal library and discover nearby books.",
      submitLabel: "Sign up",
      pendingLabel: "Signing up...",
      alternativeLabel: "Already have an account?",
      secondaryActionLabel: "Sign in",
      successMessage: "Sign-up data validated. User creation still needs to be completed.",
      fields: {
        name: {
          label: "Name",
          placeholder: "Luigi Avitabile",
        },
        email: {
          label: "Email",
          placeholder: "name@email.com",
        },
        password: {
          label: "Password",
          placeholder: "••••••••",
        },
        confirmPassword: {
          label: "Confirm password",
          placeholder: "••••••••",
        },
      },
    },
  },
  dashboard: {
    eyebrow: "Personal area",
    title: "Dashboard",
    description:
      "Manage your profile, prepare your book listings and check the current session status.",
    logoutLabel: "Sign out",
    userFallback: "Culturando user",
    sessionCard: {
      title: "Active session",
      description: "This data comes from the current Auth.js session.",
      nameLabel: "Name",
      emailLabel: "Email",
      emptyValue: "Not available",
    },
    quickActions: {
      title: "Quick actions",
      description: "The next flows will start from here.",
      newBookLabel: "Add book",
      booksLabel: "Explore books",
    },
  },
  books: {
    catalog: {
      eyebrow: "Book catalog",
      title: "Discover the first books shared by the community",
      description:
        "This demo data prepares Culturando's main flow: publishing, browsing and making private collections searchable.",
      dashboardLabel: "Back to dashboard",
      newBookLabel: "Add book",
    },
    grid: {
      emptyState: "There are no books to show yet.",
    },
    card: {
      emptyDescription: "Description not available.",
      isbnLabel: "ISBN",
    },
    status: {
      available: "Available",
      reserved: "Reserved",
      unavailable: "Unavailable",
    },
    visibility: {
      public: "Public",
      private: "Private",
    },
    new: {
      eyebrow: "New book",
      title: "Prepare a new book record",
      description:
        "The form is still non-persistent: it defines the user flow before connecting the database and real CRUD.",
      backToDashboardLabel: "Dashboard",
      backToCatalogLabel: "Catalog",
      formTitle: "Main details",
      formDescription: "Fill in a book record saved to the local mock JSON file.",
      submitLabel: "Save book",
      pendingLabel: "Saving...",
      successMessage: "Book saved to the local mock JSON file.",
      unauthorizedMessage: "You must sign in to add a book.",
      genericErrorMessage: "The book could not be saved.",
      fields: {
        title: {
          label: "Title",
          placeholder: "The Name of the Rose",
        },
        author: {
          label: "Author",
          placeholder: "Umberto Eco",
        },
        isbn: {
          label: "ISBN",
          placeholder: "9788845292613",
        },
        description: {
          label: "Description",
          placeholder: "Add a short description of the book.",
        },
        status: {
          label: "Status",
        },
        visibility: {
          label: "Visibility",
        },
      },
    },
  },
} as const;
