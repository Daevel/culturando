export type LoanRequestType = "consultation" | "loan" | "info";

export type LoanRequestStatus = "pending" | "accepted" | "rejected" | "cancelled" | "completed";

export type LoanRequest = {
  id: string;
  bookId: string;
  requesterId: string;
  ownerId: string;
  type: LoanRequestType;
  status: LoanRequestStatus;
  message?: string;
  createdAt: string;
  updatedAt: string;
};
