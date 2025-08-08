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

    public static class SetDocStatusByTime implements EventResponse<EventArgsDataUpdate> {
        private static final String DOC_STATUS = "DOC_STATUS";
        private static final String TRANS_TIME = "TRANS_TIME";
        private static final String RETURN_TIME = "RETURN_TIME";
        private static final String DESTROY_TIME = "DESTROY_TIME";

        @Override
        public void response(EventArgsDataUpdate args) {
            for (DataRow row : args.getRows()) {
                Object transTime = row.getData(TRANS_TIME);
                Object returnTime = row.getData(RETURN_TIME);
                Object destroyTime = row.getData(DESTROY_TIME);

                int docStatus = 1;
                if (transTime != null && returnTime == null && destroyTime == null) {
                    docStatus = 2;
                } else if (transTime != null && returnTime != null && destroyTime == null) {
                    docStatus = 3;
                } else if (transTime != null && returnTime != null && destroyTime != null) {
                    docStatus = 4;
                }
                row.setData(DOC_STATUS, docStatus);
            }
        }
    }
}
