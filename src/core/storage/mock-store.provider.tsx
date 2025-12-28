import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

export type MockEvent = {
  id: string;
  title: string;
  date: string; // ISO
  startTime?: string;
  endTime?: string;
  categoryId?: string;
  description?: string;
  serviceId?: string;
  customerName?: string;
};

export type MockService = {
  id: string;
  title: string;
  providerName?: string;
  price?: number;
  description?: string;
};

export type FinanceEntry = {
  id: string;
  serviceId?: string;
  amount: number;
  date: string;
  note?: string;
};

export type MockStoreState = {
  events: MockEvent[];
  services: MockService[];
  finance: FinanceEntry[];
  seed: () => void;
  addEvent: (e: MockEvent) => MockEvent;
  removeEvent: (id: string) => void;
  addService: (s: MockService) => MockService;
  removeService: (id: string) => void;
  addFinanceEntry: (f: FinanceEntry) => FinanceEntry;
  removeFinanceEntry: (id: string) => void;
};

const MockStoreContext = createContext<MockStoreState | null>(null);

function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

export function MockStoreProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<MockEvent[]>([]);
  const [services, setServices] = useState<MockService[]>([]);
  const [finance, setFinance] = useState<FinanceEntry[]>([]);

  const seed = useCallback(() => {
    const svc1: MockService = {
      id: uid("svc"),
      title: "Corte de cabelo - padrão",
      providerName: "Barbearia Central",
      price: 50,
      description: "Corte simples com acabamento.",
    };

    const svc2: MockService = {
      id: uid("svc"),
      title: "Hidratação capilar",
      providerName: "Studio Beleza",
      price: 120,
      description: "Hidratação completa e finalização.",
    };

    setServices([svc1, svc2]);

    const ev1: MockEvent = {
      id: uid("ev"),
      title: "Agendamento - Corte",
      serviceId: svc1.id,
      categoryId: "work",
      date: new Date().toISOString().split("T")[0],
      startTime: "09:00",
      endTime: "09:30",
      customerName: "João Silva",
      description: "Agendamento seed",
    };

    setEvents([ev1]);

    const f1: FinanceEntry = {
      id: uid("f"),
      serviceId: svc1.id,
      amount: svc1.price ?? 0,
      date: new Date().toISOString(),
      note: "Recebimento cartão",
    };

    setFinance([f1]);
  }, []);

  const addEvent = useCallback((e: MockEvent) => {
    const next = { ...e, id: e.id ?? uid("ev") };
    setEvents((s) => [next, ...s]);
    return next;
  }, []);

  const removeEvent = useCallback((id: string) => {
    setEvents((s) => s.filter((x) => x.id !== id));
  }, []);

  const addService = useCallback((s: MockService) => {
    const next = { ...s, id: s.id ?? uid("svc") };
    setServices((st) => [next, ...st]);
    return next;
  }, []);

  const removeService = useCallback((id: string) => {
    setServices((s) => s.filter((x) => x.id !== id));
  }, []);

  const addFinanceEntry = useCallback((f: FinanceEntry) => {
    const next = { ...f, id: f.id ?? uid("f") };
    setFinance((s) => [next, ...s]);
    return next;
  }, []);

  const removeFinanceEntry = useCallback((id: string) => {
    setFinance((s) => s.filter((x) => x.id !== id));
  }, []);

  const value = useMemo(
    () => ({
      events,
      services,
      finance,
      seed,
      addEvent,
      removeEvent,
      addService,
      removeService,
      addFinanceEntry,
      removeFinanceEntry,
    }),
    [events, services, finance, seed, addEvent, removeEvent, addService, removeService, addFinanceEntry, removeFinanceEntry]
  );

  return <MockStoreContext.Provider value={value}>{children}</MockStoreContext.Provider>;
}

export function useMockStore(): MockStoreState {
  const ctx = useContext(MockStoreContext);
  if (!ctx) throw new Error("useMockStore must be used within MockStoreProvider");
  return ctx;
}

export default MockStoreProvider;
