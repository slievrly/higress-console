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

import com.alibaba.fastjson.JSON;
import com.alibaba.higress.sdk.exception.BusinessException;
import com.alibaba.higress.sdk.exception.NotFoundException;
import com.alibaba.higress.sdk.model.ApiDoc;
import com.alibaba.higress.sdk.service.kubernetes.KubernetesClientService;

import io.kubernetes.client.openapi.models.V1ConfigMap;
import io.swagger.parser.OpenAPIParser;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.parser.core.models.ParseOptions;
import io.swagger.v3.parser.core.models.SwaggerParseResult;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;

public class ApiDocServiceImpl implements ApiDocService {

    private KubernetesClientService kubernetesClientService;

    private static final String CONFIG_MAP_NAME = "higress-service-api-config";

    public ApiDocServiceImpl(KubernetesClientService kubernetesClientService) {
        this.kubernetesClientService = kubernetesClientService;
    }

    @Override
    public OpenAPI getApiDoc(String hostName) {
        String result = null;
        try {
            V1ConfigMap configMap = kubernetesClientService.readConfigMap(CONFIG_MAP_NAME);
            if (null != configMap) {
                if (configMap.getData() != null) {
                    result = configMap.getData().get(hostName.replaceAll(":", "-"));
                }
            }
            if (StringUtils.isBlank(result)) {
                result = kubernetesClientService.getApiDocByName(hostName);
            }
            if (StringUtils.isBlank(result)) {
                return null;
            }
            ApiDoc apiDoc = JSON.parseObject(result, ApiDoc.class);
            if (apiDoc.getStatus() != 200) {
                throw new NotFoundException("no available API");
            }
            return parseApiDocs(apiDoc);
        } catch (Exception e) {
            if (e instanceof NotFoundException) {
                throw (NotFoundException)e;
            }
            throw new BusinessException("Error occurs when get api-docs.", e);
        }
    }

    private OpenAPI parseApiDocs(ApiDoc apiDoc) {
        ParseOptions parseOptions = new ParseOptions();
        parseOptions.setResolve(true);
        parseOptions.setResolveFully(true);
        SwaggerParseResult result = new OpenAPIParser().readContents(apiDoc.getApiDoc(), null, parseOptions);
        if (CollectionUtils.isNotEmpty(result.getMessages())) {
            throw new BusinessException("Error occurs when parse api-docs: " + result.getMessages());
        }
        OpenAPI openAPI = result.getOpenAPI();
        if (openAPI == null) {
            throw new BusinessException("Error occurs when parse api-docs: openAPI is null");
        }
        return openAPI;
    }
}
