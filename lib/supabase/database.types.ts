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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          attendee_email: string
          attendee_name: string
          cancellation_reason: string | null
          conference_url: string | null
          created_at: string
          ends_at: string
          google_event_id: string | null
          id: string
          lead_id: string | null
          meeting_type_id: string
          mentor_user_id: string
          organization_id: string
          starts_at: string
          status: string
          student_id: string | null
          timezone: string
          updated_at: string
        }
        Insert: {
          attendee_email: string
          attendee_name: string
          cancellation_reason?: string | null
          conference_url?: string | null
          created_at?: string
          ends_at: string
          google_event_id?: string | null
          id?: string
          lead_id?: string | null
          meeting_type_id: string
          mentor_user_id: string
          organization_id: string
          starts_at: string
          status?: string
          student_id?: string | null
          timezone?: string
          updated_at?: string
        }
        Update: {
          attendee_email?: string
          attendee_name?: string
          cancellation_reason?: string | null
          conference_url?: string | null
          created_at?: string
          ends_at?: string
          google_event_id?: string | null
          id?: string
          lead_id?: string | null
          meeting_type_id?: string
          mentor_user_id?: string
          organization_id?: string
          starts_at?: string
          status?: string
          student_id?: string | null
          timezone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_meeting_type_id_fkey"
            columns: ["meeting_type_id"]
            isOneToOne: false
            referencedRelation: "meeting_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: number
          metadata: Json
          organization_id: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: never
          metadata?: Json
          organization_id?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: never
          metadata?: Json
          organization_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      availability_rules: {
        Row: {
          active: boolean
          created_at: string
          ends_at: string
          id: string
          mentor_user_id: string
          organization_id: string
          starts_at: string
          timezone: string
          updated_at: string
          weekday: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          ends_at: string
          id?: string
          mentor_user_id: string
          organization_id: string
          starts_at: string
          timezone?: string
          updated_at?: string
          weekday: number
        }
        Update: {
          active?: boolean
          created_at?: string
          ends_at?: string
          id?: string
          mentor_user_id?: string
          organization_id?: string
          starts_at?: string
          timezone?: string
          updated_at?: string
          weekday?: number
        }
        Relationships: [
          {
            foreignKeyName: "availability_rules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      commitments: {
        Row: {
          completed_at: string | null
          created_at: string
          due_at: string | null
          enrollment_id: string
          id: string
          organization_id: string
          status: string
          title: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          due_at?: string | null
          enrollment_id: string
          id?: string
          organization_id: string
          status?: string
          title: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          due_at?: string | null
          enrollment_id?: string
          id?: string
          organization_id?: string
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "commitments_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commitments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          completed_at: string | null
          enrolled_at: string
          id: string
          organization_id: string
          program_id: string
          progress_percent: number
          status: string
          student_id: string
        }
        Insert: {
          completed_at?: string | null
          enrolled_at?: string
          id?: string
          organization_id: string
          program_id: string
          progress_percent?: number
          status?: string
          student_id: string
        }
        Update: {
          completed_at?: string | null
          enrolled_at?: string
          id?: string
          organization_id?: string
          program_id?: string
          progress_percent?: number
          status?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      intake_briefings: {
        Row: {
          ai_processing_consent: boolean
          appointment_id: string
          career_goal: string
          career_role: string | null
          context_notes: string | null
          created_at: string
          current_challenge: string
          desired_outcome: string | null
          experience_level: string | null
          id: string
          linkedin_url: string | null
          organization_id: string
          portfolio_url: string | null
          privacy_consent_at: string | null
          tools_and_skills: string[]
          updated_at: string
          weekly_availability_hours: number | null
        }
        Insert: {
          ai_processing_consent?: boolean
          appointment_id: string
          career_goal: string
          career_role?: string | null
          context_notes?: string | null
          created_at?: string
          current_challenge: string
          desired_outcome?: string | null
          experience_level?: string | null
          id?: string
          linkedin_url?: string | null
          organization_id: string
          portfolio_url?: string | null
          privacy_consent_at?: string | null
          tools_and_skills?: string[]
          updated_at?: string
          weekly_availability_hours?: number | null
        }
        Update: {
          ai_processing_consent?: boolean
          appointment_id?: string
          career_goal?: string
          career_role?: string | null
          context_notes?: string | null
          created_at?: string
          current_challenge?: string
          desired_outcome?: string | null
          experience_level?: string | null
          id?: string
          linkedin_url?: string | null
          organization_id?: string
          portfolio_url?: string | null
          privacy_consent_at?: string | null
          tools_and_skills?: string[]
          updated_at?: string
          weekly_availability_hours?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "intake_briefings_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: true
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intake_briefings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_connections: {
        Row: {
          account_label: string | null
          configuration: Json
          created_at: string
          id: string
          last_error: string | null
          last_synced_at: string | null
          organization_id: string
          provider: string
          secret_reference: string | null
          status: string
          updated_at: string
        }
        Insert: {
          account_label?: string | null
          configuration?: Json
          created_at?: string
          id?: string
          last_error?: string | null
          last_synced_at?: string | null
          organization_id: string
          provider: string
          secret_reference?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          account_label?: string | null
          configuration?: Json
          created_at?: string
          id?: string
          last_error?: string | null
          last_synced_at?: string | null
          organization_id?: string
          provider?: string
          secret_reference?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_connections_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_credentials: {
        Row: {
          access_token: string | null
          created_at: string
          expires_at: string | null
          id: string
          metadata: Json
          organization_id: string
          provider: string
          refresh_token: string | null
          scopes: string[]
          updated_at: string
        }
        Insert: {
          access_token?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          metadata?: Json
          organization_id: string
          provider: string
          refresh_token?: string | null
          scopes?: string[]
          updated_at?: string
        }
        Update: {
          access_token?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          metadata?: Json
          organization_id?: string
          provider?: string
          refresh_token?: string | null
          scopes?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_credentials_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          consent_marketing_at: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          organization_id: string
          owner_id: string | null
          phone: string | null
          source: string | null
          stage: string
          updated_at: string
        }
        Insert: {
          consent_marketing_at?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          organization_id: string
          owner_id?: string | null
          phone?: string | null
          source?: string | null
          stage?: string
          updated_at?: string
        }
        Update: {
          consent_marketing_at?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          organization_id?: string
          owner_id?: string | null
          phone?: string | null
          source?: string | null
          stage?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ledger_entries: {
        Row: {
          account: string
          amount_minor: number
          created_at: string
          currency: string
          direction: string
          effective_at: string
          id: number
          metadata: Json
          organization_id: string
          transaction_id: string | null
        }
        Insert: {
          account: string
          amount_minor: number
          created_at?: string
          currency?: string
          direction: string
          effective_at: string
          id?: never
          metadata?: Json
          organization_id: string
          transaction_id?: string | null
        }
        Update: {
          account?: string
          amount_minor?: number
          created_at?: string
          currency?: string
          direction?: string
          effective_at?: string
          id?: never
          metadata?: Json
          organization_id?: string
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ledger_entries_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ledger_entries_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "payment_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          content: Json
          created_at: string
          id: string
          lesson_type: string
          module_id: string
          organization_id: string
          position: number
          published_at: string | null
          title: string
          updated_at: string
        }
        Insert: {
          content?: Json
          created_at?: string
          id?: string
          lesson_type: string
          module_id: string
          organization_id: string
          position?: number
          published_at?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          lesson_type?: string
          module_id?: string
          organization_id?: string
          position?: number
          published_at?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_intelligence: {
        Row: {
          action_items: Json
          appointment_id: string
          created_at: string
          id: string
          key_topics: Json
          organization_id: string
          processed_at: string | null
          read_meeting_id: string | null
          report_url: string | null
          summary: string | null
          transcript_retained: boolean
          updated_at: string
        }
        Insert: {
          action_items?: Json
          appointment_id: string
          created_at?: string
          id?: string
          key_topics?: Json
          organization_id: string
          processed_at?: string | null
          read_meeting_id?: string | null
          report_url?: string | null
          summary?: string | null
          transcript_retained?: boolean
          updated_at?: string
        }
        Update: {
          action_items?: Json
          appointment_id?: string
          created_at?: string
          id?: string
          key_topics?: Json
          organization_id?: string
          processed_at?: string | null
          read_meeting_id?: string | null
          report_url?: string | null
          summary?: string | null
          transcript_retained?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meeting_intelligence_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: true
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_intelligence_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_types: {
        Row: {
          buffer_after_minutes: number
          buffer_before_minutes: number
          color: string
          created_at: string
          description: string | null
          duration_minutes: number
          id: string
          intake_required: boolean
          kind: string
          location_type: string
          max_attendees: number
          name: string
          organization_id: string
          status: Database["public"]["Enums"]["record_status"]
          updated_at: string
        }
        Insert: {
          buffer_after_minutes?: number
          buffer_before_minutes?: number
          color?: string
          created_at?: string
          description?: string | null
          duration_minutes: number
          id?: string
          intake_required?: boolean
          kind: string
          location_type?: string
          max_attendees?: number
          name: string
          organization_id: string
          status?: Database["public"]["Enums"]["record_status"]
          updated_at?: string
        }
        Update: {
          buffer_after_minutes?: number
          buffer_before_minutes?: number
          color?: string
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          intake_required?: boolean
          kind?: string
          location_type?: string
          max_attendees?: number
          name?: string
          organization_id?: string
          status?: Database["public"]["Enums"]["record_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meeting_types_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      mentoring_action_plans: {
        Row: {
          appointment_id: string
          approved_at: string | null
          approved_by: string | null
          created_at: string
          diagnosis_summary: string
          generated_at: string | null
          id: string
          milestones: Json
          model_name: string | null
          model_provider: string | null
          next_actions: Json
          objective: string
          organization_id: string
          risks: Json
          shared_at: string | null
          status: string
          student_id: string | null
          success_metrics: Json
          updated_at: string
        }
        Insert: {
          appointment_id: string
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          diagnosis_summary: string
          generated_at?: string | null
          id?: string
          milestones?: Json
          model_name?: string | null
          model_provider?: string | null
          next_actions?: Json
          objective: string
          organization_id: string
          risks?: Json
          shared_at?: string | null
          status?: string
          student_id?: string | null
          success_metrics?: Json
          updated_at?: string
        }
        Update: {
          appointment_id?: string
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          diagnosis_summary?: string
          generated_at?: string | null
          id?: string
          milestones?: Json
          model_name?: string | null
          model_provider?: string | null
          next_actions?: Json
          objective?: string
          organization_id?: string
          risks?: Json
          shared_at?: string | null
          status?: string
          student_id?: string | null
          success_metrics?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentoring_action_plans_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentoring_action_plans_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentoring_action_plans_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      mentoring_sessions: {
        Row: {
          created_at: string
          ends_at: string
          id: string
          meeting_url: string | null
          organization_id: string
          private_notes: string | null
          program_id: string
          starts_at: string
          student_id: string | null
          title: string
        }
        Insert: {
          created_at?: string
          ends_at: string
          id?: string
          meeting_url?: string | null
          organization_id: string
          private_notes?: string | null
          program_id: string
          starts_at: string
          student_id?: string | null
          title: string
        }
        Update: {
          created_at?: string
          ends_at?: string
          id?: string
          meeting_url?: string | null
          organization_id?: string
          private_notes?: string | null
          program_id?: string
          starts_at?: string
          student_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentoring_sessions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentoring_sessions_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentoring_sessions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          position: number
          program_id: string
          release_after_days: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          position?: number
          program_id: string
          release_after_days?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          position?: number
          program_id?: string
          release_after_days?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "modules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "modules_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          currency: string
          external_id: string | null
          gross_amount_minor: number
          id: string
          organization_id: string
          price_id: string
          product_id: string
          status: string
          student_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          external_id?: string | null
          gross_amount_minor: number
          id?: string
          organization_id: string
          price_id: string
          product_id: string
          status: string
          student_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          external_id?: string | null
          gross_amount_minor?: number
          id?: string
          organization_id?: string
          price_id?: string
          product_id?: string
          status?: string
          student_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_price_id_fkey"
            columns: ["price_id"]
            isOneToOne: false
            referencedRelation: "prices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_addons: {
        Row: {
          activated_at: string | null
          addon_code: string
          cancelled_at: string | null
          created_at: string
          id: string
          monthly_amount_cents: number
          organization_id: string
          setup_amount_cents: number
          status: string
          trial_ends_at: string | null
          updated_at: string
        }
        Insert: {
          activated_at?: string | null
          addon_code: string
          cancelled_at?: string | null
          created_at?: string
          id?: string
          monthly_amount_cents?: number
          organization_id: string
          setup_amount_cents?: number
          status?: string
          trial_ends_at?: string | null
          updated_at?: string
        }
        Update: {
          activated_at?: string | null
          addon_code?: string
          cancelled_at?: string | null
          created_at?: string
          id?: string
          monthly_amount_cents?: number
          organization_id?: string
          setup_amount_cents?: number
          status?: string
          trial_ends_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_addons_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_branding: {
        Row: {
          accent_color: string
          created_at: string
          custom_domain: string | null
          email_reply_to: string | null
          email_sender_name: string | null
          favicon_url: string | null
          hide_sails_branding: boolean
          logo_url: string | null
          organization_id: string
          portal_name: string
          primary_color: string
          tagline: string | null
          updated_at: string
        }
        Insert: {
          accent_color?: string
          created_at?: string
          custom_domain?: string | null
          email_reply_to?: string | null
          email_sender_name?: string | null
          favicon_url?: string | null
          hide_sails_branding?: boolean
          logo_url?: string | null
          organization_id: string
          portal_name: string
          primary_color?: string
          tagline?: string | null
          updated_at?: string
        }
        Update: {
          accent_color?: string
          created_at?: string
          custom_domain?: string | null
          email_reply_to?: string | null
          email_sender_name?: string | null
          favicon_url?: string | null
          hide_sails_branding?: boolean
          logo_url?: string | null
          organization_id?: string
          portal_name?: string
          primary_color?: string
          tagline?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_branding_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          name: string
          owner_id: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          owner_id: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          owner_id?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      payment_transactions: {
        Row: {
          amount_minor: number
          created_at: string
          currency: string
          id: string
          occurred_at: string
          order_id: string | null
          organization_id: string
          provider: string
          provider_transaction_id: string
          raw_reference: Json
          status: string
          transaction_type: string
        }
        Insert: {
          amount_minor: number
          created_at?: string
          currency?: string
          id?: string
          occurred_at: string
          order_id?: string | null
          organization_id: string
          provider: string
          provider_transaction_id: string
          raw_reference?: Json
          status: string
          transaction_type: string
        }
        Update: {
          amount_minor?: number
          created_at?: string
          currency?: string
          id?: string
          occurred_at?: string
          order_id?: string | null
          organization_id?: string
          provider?: string
          provider_transaction_id?: string
          raw_reference?: Json
          status?: string
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_transactions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      prices: {
        Row: {
          active: boolean
          amount_minor: number
          billing_interval: string | null
          created_at: string
          currency: string
          id: string
          organization_id: string
          product_id: string
        }
        Insert: {
          active?: boolean
          amount_minor: number
          billing_interval?: string | null
          created_at?: string
          currency?: string
          id?: string
          organization_id: string
          product_id: string
        }
        Update: {
          active?: boolean
          amount_minor?: number
          billing_interval?: string | null
          created_at?: string
          currency?: string
          id?: string
          organization_id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prices_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prices_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          created_at: string
          id: string
          name: string
          organization_id: string
          program_id: string | null
          status: Database["public"]["Enums"]["record_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          organization_id: string
          program_id?: string | null
          status?: Database["public"]["Enums"]["record_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          organization_id?: string
          program_id?: string | null
          status?: Database["public"]["Enums"]["record_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      programs: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          organization_id: string
          status: Database["public"]["Enums"]["record_status"]
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          organization_id: string
          status?: Database["public"]["Enums"]["record_status"]
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          organization_id?: string
          status?: Database["public"]["Enums"]["record_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "programs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      student_events: {
        Row: {
          enrollment_id: string
          event_type: string
          id: number
          occurred_at: string
          organization_id: string
          properties: Json
        }
        Insert: {
          enrollment_id: string
          event_type: string
          id?: never
          occurred_at?: string
          organization_id: string
          properties?: Json
        }
        Update: {
          enrollment_id?: string
          event_type?: string
          id?: never
          occurred_at?: string
          organization_id?: string
          properties?: Json
        }
        Relationships: [
          {
            foreignKeyName: "student_events_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          objective: string | null
          organization_id: string
          status: Database["public"]["Enums"]["record_status"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          objective?: string | null
          organization_id: string
          status?: Database["public"]["Enums"]["record_status"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          objective?: string | null
          organization_id?: string
          status?: Database["public"]["Enums"]["record_status"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_events: {
        Row: {
          attempts: number
          event_type: string
          id: number
          last_error: string | null
          payload: Json
          processed_at: string | null
          provider: string
          provider_event_id: string
          received_at: string
          status: string
        }
        Insert: {
          attempts?: number
          event_type: string
          id?: never
          last_error?: string | null
          payload: Json
          processed_at?: string | null
          provider: string
          provider_event_id: string
          received_at?: string
          status?: string
        }
        Update: {
          attempts?: number
          event_type?: string
          id?: never
          last_error?: string | null
          payload?: Json
          processed_at?: string | null
          provider?: string
          provider_event_id?: string
          received_at?: string
          status?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_org_role: {
        Args: {
          allowed_roles?: Database["public"]["Enums"]["app_role"][]
          target_org: string
        }
        Returns: boolean
      }
      request_from_data_brief_call: {
        Args: {
          p_ai_consent: boolean
          p_career_goal: string
          p_career_role: string
          p_current_challenge: string
          p_email: string
          p_experience_level: string
          p_name: string
          p_starts_at: string
          p_weekly_hours: number
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "owner" | "admin" | "finance" | "mentor" | "support" | "student"
      record_status: "draft" | "active" | "paused" | "archived"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      app_role: ["owner", "admin", "finance", "mentor", "support", "student"],
      record_status: ["draft", "active", "paused", "archived"],
    },
  },
} as const
