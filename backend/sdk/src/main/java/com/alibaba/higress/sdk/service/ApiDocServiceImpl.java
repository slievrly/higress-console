/*
 * Copyright (c) 2022-2023 Alibaba Group Holding Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */
package com.alibaba.higress.sdk.service;

import com.alibaba.higress.sdk.exception.BusinessException;
import com.alibaba.higress.sdk.service.kubernetes.KubernetesClientService;

import io.kubernetes.client.openapi.models.V1ConfigMap;

public class ApiDocServiceImpl implements ApiDocService {

    private KubernetesClientService kubernetesClientService;

    private static final String CONFIG_MAP_NAME = "higress-service-api-config";

    public ApiDocServiceImpl(KubernetesClientService kubernetesClientService) {
        this.kubernetesClientService = kubernetesClientService;
    }

    @Override
    public String getApiDoc(String hostName) {
        try {
            V1ConfigMap configMap = kubernetesClientService.readConfigMap(CONFIG_MAP_NAME);
            if (null != configMap) {
                return configMap.getData().get(hostName);
            }
            return kubernetesClientService.getApiDocByName(hostName);
        } catch (Exception e) {
            throw new BusinessException("Error occurs when get api-docs.", e);
        }
    }
}
