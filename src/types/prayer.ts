export interface PrayerRequest {
  id: string;
  title: string;
  description?: string;
  author?: string;
  memberId?: string;
  date: string;
  status: 'active' | 'answered' | 'closed';
  prayers: number;
  isPrivate: boolean;
  createdAt: string;
}
