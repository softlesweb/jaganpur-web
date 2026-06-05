export type AnnouncementCategory =
  | "general"
  | "farming"
  | "health"
  | "school"
  | "government"
  | "emergency";

export interface Announcement {
  id: string;
  title: string;
  body: string;
  category: AnnouncementCategory;
  image_url: string | null;
  is_emergency: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  name: string;
  category: string;
  phone: string | null;
  address: string | null;
  hours: string | null;
  sort_order: number;
}

export interface GalleryPhoto {
  id: string;
  storage_path: string;
  public_url: string;
  caption: string | null;
  album_tag: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  phone: string;
  name: string | null;
  role: "resident" | "admin";
  wa_opt_in: boolean;
}
