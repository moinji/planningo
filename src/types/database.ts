// Database Types for PLANNINGO
// Based on Supabase schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Enums
export type TripStatus = "planning" | "ongoing" | "completed";
export type MemberRole = "owner" | "admin" | "member";
export type ExpenseCategory =
  | "food"
  | "transport"
  | "accommodation"
  | "activity"
  | "shopping"
  | "other";
export type SplitType = "equal" | "custom" | "individual";
export type PlaceCategory =
  | "restaurant"
  | "cafe"
  | "attraction"
  | "accommodation"
  | "shopping"
  | "transport"
  | "other";
export type NotificationType =
  | "trip_invite"
  | "schedule_change"
  | "expense_added"
  | "checklist_update"
  | "member_joined"
  | "reminder";

// User Profile
export interface Profile {
  id: string;
  email: string;
  nickname: string;
  avatar_url: string | null;
  bio: string | null;
  preferred_language: "ko" | "en";
  notification_enabled: boolean;
  created_at: string;
  updated_at: string;
}

// Trip
export interface Trip {
  id: string;
  title: string;
  description: string | null;
  destination: string;
  start_date: string;
  end_date: string;
  cover_image_url: string | null;
  status: TripStatus;
  invite_code: string;
  invite_code_expires_at: string | null;
  budget_total: number | null;
  currency: string;
  is_domestic: boolean;
  timezone: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Trip Member
export interface TripMember {
  id: string;
  trip_id: string;
  user_id: string;
  role: MemberRole;
  nickname_in_trip: string | null;
  color: string;
  joined_at: string;
}

// Schedule Item
export interface Schedule {
  id: string;
  trip_id: string;
  date: string;
  start_time: string | null;
  end_time: string | null;
  title: string;
  description: string | null;
  place_id: string | null;
  order_index: number;
  assigned_to: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Place
export interface Place {
  id: string;
  trip_id: string;
  name: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  category: PlaceCategory;
  map_provider: "kakao" | "google";
  external_place_id: string | null;
  phone: string | null;
  website: string | null;
  notes: string | null;
  photos: string[];
  rating: number | null;
  created_by: string;
  created_at: string;
}

// Expense
export interface Expense {
  id: string;
  trip_id: string;
  title: string;
  amount: number;
  currency: string;
  category: ExpenseCategory;
  paid_by: string;
  split_type: SplitType;
  date: string;
  place_id: string | null;
  receipt_url: string | null;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Expense Participant (for splitting)
export interface ExpenseParticipant {
  id: string;
  expense_id: string;
  user_id: string;
  amount: number;
  is_settled: boolean;
  settled_at: string | null;
}

// Checklist
export interface Checklist {
  id: string;
  trip_id: string;
  title: string;
  is_shared: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Checklist Item
export interface ChecklistItem {
  id: string;
  checklist_id: string;
  content: string;
  is_completed: boolean;
  assigned_to: string | null;
  due_date: string | null;
  order_index: number;
  completed_by: string | null;
  completed_at: string | null;
  created_at: string;
}

// Notification
export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data: Json;
  is_read: boolean;
  created_at: string;
}

// Trip Invitation
export interface TripInvitation {
  id: string;
  trip_id: string;
  invited_email: string | null;
  invite_code: string;
  invited_by: string;
  status: "pending" | "accepted" | "declined" | "expired";
  expires_at: string;
  created_at: string;
}

// Activity Log (for realtime updates)
export interface ActivityLog {
  id: string;
  trip_id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: Json;
  created_at: string;
}

// Database schema type for Supabase client
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at" | "updated_at">;
        Update: Partial<Omit<Profile, "id" | "created_at">>;
      };
      trips: {
        Row: Trip;
        Insert: Omit<Trip, "id" | "created_at" | "updated_at" | "invite_code">;
        Update: Partial<Omit<Trip, "id" | "created_at" | "created_by">>;
      };
      trip_members: {
        Row: TripMember;
        Insert: Omit<TripMember, "id" | "joined_at">;
        Update: Partial<Omit<TripMember, "id" | "trip_id" | "user_id" | "joined_at">>;
      };
      schedules: {
        Row: Schedule;
        Insert: Omit<Schedule, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Schedule, "id" | "trip_id" | "created_at" | "created_by">>;
      };
      places: {
        Row: Place;
        Insert: Omit<Place, "id" | "created_at">;
        Update: Partial<Omit<Place, "id" | "trip_id" | "created_at" | "created_by">>;
      };
      expenses: {
        Row: Expense;
        Insert: Omit<Expense, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Expense, "id" | "trip_id" | "created_at" | "created_by">>;
      };
      expense_participants: {
        Row: ExpenseParticipant;
        Insert: Omit<ExpenseParticipant, "id">;
        Update: Partial<Omit<ExpenseParticipant, "id" | "expense_id" | "user_id">>;
      };
      checklists: {
        Row: Checklist;
        Insert: Omit<Checklist, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Checklist, "id" | "trip_id" | "created_at" | "created_by">>;
      };
      checklist_items: {
        Row: ChecklistItem;
        Insert: Omit<ChecklistItem, "id" | "created_at">;
        Update: Partial<Omit<ChecklistItem, "id" | "checklist_id" | "created_at">>;
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, "id" | "created_at">;
        Update: Partial<Omit<Notification, "id" | "user_id" | "created_at">>;
      };
      trip_invitations: {
        Row: TripInvitation;
        Insert: Omit<TripInvitation, "id" | "created_at">;
        Update: Partial<Omit<TripInvitation, "id" | "trip_id" | "created_at" | "invited_by">>;
      };
      activity_logs: {
        Row: ActivityLog;
        Insert: Omit<ActivityLog, "id" | "created_at">;
        Update: never;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      trip_status: TripStatus;
      member_role: MemberRole;
      expense_category: ExpenseCategory;
      split_type: SplitType;
      place_category: PlaceCategory;
      notification_type: NotificationType;
    };
  };
}

// Utility types for joins
export type TripWithMembers = Trip & {
  members: (TripMember & { profile: Profile })[];
};

export type ScheduleWithPlace = Schedule & {
  place: Place | null;
};

export type ExpenseWithParticipants = Expense & {
  participants: (ExpenseParticipant & { profile: Profile })[];
  paid_by_profile: Profile;
};

export type ChecklistWithItems = Checklist & {
  items: ChecklistItem[];
};
