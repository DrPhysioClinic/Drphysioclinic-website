/**
 * Supabase database types for the Dr Physio clinic project.
 *
 * NOTE: This file mirrors the live schema (project `sfznvsrwaquadutvlviq`).
 * The authoritative way to regenerate it is the Supabase CLI:
 *
 *     supabase login          # one-time
 *     npm run gen:types       # supabase gen types typescript --project-id sfznvsrwaquadutvlviq
 *
 * Until you run that, this hand-mirrored version keeps the app type-safe.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type Timestamps = {
  created_at: string;
  updated_at: string;
};

export interface Database {
  public: {
    Tables: {
      admins: {
        Row: { user_id: string; email: string | null; created_at: string };
        Insert: { user_id: string; email?: string | null; created_at?: string };
        Update: { user_id?: string; email?: string | null; created_at?: string };
        Relationships: [];
      };
      doctors: {
        Row: {
          id: string;
          name: string | null;
          slug: string | null;
          title: string | null;
          specialization: string | null;
          experience_years: number | null;
          education: string | null;
          memberships: string | null;
          registration_no: string | null;
          phone: string | null;
          email: string | null;
          bio: string | null;
          hero_bio: string | null;
          homepage_label: string | null;
          image_url: string | null;
          cutout_url: string | null;
          sort_order: number;
          is_featured: boolean;
          is_published: boolean;
          seo_title: string | null;
          seo_description: string | null;
        } & Timestamps;
        Insert: Partial<Database["public"]["Tables"]["doctors"]["Row"]> & { name?: string | null };
        Update: Partial<Database["public"]["Tables"]["doctors"]["Row"]>;
        Relationships: [];
      };
      services: {
        Row: {
          id: string;
          title: string | null;
          slug: string | null;
          category: string | null;
          short_description: string | null;
          full_description: string | null;
          price: number | null;
          old_price: number | null;
          doctor_id: string | null;
          hero_image_url: string | null;
          gallery_urls: string[];
          tags: string[];
          faqs: Json;
          seo_title: string | null;
          seo_description: string | null;
          sort_order: number;
          is_featured: boolean;
          is_published: boolean;
          scheduled_at: string | null;
        } & Timestamps;
        Insert: Partial<Database["public"]["Tables"]["services"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["services"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "services_doctor_id_fkey";
            columns: ["doctor_id"];
            referencedRelation: "doctors";
            referencedColumns: ["id"];
          }
        ];
      };
      testimonials: {
        Row: {
          id: string;
          patient_name: string | null;
          treatment_category: string | null;
          testimonial: string | null;
          rating: number | null;
          image_url: string | null;
          video_url: string | null;
          is_featured: boolean;
          is_published: boolean;
          sort_order: number;
        } & Timestamps;
        Insert: Partial<Database["public"]["Tables"]["testimonials"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["testimonials"]["Row"]>;
        Relationships: [];
      };
      gallery: {
        Row: {
          id: string;
          title: string | null;
          image_url: string;
          category: string | null;
          alt_text: string | null;
          is_featured: boolean;
          is_published: boolean;
          sort_order: number;
        } & Timestamps;
        Insert: Partial<Database["public"]["Tables"]["gallery"]["Row"]> & { image_url: string };
        Update: Partial<Database["public"]["Tables"]["gallery"]["Row"]>;
        Relationships: [];
      };
      updates: {
        Row: {
          id: string;
          title: string | null;
          slug: string | null;
          excerpt: string | null;
          content: string | null;
          image_url: string | null;
          tags: string[] | null;
          seo_title: string | null;
          seo_description: string | null;
          is_featured: boolean;
          is_published: boolean;
          published_at: string | null;
          scheduled_at: string | null;
        } & Timestamps;
        Insert: Partial<Database["public"]["Tables"]["updates"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["updates"]["Row"]>;
        Relationships: [];
      };
      videos: {
        Row: {
          id: string;
          title: string | null;
          slug: string | null;
          description: string | null;
          video_url: string;
          thumbnail_url: string | null;
          category: string | null;
          is_featured: boolean;
          is_published: boolean;
          sort_order: number;
        } & Timestamps;
        Insert: Partial<Database["public"]["Tables"]["videos"]["Row"]> & { video_url: string };
        Update: Partial<Database["public"]["Tables"]["videos"]["Row"]>;
        Relationships: [];
      };
      info_pages: {
        Row: {
          id: string;
          title: string | null;
          slug: string | null;
          content: string | null;
          seo_title: string | null;
          seo_description: string | null;
          is_published: boolean;
          sort_order: number;
        } & Timestamps;
        Insert: Partial<Database["public"]["Tables"]["info_pages"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["info_pages"]["Row"]>;
        Relationships: [];
      };
      appointments: {
        Row: {
          id: string;
          patient_name: string;
          phone: string;
          email: string | null;
          service_id: string | null;
          preferred_date: string | null;
          preferred_time: string | null;
          notes: string | null;
          status: string;
          terms_accepted: boolean;
          source_page: string | null;
          consultation_type: string;
          zoom_meeting_id: string | null;
          zoom_join_url: string | null;
          zoom_start_url: string | null;
        } & Timestamps;
        Insert: Partial<Database["public"]["Tables"]["appointments"]["Row"]> & {
          patient_name: string;
          phone: string;
          consultation_type?: string;
        };
        Update: Partial<Database["public"]["Tables"]["appointments"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "appointments_service_id_fkey";
            columns: ["service_id"];
            referencedRelation: "services";
            referencedColumns: ["id"];
          }
        ];
      };
      enquiries: {
        Row: {
          id: string;
          name: string;
          contact: string;
          message: string | null;
          source_page: string | null;
          status: string;
        } & Timestamps;
        Insert: Partial<Database["public"]["Tables"]["enquiries"]["Row"]> & {
          name: string;
          contact: string;
        };
        Update: Partial<Database["public"]["Tables"]["enquiries"]["Row"]>;
        Relationships: [];
      };
      newsletter_subscribers: {
        Row: {
          id: string;
          email: string;
          status: string;
          source_page: string | null;
          created_at: string;
        };
        Insert: { id?: string; email: string; status?: string; source_page?: string | null; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["newsletter_subscribers"]["Row"]>;
        Relationships: [];
      };
      settings: {
        Row: {
          id: string;
          clinic_name: string;
          tagline: string | null;
          phone_primary: string | null;
          phone_secondary: string | null;
          whatsapp_number: string | null;
          email: string | null;
          address: string | null;
          google_maps_url: string | null;
          latitude: number | null;
          longitude: number | null;
          opening_hours: string | null;
          logo_url: string | null;
          favicon_url: string | null;
          seo_title: string | null;
          seo_description: string | null;
        } & Timestamps;
        Insert: Partial<Database["public"]["Tables"]["settings"]["Row"]> & { clinic_name: string };
        Update: Partial<Database["public"]["Tables"]["settings"]["Row"]>;
        Relationships: [];
      };
      social_links: {
        Row: {
          id: string;
          platform: string;
          label: string | null;
          url: string | null;
          username: string | null;
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["social_links"]["Row"]> & { platform: string };
        Update: Partial<Database["public"]["Tables"]["social_links"]["Row"]>;
        Relationships: [];
      };
      analytics_events: {
        Row: {
          id: string;
          event_type: string;
          event_name: string | null;
          source_page: string | null;
          metadata: Json;
          user_agent: string | null;
          ip_hash: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_type: string;
          event_name?: string | null;
          source_page?: string | null;
          metadata?: Json;
          user_agent?: string | null;
          ip_hash?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["analytics_events"]["Row"]>;
        Relationships: [];
      };
      admin_activity_logs: {
        Row: {
          id: string;
          admin_user_id: string | null;
          action: string;
          table_name: string | null;
          record_id: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          admin_user_id?: string | null;
          action: string;
          table_name?: string | null;
          record_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["admin_activity_logs"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

// Convenience row aliases
type PublicTables = Database["public"]["Tables"];
export type Tables<T extends keyof PublicTables> = PublicTables[T]["Row"];
export type TablesInsert<T extends keyof PublicTables> = PublicTables[T]["Insert"];
export type TablesUpdate<T extends keyof PublicTables> = PublicTables[T]["Update"];

export type Doctor = Tables<"doctors">;
export type Service = Tables<"services">;
export type Testimonial = Tables<"testimonials">;
export type GalleryItem = Tables<"gallery">;
export type Update = Tables<"updates">;
export type Video = Tables<"videos">;
export type InfoPage = Tables<"info_pages">;
export type Appointment = Tables<"appointments">;
export type Enquiry = Tables<"enquiries">;
export type Settings = Tables<"settings">;
export type SocialLink = Tables<"social_links">;
