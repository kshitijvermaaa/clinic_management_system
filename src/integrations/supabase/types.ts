type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      appointments: {
        Row: {
          appointment_date: string
          appointment_time: string
          appointment_type: Database["public"]["Enums"]["appointment_type"]
          created_at: string
          id: string
          notes: string | null
          patient_id: string | null
          status: Database["public"]["Enums"]["appointment_status"]
          updated_at: string
        }
        Insert: {
          appointment_date: string
          appointment_time: string
          appointment_type?: Database["public"]["Enums"]["appointment_type"]
          created_at?: string
          id?: string
          notes?: string | null
          patient_id?: string | null
          status?: Database["public"]["Enums"]["appointment_status"]
          updated_at?: string
        }
        Update: {
          appointment_date?: string
          appointment_time?: string
          appointment_type?: Database["public"]["Enums"]["appointment_type"]
          created_at?: string
          id?: string
          notes?: string | null
          patient_id?: string | null
          status?: Database["public"]["Enums"]["appointment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_appointments_patient_id"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["patient_id"]
          },
        ]
      }
      clinic_closures: {
        Row: {
          closure_date: string
          created_at: string
          id: string
          is_half_day: boolean
          reason: string
        }
        Insert: {
          closure_date: string
          created_at?: string
          id?: string
          is_half_day?: boolean
          reason: string
        }
        Update: {
          closure_date?: string
          created_at?: string
          id?: string
          is_half_day?: boolean
          reason?: string
        }
        Relationships: []
      }
      clinic_holidays: {
        Row: {
          created_at: string
          holiday_date: string
          holiday_name: string
          id: string
          is_half_day: boolean
          is_recurring: boolean
        }
        Insert: {
          created_at?: string
          holiday_date: string
          holiday_name: string
          id?: string
          is_half_day?: boolean
          is_recurring?: boolean
        }
        Update: {
          created_at?: string
          holiday_date?: string
          holiday_name?: string
          id?: string
          is_half_day?: boolean
          is_recurring?: boolean
        }
        Relationships: []
      }
      lab_work: {
        Row: {
          actual_date: string | null
          cost: number | null
          created_at: string | null
          date_sent: string
          expected_date: string | null
          id: string
          instructions: string | null
          lab_name: string
          lab_type: string
          notes: string | null
          patient_id: string
          status: Database["public"]["Enums"]["lab_work_status"]
          treatment_id: string | null
          updated_at: string | null
          work_description: string
        }
        Insert: {
          actual_date?: string | null
          cost?: number | null
          created_at?: string | null
          date_sent?: string
          expected_date?: string | null
          id?: string
          instructions?: string | null
          lab_name: string
          lab_type: string
          notes?: string | null
          patient_id: string
          status?: Database["public"]["Enums"]["lab_work_status"]
          treatment_id?: string | null
          updated_at?: string | null
          work_description: string
        }
        Update: {
          actual_date?: string | null
          cost?: number | null
          created_at?: string | null
          date_sent?: string
          expected_date?: string | null
          id?: string
          instructions?: string | null
          lab_name?: string
          lab_type?: string
          notes?: string | null
          patient_id?: string
          status?: Database["public"]["Enums"]["lab_work_status"]
          treatment_id?: string | null
          updated_at?: string | null
          work_description?: string
        }
        Relationships: [
          {
            foreignKeyName: "lab_work_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "lab_work_treatment_id_fkey"
            columns: ["treatment_id"]
            isOneToOne: false
            referencedRelation: "treatments"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_work_files: {
        Row: {
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          lab_work_id: string
          uploaded_at: string | null
        }
        Insert: {
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id?: string
          lab_work_id: string
          uploaded_at?: string | null
        }
        Update: {
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          lab_work_id?: string
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lab_work_files_lab_work_id_fkey"
            columns: ["lab_work_id"]
            isOneToOne: false
            referencedRelation: "lab_work"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          address: string
          allergies: string | null
          blood_group: string | null
          chronic_conditions: string | null
          created_at: string
          date_of_birth: string
          email: string | null
          emergency_contact: string | null
          full_name: string
          gender: string
          id: string
          insurance_details: string | null
          mobile_number: string
          patient_id: string
          patient_nickname: string | null
          referred_by: string | null
          updated_at: string
        }
        Insert: {
          address: string
          allergies?: string | null
          blood_group?: string | null
          chronic_conditions?: string | null
          created_at?: string
          date_of_birth: string
          email?: string | null
          emergency_contact?: string | null
          full_name: string
          gender: string
          id?: string
          insurance_details?: string | null
          mobile_number: string
          patient_id?: string
          patient_nickname?: string | null
          referred_by?: string | null
          updated_at?: string
        }
        Update: {
          address?: string
          allergies?: string | null
          blood_group?: string | null
          chronic_conditions?: string | null
          created_at?: string
          date_of_birth?: string
          email?: string | null
          emergency_contact?: string | null
          full_name?: string
          gender?: string
          id?: string
          insurance_details?: string | null
          mobile_number?: string
          patient_id?: string
          patient_nickname?: string | null
          referred_by?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          lab_work_id: string | null
          notes: string | null
          patient_id: string
          payment_date: string
          payment_method: string
          treatment_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          lab_work_id?: string | null
          notes?: string | null
          patient_id: string
          payment_date?: string
          payment_method?: string
          treatment_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          lab_work_id?: string | null
          notes?: string | null
          patient_id?: string
          payment_date?: string
          payment_method?: string
          treatment_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_lab_work_id_fkey"
            columns: ["lab_work_id"]
            isOneToOne: false
            referencedRelation: "lab_work"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "payments_treatment_id_fkey"
            columns: ["treatment_id"]
            isOneToOne: false
            referencedRelation: "treatments"
            referencedColumns: ["id"]
          },
        ]
      }
      prescriptions: {
        Row: {
          created_at: string
          dosage: string
          duration: string
          frequency: string
          id: string
          instructions: string | null
          medication_name: string
          patient_id: string | null
          prescribed_date: string
          treatment_id: string | null
        }
        Insert: {
          created_at?: string
          dosage: string
          duration: string
          frequency: string
          id?: string
          instructions?: string | null
          medication_name: string
          patient_id?: string | null
          prescribed_date?: string
          treatment_id?: string | null
        }
        Update: {
          created_at?: string
          dosage?: string
          duration?: string
          frequency?: string
          id?: string
          instructions?: string | null
          medication_name?: string
          patient_id?: string | null
          prescribed_date?: string
          treatment_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_prescriptions_patient_id"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "prescriptions_treatment_id_fkey"
            columns: ["treatment_id"]
            isOneToOne: false
            referencedRelation: "treatments"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      treatments: {
        Row: {
          appointment_id: string | null
          created_at: string
          id: string
          materials_used: string | null
          next_appointment_date: string | null
          notes: string | null
          patient_id: string | null
          procedure_done: string
          teeth_involved: string[] | null
          treatment_cost: number | null
          treatment_date: string
          treatment_status: Database["public"]["Enums"]["treatment_status"]
          updated_at: string
        }
        Insert: {
          appointment_id?: string | null
          created_at?: string
          id?: string
          materials_used?: string | null
          next_appointment_date?: string | null
          notes?: string | null
          patient_id?: string | null
          procedure_done: string
          teeth_involved?: string[] | null
          treatment_cost?: number | null
          treatment_date: string
          treatment_status?: Database["public"]["Enums"]["treatment_status"]
          updated_at?: string
        }
        Update: {
          appointment_id?: string | null
          created_at?: string
          id?: string
          materials_used?: string | null
          next_appointment_date?: string | null
          notes?: string | null
          patient_id?: string | null
          procedure_done?: string
          teeth_involved?: string[] | null
          treatment_cost?: number | null
          treatment_date?: string
          treatment_status?: Database["public"]["Enums"]["treatment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_treatments_patient_id"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "treatments_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_patient_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      appointment_status:
        | "scheduled"
        | "completed"
        | "cancelled"
        | "rescheduled"
      appointment_type: "regular" | "emergency" | "walkin" | "followup"
      lab_work_status: "pending" | "in_progress" | "completed" | "delivered"
      treatment_status: "ongoing" | "completed" | "paused"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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

type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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

type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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

type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

const Constants = {
  public: {
    Enums: {
      appointment_status: [
        "scheduled",
        "completed",
        "cancelled",
        "rescheduled",
      ],
      appointment_type: ["regular", "emergency", "walkin", "followup"],
      lab_work_status: ["pending", "in_progress", "completed", "delivered"],
      treatment_status: ["ongoing", "completed", "paused"],
    },
  },
} as const