import { OptionItem } from '@/interfaces/common';
import { Service, serviceToString } from '@/interfaces/service';
import { getGatewayServices } from '@/services';
import { RedoOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-layout';
import { useRequest } from 'ahooks';
import { Button, Col, Drawer, Form, Input, List, Row, Select, Space, Table } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import RouteForm from '@/pages/route/components/RouteForm';

const ServiceList: React.FC = () => {
  const { t } = useTranslation();

  const columns = [
    {
      title: t('service.columns.name'),
      dataIndex: 'name',
      key: 'name',
      width: 350,
      ellipsis: true,
      render: (_, record) => {
        return serviceToString(record);
      },
    },
    {
      title: t('service.columns.namespace'),
      dataIndex: 'namespace',
      key: 'namespace',
      width: 200,
    },
    {
      title: t('service.columns.endpoints'),
      dataIndex: 'endpoints',
      key: 'endpoints',
      ellipsis: true,
      render: (value) => {
        return (value && value.join(', ')) || '-';
      },
    },
    {
      title: t('service.columns.apiList'),
      key: 'apiList',
      width: 200,
      align: 'center',
      render: (_, record) => {
        return (
          <Space size="small">
            <a onClick={() => showApiList(record)}>{t('service.showApiList')}</a>
          </Space>
        );
      },
    },
  ];

  const [dataSource, setDataSource] = useState<Service[]>([]);
  const [namespaces, setNamespaces] = useState<OptionItem[]>();
  const servicesRef = useRef<Service[] | null>();
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiListVisible, setApiListVisible] = useState<boolean>(false);
  const [apiImportVisible, setApiImportVisible] = useState<boolean>(false);

  const getServiceList = async (): Promise<Service[]> => getGatewayServices();

  const { loading, run, refresh } = useRequest(getServiceList, {
    manual: true,
    onSuccess: (result, params) => {
      const _os = new Set();
      const _namespaces: OptionItem[] = [];
      result &&
        result.forEach((service) => {
          const { name, namespace } = service;
          service.key = serviceToString(service);
          if (!_os.has(namespace)) {
            _namespaces.push({
              label: namespace,
              value: namespace,
            });
            _os.add(namespace);
          }
        });
      servicesRef.current = result || [];
      setDataSource(result);
      setNamespaces(_namespaces);
    },
  });

  useEffect(() => {
    run();
  }, []);

  const onSearch = () => {
    const values = form.getFieldsValue();
    setIsLoading(true);
    const factor = {};
    const { name, namespace } = values;
    let _dataSource: Service[] = servicesRef.current as Service[];
    if (name) {
      Object.assign(factor, { name });
      _dataSource =
        _dataSource &&
        _dataSource.filter((service: Service) => {
          const { name: _name } = service;
          return _name.indexOf(name) > -1;
        });
    }
    if (namespace) {
      Object.assign(factor, { namespace });
      _dataSource =
        _dataSource &&
        _dataSource.filter((service: Service) => {
          const { namespace: _namespace } = service;
          // eslint-disable-next-line eqeqeq
          return _namespace == namespace;
        });
    }
    setDataSource(_dataSource);
    setIsLoading(false);
  };

  const onReset = () => form.resetFields();

  const showApiImport = () => {
    setApiImportVisible(true);
  };

  const hideApiImport = () => {
    setApiImportVisible(false);
  };

  const showApiList = (record) => {
    setApiListVisible(true);
  };

  const hideApiList = () => {
    setApiListVisible(false);
  };

  return (
    <PageContainer>
      <Form
        form={form}
        style={{
          background: '#fff',
          height: 64,
          paddingTop: 16,
          marginBottom: 16,
          paddingLeft: 16,
          paddingRight: 16,
        }}
      >
        <Row gutter={24}>
          <Col span={6}>
            <Form.Item label={t('service.columns.name')} name="name">
              <Input allowClear placeholder={t('service.namePlaceholder') || ''} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label={t('service.columns.namespace')} name="namespace">
              <Select showSearch allowClear placeholder={t('service.namespacePlaceholder')} options={namespaces} />
            </Form.Item>
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <Button style={{ marginRight: '8px' }} type="primary" onClick={showApiImport}>
              {t('service.apiImport')}
            </Button>
            <Button type="primary" onClick={onSearch}>
              {t('misc.search')}
            </Button>
            <Button style={{ margin: '0 8px' }} onClick={onReset}>
              {t('misc.reset')}
            </Button>
            <Button icon={<RedoOutlined />} onClick={refresh} />
          </Col>
        </Row>
      </Form>
      <Table loading={loading || isLoading} dataSource={dataSource} columns={columns} pagination={false} />

      <Drawer
        title={t('service.showApiList')}
        placement="right"
        width={660}
        onClose={hideApiList}
        open={apiListVisible}
      >
        <List
          bordered
          dataSource={['111111', '222222', '333333']}
          renderItem={(item) => <List.Item>{item}</List.Item>}
        />
      </Drawer>

      <Drawer
        title={t('service.apiImport')}
        placement="right"
        width={660}
        onClose={hideApiImport}
        open={apiImportVisible}
      >
        <Form>
          <Form.Item label={t('service.columns.name')}>
            <Select>
              <Select.Option value="1">1</Select.Option>
              <Select.Option value="2">2</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Drawer>
    </PageContainer>
  );
};

export default ServiceList;
