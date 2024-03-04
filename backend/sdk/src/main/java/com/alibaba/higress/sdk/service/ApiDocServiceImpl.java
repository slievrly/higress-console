package com.alibaba.higress.sdk.service;

import com.alibaba.higress.sdk.exception.BusinessException;
import com.alibaba.higress.sdk.service.kubernetes.KubernetesClientService;

public class ApiDocServiceImpl implements ApiDocService {

    private KubernetesClientService kubernetesClientService;

    public ApiDocServiceImpl(KubernetesClientService kubernetesClientService) {
        this.kubernetesClientService = kubernetesClientService;
    }

    @Override
    public String getApiDoc(String hostName) {
        try {
            return kubernetesClientService.getApiDocByName(hostName);
        } catch (Exception e) {
            throw new BusinessException("Error occurs when get api-docs.", e);
        }
    }
}
