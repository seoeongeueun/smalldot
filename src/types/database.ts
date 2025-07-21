// db의 테이블 데이터 타입을 정의
export type Note = {
  id: string;
  title: string;
  content: string;
  country_code: string;
  date: string;
  created_at: string;
  updated_at?: string;
};
