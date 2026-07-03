import { prisma } from "@culturando/db";

export type DashboardStats = {
  booksCount: number;
  publicBooksCount: number;
  privateBooksCount: number;
  totalViewsCount: number;
  receivedRequestsCount: number;
  pendingRequestsCount: number;
  acceptedRequestsCount: number;
  topViewedBooks: Array<{
    id: string;
    title: string;
    author: string;
    viewCount: number;
  }>;
};

export async function getDashboardStats(ownerId: string): Promise<DashboardStats> {
  const [
    booksCount,
    publicBooksCount,
    privateBooksCount,
    requestStats,
    topViewedBooks,
    ownedBookStats,
  ] = await Promise.all([
    prisma.book.count({ where: { ownerId } }),
    prisma.book.count({ where: { ownerId, visibility: "public" } }),
    prisma.book.count({ where: { ownerId, visibility: "private" } }),
    prisma.loanRequest.groupBy({
      by: ["status"],
      where: { ownerId },
      _count: { _all: true },
    }),
    prisma.book.findMany({
      where: { ownerId },
      select: {
        id: true,
        title: true,
        author: true,
        stats: { select: { viewCount: true } },
      },
      orderBy: { stats: { viewCount: "desc" } },
      take: 5,
    }),
    prisma.book.findMany({
      where: { ownerId },
      select: {
        stats: { select: { viewCount: true } },
      },
    }),
  ]);

  const getRequestsCountByStatus = (status: "pending" | "accepted") =>
    requestStats.find((item) => item.status === status)?._count._all ?? 0;

  return {
    booksCount,
    publicBooksCount,
    privateBooksCount,
    totalViewsCount: ownedBookStats.reduce(
      (total, book) => total + (book.stats?.viewCount ?? 0),
      0,
    ),
    receivedRequestsCount: requestStats.reduce((total, item) => total + item._count._all, 0),
    pendingRequestsCount: getRequestsCountByStatus("pending"),
    acceptedRequestsCount: getRequestsCountByStatus("accepted"),
    topViewedBooks: topViewedBooks.map((book) => ({
      id: book.id,
      title: book.title,
      author: book.author,
      viewCount: book.stats?.viewCount ?? 0,
    })),
  };
}
