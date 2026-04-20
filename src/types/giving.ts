export interface Giving {
  id: string;
  memberId: string;
  amount: number;
  type: 'tithe' | 'offering' | 'missions' | 'building_fund' | 'special';
  method: 'cash' | 'check' | 'online' | 'card';
  date: string;
  notes?: string;
  createdAt: string;
}

export interface GivingSummary {
  totalAmount: number;
  count: number;
  byType: Record<string, number>;
  byMonth: Record<string, number>;
}
