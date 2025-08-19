import { $$, DataModel, DataUnit } from "g2fw";

let _docIdToFocus: string | null = null;

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
     * onInputed event handler for filter combo [cabinet, column, box]
     * @param param0 { field, dataUtil }
     */
    onInputed: function ({ field, dataUtil }) {
        const dm: DataModel = dataUtil.getDataModel("DM_DOC_MANAGE");
        const du: DataUnit = dm.getUnit("DU_DOC_MANAGE");
        const row = du.getCurrentRow();

        if (field === "FLOOR_ID") {
            row.input({
                CABINET_ID: null,
                CABIN_ID: null,
                BOX_ID: null
            });
        }
        else if (field === "CABINET_ID") {
            row.input({
                CABIN_ID: null,
                BOX_ID: null
            });
        }
        else if (field === "CABIN_ID") {
            row.input({
                BOX_ID: null
            });
        }
    },
    /**
     * for handle docId to focus when onDataLoaded
     * @param param0 { dataUtil }
     * @returns 
     */
    onDataLoaded: function ({ dataUtil }) {
        if (!_docIdToFocus) return;

        const dm: DataModel = dataUtil.getDataModel("DM_DOC_MANAGE");
        const du: DataUnit = dm.getUnit("DU_DOC_MANAGE");
        const target = du.findRows({ DOC_ID: _docIdToFocus })[0];
        if (target) du.setCurrentRow(target);

        _docIdToFocus = null;
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
                RETURN: "Document is created. Return not allowed."
            },
            "2. TRANSFER": {
                TRANSFER: "Document is already transferred. Transfer not allowed.",
                DESTROY: "Document is already transferred. Destroy not allowed."
            },
            "3. RETURN": {
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
            await $$.Ajax.callService(
                dataUtil,
                serviceUri,
                { DOC_ID: row.getData().DOC_ID },
                "json",
                "POST"
            );

            _docIdToFocus = row.getData().DOC_ID;

            await dataUtil.retrieve();

            $$.Alert.show({ type: "success", text: `${actionType.substring(0, 1).toUpperCase()}${actionType.substring(1).toLowerCase()} Success`, timeout: 2000 });
        } catch (e) {
            console.error("callService error", e);
            $$.Alert.show({ type: "warning", text: e?.message ?? `${actionType.substring(0, 1).toUpperCase()}${actionType.substring(1).toLowerCase()} Failed`, timeout: 2000 });
        } finally {
            $$.Loading.hide();
        }
    },
    /**
     * Handle onClick event action from toolbar (Transfer, Return, Destroy)
     * @param param0 { dataUtil }
     */
    onClickTrans: async function ({ dataUtil }) {
        $$.Dialog.show({
            title: "Confirmation",
            text: "Are you sure to transfer document?",
            buttons: ["Y", "N"],
            textYes: "Yes",
            textNo: "No",
            onYes: async () => {
                this.syncDocStatus("TRANSFER", dataUtil, "/p/restws/com.pouchen.docmgt.service.MainDocManageService.updateTransTime");
            },
            onNo: async () => { return true; }
        });
    },
    onClickReturn: async function ({ dataUtil }) {
        $$.Dialog.show({
            title: "Confirmation",
            text: "Are you sure to return document?",
            buttons: ["Y", "N"],
            textYes: "Yes",
            textNo: "No",
            onYes: async () => {
                this.syncDocStatus("RETURN", dataUtil, "/p/restws/com.pouchen.docmgt.service.MainDocManageService.updateReturnTime");
            },
            onNo: async () => { return true; }
        });
    },
    onClickDestroy: async function ({ dataUtil }) {
        $$.Dialog.show({
            title: "Confirmation",
            text: "Are you sure to destroy document?",
            buttons: ["Y", "N"],
            textYes: "Yes",
            textNo: "No",
            onYes: async () => {
                this.syncDocStatus("DESTROY", dataUtil, "/p/restws/com.pouchen.docmgt.service.MainDocManageService.updateDestroyTime");
            },
            onNo: async () => { return true; }
        });
    }
}

export default logic;

