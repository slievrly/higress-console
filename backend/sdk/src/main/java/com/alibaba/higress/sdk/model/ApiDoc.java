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
package com.alibaba.higress.sdk.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApiDoc {
    private String path;
    private MethodType method;
    private String signature;
    private String parameter;
    private String description;
    private String response;

    public ApiDoc simpleCopy() {
        ApiDoc target = new ApiDoc();
        target.setPath(this.path);
        return target;
    }

    public enum MethodType {
        GET,
        POST,
        PUT,
        DELETE,
        ALL;

        public MethodType getTypeByName(String name) {
            for (MethodType type : MethodType.values()) {
                if (type.name().equalsIgnoreCase(name)) {
                    return type;
                }
            }
            return ALL;
        }
    }
}
