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
      profiles: {
        Row: {
          id: string
          full_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      incomes: {
        Row: {
          id: string
          user_id: string
          valor: number
          data: string
          fonte: string
          tipo: 'recorrente' | 'pontual'
          projeto: string | null
          conta: 'pessoal' | 'negocio'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          valor: number
          data?: string
          fonte: string
          tipo: 'recorrente' | 'pontual'
          projeto?: string | null
          conta: 'pessoal' | 'negocio'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          valor?: number
          data?: string
          fonte?: string
          tipo?: 'recorrente' | 'pontual'
          projeto?: string | null
          conta?: 'pessoal' | 'negocio'
          created_at?: string
        }
      }
      expenses: {
        Row: {
          id: string
          user_id: string
          valor: number
          data: string
          categoria: string
          descricao: string | null
          tipo: 'fixo' | 'variavel'
          status: 'pago' | 'pendente'
          conta: 'pessoal' | 'negocio'
          recorrente: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          valor: number
          data?: string
          categoria: string
          descricao?: string | null
          tipo: 'fixo' | 'variavel'
          status?: 'pago' | 'pendente'
          conta: 'pessoal' | 'negocio'
          recorrente?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          valor?: number
          data?: string
          categoria?: string
          descricao?: string | null
          tipo?: 'fixo' | 'variavel'
          status?: 'pago' | 'pendente'
          conta?: 'pessoal' | 'negocio'
          recorrente?: boolean
          created_at?: string
        }
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}
