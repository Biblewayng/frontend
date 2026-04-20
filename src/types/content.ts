export interface Content {
  id: string;
  key: string;
  value: string;
  category?: string;
  updatedAt: string;
}

export interface ServiceTime {
  id: string;
  day: string;
  time: string;
  service?: string;
  service_type: string;
  description?: string;
}
