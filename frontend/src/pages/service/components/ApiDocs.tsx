import { List } from 'antd';
import React, { useEffect, useState } from 'react';
import { useRequest } from 'ahooks';
import { getApiDocs } from '@/services/api-doc';
import { ApiDoc } from '@/interfaces/api-doc';

const ApiDocs: React.FC = ({ value }) => {
  const [apiDocs, setApiDocs] = useState<ApiDoc | null>(null);
  const { loading, run, refresh } = useRequest(getApiDocs, {
    manual: true,
    onSuccess: (res) => {
      setApiDocs(res || null);
    },
  });
  useEffect(() => {
    value && run(value.name);
  }, [value]);
  return apiDocs;
};
export default ApiDocs;
