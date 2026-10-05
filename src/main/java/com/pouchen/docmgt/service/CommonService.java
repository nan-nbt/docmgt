package com.pouchen.docmgt.service;

import java.util.List;
import java.util.Map;

import com.pouchen.module.dataaccess.DbUtils;
import com.pouchen.module.meta.MetaFactory;
import com.pouchen.docmgt.constant.CommonConstant;

public class CommonService {
    private CommonService() {

    }
    
    private static String getComboSiteMapSQL = MetaFactory.getSql("V_COMBO_BASIC_SITEMAP", CommonConstant.DB_ALIAS);

    public static List<Map<String, Object>> getComboSiteMap(Map<String, Object> args) {
        Object[] params = new Object[]{ CommonConstant.PCCUID, args.get(CommonConstant.PCCUID) };
        try {
            return DbUtils.queryList(CommonConstant.DB_ALIAS, getComboSiteMapSQL, params);
        } catch (Exception e) {
            throw new IllegalArgumentException("Failed to fetch data: " + e.getMessage(), e);
        }
    }
}
