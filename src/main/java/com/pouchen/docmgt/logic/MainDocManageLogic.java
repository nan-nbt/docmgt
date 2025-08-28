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
                switch (docStatusVal) {
                    case 1:
                        docStatusDesc = "1. CREATED";
                        break;
                    case 2:
                        docStatusDesc = "2. TRANSFER";
                        break;
                    case 3:
                        docStatusDesc = "3. RETURN";
                        break;
                    case 4:
                        docStatusDesc = "4. DESTROY";
                        break;
                    default:
                        docStatusDesc = "UNKNOWN STATUS";
                        break;
                }
                row.setData(DOC_STATUS_DESC, docStatusDesc);
            }
        }
    }
}
