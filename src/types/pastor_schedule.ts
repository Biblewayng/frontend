export interface ScheduleEntry {
  id: string;
  pastor_id: string;
  title: string;
  description?: string;
  type: 'meeting' | 'counselling' | 'prep' | 'personal';
  start_datetime: string;
  end_datetime: string;
  created_at: string;
}

export interface ScheduleCreate {
  title: string;
  description?: string;
  type?: string;
  start_datetime: string;
  end_datetime: string;
}
