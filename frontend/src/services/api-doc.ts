import { ApiDoc } from '@/interfaces/api-doc';
import request from '@/services/request';

export const getApiDocs = (service: string): Promise<ApiDoc> => {
  return request.get<string, ApiDoc>(`/v1/apidocs/${service}`);
};
