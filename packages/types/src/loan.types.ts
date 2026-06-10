export type LoanRequestStatus = "pending" | "accepted" | "rejected" | "cancelled" | "completed";

export type LoanRequest = {
  id: string;
  bookId: string;
  requesterId: string;
  ownerId: string;
  status: LoanRequestStatus;
  message?: string;
  createdAt: string;
  updatedAt: string;
};