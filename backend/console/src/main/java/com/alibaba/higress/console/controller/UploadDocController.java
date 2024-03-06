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
package com.alibaba.higress.console.controller;

import java.util.HashMap;
import java.util.Map;

import javax.annotation.Resource;

import com.alibaba.higress.console.controller.dto.Response;
import com.alibaba.higress.sdk.service.kubernetes.KubernetesClientService;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.kubernetes.client.openapi.models.V1ConfigMap;
import io.kubernetes.client.openapi.models.V1ObjectMeta;
import org.apache.commons.lang3.StringUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping(value = "v1/upload")
@Validated
public class UploadDocController {

    @Resource
    private KubernetesClientService kubernetesClientService;

    private static final String CONFIG_MAP_NAME = "higress-service-api-config";

    @PostMapping(value = "", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Response<String>> upload(@RequestParam(name = "file") MultipartFile file,
                                                   @RequestParam(name = "hostname") String hostname) {
        if (file.isEmpty()|| StringUtils.isEmpty(hostname)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Response.failure("file or hostname is empty"));
        }
        if (hostname.contains(":")) {
            hostname = hostname.replace(':', '-');
        }
        try {
            byte[] bytes = file.getBytes();
            String jsonStr = new String(bytes);
            if (validJsonStr(jsonStr)) {
                V1ConfigMap configMap = kubernetesClientService.readConfigMap(CONFIG_MAP_NAME);
                if (null == configMap) {
                    V1ConfigMap newConfigMap = new V1ConfigMap();
                    V1ObjectMeta metadata = new V1ObjectMeta();
                    metadata.setName(CONFIG_MAP_NAME);
                    newConfigMap.setMetadata(metadata);
                    Map<String, String> dataMap = new HashMap<String, String>();
                    dataMap.put(hostname, jsonStr);
                    newConfigMap.setData(dataMap);
                    kubernetesClientService.createConfigMap(newConfigMap);
                } else {
                    Map<String, String> dataMap = configMap.getData();
                    if (null == dataMap) {
                        dataMap = new HashMap<String, String>();
                    }
                    dataMap.put(hostname, jsonStr);
                    kubernetesClientService.replaceConfigMap(configMap);
                }
                return ResponseEntity.status(HttpStatus.OK).body(Response.success("upload success"));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Response.failure("invalid json"));
            }

        } catch (Exception ignore) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Response.failure(ignore.getMessage()));
        }
    }

    private boolean validJsonStr(String jsonStr) {
        ObjectMapper om = new ObjectMapper();
        try {
            om.readTree(jsonStr);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

}
