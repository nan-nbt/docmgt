
package com.pouchen.docmgt.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.pouchen.module.data.RequestInfo;
import com.pouchen.module.dataaccess.DbUtils;
import com.pouchen.module.meta.MetaFactory;
import com.pouchen.module.util.HttpUtils;
import com.pouchen.module.util.JsonUtils;
import com.pouchen.docmgt.constant.CommonConstant;
import com.pouchen.docmgt.constant.MainDocManageConstant;

public class MainDocManageService {
    private MainDocManageService() {

    }

    private static String updateTransInfoSQL = MetaFactory.getSql("V_UPD_TRANS_INFO", CommonConstant.DB_ALIAS);
    private static String updateReturnInfoSQL = MetaFactory.getSql("V_UPD_RETURN_INFO", CommonConstant.DB_ALIAS);
    private static String updateDestroyInfoSQL = MetaFactory.getSql("V_UPD_DESTROY_INFO", CommonConstant.DB_ALIAS);    
    private static String getComboGroupMasterSQL = MetaFactory.getSql("V_COMBO_BASIC_GROUPM", CommonConstant.DB_ALIAS);
    private static String getComboGroupDetailSQL = MetaFactory.getSql("V_COMBO_BASIC_GROUPD", CommonConstant.DB_ALIAS);
    private static String getMFPCServiceSQL = MetaFactory.getSql("V_GET_SERVICE_INFO", CommonConstant.DB_ALIAS);

    public static void updateTransInfo(RequestInfo requestInfo, Map<String, Object> args) {
        Map<String, Object> params = new HashMap<>();
        try {
            params.put(MainDocManageConstant.DOC_ID, args.get(MainDocManageConstant.DOC_ID));
            params.put(MainDocManageConstant.TRANS_TIME, System.currentTimeMillis());
            params.put(MainDocManageConstant.RETURN_TIME, null);
            params.put(MainDocManageConstant.DOC_STATUS, 2);
            params.put(MainDocManageConstant.GROUPM_BO_ID, args.get(MainDocManageConstant.GROUPM_BO_ID));
            params.put(MainDocManageConstant.GROUPD_BO_ID, args.get(MainDocManageConstant.GROUPD_BO_ID));
            params.put(MainDocManageConstant.UPDATE_USER, requestInfo.getUser().getPccUid());
            params.put(MainDocManageConstant.UPDATE_TIME, System.currentTimeMillis());
            DbUtils.execute(CommonConstant.DB_ALIAS, updateTransInfoSQL, params);
            DbUtils.commit(CommonConstant.DB_ALIAS);
        } catch (Exception e) {
            throw new IllegalArgumentException("Failed to update data: " + e.getMessage(), e);
        }
    }

    public static void updateReturnInfo(RequestInfo requestInfo, Map<String, Object> args) {
        Map<String, Object> params = new HashMap<>();
        try {
            params.put(MainDocManageConstant.DOC_ID, args.get(MainDocManageConstant.DOC_ID));
            params.put(MainDocManageConstant.RETURN_TIME, System.currentTimeMillis());
            params.put(MainDocManageConstant.DOC_STATUS, 3);
            params.put(MainDocManageConstant.GROUPM_BO_ID, null);
            params.put(MainDocManageConstant.GROUPD_BO_ID, null);
            params.put(MainDocManageConstant.UPDATE_USER, requestInfo.getUser().getPccUid());
            params.put(MainDocManageConstant.UPDATE_TIME, System.currentTimeMillis());
            DbUtils.execute(CommonConstant.DB_ALIAS, updateReturnInfoSQL, params);
            DbUtils.commit(CommonConstant.DB_ALIAS);
        } catch (Exception e) {
            throw new IllegalArgumentException("Failed to update data: " + e.getMessage(), e);
        }
    }

    public static void updateDestroyInfo(RequestInfo requestInfo, Map<String, Object> args) {
        Map<String, Object> params = new HashMap<>();
        try {
            params.put(MainDocManageConstant.DOC_ID, args.get(MainDocManageConstant.DOC_ID));
            params.put(MainDocManageConstant.DESTROY_TIME, System.currentTimeMillis());
            params.put(MainDocManageConstant.DOC_STATUS, 4);
            params.put(MainDocManageConstant.UPDATE_USER, requestInfo.getUser().getPccUid());
            params.put(MainDocManageConstant.UPDATE_TIME, System.currentTimeMillis());
            DbUtils.execute(CommonConstant.DB_ALIAS, updateDestroyInfoSQL, params);
            DbUtils.commit(CommonConstant.DB_ALIAS);
        } catch (Exception e) {
            throw new IllegalArgumentException("Failed to update data: " + e.getMessage(), e);
        }
    }

    public static List<Map<String, Object>> getComboGroupMaster() {
        try {
            return DbUtils.queryList(CommonConstant.DB_ALIAS, getComboGroupMasterSQL);
        } catch (Exception e) {
            throw new IllegalArgumentException("Failed to fetch data: " + e.getMessage(), e);
        }
    }

    public static List<Map<String, Object>> getComboGroupDetail() {
        try {
            return DbUtils.queryList(CommonConstant.DB_ALIAS, getComboGroupDetailSQL);
        } catch (Exception e) {
            throw new IllegalArgumentException("Failed to fetch data: " + e.getMessage(), e);
        }
    }

    public static Map<String, Object> callMFPCService(Map<String, Object> args) {
        Object[] params = new Object[]{ "SITE_NO", args.get("SITE_NO"), "SERVICE_NO", args.get("SERVICE_NO"), "ENABLED", "Y" };
        Map<String, Object> service = DbUtils.queryFirst(CommonConstant.DB_ALIAS, getMFPCServiceSQL, params);

        if (service == null || service.isEmpty()) {
            return resultError(400, MainDocManageConstant.STATUS_BAD_REQUEST, (String) params[3] + " Service not found.");
        }

        try {
            String serviceUrl = service.get("BASE_URL").toString() + service.get("ENDPOINT").toString();
            String authType = service.get("AUTH_TYPE") != null ? service.get("AUTH_TYPE").toString() : "";
            String authCode = service.get("AUTH_CODE") != null ? service.get("AUTH_CODE").toString() : "";
            String authHeader = authType.isEmpty() ? authCode : authType + " " + authCode;
            String requestBody = "[\"" + args.get("UUID").toString() + "\"]";

            Map<String, String> headers = new HashMap<>();
            headers.put("Content-Type", "application/json");
            headers.put("Accept", "application/json, text/plain, */*");
            headers.put("User-Agent", "PostmanRuntime/7.32.3");

            if (!authHeader.isEmpty()) {
                headers.put("Authorization", authHeader);
            }

            Map<String, String> response = HttpUtils.post(serviceUrl, requestBody, headers);

            String body = response.get("body");
            if (body == null || body.trim().isEmpty()) {
                return resultError(404, MainDocManageConstant.STATUS_NOT_FOUND, "Empty response body.");
            }

            Object parsedObj = JsonUtils.deserialize(body, Object.class);

            if (parsedObj == null) {
                return resultError(404, MainDocManageConstant.STATUS_NOT_FOUND, "Data not found.");
            }

            Map<String, Object> dataMap = new HashMap<>();

            if (parsedObj instanceof Map) {
                @SuppressWarnings("unchecked")
                Map<String, Object> data = (Map<String, Object>) parsedObj;

                if (data.isEmpty()) {
                    return resultError(404, MainDocManageConstant.STATUS_NOT_FOUND, "Data not found.");
                }
                
                dataMap = data;
            }
            else {
                dataMap.put("value", parsedObj);
            }

            return resutlSuccess(200, MainDocManageConstant.STATUS_OK, "Data found.", dataMap);

        } catch (Exception e) {
            return resultError(500, MainDocManageConstant.STATUS_INT_SRV_ERR, e.getMessage());
        }
    }

    private static Map<String, Object> resutlSuccess (int code, String status, String message, Object data) {
        Map<String, Object> result = new HashMap<>();
        result.put("code", code);
        result.put("status", status);
        result.put("message", message);
        result.put("data", data);
        return result;
    }

    private static Map<String, Object> resultError (int code, String status, String message) {
        Map<String, Object> result = new HashMap<>();
        result.put("code", code);
        result.put("status", status);
        result.put("message", message);
        return result;
    }
}