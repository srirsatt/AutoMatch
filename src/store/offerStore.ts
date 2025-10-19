"use client";
import { create } from "zustand";
import { DealershipOffer } from "@/lib/types";

type OfferState = {
  offers: DealershipOffer[];
  hydrate: (offers: DealershipOffer[]) => void;
  upsertOffer: (offer: DealershipOffer) => void;
  updateStatus: (id: number, status: DealershipOffer["status"]) => void;
};

export const useOfferStore = create<OfferState>((set) => ({
  offers: [],
  hydrate: (offers) => set({ offers }),
  upsertOffer: (offer) =>
    set((s) => {
      const i = s.offers.findIndex((o) => o.id === offer.id);
      if (i >= 0) {
        const copy = s.offers.slice();
        copy[i] = offer;
        return { offers: copy };
      }
      return { offers: [...s.offers, offer] };
    }),
  updateStatus: (id, status) =>
    set((s) => ({ offers: s.offers.map((o) => (o.id === id ? { ...o, status } : o)) })),
}));
