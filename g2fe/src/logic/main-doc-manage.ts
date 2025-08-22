import { $$, DataModel, DataUnit } from "g2fw";
import { ExportModalPicAction } from "./modal-pic-action";

/**
 * Declare global variables for service uri and others
 */
const _SERVICE_UPDATE_TRANS_TIME = "/p/restws/com.pouchen.docmgt.service.MainDocManageService.updateTransTime";
const _SERVICE_UPDATE_RETURN_TIME = "/p/restws/com.pouchen.docmgt.service.MainDocManageService.updateReturnTime";
const _SERVICE_UPDATE_DESTROY_TIME = "/p/restws/com.pouchen.docmgt.service.MainDocManageService.updateDestroyTime";

let _DOC_ID_TO_SET_FOCUS: string | null = null;

const logic = {
    /**
     * invoke and export modal-pic-action
     * @param param0 { dataUtil }
     */
    exportModalPicAction: ExportModalPicAction,
    /**
     * Filter combo [groupd, cabinet, column, box] data in form area v2
     * @param param0 { item, values }
     */
    onFilterGroupd: function ({ item, values }) {
        return item?.REF === values?.GROUPM_ID;
    },
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

        if (field === "GROUPM_ID") {
            row.input({
                GROUPD_ID: null
            });
        } else if (field === "FLOOR_ID") {
            row.input({
                CABINET_ID: null,
                CABIN_ID: null,
                BOX_ID: null
            });
        } else if (field === "CABINET_ID") {
            row.input({
                CABIN_ID: null,
                BOX_ID: null
            });
        } else if (field === "CABIN_ID") {
            row.input({
                BOX_ID: null
            });
        }
    },
    /**
     * Handle onEndEdit event from form retrieve data
     * @param param0 { dataUtil }
     */
    onEndEdit: async function ({ dataUtil }) {
        const dm: DataModel = dataUtil.getDataModel("DM_DOC_MANAGE");
        const du: DataUnit = dm.getUnit("DU_DOC_MANAGE");
        const row = du.getCurrentRow();

        _DOC_ID_TO_SET_FOCUS = row ? row.getData().DOC_ID : null;

        try {
            await dataUtil.retrieve();
        } catch (e) {
            $$.Alert.show(e.message);
        }
    },
    /**
     * Handle onDataLoaded event from DataProvider
     * @param param0 { dataUtil }
     * @returns 
     */
    onDataLoaded: function ({ dataUtil }) {
        if (!_DOC_ID_TO_SET_FOCUS) return;

        const dm: DataModel = dataUtil.getDataModel("DM_DOC_MANAGE");
        const du: DataUnit = dm.getUnit("DU_DOC_MANAGE");
        const target = du.findRows({ DOC_ID: _DOC_ID_TO_SET_FOCUS })[0];

        if (target) du.setCurrentRow(target);

        _DOC_ID_TO_SET_FOCUS = null;
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

        const docStatusDesc = row.getData().DOC_STATUS_DESC;
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

        const warningMsg = restrictionRules[docStatusDesc]?.[actionType] || "";

        if (warningMsg) {
            $$.Alert.show({ type: "warning", text: warningMsg, timeout: 2000 });
            return;
        }

        let alertConfig: { type: string; text: string; timeout: number } | null = null;

        try {
            $$.Loading.show();
            await $$.Ajax.callService(
                dataUtil,
                serviceUri,
                { DOC_ID: row.getData().DOC_ID },
                "json",
                "POST"
            );

            _DOC_ID_TO_SET_FOCUS = row ? row.getData().DOC_ID : null;

            await dataUtil.retrieve();

            alertConfig = {
                type: "success",
                text: `${actionType.substring(0, 1).toUpperCase()}${actionType.substring(1).toLowerCase()} Success`,
                timeout: 2000
            };
        } catch (error) {
            alertConfig = {
                type: "warning",
                text: error?.message ?? `${actionType.substring(0, 1).toUpperCase()}${actionType.substring(1).toLowerCase()} Failed`,
                timeout: 2000
            }
        } finally {
            $$.Loading.hide();

            if (alertConfig) {
                $$.Alert.show(alertConfig);
            }
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
                this.syncDocStatus("TRANSFER", dataUtil, _SERVICE_UPDATE_TRANS_TIME);
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
                this.syncDocStatus("RETURN", dataUtil, _SERVICE_UPDATE_RETURN_TIME);
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
                this.syncDocStatus("DESTROY", dataUtil, _SERVICE_UPDATE_DESTROY_TIME);
            },
            onNo: async () => { return true; }
        });
    }
}

export default logic;

