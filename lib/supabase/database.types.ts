export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          name: string;
          code: string;
          description: string | null;
          price: number;
          is_featured: boolean;
          status: "draft" | "published" | "archived";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          code: string;
          description?: string | null;
          price: number;
          is_featured?: boolean;
          status?: "draft" | "published" | "archived";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          code?: string;
          description?: string | null;
          price?: number;
          is_featured?: boolean;
          status?: "draft" | "published" | "archived";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          code: string;
          description: string | null;
          icon: string | null;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          name: string;
          code: string;
          description?: string | null;
          icon?: string | null;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          name?: string;
          code?: string;
          description?: string | null;
          icon?: string | null;
          is_active?: boolean;
        };
        Relationships: [];
      };
      product_categories: {
        Row: {
          product_id: string;
          category_id: string;
        };
        Insert: {
          product_id: string;
          category_id: string;
        };
        Update: {
          product_id?: string;
          category_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_categories_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "product_categories_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      colors: {
        Row: {
          id: string;
          name: string;
          hex_code: string;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          name: string;
          hex_code: string;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          name?: string;
          hex_code?: string;
          is_active?: boolean;
        };
        Relationships: [];
      };
      product_part_colors: {
        Row: {
          product_id: string;
          part:
            | "all"
            | "crown"
            | "front_panel"
            | "side_panels"
            | "back_panels"
            | "visor"
            | "mesh"
            | "strap"
            | "button";
          color_id: string;
        };
        Insert: {
          product_id: string;
          part:
            | "all"
            | "crown"
            | "front_panel"
            | "side_panels"
            | "back_panels"
            | "visor"
            | "mesh"
            | "strap"
            | "button";
          color_id: string;
        };
        Update: {
          product_id?: string;
          part?:
            | "all"
            | "crown"
            | "front_panel"
            | "side_panels"
            | "back_panels"
            | "visor"
            | "mesh"
            | "strap"
            | "button";
          color_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_part_colors_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "product_part_colors_color_id_fkey";
            columns: ["color_id"];
            isOneToOne: false;
            referencedRelation: "colors";
            referencedColumns: ["id"];
          },
        ];
      };
      product_attributes: {
        Row: {
          product_id: string;
          visor_type: "curved" | "flat" | "other";
          construction_type: "mesh" | "closed" | "mixed";
          has_strap: boolean;
          strap_type:
            | "snapback"
            | "velcro"
            | "buckle"
            | "fabric"
            | "other"
            | null;
          has_front_logo: boolean;
        };
        Insert: {
          product_id: string;
          visor_type: "curved" | "flat" | "other";
          construction_type: "mesh" | "closed" | "mixed";
          has_strap?: boolean;
          strap_type?:
            | "snapback"
            | "velcro"
            | "buckle"
            | "fabric"
            | "other"
            | null;
          has_front_logo?: boolean;
        };
        Update: {
          product_id?: string;
          visor_type?: "curved" | "flat" | "other";
          construction_type?: "mesh" | "closed" | "mixed";
          has_strap?: boolean;
          strap_type?:
            | "snapback"
            | "velcro"
            | "buckle"
            | "fabric"
            | "other"
            | null;
          has_front_logo?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "product_attributes_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: true;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          storage_path: string;
          alt_text: string | null;
          is_primary: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          storage_path: string;
          alt_text?: string | null;
          is_primary?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          storage_path?: string;
          alt_text?: string | null;
          is_primary?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      store_settings: {
        Row: {
          id: number;
          store_name: string;
          description: string | null;
          logo_path: string | null;
          contacts: Json;
          updated_at: string;
        };
        Insert: {
          id?: number;
          store_name?: string;
          description?: string | null;
          logo_path?: string | null;
          contacts?: Json;
          updated_at?: string;
        };
        Update: {
          id?: number;
          store_name?: string;
          description?: string | null;
          logo_path?: string | null;
          contacts?: Json;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      color_name_slug: {
        Args: { p_name: string };
        Returns: string;
      };
      is_store_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      search_published_products: {
        Args: {
          p_query?: string | null;
          p_category_codes?: string[] | null;
          p_color_slugs?: string[] | null;
          p_visor_types?: string[] | null;
          p_construction_types?: string[] | null;
          p_has_strap?: boolean | null;
          p_strap_types?: string[] | null;
          p_has_front_logo?: boolean | null;
          p_sort?: string | null;
          p_page?: number | null;
          p_page_size?: number | null;
        };
        Returns: Array<{
          id: string;
          name: string;
          code: string;
          price: number;
          created_at: string;
          categories: Json;
          colors: Json;
          attributes: Json;
          product_images: Json;
          total_count: number;
        }>;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
