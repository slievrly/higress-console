import { Service } from '@/interfaces/service';

export interface ApiDoc {
  host: string;
  status: string;
  apiDoc?: string;
  errorMsg?: string;
}

export interface ApiDocResponse {
  data: ApiDoc[];
  pageNum: number;
  pageSize: number;
  total: number;
}
