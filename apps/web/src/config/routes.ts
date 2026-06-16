export const routes = {
  home: "/",
  auth: "/auth",
  login: "/auth/login",
  signup: "/auth/signup",
  dashboard: "/dashboard",
  nearby: "/nearby",
  books: "/books",
  bookDetail: (bookId: string) => `/books/${bookId}`,
  nearbyBooks: (bookId: string) => `/books/${bookId}/nearby`,
  newBook: "/dashboard/books/new",
} as const;
