export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      broker_queue: {
        Row: {
          broker_id: string
          id: string
          last_assigned_at: string | null
          queue_position: number | null
        }
        Insert: {
          broker_id: string
          id?: string
          last_assigned_at?: string | null
          queue_position?: number | null
        }
        Update: {
          broker_id?: string
          id?: string
          last_assigned_at?: string | null
          queue_position?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "broker_queue_broker_id_fkey"
            columns: ["broker_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      client_documents: {
        Row: {
          created_at: string | null
          document_type: string
          file_name: string
          file_url: string
          id: string
          is_spouse_document: boolean | null
          proposal_id: string
        }
        Insert: {
          created_at?: string | null
          document_type: string
          file_name: string
          file_url: string
          id?: string
          is_spouse_document?: boolean | null
          proposal_id: string
        }
        Update: {
          created_at?: string | null
          document_type?: string
          file_name?: string
          file_url?: string
          id?: string
          is_spouse_document?: boolean | null
          proposal_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_documents_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      partners: {
        Row: {
          created_at: string
          created_by: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          logo_url: string
          name: string
          website_url: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          logo_url: string
          name: string
          website_url?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          logo_url?: string
          name?: string
          website_url?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          id: string
          is_active: boolean | null
          last_seen_at: string | null
          name: string
          phone: string | null
          proposals_count: number | null
          role: Database["public"]["Enums"]["user_role"]
          status: Database["public"]["Enums"]["broker_status"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          is_active?: boolean | null
          last_seen_at?: string | null
          name: string
          phone?: string | null
          proposals_count?: number | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["broker_status"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          last_seen_at?: string | null
          name?: string
          phone?: string | null
          proposals_count?: number | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["broker_status"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      properties: {
        Row: {
          ai_description: string | null
          bedrooms: number | null
          category: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          images: string[] | null
          import_batch_id: string | null
          import_folder_name: string | null
          is_active: boolean | null
          is_mcmv: boolean | null
          location: string
          mcmv_logo_url: string | null
          min_income: number | null
          name: string
          pdf_cover_image: string | null
          pdf_url: string | null
          property_type: string | null
          rental_value: number | null
          size_m2: number | null
          updated_at: string | null
        }
        Insert: {
          ai_description?: string | null
          bedrooms?: number | null
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          import_batch_id?: string | null
          import_folder_name?: string | null
          is_active?: boolean | null
          is_mcmv?: boolean | null
          location: string
          mcmv_logo_url?: string | null
          min_income?: number | null
          name: string
          pdf_cover_image?: string | null
          pdf_url?: string | null
          property_type?: string | null
          rental_value?: number | null
          size_m2?: number | null
          updated_at?: string | null
        }
        Update: {
          ai_description?: string | null
          bedrooms?: number | null
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          import_batch_id?: string | null
          import_folder_name?: string | null
          is_active?: boolean | null
          is_mcmv?: boolean | null
          location?: string
          mcmv_logo_url?: string | null
          min_income?: number | null
          name?: string
          pdf_cover_image?: string | null
          pdf_url?: string | null
          property_type?: string | null
          rental_value?: number | null
          size_m2?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      property_prices: {
        Row: {
          area_m2: number
          bedrooms: number | null
          created_at: string
          floor: string | null
          id: string
          parking_spots: number | null
          price: number
          property_id: string
          status: string | null
          suites: number | null
          unit_type: string
          updated_at: string
        }
        Insert: {
          area_m2: number
          bedrooms?: number | null
          created_at?: string
          floor?: string | null
          id?: string
          parking_spots?: number | null
          price: number
          property_id: string
          status?: string | null
          suites?: number | null
          unit_type: string
          updated_at?: string
        }
        Update: {
          area_m2?: number
          bedrooms?: number | null
          created_at?: string
          floor?: string | null
          id?: string
          parking_spots?: number | null
          price?: number
          property_id?: string
          status?: string | null
          suites?: number | null
          unit_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_prices_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      proposals: {
        Row: {
          accepted_at: string | null
          assigned_at: string | null
          assigned_broker_id: string | null
          client_cpf: string
          client_email: string
          client_marital_status: Database["public"]["Enums"]["marital_status"]
          client_name: string
          client_phone: string
          client_rg: string
          created_at: string | null
          id: string
          property_id: string
          proposal_description: string | null
          proposal_type: Database["public"]["Enums"]["proposal_type"]
          proposal_value: number
          redistribution_count: number | null
          spouse_cpf: string | null
          spouse_name: string | null
          spouse_rg: string | null
          status: Database["public"]["Enums"]["proposal_status"] | null
          updated_at: string | null
        }
        Insert: {
          accepted_at?: string | null
          assigned_at?: string | null
          assigned_broker_id?: string | null
          client_cpf: string
          client_email: string
          client_marital_status: Database["public"]["Enums"]["marital_status"]
          client_name: string
          client_phone: string
          client_rg: string
          created_at?: string | null
          id?: string
          property_id: string
          proposal_description?: string | null
          proposal_type: Database["public"]["Enums"]["proposal_type"]
          proposal_value: number
          redistribution_count?: number | null
          spouse_cpf?: string | null
          spouse_name?: string | null
          spouse_rg?: string | null
          status?: Database["public"]["Enums"]["proposal_status"] | null
          updated_at?: string | null
        }
        Update: {
          accepted_at?: string | null
          assigned_at?: string | null
          assigned_broker_id?: string | null
          client_cpf?: string
          client_email?: string
          client_marital_status?: Database["public"]["Enums"]["marital_status"]
          client_name?: string
          client_phone?: string
          client_rg?: string
          created_at?: string | null
          id?: string
          property_id?: string
          proposal_description?: string | null
          proposal_type?: Database["public"]["Enums"]["proposal_type"]
          proposal_value?: number
          redistribution_count?: number | null
          spouse_cpf?: string | null
          spouse_name?: string | null
          spouse_rg?: string | null
          status?: Database["public"]["Enums"]["proposal_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposals_assigned_broker_id_fkey"
            columns: ["assigned_broker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      broker_status: "online" | "offline"
      marital_status: "single" | "married" | "divorced" | "widowed"
      proposal_status:
        | "new"
        | "pending_acceptance"
        | "in_progress"
        | "completed"
        | "redistributed"
      proposal_type: "cash" | "financed"
      user_role: "admin" | "broker"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      broker_status: ["online", "offline"],
      marital_status: ["single", "married", "divorced", "widowed"],
      proposal_status: [
        "new",
        "pending_acceptance",
        "in_progress",
        "completed",
        "redistributed",
      ],
      proposal_type: ["cash", "financed"],
      user_role: ["admin", "broker"],
    },
  },
} as const
