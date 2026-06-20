import { prisma } from "@culturando/db";
import type { LoanRequest, LoanRequestStatus, LoanRequestType } from "@culturando/types";

export type ReceivedLoanRequest = LoanRequest & {
  book: {
    id: string;
    title: string;
    author: string;
  };
  requester: {
    name?: string;
    email?: string;
  };
};

export type SentLoanRequest = LoanRequest & {
  book: {
    id: string;
    title: string;
    author: string;
  };
  owner: {
    name?: string;
    email?: string;
  };
};

export type CreateLoanRequestInput = {
  bookId: string;
  requesterId: string;
  ownerId: string;
  type: LoanRequestType;
  message?: string;
};

export async function createStoredLoanRequest(input: CreateLoanRequestInput) {
  return prisma.loanRequest.create({
    data: input,
  });
}

export async function updatePendingLoanRequestStatus({
  ownerId,
  requestId,
  status,
}: {
  ownerId: string;
  requestId: string;
  status: Extract<LoanRequestStatus, "accepted" | "rejected">;
}) {
  return prisma.loanRequest.updateMany({
    where: {
      id: requestId,
      ownerId,
      status: "pending",
    },
    data: {
      status,
    },
  });
}

export async function cancelPendingLoanRequest({
  requestId,
  requesterId,
}: {
  requestId: string;
  requesterId: string;
}) {
  return prisma.loanRequest.updateMany({
    where: {
      id: requestId,
      requesterId,
      status: "pending",
    },
    data: {
      status: "cancelled",
    },
  });
}

export async function getReceivedLoanRequests(ownerId: string): Promise<ReceivedLoanRequest[]> {
  const requests = await prisma.loanRequest.findMany({
    where: {
      ownerId,
    },
    include: {
      book: {
        select: {
          id: true,
          title: true,
          author: true,
        },
      },
      requester: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return requests.map((request) => ({
    id: request.id,
    bookId: request.bookId,
    requesterId: request.requesterId,
    ownerId: request.ownerId,
    type: request.type,
    status: request.status,
    message: request.message ?? undefined,
    createdAt: request.createdAt.toISOString(),
    updatedAt: request.updatedAt.toISOString(),
    book: request.book,
    requester: {
      name: request.requester.name ?? undefined,
      email: request.requester.email ?? undefined,
    },
  }));
}

export async function getSentLoanRequests(requesterId: string): Promise<SentLoanRequest[]> {
  const requests = await prisma.loanRequest.findMany({
    where: {
      requesterId,
    },
    include: {
      book: {
        select: {
          id: true,
          title: true,
          author: true,
        },
      },
      owner: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return requests.map((request) => ({
    id: request.id,
    bookId: request.bookId,
    requesterId: request.requesterId,
    ownerId: request.ownerId,
    type: request.type,
    status: request.status,
    message: request.message ?? undefined,
    createdAt: request.createdAt.toISOString(),
    updatedAt: request.updatedAt.toISOString(),
    book: request.book,
    owner: {
      name: request.owner.name ?? undefined,
      email: request.owner.email ?? undefined,
    },
  }));
}
