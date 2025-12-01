package com.pouchen.docmgt.service;

import java.util.List;
import java.util.Map;

import com.pouchen.module.data.RequestInfo;
import com.pouchen.module.dataaccess.DbUtils;
import com.pouchen.module.meta.MetaFactory;

public class CommonService {
    private CommonService() {

    }
    
    private static final String DB_ALIAS = "_AP_CONN";

    private static String getComboSiteMapSQL = MetaFactory.getSql("V_COMBO_BASIC_SITEMAP", DB_ALIAS);

    public static List<Map<String, Object>> getComboSiteMap(RequestInfo requestInfo, Map<String, Object> args) {
        Object[] params = new Object[]{ "PCCUID", args.get("PCCUID") };
        try {
            return DbUtils.queryList(DB_ALIAS, getComboSiteMapSQL, params);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}
