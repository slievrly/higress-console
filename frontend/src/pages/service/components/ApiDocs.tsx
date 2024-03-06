import { Table } from 'antd';
import React, { useEffect, useState } from 'react';
import { useRequest } from 'ahooks';
import { getApiDocs } from '@/services/api-doc';
import { ApiDoc } from '@/interfaces/api-doc';
import { serviceToString } from '@/interfaces/service';
import { ColumnsType } from 'antd/lib/table';
import { get } from 'axios';

const ApiDocs: React.FC = ({ value }) => {
  const [dataSource, setDataSource] = useState([]);
  const { loading, run, refresh } = useRequest(getApiDocs, {
    manual: true,
    onSuccess: (res) => {
      const records = [];
      for (let key in res.paths) {
        const path = res.paths[key];
        const methods: string[] = [];
        if (path.get) {
          methods.push('get');
        }
        if (path.post) {
          methods.push('post');
        }
        if (path.put) {
          methods.push('put');
        }
        if (path.delete) {
          methods.push('delete');
        }
        console.log(methods);
        records.push({
          key,
          path: key,
          methods: methods.join(','),
        });
      }
      setDataSource(records);
    },
  });

  const columns: ColumnsType = [
    {
      title: 'path',
      dataIndex: 'path',
      key: 'path',
    },
    {
      title: 'methods',
      dataIndex: 'methods',
      key: 'methods',
    },
  ];

  useEffect(() => {
    setDataSource([]);
    value && run(serviceToString(value));
  }, [value]);
  return <Table dataSource={dataSource} columns={columns} />;
};
export default ApiDocs;
