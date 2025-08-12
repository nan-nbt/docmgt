package com.pouchen.docmgt.logic;

import com.pouchen.module.datamodel.DataRow;
import com.pouchen.module.datamodel.EventArgsDataUpdate;
import com.pouchen.module.event.EventResponse;

public class MainDocManageLogic {
    private MainDocManageLogic() {

    }

    public static class SetDocStatusDesc implements EventResponse<EventArgsDataUpdate> {
        private static final String DOC_STATUS_DESC = "DOC_STATUS_DESC";
        private static final String DOC_STATUS = "DOC_STATUS";

        @Override
        public void response(EventArgsDataUpdate args) {
            for (DataRow row : args.getRows()) {
                String docStatusDesc = null;
                Object docStatus = row.getData(DOC_STATUS);
                int docStatusVal = docStatus == null ? 0 : Integer.parseInt(docStatus.toString());
                if (docStatusVal == 1) {
                    docStatusDesc = "1. CREATED";
                } else if (docStatusVal == 2) {
                    docStatusDesc = "2. TRANSFER";
                } else if (docStatusVal == 3) {
                    docStatusDesc = "3. RETURN";
                } else if (docStatusVal == 4) {
                    docStatusDesc = "4. DESTROY";
                }
                row.setData(DOC_STATUS_DESC, docStatusDesc);
            }
        }
    }
}
