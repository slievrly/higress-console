import {Table} from 'antd';
import React, {useEffect, useState} from 'react';
import {useRequest} from 'ahooks';
import {getApiDocs} from '@/services/api-doc';
import {serviceToString} from '@/interfaces/service';
import {ColumnsType} from 'antd/lib/table';

const ApiDocs: React.FC = ({ value }) => {
  const [dataSource, setDataSource] = useState([]);
  const { loading, run, refresh } = useRequest(getApiDocs, {
    manual: true,
    onSuccess: (res) => {
      const records = [];
      {
        res.map(data => (
            records.push({
              path: data.path,
              method: data.method,
              signature: data.signature,
              parameter: data.parameter,
              response: data.response,
              description: data.description,
            })
        ));
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
      title: 'method',
      dataIndex: 'method',
      key: 'method',
    },
    {
      title: 'signature',
      dataIndex: 'signature',
      key: 'signature',
    },
    {
      title: 'parameter',
      dataIndex: 'parameter',
      key: 'parameter',
    },
    {
      title: 'response',
      dataIndex: 'response',
      key: 'response',
    },
    {
      title: 'description',
      dataIndex: 'description',
      key: 'description',
    },
  ];

  useEffect(() => {
    setDataSource([]);
    value && run(serviceToString(value));
  }, [value]);
  return <Table dataSource={dataSource} columns={columns} />;
};
export default ApiDocs;
