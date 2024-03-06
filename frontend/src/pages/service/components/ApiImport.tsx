import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { Button, Form, Select, Upload, UploadProps } from 'antd';
import { useTranslation } from 'react-i18next';
import { UploadOutlined } from '@ant-design/icons';
import { OptionItem } from '@/interfaces/common';
import { RcFile } from 'antd/lib/upload';

const ApiImport: React.FC = forwardRef(({ value }, ref) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [file, setFile] = useState<RcFile | null>(null);
  const serviceOptions: OptionItem[] = [];
  value &&
    value.forEach((service) => {
      serviceOptions.push({ label: service.key, value: service.key });
    });
  const props: UploadProps = {
    action: '',
    maxCount: 1,
    accept: 'application/json',
    onRemove: () => {
      setFile(null);
    },
    // eslint-disable-next-line @typescript-eslint/no-shadow
    beforeUpload: (file, fileList) => {
      setFile(file);
      return false;
    },
  };

  useImperativeHandle(ref, () => ({
    reset: () => form.resetFields(),
    handleSubmit: async () => {
      form.setFieldValue('file', file);
      return await form.validateFields();
    },
  }));

  return (
    <Form form={form} layout="vertical">
      <Form.Item
        label={t('service.columns.name')}
        name="hostname"
        rules={[
          {
            required: true,
            message: '目标服务不能为空',
          },
        ]}
      >
        <Select showSearch allowClear placeholder={'请选择目标服务'} options={serviceOptions} />
      </Form.Item>
      <Form.Item
        label={'上传API文件'}
        name="file"
        rules={[
          {
            required: true,
            message: 'API文件不能为空',
          },
        ]}
      >
        <Upload {...props}>
          <Button icon={<UploadOutlined />}>点击上传</Button>
        </Upload>
      </Form.Item>
    </Form>
  );
});

export default ApiImport;
