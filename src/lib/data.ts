import { Car, Customer, DealershipOffer, PricingPlan } from "./types";

export const customers: Customer[] = [
  { id: 1, name: "John Doe",  email: "john@example.com", phone: "555-1234", zip: "75001", documents: ["w2.pdf","residence.pdf"] },
  { id: 2, name: "Jane Smith",email: "jane@example.com", phone: "555-5678", zip: "94105", documents: ["income.pdf"] },
];

export const cars: Car[] = [
  { id: 1, model: "Toyota Camry", msrp: "$28,000", image: "/camry.jpg" },
  { id: 2, model: "Honda Civic",  msrp: "$24,500", image: "/civic.jpg" },
];

export const pricingPlans: PricingPlan[] = [
  { id: 1, carId: 1, plan: "Lease",   monthly: "$399", term: "36 months", apr: "4.2%" },
  { id: 2, carId: 2, plan: "Finance", monthly: "$450", term: "60 months", apr: "3.5%" },
];

export const initialOffers: DealershipOffer[] = [
  { id: 1, customerId: 1, carId: 1, planId: 1, status: "Approved", dealerPDF: "toyota_camry_plan.pdf" },
];
