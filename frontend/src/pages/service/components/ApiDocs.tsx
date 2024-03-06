import { Table } from 'antd';
import React, { useEffect, useState } from 'react';
import { useRequest } from 'ahooks';
import { getApiDocs } from '@/services/api-doc';
import { ApiDoc } from '@/interfaces/api-doc';
import { serviceToString } from '@/interfaces/service';
import { ColumnsType } from 'antd/lib/table';

const ApiDocs: React.FC = ({ value }) => {
  const [dataSource, setDataSource] = useState([]);
  const { loading, run, refresh } = useRequest(getApiDocs, {
    manual: true,
    onSuccess: (res) => {
      const records = [];
      for (let key in res.paths) {
        records.push({
          path: key,
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
  ];

  useEffect(() => {
    setDataSource([]);
    value && run(serviceToString(value));
  }, [value]);
  return <Table dataSource={dataSource} columns={columns} />;
};
export default ApiDocs;
