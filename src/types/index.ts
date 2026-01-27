export type Brand = 'UPPAbaby' | 'Nuna' | 'SNOO' | 'Stokke';
export type ItemCategory = 'Stroller' | 'Bassinet' | 'Car Seat' | 'High Chair';
export type SafetyStatus = 'Verified Model' | 'Check Recall' | 'Unknown' | 'Recalled';

export interface Hunt {
  id: string;
  user_id: string;
  brand: Brand;
  item_name: string | null;
  category: ItemCategory;
  max_price: number;
  zip_code: string;
  radius_miles: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FoundItem {
  id: string;
  hunt_id: string;
  brand: Brand;
  category: ItemCategory;
  title: string;
  price: number;
  retail_price: number | null;
  link: string;
  image_url: string | null;
  safety_status: SafetyStatus;
  location: string | null;
  found_at: string;
  is_viewed: boolean;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  telegram_username: string | null;
  telegram_connected: boolean;
  created_at: string;
  updated_at: string;
}
