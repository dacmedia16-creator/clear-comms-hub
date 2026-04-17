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
          target_member_ids: string[] | null
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
          target_member_ids?: string[] | null
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
          target_member_ids?: string[] | null
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
      audit_logs: {
        Row: {
          action: string
          actor_profile_id: string | null
          after: Json | null
          before: Json | null
          condominium_id: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
        }
        Insert: {
          action: string
          actor_profile_id?: string | null
          after?: Json | null
          before?: Json | null
          condominium_id: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
        }
        Update: {
          action?: string
          actor_profile_id?: string | null
          after?: Json | null
          before?: Json | null
          condominium_id?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_profile_id_fkey"
            columns: ["actor_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_condominium_id_fkey"
            columns: ["condominium_id"]
            isOneToOne: false
            referencedRelation: "condominiums"
            referencedColumns: ["id"]
          },
        ]
      }
      capture_leads: {
        Row: {
          assigned_to_profile_id: string | null
          condominium_id: string
          converted_at: string | null
          converted_to_id: string | null
          converted_to_type: string | null
          created_at: string
          created_by: string | null
          email: string | null
          full_name: string
          id: string
          lead_type: string
          metadata: Json
          notes: string | null
          phone: string | null
          source: string | null
          stage_id: string | null
          updated_at: string
        }
        Insert: {
          assigned_to_profile_id?: string | null
          condominium_id: string
          converted_at?: string | null
          converted_to_id?: string | null
          converted_to_type?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          full_name: string
          id?: string
          lead_type: string
          metadata?: Json
          notes?: string | null
          phone?: string | null
          source?: string | null
          stage_id?: string | null
          updated_at?: string
        }
        Update: {
          assigned_to_profile_id?: string | null
          condominium_id?: string
          converted_at?: string | null
          converted_to_id?: string | null
          converted_to_type?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          full_name?: string
          id?: string
          lead_type?: string
          metadata?: Json
          notes?: string | null
          phone?: string | null
          source?: string | null
          stage_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "capture_leads_assigned_to_profile_id_fkey"
            columns: ["assigned_to_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "capture_leads_condominium_id_fkey"
            columns: ["condominium_id"]
            isOneToOne: false
            referencedRelation: "condominiums"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "capture_leads_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "capture_leads_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "pipeline_stages"
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
          phone_secondary: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          phone?: string | null
          phone_secondary?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          phone_secondary?: string | null
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
      interactions: {
        Row: {
          channel: string
          condominium_id: string
          content: string | null
          created_at: string
          created_by: string | null
          direction: string | null
          entity_id: string
          entity_type: string
          id: string
          metadata: Json
          subject: string | null
        }
        Insert: {
          channel: string
          condominium_id: string
          content?: string | null
          created_at?: string
          created_by?: string | null
          direction?: string | null
          entity_id: string
          entity_type: string
          id?: string
          metadata?: Json
          subject?: string | null
        }
        Update: {
          channel?: string
          condominium_id?: string
          content?: string | null
          created_at?: string
          created_by?: string | null
          direction?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          metadata?: Json
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interactions_condominium_id_fkey"
            columns: ["condominium_id"]
            isOneToOne: false
            referencedRelation: "condominiums"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interactions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      member_lists: {
        Row: {
          condominium_id: string
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          condominium_id: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          condominium_id?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_lists_condominium_id_fkey"
            columns: ["condominium_id"]
            isOneToOne: false
            referencedRelation: "condominiums"
            referencedColumns: ["id"]
          },
        ]
      }
      message_templates: {
        Row: {
          body: string
          channel: string
          condominium_id: string
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          name: string
          subject: string | null
          updated_at: string
          variables: Json
        }
        Insert: {
          body: string
          channel: string
          condominium_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          name: string
          subject?: string | null
          updated_at?: string
          variables?: Json
        }
        Update: {
          body?: string
          channel?: string
          condominium_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          name?: string
          subject?: string | null
          updated_at?: string
          variables?: Json
        }
        Relationships: [
          {
            foreignKeyName: "message_templates_condominium_id_fkey"
            columns: ["condominium_id"]
            isOneToOne: false
            referencedRelation: "condominiums"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pipeline_stages: {
        Row: {
          color: string | null
          created_at: string
          id: string
          is_terminal: boolean
          name: string
          pipeline_id: string
          position: number
          sla_days: number | null
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          is_terminal?: boolean
          name: string
          pipeline_id: string
          position?: number
          sla_days?: number | null
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          is_terminal?: boolean
          name?: string
          pipeline_id?: string
          position?: number
          sla_days?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pipeline_stages_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "pipelines"
            referencedColumns: ["id"]
          },
        ]
      }
      pipelines: {
        Row: {
          condominium_id: string
          created_at: string
          id: string
          is_default: boolean
          lead_type: string
          name: string
          updated_at: string
        }
        Insert: {
          condominium_id: string
          created_at?: string
          id?: string
          is_default?: boolean
          lead_type: string
          name: string
          updated_at?: string
        }
        Update: {
          condominium_id?: string
          created_at?: string
          id?: string
          is_default?: boolean
          lead_type?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pipelines_condominium_id_fkey"
            columns: ["condominium_id"]
            isOneToOne: false
            referencedRelation: "condominiums"
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
      properties: {
        Row: {
          address: string | null
          area_m2: number | null
          bathrooms: number | null
          bedrooms: number | null
          captured_at: string | null
          city: string | null
          code: string | null
          condo_fee: number | null
          condominium_id: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          iptu: number | null
          listing_agent_member_id: string | null
          metadata: Json
          neighborhood: string | null
          owner_member_id: string | null
          parking: number | null
          photos: Json
          price: number | null
          property_type: string | null
          published_at: string | null
          stage_id: string | null
          state: string | null
          status: string
          title: string
          transaction_type: string | null
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          area_m2?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          captured_at?: string | null
          city?: string | null
          code?: string | null
          condo_fee?: number | null
          condominium_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          iptu?: number | null
          listing_agent_member_id?: string | null
          metadata?: Json
          neighborhood?: string | null
          owner_member_id?: string | null
          parking?: number | null
          photos?: Json
          price?: number | null
          property_type?: string | null
          published_at?: string | null
          stage_id?: string | null
          state?: string | null
          status?: string
          title: string
          transaction_type?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          area_m2?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          captured_at?: string | null
          city?: string | null
          code?: string | null
          condo_fee?: number | null
          condominium_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          iptu?: number | null
          listing_agent_member_id?: string | null
          metadata?: Json
          neighborhood?: string | null
          owner_member_id?: string | null
          parking?: number | null
          photos?: Json
          price?: number | null
          property_type?: string | null
          published_at?: string | null
          stage_id?: string | null
          state?: string | null
          status?: string
          title?: string
          transaction_type?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_condominium_id_fkey"
            columns: ["condominium_id"]
            isOneToOne: false
            referencedRelation: "condominiums"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_listing_agent_member_id_fkey"
            columns: ["listing_agent_member_id"]
            isOneToOne: false
            referencedRelation: "condo_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_owner_member_id_fkey"
            columns: ["owner_member_id"]
            isOneToOne: false
            referencedRelation: "condo_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "pipeline_stages"
            referencedColumns: ["id"]
          },
        ]
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
      tasks: {
        Row: {
          assigned_to_profile_id: string | null
          completed_at: string | null
          condominium_id: string
          created_at: string
          created_by: string | null
          description: string | null
          due_at: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          priority: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to_profile_id?: string | null
          completed_at?: string | null
          condominium_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          priority?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to_profile_id?: string | null
          completed_at?: string | null
          condominium_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          priority?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_to_profile_id_fkey"
            columns: ["assigned_to_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_condominium_id_fkey"
            columns: ["condominium_id"]
            isOneToOne: false
            referencedRelation: "condominiums"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          auth_user_id: string | null
          block: string | null
          condominium_id: string
          created_at: string
          id: string
          is_approved: boolean
          list_id: string | null
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
          list_id?: string | null
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
          list_id?: string | null
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
            foreignKeyName: "user_roles_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "member_lists"
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
      whatsapp_broadcasts: {
        Row: {
          announcement_id: string
          condominium_id: string
          created_at: string | null
          id: string
          status: string
          total_members: number
          updated_at: string | null
        }
        Insert: {
          announcement_id: string
          condominium_id: string
          created_at?: string | null
          id?: string
          status?: string
          total_members?: number
          updated_at?: string | null
        }
        Update: {
          announcement_id?: string
          condominium_id?: string
          created_at?: string | null
          id?: string
          status?: string
          total_members?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_broadcasts_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "announcements"
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
          button_config: string
          created_at: string | null
          has_nome_param: boolean
          id: string
          is_active: boolean | null
          is_default: boolean | null
          name: string
          param_style: string
          phone: string
          template_identifier: string | null
          updated_at: string | null
        }
        Insert: {
          api_key: string
          button_config?: string
          created_at?: string | null
          has_nome_param?: boolean
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name: string
          param_style?: string
          phone: string
          template_identifier?: string | null
          updated_at?: string | null
        }
        Update: {
          api_key?: string
          button_config?: string
          created_at?: string | null
          has_nome_param?: boolean
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name?: string
          param_style?: string
          phone?: string
          template_identifier?: string | null
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
      get_condo_members_by_ids: {
        Args: { _member_ids: string[] }
        Returns: {
          email: string
          full_name: string
          id: string
          phone: string
          phone_secondary: string
        }[]
      }
      get_condominium_user_roles:
        | {
            Args: { _condominium_id: string; _list_id?: string }
            Returns: {
              block: string
              created_at: string
              id: string
              is_approved: boolean
              list_id: string
              member_id: string
              role: Database["public"]["Enums"]["app_role"]
              unit: string
              user_id: string
            }[]
          }
        | {
            Args: {
              _condominium_id: string
              _limit?: number
              _list_id?: string
              _offset?: number
            }
            Returns: {
              block: string
              created_at: string
              id: string
              is_approved: boolean
              list_id: string
              member_id: string
              role: Database["public"]["Enums"]["app_role"]
              unit: string
              user_id: string
            }[]
          }
      has_condominium_role: {
        Args: {
          _role?: Database["public"]["Enums"]["app_role"]
          cond_id: string
        }
        Returns: boolean
      }
      is_condominium_owner: { Args: { cond_id: string }; Returns: boolean }
      is_super_admin: { Args: never; Returns: boolean }
      write_audit_log: {
        Args: {
          _action: string
          _after?: Json
          _before?: Json
          _condominium_id: string
          _entity_id: string
          _entity_type: string
        }
        Returns: string
      }
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
        | "generic"
        | "real_estate"
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
        "generic",
        "real_estate",
      ],
      plan_type: ["free", "starter", "pro"],
    },
  },
} as const
