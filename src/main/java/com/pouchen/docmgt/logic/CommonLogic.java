package com.pouchen.docmgt.logic;

import com.pouchen.module.datamodel.DataRow;
import com.pouchen.module.datamodel.EventArgsDataUpdate;
import com.pouchen.module.event.EventResponse;
import com.pouchen.web.util.SessionUtils;

public class CommonLogic {
    private CommonLogic() {

    }

    public static class SetCreateAndUpdateUsername implements EventResponse<EventArgsDataUpdate> {
        private static final String CREATE_USER_NM = "CREATE_USER_NM";
        private static final String UPDATE_USER_NM = "UPDATE_USER_NM";

        @Override
        public void response(EventArgsDataUpdate args) {
            String username = SessionUtils.getUser().getName();
            for (DataRow row : args.getRows()) {
                switch (row.getState()) {
                    case added:
                        row.setData(CREATE_USER_NM, username);
                        row.setData(UPDATE_USER_NM, username);
                        break;
                    case modified:
                        row.setData(UPDATE_USER_NM, username);
                        break;
                    default:
                        break;
                }
            }
        }
    }
}
