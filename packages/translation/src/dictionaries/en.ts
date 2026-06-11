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
} as const;
