import request from '@/services/request';

export const uploadApiDoc = (payload: any): Promise<any> => {
  return request.post<string, any>(`/v1/upload`, payload, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
