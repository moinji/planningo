-- PLANNINGO Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum Types
CREATE TYPE trip_status AS ENUM ('planning', 'ongoing', 'completed');
CREATE TYPE member_role AS ENUM ('owner', 'admin', 'member');
CREATE TYPE expense_category AS ENUM ('food', 'transport', 'accommodation', 'activity', 'shopping', 'other');
CREATE TYPE split_type AS ENUM ('equal', 'custom', 'individual');
CREATE TYPE place_category AS ENUM ('restaurant', 'cafe', 'attraction', 'accommodation', 'shopping', 'transport', 'other');
CREATE TYPE notification_type AS ENUM ('trip_invite', 'schedule_change', 'expense_added', 'checklist_update', 'member_joined', 'reminder');

-- Profiles Table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  nickname TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  preferred_language TEXT DEFAULT 'ko' CHECK (preferred_language IN ('ko', 'en')),
  notification_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trips Table
CREATE TABLE trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  destination TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  cover_image_url TEXT,
  status trip_status DEFAULT 'planning',
  invite_code TEXT UNIQUE NOT NULL,
  invite_code_expires_at TIMESTAMPTZ,
  budget_total NUMERIC(12, 2),
  currency TEXT DEFAULT 'KRW',
  is_domestic BOOLEAN DEFAULT true,
  timezone TEXT DEFAULT 'Asia/Seoul',
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trip Members Table
CREATE TABLE trip_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role member_role DEFAULT 'member',
  nickname_in_trip TEXT,
  color TEXT DEFAULT '#FF6B9D',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(trip_id, user_id)
);

-- Places Table
CREATE TABLE places (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  latitude NUMERIC(10, 8),
  longitude NUMERIC(11, 8),
  category place_category DEFAULT 'other',
  map_provider TEXT DEFAULT 'kakao' CHECK (map_provider IN ('kakao', 'google')),
  external_place_id TEXT,
  phone TEXT,
  website TEXT,
  notes TEXT,
  photos TEXT[] DEFAULT '{}',
  rating NUMERIC(2, 1),
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Schedules Table
CREATE TABLE schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  title TEXT NOT NULL,
  description TEXT,
  place_id UUID REFERENCES places(id) ON DELETE SET NULL,
  order_index INTEGER DEFAULT 0,
  assigned_to UUID[] DEFAULT '{}',
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Expenses Table
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  currency TEXT DEFAULT 'KRW',
  category expense_category DEFAULT 'other',
  paid_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  split_type split_type DEFAULT 'equal',
  date DATE NOT NULL,
  place_id UUID REFERENCES places(id) ON DELETE SET NULL,
  receipt_url TEXT,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Expense Participants Table
CREATE TABLE expense_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  expense_id UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL,
  is_settled BOOLEAN DEFAULT false,
  settled_at TIMESTAMPTZ,
  UNIQUE(expense_id, user_id)
);

-- Checklists Table
CREATE TABLE checklists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  is_shared BOOLEAN DEFAULT true,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Checklist Items Table
CREATE TABLE checklist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  checklist_id UUID NOT NULL REFERENCES checklists(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  due_date DATE,
  order_index INTEGER DEFAULT 0,
  completed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications Table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trip Invitations Table
CREATE TABLE trip_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  invited_email TEXT,
  invite_code TEXT NOT NULL,
  invited_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity Logs Table (for realtime updates)
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_trips_created_by ON trips(created_by);
CREATE INDEX idx_trips_invite_code ON trips(invite_code);
CREATE INDEX idx_trip_members_trip_id ON trip_members(trip_id);
CREATE INDEX idx_trip_members_user_id ON trip_members(user_id);
CREATE INDEX idx_schedules_trip_id ON schedules(trip_id);
CREATE INDEX idx_schedules_date ON schedules(date);
CREATE INDEX idx_expenses_trip_id ON expenses(trip_id);
CREATE INDEX idx_expense_participants_expense_id ON expense_participants(expense_id);
CREATE INDEX idx_checklists_trip_id ON checklists(trip_id);
CREATE INDEX idx_checklist_items_checklist_id ON checklist_items(checklist_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_activity_logs_trip_id ON activity_logs(trip_id);

-- Updated At Trigger Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_trips_updated_at BEFORE UPDATE ON trips FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_schedules_updated_at BEFORE UPDATE ON schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_checklists_updated_at BEFORE UPDATE ON checklists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE places ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Trips Policies (members can access)
CREATE POLICY "Trip members can view trips" ON trips FOR SELECT
  USING (EXISTS (SELECT 1 FROM trip_members WHERE trip_members.trip_id = trips.id AND trip_members.user_id = auth.uid()));
CREATE POLICY "Authenticated users can create trips" ON trips FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Trip owner/admin can update trips" ON trips FOR UPDATE
  USING (EXISTS (SELECT 1 FROM trip_members WHERE trip_members.trip_id = trips.id AND trip_members.user_id = auth.uid() AND trip_members.role IN ('owner', 'admin')));
CREATE POLICY "Trip owner can delete trips" ON trips FOR DELETE
  USING (EXISTS (SELECT 1 FROM trip_members WHERE trip_members.trip_id = trips.id AND trip_members.user_id = auth.uid() AND trip_members.role = 'owner'));

-- Trip Members Policies
CREATE POLICY "Trip members can view members" ON trip_members FOR SELECT
  USING (EXISTS (SELECT 1 FROM trip_members tm WHERE tm.trip_id = trip_members.trip_id AND tm.user_id = auth.uid()));
CREATE POLICY "Trip owner/admin can add members" ON trip_members FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM trip_members tm WHERE tm.trip_id = trip_members.trip_id AND tm.user_id = auth.uid() AND tm.role IN ('owner', 'admin')) OR trip_members.user_id = auth.uid());
CREATE POLICY "Trip owner/admin can update members" ON trip_members FOR UPDATE
  USING (EXISTS (SELECT 1 FROM trip_members tm WHERE tm.trip_id = trip_members.trip_id AND tm.user_id = auth.uid() AND tm.role IN ('owner', 'admin')));
CREATE POLICY "Users can leave trips" ON trip_members FOR DELETE
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM trip_members tm WHERE tm.trip_id = trip_members.trip_id AND tm.user_id = auth.uid() AND tm.role = 'owner'));

-- Places Policies (trip members can access)
CREATE POLICY "Trip members can view places" ON places FOR SELECT
  USING (EXISTS (SELECT 1 FROM trip_members WHERE trip_members.trip_id = places.trip_id AND trip_members.user_id = auth.uid()));
CREATE POLICY "Trip members can create places" ON places FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM trip_members WHERE trip_members.trip_id = places.trip_id AND trip_members.user_id = auth.uid()));
CREATE POLICY "Trip members can update places" ON places FOR UPDATE
  USING (EXISTS (SELECT 1 FROM trip_members WHERE trip_members.trip_id = places.trip_id AND trip_members.user_id = auth.uid()));
CREATE POLICY "Creator/owner can delete places" ON places FOR DELETE
  USING (auth.uid() = created_by OR EXISTS (SELECT 1 FROM trip_members WHERE trip_members.trip_id = places.trip_id AND trip_members.user_id = auth.uid() AND trip_members.role = 'owner'));

-- Schedules Policies
CREATE POLICY "Trip members can view schedules" ON schedules FOR SELECT
  USING (EXISTS (SELECT 1 FROM trip_members WHERE trip_members.trip_id = schedules.trip_id AND trip_members.user_id = auth.uid()));
CREATE POLICY "Trip members can create schedules" ON schedules FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM trip_members WHERE trip_members.trip_id = schedules.trip_id AND trip_members.user_id = auth.uid()));
CREATE POLICY "Trip members can update schedules" ON schedules FOR UPDATE
  USING (EXISTS (SELECT 1 FROM trip_members WHERE trip_members.trip_id = schedules.trip_id AND trip_members.user_id = auth.uid()));
CREATE POLICY "Creator/owner can delete schedules" ON schedules FOR DELETE
  USING (auth.uid() = created_by OR EXISTS (SELECT 1 FROM trip_members WHERE trip_members.trip_id = schedules.trip_id AND trip_members.user_id = auth.uid() AND trip_members.role = 'owner'));

-- Expenses Policies (creator and owner can modify/delete per requirements)
CREATE POLICY "Trip members can view expenses" ON expenses FOR SELECT
  USING (EXISTS (SELECT 1 FROM trip_members WHERE trip_members.trip_id = expenses.trip_id AND trip_members.user_id = auth.uid()));
CREATE POLICY "Trip members can create expenses" ON expenses FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM trip_members WHERE trip_members.trip_id = expenses.trip_id AND trip_members.user_id = auth.uid()));
CREATE POLICY "Creator or owner can update expenses" ON expenses FOR UPDATE
  USING (auth.uid() = created_by OR EXISTS (SELECT 1 FROM trip_members WHERE trip_members.trip_id = expenses.trip_id AND trip_members.user_id = auth.uid() AND trip_members.role = 'owner'));
CREATE POLICY "Creator or owner can delete expenses" ON expenses FOR DELETE
  USING (auth.uid() = created_by OR EXISTS (SELECT 1 FROM trip_members WHERE trip_members.trip_id = expenses.trip_id AND trip_members.user_id = auth.uid() AND trip_members.role = 'owner'));

-- Expense Participants Policies
CREATE POLICY "Trip members can view expense participants" ON expense_participants FOR SELECT
  USING (EXISTS (SELECT 1 FROM expenses e JOIN trip_members tm ON tm.trip_id = e.trip_id WHERE e.id = expense_participants.expense_id AND tm.user_id = auth.uid()));
CREATE POLICY "Trip members can create expense participants" ON expense_participants FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM expenses e JOIN trip_members tm ON tm.trip_id = e.trip_id WHERE e.id = expense_participants.expense_id AND tm.user_id = auth.uid()));
CREATE POLICY "Trip members can update expense participants" ON expense_participants FOR UPDATE
  USING (EXISTS (SELECT 1 FROM expenses e JOIN trip_members tm ON tm.trip_id = e.trip_id WHERE e.id = expense_participants.expense_id AND tm.user_id = auth.uid()));

-- Checklists Policies
CREATE POLICY "Trip members can view checklists" ON checklists FOR SELECT
  USING (EXISTS (SELECT 1 FROM trip_members WHERE trip_members.trip_id = checklists.trip_id AND trip_members.user_id = auth.uid()));
CREATE POLICY "Trip members can create checklists" ON checklists FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM trip_members WHERE trip_members.trip_id = checklists.trip_id AND trip_members.user_id = auth.uid()));
CREATE POLICY "Trip members can update checklists" ON checklists FOR UPDATE
  USING (EXISTS (SELECT 1 FROM trip_members WHERE trip_members.trip_id = checklists.trip_id AND trip_members.user_id = auth.uid()));
CREATE POLICY "Creator/owner can delete checklists" ON checklists FOR DELETE
  USING (auth.uid() = created_by OR EXISTS (SELECT 1 FROM trip_members WHERE trip_members.trip_id = checklists.trip_id AND trip_members.user_id = auth.uid() AND trip_members.role = 'owner'));

-- Checklist Items Policies
CREATE POLICY "Trip members can view checklist items" ON checklist_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM checklists c JOIN trip_members tm ON tm.trip_id = c.trip_id WHERE c.id = checklist_items.checklist_id AND tm.user_id = auth.uid()));
CREATE POLICY "Trip members can create checklist items" ON checklist_items FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM checklists c JOIN trip_members tm ON tm.trip_id = c.trip_id WHERE c.id = checklist_items.checklist_id AND tm.user_id = auth.uid()));
CREATE POLICY "Trip members can update checklist items" ON checklist_items FOR UPDATE
  USING (EXISTS (SELECT 1 FROM checklists c JOIN trip_members tm ON tm.trip_id = c.trip_id WHERE c.id = checklist_items.checklist_id AND tm.user_id = auth.uid()));
CREATE POLICY "Trip members can delete checklist items" ON checklist_items FOR DELETE
  USING (EXISTS (SELECT 1 FROM checklists c JOIN trip_members tm ON tm.trip_id = c.trip_id WHERE c.id = checklist_items.checklist_id AND tm.user_id = auth.uid()));

-- Notifications Policies (users can only see their own)
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System can insert notifications" ON notifications FOR INSERT WITH CHECK (true);

-- Activity Logs Policies
CREATE POLICY "Trip members can view activity logs" ON activity_logs FOR SELECT
  USING (EXISTS (SELECT 1 FROM trip_members WHERE trip_members.trip_id = activity_logs.trip_id AND trip_members.user_id = auth.uid()));
CREATE POLICY "Trip members can create activity logs" ON activity_logs FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM trip_members WHERE trip_members.trip_id = activity_logs.trip_id AND trip_members.user_id = auth.uid()));

-- Trip Invitations Policies
CREATE POLICY "Trip members can view invitations" ON trip_invitations FOR SELECT
  USING (EXISTS (SELECT 1 FROM trip_members WHERE trip_members.trip_id = trip_invitations.trip_id AND trip_members.user_id = auth.uid()));
CREATE POLICY "Trip owner/admin can create invitations" ON trip_invitations FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM trip_members WHERE trip_members.trip_id = trip_invitations.trip_id AND trip_members.user_id = auth.uid() AND trip_members.role IN ('owner', 'admin')));
CREATE POLICY "Trip owner/admin can update invitations" ON trip_invitations FOR UPDATE
  USING (EXISTS (SELECT 1 FROM trip_members WHERE trip_members.trip_id = trip_invitations.trip_id AND trip_members.user_id = auth.uid() AND trip_members.role IN ('owner', 'admin')));

-- Enable Realtime for relevant tables
ALTER PUBLICATION supabase_realtime ADD TABLE trips;
ALTER PUBLICATION supabase_realtime ADD TABLE trip_members;
ALTER PUBLICATION supabase_realtime ADD TABLE schedules;
ALTER PUBLICATION supabase_realtime ADD TABLE expenses;
ALTER PUBLICATION supabase_realtime ADD TABLE expense_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE checklists;
ALTER PUBLICATION supabase_realtime ADD TABLE checklist_items;
ALTER PUBLICATION supabase_realtime ADD TABLE activity_logs;

-- Create profile on user signup (trigger)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nickname, preferred_language, notification_enabled)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nickname', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'ko'),
    true
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
