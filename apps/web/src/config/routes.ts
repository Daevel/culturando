export const routes = {
  home: "/",
  auth: "/auth",
  login: "/auth/login",
  signup: "/auth/signup",
  dashboard: "/dashboard",
  books: "/books",
  bookDetail: (bookId: string) => `/books/${bookId}`,
  newBook: "/dashboard/books/new",
} as const;
