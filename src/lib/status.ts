export type PaymentStatus = "pending" | "approved" | "rejected";

export const STATUS_LABEL: Record<PaymentStatus, string> = {
  pending: "Pending Payment Verification",
  approved: "Payment Approved · Enrolled",
  rejected: "Payment Rejected",
};

export const STATUS_CLASS: Record<PaymentStatus, string> = {
  pending: "border-accent text-accent",
  approved: "border-secondary text-secondary",
  rejected: "border-destructive text-destructive",
};
