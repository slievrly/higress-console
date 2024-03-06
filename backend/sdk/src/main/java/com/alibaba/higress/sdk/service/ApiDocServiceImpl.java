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

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.alibaba.higress.sdk.exception.BusinessException;
import com.alibaba.higress.sdk.exception.NotFoundException;
import com.alibaba.higress.sdk.model.ApiDoc;
import com.alibaba.higress.sdk.model.ApiDoc.MethodType;
import com.alibaba.higress.sdk.service.kubernetes.KubernetesClientService;

import io.kubernetes.client.openapi.models.V1ConfigMap;
import io.swagger.parser.OpenAPIParser;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.Operation;
import io.swagger.v3.oas.models.PathItem;
import io.swagger.v3.parser.core.models.ParseOptions;
import io.swagger.v3.parser.core.models.SwaggerParseResult;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.collections4.MapUtils;
import org.apache.commons.lang3.StringUtils;

public class ApiDocServiceImpl implements ApiDocService {

    private KubernetesClientService kubernetesClientService;

    private static final String CONFIG_MAP_NAME = "higress-service-api-config";

    public ApiDocServiceImpl(KubernetesClientService kubernetesClientService) {
        this.kubernetesClientService = kubernetesClientService;
    }

    @Override
    public List<ApiDoc> getApiDoc(String hostName) {
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
            String apiDoc = result;
            JSONObject apiObj = JSON.parseObject(result);
            if (apiObj.containsKey("apiDoc")) {
                apiDoc = apiObj.getString("apiDoc");
            }
            if (null == apiDoc) {
                throw new NotFoundException("no available API");
            }
            return parseApiDocList(parseApiDocs(apiDoc));
        } catch (Exception e) {
            if (e instanceof NotFoundException) {
                throw (NotFoundException)e;
            }
            throw new BusinessException("Error occurs when get api-docs.", e);
        }
    }

    private OpenAPI parseApiDocs(String apiDoc) {
        ParseOptions parseOptions = new ParseOptions();
        parseOptions.setResolve(true);
        parseOptions.setResolveFully(true);
        SwaggerParseResult result = new OpenAPIParser().readContents(apiDoc, null, parseOptions);
        if (CollectionUtils.isNotEmpty(result.getMessages())) {
            throw new BusinessException("Error occurs when parse api-docs: " + result.getMessages());
        }
        OpenAPI openAPI = result.getOpenAPI();
        if (openAPI == null) {
            throw new BusinessException("Error occurs when parse api-docs: openAPI is null");
        }
        return openAPI;
    }

    private List<ApiDoc> parseApiDocList(OpenAPI openAPI) {
        if (openAPI.getPaths().size() == 0) {
            return null;
        }
        List<ApiDoc> apiDocs = new ArrayList<>();
        for (Map.Entry<String, PathItem> entry : openAPI.getPaths().entrySet()) {
            ApiDoc apiDoc = new ApiDoc();
            String path = entry.getKey();
            apiDoc.setPath(path);
            PathItem pathItem = entry.getValue();
            if (pathItem.getGet() != null) {
                ApiDoc newApiDoc = apiDoc.simpleCopy();
                newApiDoc.setMethod(MethodType.GET);
                setOperationAttr(newApiDoc, pathItem.getGet());
                apiDocs.add(newApiDoc);
            }
            if (pathItem.getPost() != null) {
                ApiDoc newApiDoc = apiDoc.simpleCopy();
                newApiDoc.setMethod(MethodType.POST);
                setOperationAttr(newApiDoc, pathItem.getPost());
                apiDocs.add(newApiDoc);
            }
            if (pathItem.getPut() != null) {
                ApiDoc newApiDoc = apiDoc.simpleCopy();
                newApiDoc.setMethod(MethodType.PUT);
                setOperationAttr(newApiDoc, pathItem.getPut());
                apiDocs.add(newApiDoc);
            }
            if (pathItem.getDelete() != null) {
                ApiDoc newApiDoc = apiDoc.simpleCopy();
                newApiDoc.setMethod(MethodType.DELETE);
                setOperationAttr(newApiDoc, pathItem.getDelete());
                apiDocs.add(newApiDoc);
            }

        }
        return apiDocs;
    }

    private void setOperationAttr(ApiDoc apiDoc, Operation operation) {
        apiDoc.setDescription(operation.getDescription());
        apiDoc.setSignature(operation.getOperationId());
        if (CollectionUtils.isNotEmpty(operation.getParameters())) {
            apiDoc.setParameter(JSON.toJSONString(operation.getParameters()));
        }
        if (MapUtils.isNotEmpty(operation.getResponses())) {
            apiDoc.setResponse(JSON.toJSONString(operation.getResponses()));
        }
        apiDoc.setDescription(operation.getSummary());
    }

}
