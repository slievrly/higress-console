import { List } from 'antd';
import React from 'react';

const ApiList: React.FC = () => {
  return (
    <List bordered dataSource={['111111', '222222', '333333']} renderItem={(item) => <List.Item>{item}</List.Item>} />
  );
};
export default ApiList;
