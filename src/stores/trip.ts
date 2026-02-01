import { create } from "zustand";
import type { Trip, TripMember, Schedule, Expense, Checklist, Place } from "@/types";

interface TripState {
  // Current trip data
  currentTrip: Trip | null;
  members: TripMember[];
  schedules: Schedule[];
  expenses: Expense[];
  checklists: Checklist[];
  places: Place[];

  // UI state
  selectedDate: string | null;
  activeTab: "schedule" | "expense" | "checklist" | "place";

  // Actions
  setCurrentTrip: (trip: Trip | null) => void;
  setMembers: (members: TripMember[]) => void;
  setSchedules: (schedules: Schedule[]) => void;
  setExpenses: (expenses: Expense[]) => void;
  setChecklists: (checklists: Checklist[]) => void;
  setPlaces: (places: Place[]) => void;
  setSelectedDate: (date: string | null) => void;
  setActiveTab: (tab: "schedule" | "expense" | "checklist" | "place") => void;

  // Schedule actions
  addSchedule: (schedule: Schedule) => void;
  updateSchedule: (id: string, updates: Partial<Schedule>) => void;
  removeSchedule: (id: string) => void;
  reorderSchedules: (schedules: Schedule[]) => void;

  // Expense actions
  addExpense: (expense: Expense) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  removeExpense: (id: string) => void;

  // Checklist actions
  addChecklist: (checklist: Checklist) => void;
  updateChecklist: (id: string, updates: Partial<Checklist>) => void;
  removeChecklist: (id: string) => void;

  // Place actions
  addPlace: (place: Place) => void;
  updatePlace: (id: string, updates: Partial<Place>) => void;
  removePlace: (id: string) => void;

  // Reset
  resetTrip: () => void;
}

const initialState = {
  currentTrip: null,
  members: [],
  schedules: [],
  expenses: [],
  checklists: [],
  places: [],
  selectedDate: null,
  activeTab: "schedule" as const,
};

export const useTripStore = create<TripState>((set) => ({
  ...initialState,

  setCurrentTrip: (trip) => set({ currentTrip: trip }),
  setMembers: (members) => set({ members }),
  setSchedules: (schedules) => set({ schedules }),
  setExpenses: (expenses) => set({ expenses }),
  setChecklists: (checklists) => set({ checklists }),
  setPlaces: (places) => set({ places }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setActiveTab: (tab) => set({ activeTab: tab }),

  addSchedule: (schedule) =>
    set((state) => ({ schedules: [...state.schedules, schedule] })),
  updateSchedule: (id, updates) =>
    set((state) => ({
      schedules: state.schedules.map((s) =>
        s.id === id ? { ...s, ...updates } : s
      ),
    })),
  removeSchedule: (id) =>
    set((state) => ({
      schedules: state.schedules.filter((s) => s.id !== id),
    })),
  reorderSchedules: (schedules) => set({ schedules }),

  addExpense: (expense) =>
    set((state) => ({ expenses: [...state.expenses, expense] })),
  updateExpense: (id, updates) =>
    set((state) => ({
      expenses: state.expenses.map((e) =>
        e.id === id ? { ...e, ...updates } : e
      ),
    })),
  removeExpense: (id) =>
    set((state) => ({
      expenses: state.expenses.filter((e) => e.id !== id),
    })),

  addChecklist: (checklist) =>
    set((state) => ({ checklists: [...state.checklists, checklist] })),
  updateChecklist: (id, updates) =>
    set((state) => ({
      checklists: state.checklists.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    })),
  removeChecklist: (id) =>
    set((state) => ({
      checklists: state.checklists.filter((c) => c.id !== id),
    })),

  addPlace: (place) =>
    set((state) => ({ places: [...state.places, place] })),
  updatePlace: (id, updates) =>
    set((state) => ({
      places: state.places.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    })),
  removePlace: (id) =>
    set((state) => ({
      places: state.places.filter((p) => p.id !== id),
    })),

  resetTrip: () => set(initialState),
}));
