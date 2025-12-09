
package com.pouchen.docmgt.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.pouchen.module.data.RequestInfo;
import com.pouchen.module.dataaccess.DbUtils;
import com.pouchen.module.meta.MetaFactory;
import com.pouchen.module.util.HttpUtils;

public class MainDocManageService {
    private MainDocManageService() {

    }

    private static final String DB_ALIAS = "_AP_CONN";

    private static String updateTransInfoSQL = "UPDATE DOC_MANAGE DM SET TRANS_TIME = :TRANS_TIME, RETURN_TIME = :RETURN_TIME, DOC_STATUS = :DOC_STATUS, GROUPM_BO_ID = :GROUPM_BO_ID, GROUPD_BO_ID = :GROUPD_BO_ID, UPDATE_USER = :UPDATE_USER, UPDATE_TIME = :UPDATE_TIME WHERE DM.DOC_ID = :DOC_ID";
    private static String updateReturnInfoSQL = "UPDATE DOC_MANAGE DM SET RETURN_TIME = :RETURN_TIME, DOC_STATUS = :DOC_STATUS, GROUPM_BO_ID = :GROUPM_BO_ID, GROUPD_BO_ID = :GROUPD_BO_ID, UPDATE_USER = :UPDATE_USER, UPDATE_TIME = :UPDATE_TIME WHERE DM.DOC_ID = :DOC_ID";
    private static String updateDestroyInfoSQL = "UPDATE DOC_MANAGE DM SET DESTROY_TIME = :DESTROY_TIME, DOC_STATUS = :DOC_STATUS, UPDATE_USER = :UPDATE_USER, UPDATE_TIME = :UPDATE_TIME WHERE DM.DOC_ID = :DOC_ID";
    
    private static String getComboGroupMasterSQL = MetaFactory.getSql("V_COMBO_BASIC_GROUPM", DB_ALIAS);
    private static String getComboGroupDetailSQL = MetaFactory.getSql("V_COMBO_BASIC_GROUPD", DB_ALIAS);

    private static String getMFPCServiceSQL = "SELECT BS1.SERVICE_NO, BS1.SERVICE_NAME, BS1.SERVICE_URL FROM BASIC_SERVICE BS1 JOIN BASIC_SITE BS2 ON BS1.SITE_NO = BS2.SITE_NO WHERE BS1.SITE_NO = :SITE_NO AND BS1.ENABLED = :ENABLED AND BS2.ENABLED = :ENABLED";

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
        Object[] params = new Object[]{ "SITE_NO", args.get("SITE_NO"), "ENABLED", "Y" };
        Map<String, Object> service = DbUtils.queryFirst(DB_ALIAS, getMFPCServiceSQL, params);
        Map<String, Object> result = new HashMap<>();
        try {
            String uuid = args.get("UUID").toString();
            String requestBody = "[\"" + uuid + "\"]";
            Map<String, String> headers = new HashMap<>();
            headers.put("Content-Type", "application/json");
            Map<String, String> response = HttpUtils.post(service.get("SERVICE_URL").toString(), requestBody, headers, requestInfo, null);
            result.put("data", response);
        } catch (Exception e) {
            result.put("error", e.getMessage());
        }
        return result;
    }
}