
package com.pouchen.docmgt.service;

import java.util.HashMap;
import java.util.Map;
import java.util.List;

import com.pouchen.module.data.RequestInfo;
import com.pouchen.module.dataaccess.DbUtils;

public class MainDocManageService {
    private MainDocManageService() {

    }

    private static final String DB_ALIAS = "_AP_CONN";

    private static String updateTransTimeSQL = "UPDATE DOC_MANAGE DM SET TRANS_TIME = EXTRACT(EPOCH FROM CLOCK_TIMESTAMP()) * 1000, DOC_STATUS = 2, RETURN_TIME = NULL WHERE DM.DOC_ID = :DOC_ID";
    private static String updateReturnTimeSQL = "UPDATE DOC_MANAGE DM SET RETURN_TIME = EXTRACT(EPOCH FROM CLOCK_TIMESTAMP()) * 1000, DOC_STATUS = 3 WHERE DM.DOC_ID = :DOC_ID";
    private static String updateDestroyTimeSQL = "UPDATE DOC_MANAGE DM SET DESTROY_TIME = EXTRACT(EPOCH FROM CLOCK_TIMESTAMP()) * 1000, DOC_STATUS = 4 WHERE DM.DOC_ID = :DOC_ID";
    private static String getPersonInChargeSQL = "SELECT BG.GROUPD_ID AS VALUE, CONCAT(BG.EMP_NO  , '-', BG.EMP_NAME) AS LABEL, BG.GROUPM_ID AS REF FROM BASIC_GROUPD BG ORDER BY CONCAT(BG.EMP_NO  , '-', BG.EMP_NAME)";

    public static void updateTransTime (RequestInfo requestInfo, Map<String, Object> args) {
        Map<String, Object> params = new HashMap<>();
        try {
            params.put("DOC_ID", args.get("DOC_ID"));
            DbUtils.execute(DB_ALIAS, updateTransTimeSQL, params);
            DbUtils.commit(DB_ALIAS);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static void updateReturnTime (RequestInfo requestInfo, Map<String, Object> args) {
        Map<String, Object> params = new HashMap<>();
        try {
            params.put("DOC_ID", args.get("DOC_ID"));
            DbUtils.execute(DB_ALIAS, updateReturnTimeSQL, params);
            DbUtils.commit(DB_ALIAS);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static void updateDestroyTime (RequestInfo requestInfo, Map<String, Object> args) {
        Map<String, Object> params = new HashMap<>();
        try {
            params.put("DOC_ID", args.get("DOC_ID"));
            DbUtils.execute(DB_ALIAS, updateDestroyTimeSQL, params);
            DbUtils.commit(DB_ALIAS);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static List<Map<String, Object>> getPersonInCharge (RequestInfo requestInfo, Map<String, Object> args) {
        try {
            return DbUtils.queryList(DB_ALIAS, getPersonInChargeSQL);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

}