export type Customer = {
  id: number;
  name: string;
  email: string;
  phone: string;
  zip: string;
  documents: string[];
};

export type Car = { id: number; model: string; msrp: string; image: string };

export type PricingPlan = {
  id: number;
  carId: number;
  plan: "Lease" | "Finance";
  monthly: string;
  term: string;
  apr: string;
};

export type OfferStatus = "Pending" | "Approved" | "Counteroffer";

export type DealershipOffer = {
  id: number;
  customerId: number;
  carId: number;
  planId: number;
  status: OfferStatus;
  dealerPDF?: string;
};
