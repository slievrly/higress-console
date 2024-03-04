package com.alibaba.higress.console.controller;

import javax.annotation.Resource;
import javax.validation.constraints.NotBlank;

import com.alibaba.higress.console.controller.dto.Response;
import com.alibaba.higress.console.controller.util.ControllerUtil;
import com.alibaba.higress.sdk.service.ApiDocService;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/apidocs")
@Validated
public class ApiDocController {

    @Resource
    private ApiDocService apiDocService;

    @GetMapping(value = "/{hostname}")
    public ResponseEntity<Response<String>> get(@PathVariable("hostname") @NotBlank String hostname) {
        return ControllerUtil.buildResponseEntity(apiDocService.getApiDoc(hostname));
    }
}
