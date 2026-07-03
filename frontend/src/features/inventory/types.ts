export interface Asset {
  id: number;
  name: string;
  ip_address: string;
  mac_address?: string;
  description?: string;
  type: string;
  status: string;
  is_deleted: boolean;
  created_at: string;
}

export interface TelemetryData {
  _id: string;
  asset_id: number;
  cpu_usage: number;
  ram_usage: number;
  temperature: number;
  timestamp: string;
}

export type ViewMode = 'SQL' | 'NOSQL';
