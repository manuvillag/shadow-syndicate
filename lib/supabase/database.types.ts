export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      players: {
        Row: {
          id: string
          user_id: string
          handle: string
          rank: string
          syndicate: string
          credits: number
          alloy: number
          level: number
          xp_current: number
          xp_max: number
          charge: number
          charge_max: number
          adrenal: number
          adrenal_max: number
          health: number
          health_max: number
          crew_size: number
          crew_max: number
          created_at: string
          updated_at: string
          last_charge_regen: string
          last_adrenal_regen: string
          last_health_regen: string
        }
        Insert: Omit<Database['public']['Tables']['players']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['players']['Insert']>
      }
      contracts: {
        Row: {
          id: string
          name: string
          description: string
          difficulty: 'easy' | 'risky' | 'elite' | 'event'
          energy_cost: number
          credits_reward: number
          xp_reward: number
          loot_chance: number
          is_active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['contracts']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['contracts']['Insert']>
      }
      contract_executions: {
        Row: {
          id: string
          player_id: string
          contract_id: string
          executed_at: string
          success: boolean
          credits_earned: number
          xp_earned: number
          loot_received: string | null
        }
        Insert: Omit<Database['public']['Tables']['contract_executions']['Row'], 'id' | 'executed_at'>
        Update: Partial<Database['public']['Tables']['contract_executions']['Insert']>
      }
      crew_members: {
        Row: {
          id: string
          player_id: string
          name: string
          role: 'Enforcer' | 'Hacker' | 'Smuggler'
          level: number
          bonus_description: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['crew_members']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['crew_members']['Insert']>
      }
      outposts: {
        Row: {
          id: string
          player_id: string
          name: string
          type: string
          level: number
          income_rate: number
          last_collected_at: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['outposts']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['outposts']['Insert']>
      }
      items: {
        Row: {
          id: string
          name: string
          rarity: 'common' | 'rare' | 'epic' | 'legendary'
          type: 'weapon' | 'armor' | 'gadget' | 'consumable'
          attack_boost: number | null
          defense_boost: number | null
          special_boost: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['items']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['items']['Insert']>
      }
      player_inventory: {
        Row: {
          id: string
          player_id: string
          item_id: string
          quantity: number
          equipped: boolean
          slot: 'weapon' | 'armor' | 'gadget' | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['player_inventory']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['player_inventory']['Insert']>
      }
      combat_logs: {
        Row: {
          id: string
          player_id: string
          opponent_name: string
          outcome: 'win' | 'lose'
          damage_dealt: number
          damage_taken: number
          credits_earned: number
          xp_gained: number
          loot_received: string | null
          fought_at: string
        }
        Insert: Omit<Database['public']['Tables']['combat_logs']['Row'], 'id' | 'fought_at'>
        Update: Partial<Database['public']['Tables']['combat_logs']['Insert']>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}


