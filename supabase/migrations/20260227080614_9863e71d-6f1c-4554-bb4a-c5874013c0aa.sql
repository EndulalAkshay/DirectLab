
-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('patient', 'lab', 'collector', 'admin');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- Function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1
$$;

-- RLS for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    full_name TEXT NOT NULL DEFAULT '',
    phone TEXT DEFAULT '',
    address TEXT DEFAULT '',
    city TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are viewable by authenticated users" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Labs table
CREATE TABLE public.labs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    lab_name TEXT NOT NULL,
    description TEXT DEFAULT '',
    location TEXT DEFAULT '',
    city TEXT DEFAULT '',
    certifications TEXT[] DEFAULT '{}',
    is_nabl_certified BOOLEAN DEFAULT false,
    rating NUMERIC(2,1) DEFAULT 0.0,
    price_list JSONB DEFAULT '[]'::jsonb,
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.labs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Labs are viewable by everyone" ON public.labs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Lab owners can update their lab" ON public.labs FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Lab role can insert lab" ON public.labs FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'lab'));
CREATE POLICY "Admins can manage labs" ON public.labs FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Bookings table
CREATE TABLE public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    lab_id UUID REFERENCES public.labs(id) ON DELETE CASCADE NOT NULL,
    collector_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    test_type TEXT NOT NULL,
    booking_date DATE NOT NULL,
    booking_time TEXT DEFAULT '09:00',
    status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested','collector_assigned','sample_collected','testing','report_ready','cancelled')),
    report_file TEXT,
    notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Patients can view own bookings" ON public.bookings FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "Labs can view their bookings" ON public.bookings FOR SELECT USING (EXISTS (SELECT 1 FROM public.labs WHERE labs.id = bookings.lab_id AND labs.owner_id = auth.uid()));
CREATE POLICY "Collectors can view assigned bookings" ON public.bookings FOR SELECT USING (auth.uid() = collector_id);
CREATE POLICY "Admins can view all bookings" ON public.bookings FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Patients can create bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "Labs can update their bookings" ON public.bookings FOR UPDATE USING (EXISTS (SELECT 1 FROM public.labs WHERE labs.id = bookings.lab_id AND labs.owner_id = auth.uid()));
CREATE POLICY "Collectors can update assigned bookings" ON public.bookings FOR UPDATE USING (auth.uid() = collector_id);
CREATE POLICY "Admins can manage all bookings" ON public.bookings FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Chat messages table
CREATE TABLE public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Chat participants can view messages" ON public.chat_messages FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.bookings WHERE bookings.id = chat_messages.booking_id AND (bookings.patient_id = auth.uid() OR EXISTS (SELECT 1 FROM public.labs WHERE labs.id = bookings.lab_id AND labs.owner_id = auth.uid())))
);
CREATE POLICY "Chat participants can send messages" ON public.chat_messages FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND EXISTS (SELECT 1 FROM public.bookings WHERE bookings.id = chat_messages.booking_id AND (bookings.patient_id = auth.uid() OR EXISTS (SELECT 1 FROM public.labs WHERE labs.id = bookings.lab_id AND labs.owner_id = auth.uid())))
);

-- Enable realtime for chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_labs_updated_at BEFORE UPDATE ON public.labs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger to auto-create user_role on signup  
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'patient'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_role_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- Storage bucket for reports
INSERT INTO storage.buckets (id, name, public) VALUES ('reports', 'reports', false);
CREATE POLICY "Authenticated users can upload reports" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'reports');
CREATE POLICY "Users can view their reports" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'reports');
