import { $$, DataModel, DataUnit } from "g2fw";

const logic = {
    /**
     * Filter combo [cabinet, column, box] data in form area v2
     * @param param0 { item, values }
     */
    onFilterCabinet: function ({ item, values }) {
        return item?.REF === values?.FLOOR_ID;
    },
    onFilterCabin: function ({ item, values }) {
        return item?.REF === values?.CABINET_ID;
    },
    onFilterBox: function ({ item, values }) {
        return item?.REF === values?.CABIN_ID;
    },
    /**
     * Handle custom action from toolbar to update doc status and sync data
     * @param ctx Context object from G2FW (includes actionType, dataUtil, serviceUri, ...)
     */
    syncDocStatus: async function (actionType, dataUtil, serviceUri) {
        const dm: DataModel = dataUtil.getDataModel("DM_DOC_MANAGE");
        const du: DataUnit = dm.getUnit("DU_DOC_MANAGE");
        const row = du.getCurrentRow();

        if (!row) {
            $$.Alert.show({ type: "warning", text: "No row selected or missing ID.", timeout: 2000 });
            return;
        }

        const DOC_STATUS_DESC = row.getData().DOC_STATUS_DESC;
        const restrictionRules: Record<string, Record<string, string>> = {
            "1. CREATED": {
                RETURN: "Document is created. Return not allowed.",
                DESTROY: "Document is created. Destroy not allowed."
            },
            "2. TRANSFER": {
                TRANSFER: "Document is already transferred. Transfer not allowed.",
                DESTROY: "Document is already transferred and not returned. Destroy not allowed."
            },
            "3. RETURN": {
                TRANSFER: "Document is already returned. Transfer not allowed.",
                RETURN: "Document is already returned. Return not allowed."
            },
            "4. DESTROY": {
                TRANSFER: "Document is already destroyed. Transfer not allowed.",
                RETURN: "Document is already destroyed. Return not allowed.",
                DESTROY: "Document is already destroyed. Destroy not allowed."
            }
        };

        const warningMsg = restrictionRules[DOC_STATUS_DESC]?.[actionType] || "";

        if (warningMsg) {
            $$.Alert.show({ type: "warning", text: warningMsg, timeout: 2000 });
            return;
        }

        try {
            $$.Loading.show();
            $$.Ajax.callService(
                dataUtil,
                serviceUri,
                { DOC_ID: row.getData().DOC_ID },
                "json",
                "POST"
            );
            $$.Alert.show({ type: "success", text: `${actionType} Success`, timeout: 2000 });

        } catch (e) {
            console.error("callService error", e);
            $$.Alert.show({ type: "warning", text: e?.message ?? `${actionType} Failed`, timeout: 2000 });
        } finally {
            $$.Loading.hide();
        }
    },
    onClickTrans: async function ({ dataUtil }) {
        this.syncDocStatus("TRANSFER", dataUtil, "/p/restws/com.pouchen.docmgt.service.MainDocManageService.updateTransTime");
    },
    onClickReturn: async function ({ dataUtil }) {
        this.syncDocStatus("RETURN", dataUtil, "/p/restws/com.pouchen.docmgt.service.MainDocManageService.updateReturnTime");
    },
    onClickDestroy: async function ({ dataUtil }) {
        this.syncDocStatus("DESTROY", dataUtil, "/p/restws/com.pouchen.docmgt.service.MainDocManageService.updateDestroyTime");
    }
}

export default logic;

