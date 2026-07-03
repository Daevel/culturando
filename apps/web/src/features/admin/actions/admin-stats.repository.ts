import { prisma } from "@culturando/db";

export type AdminStats = {
  usersCount: number;
  booksCount: number;
  publicBooksCount: number;
  privateBooksCount: number;
  requestsCount: number;
  pendingRequestsCount: number;
  acceptedRequestsCount: number;
  rejectedRequestsCount: number;
  cancelledRequestsCount: number;
  totalViewsCount: number;
  latestUsers: Array<{
    id: string;
    name?: string;
    email: string;
    createdAt: string;
  }>;
  latestBooks: Array<{
    id: string;
    title: string;
    author: string;
    ownerName?: string;
    ownerEmail: string;
    createdAt: string;
  }>;
};

export async function getAdminStats(): Promise<AdminStats> {
  const [
    usersCount,
    booksCount,
    publicBooksCount,
    privateBooksCount,
    requestStats,
    ownedBookStats,
    latestUsers,
    latestBooks,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.book.count(),
    prisma.book.count({ where: { visibility: "public" } }),
    prisma.book.count({ where: { visibility: "private" } }),
    prisma.loanRequest.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.book.findMany({
      select: {
        stats: { select: { viewCount: true } },
      },
    }),
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.book.findMany({
      select: {
        id: true,
        title: true,
        author: true,
        createdAt: true,
        owner: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const getRequestsCountByStatus = (status: "accepted" | "cancelled" | "pending" | "rejected") =>
    requestStats.find((item) => item.status === status)?._count._all ?? 0;

  return {
    usersCount,
    booksCount,
    publicBooksCount,
    privateBooksCount,
    requestsCount: requestStats.reduce((total, item) => total + item._count._all, 0),
    pendingRequestsCount: getRequestsCountByStatus("pending"),
    acceptedRequestsCount: getRequestsCountByStatus("accepted"),
    rejectedRequestsCount: getRequestsCountByStatus("rejected"),
    cancelledRequestsCount: getRequestsCountByStatus("cancelled"),
    totalViewsCount: ownedBookStats.reduce(
      (total, book) => total + (book.stats?.viewCount ?? 0),
      0,
    ),
    latestUsers: latestUsers.map((user) => ({
      id: user.id,
      name: user.name ?? undefined,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
    })),
    latestBooks: latestBooks.map((book) => ({
      id: book.id,
      title: book.title,
      author: book.author,
      ownerName: book.owner.name ?? undefined,
      ownerEmail: book.owner.email,
      createdAt: book.createdAt.toISOString(),
    })),
  };
}
