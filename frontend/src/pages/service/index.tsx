import { OptionItem } from '@/interfaces/common';
import { Service, serviceToString } from '@/interfaces/service';
import { addGatewayRoute, getGatewayServices, updateGatewayRoute } from '@/services';
import { RedoOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-layout';
import { useRequest } from 'ahooks';
import { Button, Col, Drawer, Form, Input, List, message, Row, Select, Space, Table } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import RouteForm from '@/pages/route/components/RouteForm';
import ApiDocs from '@/pages/service/components/ApiDocs';
import ApiImport from '@/pages/service/components/ApiImport';
import { Route } from '@/interfaces/route';
import { uploadApiDoc } from '@/services/api-import';

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
      title: t('service.columns.apiDocs'),
      key: 'apiDocs',
      width: 200,
      align: 'center',
      render: (_, record) => {
        return (
          <Space size="small">
            <a onClick={() => showApiDocs(record)}>{t('service.showApiDocs')}</a>
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
  const [currentService, setCurrentService] = useState<Service | null>(null);
  const formRef = useRef(null);

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

  const showApiDocs = (record) => {
    setCurrentService(record);
    setApiListVisible(true);
  };

  const hideApiDocs = () => {
    setCurrentService(null);
    setApiListVisible(false);
  };

  const handleDrawerOK = async () => {
    try {
      const values = formRef.current && (await formRef.current.handleSubmit());
      const { hostname, file } = values;
      const result = await uploadApiDoc({
        hostname,
        file,
      });
      hideApiImport();
      formRef.current.reset();
      message.success('上传成功');
    } catch (errInfo) {
      // eslint-disable-next-line no-console
      console.log('upload api-doc failed:', errInfo);
    }
  };

  const handleDrawerCancel = () => {
    hideApiImport();
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
        title={t('service.showApiDocs')}
        placement="right"
        width={660}
        onClose={hideApiDocs}
        open={apiListVisible}
      >
        <ApiDocs value={currentService} />
      </Drawer>

      <Drawer
        title={t('service.apiImport')}
        placement="right"
        width={660}
        onClose={hideApiImport}
        open={apiImportVisible}
        extra={
          <Space>
            <Button onClick={handleDrawerCancel}>{t('misc.cancel')}</Button>
            <Button type="primary" onClick={handleDrawerOK}>
              {t('misc.confirm')}
            </Button>
          </Space>
        }
      >
        <ApiImport ref={formRef} value={dataSource} />
      </Drawer>
    </PageContainer>
  );
};

export default ServiceList;
