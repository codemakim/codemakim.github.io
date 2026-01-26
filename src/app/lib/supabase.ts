import { createClient } from '@supabase/supabase-js';

// 환경 변수에서 Supabase 설정 가져오기
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file.'
  );
}

// Supabase 클라이언트 생성 (브라우저에서 사용)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 타입 정의 (나중에 데이터베이스 스키마에 맞게 업데이트)
export type Database = {
  public: {
    Tables: {
      habits: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          color: string;
          start_date: string;
          end_date: string;
          weekdays: number[]; // [0,1,2,3,4,5,6] 형태 (JavaScript Date.getDay()와 동일: 0=일요일, 1=월요일, ..., 6=토요일)
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          color: string;
          start_date: string;
          end_date: string;
          weekdays: number[];
        };
        Update: {
          title?: string;
          color?: string;
          start_date?: string;
          end_date?: string;
          weekdays?: number[];
        };
      };
      habit_records: {
        Row: {
          id: string;
          habit_id: string;
          date: string; // YYYY-MM-DD 형식
          completed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          habit_id: string;
          date: string;
          completed: boolean;
        };
        Update: {
          completed?: boolean;
        };
      };
    };
  };
};

