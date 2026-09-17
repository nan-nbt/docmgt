package com.pouchen.docmgt.logic;

import com.pouchen.module.datamodel.DataRow;
import com.pouchen.module.datamodel.EventArgsDataUpdate;
import com.pouchen.module.datamodel.EventArgsQuery;
import com.pouchen.module.event.EventResponse;
import com.pouchen.web.util.SessionUtils;
import com.pouchen.docmgt.constant.CommonConstant;

public class CommonLogic {
    private CommonLogic() {

    }

    public static class SetCreateAndUpdateUsername implements EventResponse<EventArgsDataUpdate> {
        @Override
        public void response(EventArgsDataUpdate args) {
            String username = SessionUtils.getUser().getName();
            for (DataRow row : args.getRows()) {
                switch (row.getState()) {
                    case added:
                        row.setData(CommonConstant.CREATE_USER_NM, username);
                        row.setData(CommonConstant.UPDATE_USER_NM, username);
                        break;
                    case modified:
                        row.setData(CommonConstant.UPDATE_USER_NM, username);
                        break;
                    default:
                        break;
                }
            }
        }
    }
    
    public static class SetQueryParams implements EventResponse<EventArgsQuery> {
        @Override
        public void response(EventArgsQuery args) {
            String ctb = String.valueOf(args.getParams().get("CREATE_TIME_B"));
            String cte = String.valueOf(args.getParams().get("CREATE_TIME_E"));
            if (ctb != null && !"null".equals(ctb)) {
                args.addParam("CREATE_TIME_B", Long.parseLong(ctb));
            }
            if (cte != null && !"null".equals(cte)) {
                args.addParam("CREATE_TIME_E", Long.parseLong(cte) + 24 * 60 * 60 * 1000 - 1);
            }
        }
    }
}
