
package com.pouchen.docmgt.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.pouchen.module.data.RequestInfo;
import com.pouchen.module.dataaccess.DbUtils;
import com.pouchen.module.meta.MetaFactory;
import com.pouchen.module.util.HttpUtils;
import com.pouchen.module.util.JsonUtils;

public class MainDocManageService {
    private MainDocManageService() {

    }

    private static final String DB_ALIAS = "_AP_CONN";

    private static String updateTransInfoSQL = MetaFactory.getSql("V_UPD_TRANS_INFO", DB_ALIAS);
    private static String updateReturnInfoSQL = MetaFactory.getSql("V_UPD_RETURN_INFO", DB_ALIAS);
    private static String updateDestroyInfoSQL = MetaFactory.getSql("V_UPD_DESTROY_INFO", DB_ALIAS);    
    private static String getComboGroupMasterSQL = MetaFactory.getSql("V_COMBO_BASIC_GROUPM", DB_ALIAS);
    private static String getComboGroupDetailSQL = MetaFactory.getSql("V_COMBO_BASIC_GROUPD", DB_ALIAS);
    private static String getMFPCServiceSQL = MetaFactory.getSql("V_GET_SERVICE_INFO", DB_ALIAS);

    public static void updateTransInfo(RequestInfo requestInfo, Map<String, Object> args) {
        Map<String, Object> params = new HashMap<>();
        try {
            params.put("DOC_ID", args.get("DOC_ID"));
            params.put("TRANS_TIME", System.currentTimeMillis());
            params.put("RETURN_TIME", null);
            params.put("DOC_STATUS", 2);
            params.put("GROUPM_BO_ID", args.get("GROUPM_BO_ID"));
            params.put("GROUPD_BO_ID", args.get("GROUPD_BO_ID"));
            params.put("UPDATE_USER", requestInfo.getUser().getPccUid());
            params.put("UPDATE_TIME", System.currentTimeMillis());
            DbUtils.execute(DB_ALIAS, updateTransInfoSQL, params);
            DbUtils.commit(DB_ALIAS);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static void updateReturnInfo(RequestInfo requestInfo, Map<String, Object> args) {
        Map<String, Object> params = new HashMap<>();
        try {
            params.put("DOC_ID", args.get("DOC_ID"));
            params.put("RETURN_TIME", System.currentTimeMillis());
            params.put("DOC_STATUS", 3);
            params.put("GROUPM_BO_ID", null);
            params.put("GROUPD_BO_ID", null);
            params.put("UPDATE_USER", requestInfo.getUser().getPccUid());
            params.put("UPDATE_TIME", System.currentTimeMillis());
            DbUtils.execute(DB_ALIAS, updateReturnInfoSQL, params);
            DbUtils.commit(DB_ALIAS);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static void updateDestroyInfo(RequestInfo requestInfo, Map<String, Object> args) {
        Map<String, Object> params = new HashMap<>();
        try {
            params.put("DOC_ID", args.get("DOC_ID"));
            params.put("DESTROY_TIME", System.currentTimeMillis());
            params.put("DOC_STATUS", 4);
            params.put("UPDATE_USER", requestInfo.getUser().getPccUid());
            params.put("UPDATE_TIME", System.currentTimeMillis());
            DbUtils.execute(DB_ALIAS, updateDestroyInfoSQL, params);
            DbUtils.commit(DB_ALIAS);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static List<Map<String, Object>> getComboGroupMaster(RequestInfo requestInfo, Map<String, Object> args) {
        try {
            return DbUtils.queryList(DB_ALIAS, getComboGroupMasterSQL);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    public static List<Map<String, Object>> getComboGroupDetail(RequestInfo requestInfo, Map<String, Object> args) {
        try {
            return DbUtils.queryList(DB_ALIAS, getComboGroupDetailSQL);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    public static Map<String, Object> getMFPCData(RequestInfo requestInfo, Map<String, Object> args) {
        Object[] params = new Object[]{ "SITE_NO", args.get("SITE_NO"), "SERVICE_NO", args.get("SERVICE_NO"), "ENABLED", "Y" };
        Map<String, Object> service = DbUtils.queryFirst(DB_ALIAS, getMFPCServiceSQL, params);

        if (service == null || service.isEmpty()) {
            return resultError(400, "BAD_REQUEST", (String) params[3] + " Service not found.");
        }

        try {
            String uuid = args.get("UUID").toString();
            String requestBody = "[\"" + uuid + "\"]";

            Map<String, String> headers = new HashMap<>();
            headers.put("Content-Type", "application/json");

            String serviceUrl = service.get("BASE_URL").toString() + service.get("ENDPOINT").toString();

            Map<String, String> response = HttpUtils.post(serviceUrl, requestBody, headers, requestInfo, null);

            String body = response.get("body");
            if (body == null || body.trim().isEmpty()) {
                return resultError(404, "NOT_FOUND", "Empty response body.");
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> data = JsonUtils.deserialize(body, Map.class);

            if (data == null || data.isEmpty()) {
                return resultError(404, "NOT_FOUND", "Data not found.");
            }

            return resutlSuccess(200, "OK", "Data found.", data);
        } catch (Exception e) {
            return resultError(500, "INTERNAL_SERVER_ERROR", e.getMessage());
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