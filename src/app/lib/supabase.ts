import { createClient, SupabaseClient } from '@supabase/supabase-js';

// 환경 변수에서 Supabase 설정 가져오기
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 환경 변수가 없을 때는 빌드 에러를 던지지 않고, 클라이언트 사이드에서만 초기화
// 정적 빌드 시 블로그 포스트 페이지도 프리렌더링되는데, 이때는 환경 변수가 없을 수 있음
let supabaseClient: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  // 클라이언트 사이드에서만 실행
  if (typeof window === 'undefined') {
    throw new Error('Supabase client can only be used on the client side');
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please check your .env.local file.'
    );
  }

  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  }

  return supabaseClient;
}

// 클라이언트 사이드에서만 사용 가능한 Supabase 클라이언트
// 서버 사이드 빌드 시에는 에러를 던지지 않음 (빌드 성공을 위해)
export const supabase = typeof window !== 'undefined' && supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (null as unknown as SupabaseClient); // 타입 호환성을 위한 타입 단언

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

