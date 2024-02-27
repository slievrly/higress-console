import React from 'react';
import { Button, Form, Select, Upload, UploadProps } from 'antd';
import { useTranslation } from 'react-i18next';
import { UploadOutlined } from '@ant-design/icons';

const props: UploadProps = {
  action: '',
  maxCount: 1,
  beforeUpload: (file, fileList) => {
    return false;
  },
  onChange({ file, fileList }) {
    if (file.status !== 'uploading') {
      console.log(file, fileList);
    }
  },
};

const ApiImport: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Form>
      <Form.Item label={t('service.columns.name')}>
        <Select>
          <Select.Option value="1">1</Select.Option>
          <Select.Option value="2">2</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item label={'上传API文件'}>
        <Upload {...props}>
          <Button icon={<UploadOutlined />}>点击上传</Button>
        </Upload>
      </Form.Item>
    </Form>
  );
};

export default ApiImport;
