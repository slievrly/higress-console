import { ApiDoc } from '@/interfaces/api-doc';
import request from '@/services/request';

export const getApiDocs = (hostname: string): Promise<any> => {
  return request.get<string, any>(`/v1/apidocs/${hostname}`);
};
