export const en = {
  home: {
    hero: {
      eyebrow: "Geolocated private book heritage",
      title: "Culturando",
      description:
        "Discover, share and promote books, collections and private libraries near you through a geolocated, accessible and privacy-aware web platform.",
      primaryActionLabel: "Explore books",
      secondaryActionLabel: "Publish a book",
    },
    highlights: {
      map: {
        title: "3D map",
        description:
          "Explore nearby book availability and cultural places through an interactive map.",
      },
      cataloging: {
        title: "Assisted cataloging",
        description: "Upload a cover and use OCR and ISBN to prefill the book details.",
      },
      privacy: {
        title: "Privacy",
        description:
          "Precise locations are not shown publicly: approximate areas are used instead.",
      },
    },
  },
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
      searchLabel: "Search the catalog",
      searchPlaceholder: "Title, author, ISBN, publisher, city, category or description",
      availabilityFilterLabel: "Availability",
      visibilityFilterLabel: "Visibility",
      allAvailabilitiesLabel: "All availabilities",
      allVisibilitiesLabel: "All visibilities",
      resultsLabel: "results",
      clearFiltersLabel: "Clear filters",
    },
    grid: {
      emptyState: "There are no books to show yet.",
    },
    card: {
      emptyDescription: "Description not available.",
      isbnLabel: "ISBN",
      detailLabel: "Details",
    },
    detail: {
      eyebrow: "Book record",
      backToCatalogLabel: "Back to catalog",
      descriptionTitle: "Description",
      ownerLabel: "Owner",
      categoryLabel: "Category",
      publisherLabel: "Publisher",
      publishedYearLabel: "Year",
      languageLabel: "Language",
      locationLabel: "Public area",
      areaLabel: "Area",
      imagesLabel: "Images",
      approximateLocationValue: "Approximate location available",
      emptyValue: "Not available",
    },
    availability: {
      available: "Available",
      consultationOnly: "Consultation only",
      loanable: "Loanable",
      unavailable: "Unavailable",
    },
    visibility: {
      public: "Public",
      private: "Private",
    },
    physicalCondition: {
      new: "New",
      good: "Good",
      worn: "Worn",
      damaged: "Damaged",
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
      locationTitle: "Book address",
      locationDescription:
        "Enter a readable address: later it will be geocoded automatically and shown only approximately.",
      imagesHelpText:
        "For now you can enter image URLs, one per line. Photo upload and automatic cover lookup will arrive with storage and external APIs.",
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
        publisher: {
          label: "Publisher",
          placeholder: "Einaudi",
        },
        publishedYear: {
          label: "Publication year",
          placeholder: "1980",
        },
        language: {
          label: "Language",
          placeholder: "Italian",
        },
        category: {
          label: "Category",
          placeholder: "Historical novel",
        },
        description: {
          label: "Description",
          placeholder: "Add a short description of the book.",
        },
        availability: {
          label: "Availability",
        },
        visibility: {
          label: "Visibility",
        },
        physicalCondition: {
          label: "Physical condition",
        },
        addressLabel: {
          label: "Address",
          placeholder: "Via Roma 1, Naples",
        },
        city: {
          label: "City",
          placeholder: "Naples",
        },
        province: {
          label: "Province",
          placeholder: "Naples",
        },
        region: {
          label: "Region",
          placeholder: "Campania",
        },
        country: {
          label: "Country",
          placeholder: "Italy",
        },
        imageUrls: {
          label: "Images",
          placeholder: "https://example.com/cover.jpg",
        },
      },
    },
  },
} as const;
