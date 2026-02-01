// Re-export all types
export * from "./database";

// Common UI types
export interface SelectOption {
  value: string;
  label: string;
}

export interface TabItem {
  id: string;
  label: string;
  icon?: string;
}

export interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
}

// Form types
export interface FormFieldError {
  message: string;
  type: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Map types
export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface MapMarker {
  id: string;
  position: Coordinates;
  title: string;
  category?: string;
  isSelected?: boolean;
}

// Date range type
export interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

// Settlement calculation types
export interface Settlement {
  from: string;
  to: string;
  amount: number;
}

export interface MemberBalance {
  userId: string;
  nickname: string;
  paid: number;
  shouldPay: number;
  balance: number;
}

// Realtime types
export interface RealtimePresence {
  odatauser_id: string;
  nickname: string;
  avatar_url: string | null;
  online_at: string;
  current_view?: string;
}

export interface RealtimePayload<T> {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new: T | null;
  old: T | null;
}
