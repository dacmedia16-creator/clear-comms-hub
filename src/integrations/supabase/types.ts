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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          category: Database["public"]["Enums"]["announcement_category"]
          condominium_id: string
          content: string
          created_at: string
          created_by: string | null
          id: string
          is_pinned: boolean
          is_urgent: boolean
          published_at: string
          summary: string | null
          target_blocks: string[] | null
          target_units: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["announcement_category"]
          condominium_id: string
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_pinned?: boolean
          is_urgent?: boolean
          published_at?: string
          summary?: string | null
          target_blocks?: string[] | null
          target_units?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["announcement_category"]
          condominium_id?: string
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_pinned?: boolean
          is_urgent?: boolean
          published_at?: string
          summary?: string | null
          target_blocks?: string[] | null
          target_units?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_condominium_id_fkey"
            columns: ["condominium_id"]
            isOneToOne: false
            referencedRelation: "condominiums"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      api_tokens: {
        Row: {
          condominium_id: string
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          last_used_at: string | null
          name: string
          permissions: string[] | null
          token_hash: string
          token_prefix: string
        }
        Insert: {
          condominium_id: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          name: string
          permissions?: string[] | null
          token_hash: string
          token_prefix: string
        }
        Update: {
          condominium_id?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          name?: string
          permissions?: string[] | null
          token_hash?: string
          token_prefix?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_tokens_condominium_id_fkey"
            columns: ["condominium_id"]
            isOneToOne: false
            referencedRelation: "condominiums"
            referencedColumns: ["id"]
          },
        ]
      }
      attachments: {
        Row: {
          announcement_id: string
          created_at: string
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
        }
        Insert: {
          announcement_id: string
          created_at?: string
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
        }
        Update: {
          announcement_id?: string
          created_at?: string
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attachments_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "announcements"
            referencedColumns: ["id"]
          },
        ]
      }
      condo_members: {
        Row: {
          created_at: string
          email: string | null
          full_name: string
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      condominiums: {
        Row: {
          address: string | null
          auth_owner_id: string | null
          city: string | null
          code: number
          created_at: string
          description: string | null
          id: string
          logo_url: string | null
          name: string
          notification_email: boolean
          notification_sms: boolean | null
          notification_whatsapp: boolean
          organization_type:
            | Database["public"]["Enums"]["organization_type"]
            | null
          owner_id: string
          plan: string
          slug: string
          state: string | null
          trial_ends_at: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          auth_owner_id?: string | null
          city?: string | null
          code?: number
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          name: string
          notification_email?: boolean
          notification_sms?: boolean | null
          notification_whatsapp?: boolean
          organization_type?:
            | Database["public"]["Enums"]["organization_type"]
            | null
          owner_id: string
          plan?: string
          slug: string
          state?: string | null
          trial_ends_at?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          auth_owner_id?: string | null
          city?: string | null
          code?: number
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          notification_email?: boolean
          notification_sms?: boolean | null
          notification_whatsapp?: boolean
          organization_type?:
            | Database["public"]["Enums"]["organization_type"]
            | null
          owner_id?: string
          plan?: string
          slug?: string
          state?: string | null
          trial_ends_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "condominiums_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      email_logs: {
        Row: {
          announcement_id: string | null
          condominium_id: string | null
          created_by: string | null
          error_message: string | null
          id: string
          recipient_email: string
          recipient_name: string | null
          sent_at: string | null
          status: string | null
        }
        Insert: {
          announcement_id?: string | null
          condominium_id?: string | null
          created_by?: string | null
          error_message?: string | null
          id?: string
          recipient_email: string
          recipient_name?: string | null
          sent_at?: string | null
          status?: string | null
        }
        Update: {
          announcement_id?: string | null
          condominium_id?: string | null
          created_by?: string | null
          error_message?: string | null
          id?: string
          recipient_email?: string
          recipient_name?: string | null
          sent_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_logs_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "announcements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_logs_condominium_id_fkey"
            columns: ["condominium_id"]
            isOneToOne: false
            referencedRelation: "condominiums"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_logs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          announcements_per_month: number
          badge_class: string
          created_at: string
          display_order: number
          features: Json
          id: string
          is_active: boolean
          max_attachment_size_mb: number
          name: string
          price: number
          slug: string
          updated_at: string
        }
        Insert: {
          announcements_per_month?: number
          badge_class?: string
          created_at?: string
          display_order?: number
          features?: Json
          id?: string
          is_active?: boolean
          max_attachment_size_mb?: number
          name: string
          price?: number
          slug: string
          updated_at?: string
        }
        Update: {
          announcements_per_month?: number
          badge_class?: string
          created_at?: string
          display_order?: number
          features?: Json
          id?: string
          is_active?: boolean
          max_attachment_size_mb?: number
          name?: string
          price?: number
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sms_logs: {
        Row: {
          announcement_id: string | null
          condominium_id: string | null
          created_by: string | null
          error_message: string | null
          id: string
          recipient_name: string | null
          recipient_phone: string
          sent_at: string | null
          status: string | null
        }
        Insert: {
          announcement_id?: string | null
          condominium_id?: string | null
          created_by?: string | null
          error_message?: string | null
          id?: string
          recipient_name?: string | null
          recipient_phone: string
          sent_at?: string | null
          status?: string | null
        }
        Update: {
          announcement_id?: string | null
          condominium_id?: string | null
          created_by?: string | null
          error_message?: string | null
          id?: string
          recipient_name?: string | null
          recipient_phone?: string
          sent_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sms_logs_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "announcements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sms_logs_condominium_id_fkey"
            columns: ["condominium_id"]
            isOneToOne: false
            referencedRelation: "condominiums"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sms_logs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      super_admins: {
        Row: {
          auth_user_id: string | null
          created_at: string
          created_by: string | null
          id: string
          user_id: string
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          user_id: string
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "super_admins_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "super_admins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      syndic_referrals: {
        Row: {
          condominium_name: string
          created_at: string | null
          email_sent: boolean | null
          id: string
          notes: string | null
          referrer_name: string | null
          sms_sent: boolean | null
          status: string | null
          syndic_email: string | null
          syndic_name: string
          syndic_phone: string
          whatsapp_sent: boolean | null
        }
        Insert: {
          condominium_name: string
          created_at?: string | null
          email_sent?: boolean | null
          id?: string
          notes?: string | null
          referrer_name?: string | null
          sms_sent?: boolean | null
          status?: string | null
          syndic_email?: string | null
          syndic_name: string
          syndic_phone: string
          whatsapp_sent?: boolean | null
        }
        Update: {
          condominium_name?: string
          created_at?: string | null
          email_sent?: boolean | null
          id?: string
          notes?: string | null
          referrer_name?: string | null
          sms_sent?: boolean | null
          status?: string | null
          syndic_email?: string | null
          syndic_name?: string
          syndic_phone?: string
          whatsapp_sent?: boolean | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          auth_user_id: string | null
          block: string | null
          condominium_id: string
          created_at: string
          id: string
          is_approved: boolean
          member_id: string | null
          role: Database["public"]["Enums"]["app_role"]
          unit: string | null
          user_id: string | null
        }
        Insert: {
          auth_user_id?: string | null
          block?: string | null
          condominium_id: string
          created_at?: string
          id?: string
          is_approved?: boolean
          member_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          unit?: string | null
          user_id?: string | null
        }
        Update: {
          auth_user_id?: string | null
          block?: string | null
          condominium_id?: string
          created_at?: string
          id?: string
          is_approved?: boolean
          member_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          unit?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_condominium_id_fkey"
            columns: ["condominium_id"]
            isOneToOne: false
            referencedRelation: "condominiums"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "condo_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_logs: {
        Row: {
          event_type: string
          id: string
          payload: Json
          response_body: string | null
          response_status: number | null
          sent_at: string | null
          success: boolean | null
          webhook_id: string
        }
        Insert: {
          event_type: string
          id?: string
          payload: Json
          response_body?: string | null
          response_status?: number | null
          sent_at?: string | null
          success?: boolean | null
          webhook_id: string
        }
        Update: {
          event_type?: string
          id?: string
          payload?: Json
          response_body?: string | null
          response_status?: number | null
          sent_at?: string | null
          success?: boolean | null
          webhook_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_logs_webhook_id_fkey"
            columns: ["webhook_id"]
            isOneToOne: false
            referencedRelation: "webhooks"
            referencedColumns: ["id"]
          },
        ]
      }
      webhooks: {
        Row: {
          condominium_id: string
          created_at: string | null
          events: string[]
          id: string
          is_active: boolean | null
          last_triggered_at: string | null
          name: string
          secret: string | null
          updated_at: string | null
          url: string
        }
        Insert: {
          condominium_id: string
          created_at?: string | null
          events?: string[]
          id?: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          name: string
          secret?: string | null
          updated_at?: string | null
          url: string
        }
        Update: {
          condominium_id?: string
          created_at?: string | null
          events?: string[]
          id?: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          name?: string
          secret?: string | null
          updated_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhooks_condominium_id_fkey"
            columns: ["condominium_id"]
            isOneToOne: false
            referencedRelation: "condominiums"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_logs: {
        Row: {
          announcement_id: string | null
          condominium_id: string | null
          created_by: string | null
          error_message: string | null
          id: string
          recipient_name: string | null
          recipient_phone: string
          sent_at: string | null
          status: string
        }
        Insert: {
          announcement_id?: string | null
          condominium_id?: string | null
          created_by?: string | null
          error_message?: string | null
          id?: string
          recipient_name?: string | null
          recipient_phone: string
          sent_at?: string | null
          status?: string
        }
        Update: {
          announcement_id?: string | null
          condominium_id?: string | null
          created_by?: string | null
          error_message?: string | null
          id?: string
          recipient_name?: string | null
          recipient_phone?: string
          sent_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_logs_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "announcements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_logs_condominium_id_fkey"
            columns: ["condominium_id"]
            isOneToOne: false
            referencedRelation: "condominiums"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_logs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_optouts: {
        Row: {
          condominium_id: string | null
          created_at: string
          id: string
          member_name: string | null
          opted_out_at: string | null
          phone: string
          token: string
        }
        Insert: {
          condominium_id?: string | null
          created_at?: string
          id?: string
          member_name?: string | null
          opted_out_at?: string | null
          phone: string
          token: string
        }
        Update: {
          condominium_id?: string | null
          created_at?: string
          id?: string
          member_name?: string | null
          opted_out_at?: string | null
          phone?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_optouts_condominium_id_fkey"
            columns: ["condominium_id"]
            isOneToOne: false
            referencedRelation: "condominiums"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_senders: {
        Row: {
          api_key: string
          created_at: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          name: string
          phone: string
          updated_at: string | null
        }
        Insert: {
          api_key: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name: string
          phone: string
          updated_at?: string | null
        }
        Update: {
          api_key?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name?: string
          phone?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_create_announcement: { Args: { cond_id: string }; Returns: boolean }
      can_manage_condominium: { Args: { cond_id: string }; Returns: boolean }
      generate_unique_slug: { Args: { base_name: string }; Returns: string }
      has_condominium_role: {
        Args: {
          _role?: Database["public"]["Enums"]["app_role"]
          cond_id: string
        }
        Returns: boolean
      }
      is_condominium_owner: { Args: { cond_id: string }; Returns: boolean }
      is_super_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      announcement_category:
        | "informativo"
        | "financeiro"
        | "manutencao"
        | "convivencia"
        | "seguranca"
        | "urgente"
        | "pedagogico"
        | "calendario"
        | "rh"
        | "compliance"
        | "atendimento"
        | "horarios"
        | "treinos"
        | "cultos"
        | "pastoral"
        | "eventos"
      app_role: "admin" | "syndic" | "resident" | "collaborator"
      organization_type:
        | "condominium"
        | "school"
        | "company"
        | "clinic"
        | "association"
        | "gym"
        | "church"
        | "club"
        | "other"
        | "healthcare"
        | "community"
        | "franchise"
      plan_type: "free" | "starter" | "pro"
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
      announcement_category: [
        "informativo",
        "financeiro",
        "manutencao",
        "convivencia",
        "seguranca",
        "urgente",
        "pedagogico",
        "calendario",
        "rh",
        "compliance",
        "atendimento",
        "horarios",
        "treinos",
        "cultos",
        "pastoral",
        "eventos",
      ],
      app_role: ["admin", "syndic", "resident", "collaborator"],
      organization_type: [
        "condominium",
        "school",
        "company",
        "clinic",
        "association",
        "gym",
        "church",
        "club",
        "other",
        "healthcare",
        "community",
        "franchise",
      ],
      plan_type: ["free", "starter", "pro"],
    },
  },
} as const
