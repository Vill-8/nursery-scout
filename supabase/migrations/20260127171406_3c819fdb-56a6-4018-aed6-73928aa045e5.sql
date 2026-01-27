-- Create enum for brands
CREATE TYPE public.brand_type AS ENUM ('UPPAbaby', 'Nuna', 'SNOO', 'Stokke');

-- Create enum for item categories
CREATE TYPE public.item_category AS ENUM ('Stroller', 'Bassinet', 'Car Seat', 'High Chair');

-- Create enum for safety status
CREATE TYPE public.safety_status AS ENUM ('Verified Model', 'Check Recall', 'Unknown', 'Recalled');

-- Create hunts table
CREATE TABLE public.hunts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  brand brand_type NOT NULL,
  category item_category NOT NULL,
  max_price INTEGER NOT NULL DEFAULT 500,
  zip_code VARCHAR(10) NOT NULL,
  radius_miles INTEGER NOT NULL DEFAULT 25,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create found_items table
CREATE TABLE public.found_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hunt_id UUID REFERENCES public.hunts(id) ON DELETE CASCADE NOT NULL,
  brand brand_type NOT NULL,
  category item_category NOT NULL,
  title VARCHAR(255) NOT NULL,
  price INTEGER NOT NULL,
  retail_price INTEGER,
  link TEXT NOT NULL,
  image_url TEXT,
  safety_status safety_status NOT NULL DEFAULT 'Unknown',
  location VARCHAR(100),
  found_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_viewed BOOLEAN NOT NULL DEFAULT false
);

-- Create profiles table for user info
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name VARCHAR(255),
  telegram_username VARCHAR(100),
  telegram_connected BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.hunts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.found_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for hunts
CREATE POLICY "Users can view their own hunts"
  ON public.hunts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own hunts"
  ON public.hunts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own hunts"
  ON public.hunts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own hunts"
  ON public.hunts FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for found_items (through hunt ownership)
CREATE POLICY "Users can view items from their hunts"
  ON public.found_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.hunts 
    WHERE hunts.id = found_items.hunt_id 
    AND hunts.user_id = auth.uid()
  ));

CREATE POLICY "Users can update items from their hunts"
  ON public.found_items FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.hunts 
    WHERE hunts.id = found_items.hunt_id 
    AND hunts.user_id = auth.uid()
  ));

-- RLS policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for timestamp updates
CREATE TRIGGER update_hunts_updated_at
  BEFORE UPDATE ON public.hunts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to auto-create profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();