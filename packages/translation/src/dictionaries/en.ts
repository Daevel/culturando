export const en = {
  home: {
    hero: {
      eyebrow: "Geolocated private book heritage",
      title: "Culturando",
      description:
        "Discover, share and promote books, collections and private libraries near you through a geolocated, accessible and privacy-aware web platform.",
      primaryActionLabel: "Explore books",
      nearbyActionLabel: "Search nearby",
      secondaryActionLabel: "Publish a book",
    },
    theme: {
      darkLabel: "Dark theme",
      lightLabel: "Light theme",
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
      invalidCredentialsMessage: "Invalid credentials.",
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
      successMessage:
        "We sent you a confirmation email. Open it and confirm your address to activate your account.",
      emailAlreadyExistsMessage: "This email address has already been used",
      genericErrorMessage: "The account could not be created.",
      toast: {
        title: "Check your email",
      },
      wizard: {
        progressLabel: "Signup progress",
        stepLabel: "Step",
        ofLabel: "of",
        previousLabel: "Back",
        nextLabel: "Continue",
        checkingEmailLabel: "Checking email...",
        emailAvailableMessage: "Email available",
        steps: {
          account: {
            title: "Account details",
            description: "Enter your name and email to identify your profile.",
          },
          security: {
            title: "Security",
            description: "Choose a secure password and confirm it.",
          },
          confirm: {
            title: "Confirm",
            description: "Review the main details before creating your account.",
          },
        },
        review: {
          nameLabel: "Name",
          emailLabel: "Email",
          emptyValue: "Not filled in",
          notice: "The password is not shown for security reasons.",
        },
      },
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
    confirmEmail: {
      loginLabel: "Go to login",
      success: {
        title: "Account activated successfully",
        description:
          "Thank you for confirming your email address. You can now sign in to Culturando.",
        cardTitle: "Registration completed",
        cardDescription: "Your account has been verified and is ready to be used on the portal.",
      },
      invalid: {
        title: "Invalid confirmation link",
        description: "The link may have expired, already been used, or been copied incorrectly.",
        cardTitle: "Verification not completed",
        cardDescription:
          "To sign in, you must use the confirmation link received by email after signup.",
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
      profileLabel: "Edit profile",
      booksLabel: "Explore books",
      requestsLabel: "My requests",
      adminLabel: "Admin dashboard",
    },
    stats: {
      title: "Usage statistics",
      description: "Simple metrics about your published books, views and received requests.",
      booksLabel: "Published books",
      viewsLabel: "Views",
      requestsLabel: "Received requests",
      pendingRequestsLabel: "Pending requests",
      visibilityTitle: "Publishing summary",
      publicBooksLabel: "Public books",
      privateBooksLabel: "Private books",
      acceptedRequestsLabel: "Accepted requests",
      topBooksTitle: "Most viewed books",
      emptyTopBooks: "There are no books with statistics to show yet.",
    },
  },
  admin: {
    eyebrow: "Administration",
    title: "Admin dashboard",
    description:
      "Aggregate overview of the Culturando prototype: users, publications, requests and views.",
    backToDashboardLabel: "Dashboard",
    emptyName: "Name not available",
    stats: {
      usersLabel: "Users",
      booksLabel: "Books",
      requestsLabel: "Requests",
      viewsLabel: "Views",
    },
    publication: {
      title: "Publications",
      description: "Distribution of books by visibility.",
      publicBooksLabel: "Public books",
      privateBooksLabel: "Private books",
    },
    requests: {
      title: "Loan/consultation requests",
      description: "Global status of requests handled by the platform.",
      pendingLabel: "Pending",
      acceptedLabel: "Accepted",
      rejectedLabel: "Rejected",
      cancelledLabel: "Cancelled",
    },
    latestUsers: {
      title: "Latest registered users",
      description: "Most recently created accounts in the system.",
    },
    latestBooks: {
      title: "Latest published books",
      description: "Most recently added book records.",
      ownerLabel: "Owner:",
    },
  },
  profile: {
    eyebrow: "Personal profile",
    title: "Manage your profile",
    description:
      "Update the information that describes your personal library and choose whether to make the profile visible.",
    backToDashboardLabel: "Dashboard",
    form: {
      title: "Profile information",
      description:
        "This data helps other users understand the cultural context of your collection, without showing precise addresses.",
      submitLabel: "Save profile",
      pendingLabel: "Saving...",
      successMessage: "Profile updated successfully.",
      unauthorizedMessage: "You must sign in to edit your profile.",
      genericErrorMessage: "The profile could not be updated.",
      fields: {
        name: {
          label: "Name",
          placeholder: "Luigi Avitabile",
        },
        email: {
          label: "Account email",
        },
        avatarUrl: {
          label: "Avatar URL",
          placeholder: "https://example.com/avatar.jpg",
        },
        bio: {
          label: "Bio",
          placeholder: "Briefly describe your library, interests or collection.",
        },
        city: {
          label: "City",
          placeholder: "Naples",
        },
        province: {
          label: "Province",
          placeholder: "NA",
        },
        region: {
          label: "Region",
          placeholder: "Campania",
        },
        isProfilePublic: {
          label: "Make profile visible",
          description:
            "The public profile shows only descriptive data and a general area, never precise addresses or coordinates.",
        },
      },
    },
  },
  books: {
    catalog: {
      eyebrow: "Book catalog",
      title: "Discover the first books shared by the community",
      description:
        "This demo data prepares Culturando's main flow: publishing, browsing and making private collections searchable.",
      dashboardLabel: "Back to dashboard",
      nearbyLabel: "Search by area",
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
      nearbyLabel: "Find nearby availability",
      descriptionTitle: "Description",
      ownerLabel: "Owner",
      categoryLabel: "Category",
      publisherLabel: "Publisher",
      publishedYearLabel: "Year",
      languageLabel: "Language",
      locationLabel: "Public area",
      areaLabel: "Area",
      imagesLabel: "Images",
      viewsLabel: "Views",
      approximateLocationValue: "Approximate location available",
      emptyValue: "Not available",
    },
    nearby: {
      eyebrow: "Nearby availability",
      title: "Books available in the same area",
      description: "Results sorted by approximate distance from",
      mapTitle: "Availability map",
      mapDescription:
        "Markers use only approximate public coordinates, not users' precise locations.",
      mapEmptyState: "The map is not available for this book because a public location is missing.",
      emptyState:
        "There are no other public books with an approximate location available near this volume yet.",
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
        "Fill in a real book record: it will be associated with your account and saved to the local database.",
      backToDashboardLabel: "Dashboard",
      backToCatalogLabel: "Catalog",
      formTitle: "Main details",
      formDescription: "Fill in a book record saved to the local PostgreSQL database.",
      locationTitle: "Book address",
      locationDescription:
        "Enter a readable address: later it will be geocoded automatically and shown only approximately.",
      imagesTitle: "Cover and images",
      imagesDescription:
        "Upload a cover from your device, add external URLs or let Culturando search for one by ISBN.",
      imagesHelpText:
        "The uploaded cover becomes the main image. If you do not add images and provide an ISBN, the system tries Open Library as a fallback.",
      catalogingPanelTitle: "Guided cataloging",
      catalogingPanelDescription:
        "Start from a photo, extracted text or an ISBN: Culturando helps recognize the book and suggests data to apply only after confirmation.",
      catalogingStepImageLabel: "1. Image",
      catalogingStepTextLabel: "2. Text or ISBN",
      catalogingStepMetadataLabel: "3. Book data",
      isbnExtractionTitle: "ISBN extraction from text",
      isbnExtractionDescription:
        "Paste text read from the back cover or from future OCR: Culturando tries to recognize a valid ISBN and inserts it into the ISBN field.",
      isbnExtractionPlaceholder: "ISBN 978-88-452-9261-3 or OCR text from the back cover...",
      isbnExtractionLabel: "Extract ISBN",
      isbnExtractionFoundMessage: "ISBN recognized and inserted into the form.",
      isbnExtractionNotFoundMessage: "No valid ISBN was recognized in the text.",
      ocrLookupTitle: "OCR from image",
      ocrLookupDescription:
        "Upload a photo of the back cover or cover: Culturando tries to read the title, ISBN and other useful data to fill in the form.",
      ocrLookupLabel: "Read image",
      ocrLookupPendingLabel: "Reading image...",
      ocrLookupFoundMessage: "Data recognized from the image and inserted into the form.",
      ocrLookupEmptyResponseMessage: "OCR responded, but did not return readable text.",
      ocrLookupHttpErrorMessage: "The OCR Worker returned an error. Try again shortly.",
      ocrLookupNotFoundMessage: "Text was read, but no useful title or ISBN was recognized.",
      ocrLookupMissingImageMessage: "Upload an image before starting OCR.",
      ocrLookupNetworkErrorMessage: "The OCR Worker could not be reached.",
      ocrLookupNotConfiguredMessage:
        "Cloudflare OCR is not configured. Set CLOUDFLARE_OCR_ENDPOINT to enable it.",
      ocrLookupTimeoutMessage:
        "Reading the image is taking too long. Try with a clearer or cropped photo.",
      ocrLookupTooLargeMessage: "Image too large. Use a file up to 6 MB.",
      ocrLookupUnsupportedTypeMessage: "Unsupported format. Use JPG, PNG or WebP.",
      ocrLookupErrorMessage: "The image could not be read.",
      ocrTextPreviewLabel: "Text read from the image",
      metadataLookupTitle: "Assisted cataloging",
      metadataLookupDescription:
        "Use the ISBN to search for title, author and other metadata before filling in the record.",
      metadataLookupLabel: "Search book data",
      metadataLookupPendingLabel: "Searching data...",
      metadataLookupFoundMessage:
        "Data found. Review it and apply it to the form if it is correct.",
      metadataLookupNotFoundMessage: "No data found for this ISBN.",
      metadataLookupErrorMessage: "The book data lookup could not be completed.",
      metadataLookupMissingIsbnMessage: "Enter an ISBN before searching for book data.",
      metadataPreviewTitle: "Fields that will be updated",
      metadataSourceLabel: "Source:",
      metadataSourceOpenLibrary: "Open Library",
      metadataSourceOcr: "Image OCR",
      metadataCoverAvailableLabel: "Cover available",
      metadataOverwriteWarningLabel: "Current value",
      metadataApplyLabel: "Apply to form",
      coverLookupTitle: "Automatic lookup",
      coverLookupDescription: "Use the entered ISBN to search for a cover on Open Library.",
      coverLookupLabel: "Search cover",
      coverLookupPendingLabel: "Searching...",
      coverLookupFoundMessage: "Cover found and ready to be saved.",
      coverLookupNotFoundMessage: "No cover found for this ISBN.",
      coverLookupErrorMessage: "The cover lookup could not be completed.",
      coverLookupMissingIsbnMessage: "Enter an ISBN before searching for a cover.",
      coverPreviewAlt: "Book cover preview",
      submitLabel: "Save book",
      pendingLabel: "Saving...",
      successMessage: "Book saved successfully to the database.",
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
        coverImage: {
          label: "Cover",
        },
        imageUrls: {
          label: "Additional image URLs",
          placeholder: "https://example.com/cover.jpg",
        },
      },
    },
  },
  nearby: {
    search: {
      eyebrow: "Territorial search",
      title: "Find books near an area",
      description:
        "Enter a city or address: Culturando shows public books using approximate locations only.",
      formTitle: "Search area",
      queryLabel: "City or address",
      queryPlaceholder: "Naples, Rome Prati, Turin city center...",
      radiusLabel: "Radius",
      radius5Label: "5 km",
      radius10Label: "10 km",
      radius25Label: "25 km",
      radius50Label: "50 km",
      submitLabel: "Search nearby books",
      originLabel: "Search area",
      mapTitle: "Results map",
      mapDescription:
        "The map shows the searched area and books found through approximate public coordinates.",
      mapEmptyState: "Search for an area to display the results map.",
      resultsLabel: "results near the searched area",
      emptyState: "There are no public available books near this area yet.",
      geocodingFailedMessage: "This area could not be found. Try a more specific city or address.",
    },
  },
  requests: {
    page: {
      eyebrow: "Personal area",
      title: "My requests",
      description:
        "Check the requests you sent to book owners and cancel the ones that are still pending.",
      backToDashboardLabel: "Back to dashboard",
    },
    type: {
      consultation: "Consultation",
      loan: "Loan",
      info: "Information",
    },
    status: {
      pending: "Pending",
      accepted: "Accepted",
      rejected: "Rejected",
      cancelled: "Cancelled",
      completed: "Completed",
    },
    form: {
      title: "Request contact",
      description: "Send a request to the book owner. The precise location stays private.",
      typeLabel: "Request type",
      messageLabel: "Message",
      messagePlaceholder: "Introduce yourself and briefly explain what you would like to ask.",
      submitLabel: "Send request",
      pendingLabel: "Sending...",
      successMessage: "Request sent successfully.",
      unauthorizedMessage: "You must sign in to send a request.",
      unavailableBookMessage: "This book cannot receive requests.",
      ownerMessage: "You cannot send a request for your own book.",
      genericErrorMessage: "The request could not be sent.",
    },
    received: {
      title: "Received requests",
      description: "Consultation, loan or information requests for your books.",
      emptyState: "You have not received any requests yet.",
      requesterLabel: "Requester",
      messageLabel: "Message",
      acceptLabel: "Accept",
      rejectLabel: "Reject",
    },
    sent: {
      title: "Sent requests",
      description: "Requests you sent to consult, borrow or receive information.",
      emptyState: "You have not sent any requests yet.",
      ownerLabel: "Owner",
      messageLabel: "Sent message",
      cancelLabel: "Cancel request",
    },
  },
  maps: {
    controls: {
      pauseRotationLabel: "Pause rotation",
      resetCameraLabel: "Reset view",
      resumeRotationLabel: "Resume rotation",
      switchTo2dLabel: "2D view",
      switchTo3dLabel: "3D view",
    },
    legend: {
      originLabel: "Search area",
      nearbyLabel: "Available book",
    },
  },
} as const;
