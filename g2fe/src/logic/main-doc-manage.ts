import { $$, DataModel, DataUnit } from "g2fw";
import { ExportModalPIC } from "./modal-pic-action";
import Common from "./common";

/**
 * Declare global variables for service uri and others
 */
export const _SERVICE_UPDATE_TRANS_TIME = "/p/restws/com.pouchen.docmgt.service.MainDocManageService.updateTransInfo";
export const _SERVICE_UPDATE_RETURN_TIME = "/p/restws/com.pouchen.docmgt.service.MainDocManageService.updateReturnInfo";
export const _SERVICE_UPDATE_DESTROY_TIME = "/p/restws/com.pouchen.docmgt.service.MainDocManageService.updateDestroyInfo";
export const _SERVICE_GET_MFPC_DATA = "/p/restws/com.pouchen.docmgt.service.MainDocManageService.getMFPCData";

let _DOC_ID_TO_SET_FOCUS: string | null = null;

const logic = {
    /**
     * invoke and export modal-pic-action
     * @param param0 { dataUtil }
     */
    exportModalPIC: ExportModalPIC,
    /**
     * set default value for query area
     * @param param0 { args, query }
     */
    onCreated: Common.onCreatedSetQueryParams,
    /**
     * Filter combo [groupd, cabinet, column, box] data in form area v2
     * @param param0 { item, values }
     */
    onFilterGroupd: function ({ item, values }) {
        return item?.REF === values?.GROUPM_ID;
    },
    onFilterGroupdBO: function ({ item, values }) {
        return item?.REF === values?.GROUPM_BO_ID;
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
        } else if (field === "GROUPM_BO_ID") {
            row.input({
                GROUPD_BO_ID: null
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
     * handle onUInputed event Query area
     * @param param0 { field, oldVal, newVal, row, cmp, setParam }
     */
    onInputedQuery: function ({ field, oldVal, newVal, row, cmp, setParam  }) {
        Common.onInputedSetFormParams({ field: field, oldVal: oldVal, newVal: newVal, row: row, cmp: cmp, setParam: setParam });
    },
    /**
     * handle onQuerying event
     * @param param0 { obj, query, cmp }
     * @returns 
     */
    onQuerying: function ({ obj, query, cmp }) {
        return Common.onQueryingControl({ obj: obj, query: query, cmp: cmp });
    },
    /**
     * handle onNewRowing event
     * @param param0 { dataUtil, cmp }
     * @returns 
     */
    onNewRowing: function ({ dataUtil, cmp }) {
        return Common.onNewRowingControl({ dataUtil: dataUtil, cmp: cmp });
    },
    /**
     * handle onNewRowed event
     * @param param0 { dataUtil, cmp }
     */
    onNewRowed: function ({ dataUtil, cmp }) {
        const dm: DataModel = dataUtil.getDataModel("DM_DOC_MANAGE");
        const du: DataUnit = dm.getUnit("DU_DOC_MANAGE");
        const row = du.getCurrentRow();

        if (!row) {
            return $$.Alert.show({ type: "warning", text: "No row selected or missing ID.", timeout: 2000 });
        }

        row.input({
            SITE_NO: Common.getDefaultParams().SITE_NO
        });
    },
    /**
     * Handle onAccepting event from form
     * @param param0 { dataUtil }
     */
    onAccepting: function ({ dataUtil }) {
        const row = this.getIndexRow({ dataUtil: dataUtil });
        if (!row) return;

        if (row.getData().DOC_STATUS_DESC === "4. DESTROY") {
            return $$.Alert.show({ type: "warning", text: "Document is already destroyed. Update not allowed.", timeout: 2000 });
        }

        return true;
    },
    /**
     * Handle onEndEdit event from form retrieve data
     * @param param0 { dataUtil }
     */
    onEndEdit: function ({ dataUtil }) {
        const row = this.getIndexRow({ dataUtil: dataUtil });
        if (!row) return;

        _DOC_ID_TO_SET_FOCUS = row ? row.getData().DOC_ID : null;

        try {
            dataUtil.retrieve();
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
    getIndexRow: function ({ dataUtil }) {
        const dm: DataModel = dataUtil.getDataModel("DM_DOC_MANAGE");
        const du: DataUnit = dm.getUnit("DU_DOC_MANAGE");
        const row = du.getCurrentRow();

        if (!row) {
            $$.Alert.show({ type: "warning", text: "No row selected or missing ID.", timeout: 2000 });
            return null;
        }

        return row;
    },
    syncDocStatus: async function ({ actionType, dataUtil, serviceUri }) {
        const row = this.getIndexRow({ dataUtil: dataUtil });
        if (!row) return;

        if (actionType === "TRANSFER") {
            if (!row.getData().GROUPM_BO_ID || !row.getData().GROUPD_BO_ID) {
                return $$.Alert.show({ type: "warning", text: "PIC Group and PIC is required.", timeout: 2000 });
            }
        }

        const { DOC_STATUS_DESC } = row.getData();
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
            return $$.Alert.show({ type: "warning", text: warningMsg, timeout: 2000 });
        }

        let alertConfig: { type: string; text: string; timeout: number } | null = null;

        try {
            $$.Loading.show();
            await $$.Ajax.callService(
                dataUtil,
                serviceUri,
                {
                    DOC_ID: row.getData().DOC_ID,
                    GROUPM_BO_ID: row.getData().GROUPM_BO_ID,
                    GROUPD_BO_ID: row.getData().GROUPD_BO_ID
                },
                "json",
                "POST"
            );

            _DOC_ID_TO_SET_FOCUS = row ? row.getData().DOC_ID : null;

            await dataUtil.retrieve();

            alertConfig = {
                type: "success",
                text: actionType.substring(0, 1).toUpperCase() + actionType.substring(1).toLowerCase() + " Success",
                timeout: 2000
            };
        } catch (error) {
            alertConfig = {
                type: "warning",
                text: error?.message ?? actionType.substring(0, 1).toUpperCase() + actionType.substring(1).toLowerCase() + " Failed",
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
        const row = this.getIndexRow({ dataUtil: dataUtil });
        if (!row) return;

        return {
            canOpen: true,
            canEdit: false
        };
    },
    onClickReturn: async function ({ dataUtil }) {
        const row = this.getIndexRow({ dataUtil: dataUtil });
        if (!row) return;

        $$.Dialog.show({
            title: "Confirmation",
            text: "Are you sure to return document?",
            buttons: ["Y", "N"],
            textYes: "Yes",
            textNo: "No",
            onYes: async () => {
                await this.syncDocStatus({ actionType: "RETURN", dataUtil: dataUtil, serviceUri: _SERVICE_UPDATE_RETURN_TIME });
            },
            onNo: async () => { return true; }
        });
    },
    onClickDestroy: async function ({ dataUtil }) {
        const row = this.getIndexRow({ dataUtil: dataUtil });
        if (!row) return;

        $$.Dialog.show({
            title: "Confirmation",
            text: "Are you sure to destroy document?",
            buttons: ["Y", "N"],
            textYes: "Yes",
            textNo: "No",
            onYes: async () => {
                await this.syncDocStatus({ actionType: "DESTROY", dataUtil: dataUtil, serviceUri: _SERVICE_UPDATE_DESTROY_TIME });
            },
            onNo: async () => { return true; }
        });
    },
    onConfirmPicker: async function ({ dataUtil, checkedRows }) {
        const row = this.getIndexRow({ dataUtil: dataUtil });
        if (!row) return;

        try {
            row.setInitialData({
                GROUPM_BO_ID: checkedRows[0].GROUPM_BO_ID,
                GROUPD_BO_ID: checkedRows[0].GROUPD_BO_ID
            });
        } catch (e) {
            $$.Alert.show(e.message);
        }

        $$.Dialog.show({
            title: "Confirmation",
            text: "Are you sure to transfer document?",
            buttons: ["Y", "N"],
            textYes: "Yes",
            textNo: "No",
            onYes: async () => {
                await this.syncDocStatus({ actionType: "TRANSFER", dataUtil: dataUtil, serviceUri: _SERVICE_UPDATE_TRANS_TIME });
            },
            onNo: async () => { return true; }
        });
    },
    /**
     * 
     * @param param0 handle MFPC scanner
     * @returns 
     */
    onOpen: async function ({ dataUtil, cmp }) {
        const row = this.getIndexRow({ dataUtil: dataUtil });
        if (!row) return;

        const scanner = cmp("CMP_MFPC_SCAN");
        const scannerField = cmp("CMP_MFPC_UUID");

        scanner.setValue({
            MFPC_UUID: null,
            MFPC_ID: null,
            DOC_NO: null,
            DOC_NAME: null,
            MFPC_USERNAME: null,
            MFPC_SSO: null,
            MFPC_CARD_ID: null,
            MFPC_MACHINE_NAME: null,
            MFPC_PRINTER_NAME: null,
            MFPC_PRINT_TIME: null,
            MFPC_COUNT_PAGE: null
        });

        if (row.getData().DOC_NO) {
            scanner.close();
            return $$.Alert.show({ type: "warning", text: "MFPC scan not allowed for Edit mode.", timeout: 2000 });
        }

        scanner.open();
        scanner.setInfo(null);
        scannerField.focus();
    },
    onClose: async function ({ dataUtil, cmp }) {
        const row = this.getIndexRow({ dataUtil: dataUtil });
        if (!row) return;

        const scanner = cmp("CMP_MFPC_SCAN");
        const {
            MFPC_ID,
            MFPC_DOC_NO,
            MFPC_DOC_NAME,
            MFPC_USERNAME,
            MFPC_SSO,
            MFPC_CARD_ID,
            MFPC_MACHINE_NAME,
            MFPC_PRINTER_NAME,
            MFPC_PRINT_TIME,
            MFPC_COUNT_PAGE
        } = scanner.getValue();

        if (MFPC_ID) {
            row.setInitialData({
                DOCTYPE_ID: "MFPC",
                DOC_CATEGORY: 1,
                GROUPM_ID: "MFPC",
                GROUPD_ID: "MFPC",
                FLOOR_ID: "MFPC",
                CABINET_ID: "MFPC",
                CABIN_ID: "MFPC",
                BOX_ID: "MFPC",
                MFPC_ID: MFPC_ID,
                DOC_NO: MFPC_DOC_NO,
                DOC_NAME: MFPC_DOC_NAME,
                MFPC_USERNAME: MFPC_USERNAME,
                MFPC_SSO: MFPC_SSO,
                MFPC_CARD_ID: MFPC_CARD_ID,
                MFPC_MACHINE_NAME: MFPC_MACHINE_NAME,
                MFPC_PRINTER_NAME: MFPC_PRINTER_NAME,
                MFPC_PRINT_TIME: MFPC_PRINT_TIME,
                MFPC_COUNT_PAGE: MFPC_COUNT_PAGE
            });
        }
    },
    onKeyPressEnter: async function ({ dataUtil, cmp, field, newVal }) {
        const dm: DataModel = dataUtil.getDataModel("DM_DOC_MANAGE");
        const du: DataUnit = dm.getUnit("DU_DOC_MANAGE");
        const rows = du.findRows({ DOC_NO: newVal })

        const scanner = cmp("CMP_MFPC_SCAN");

        if (rows.length > 0) {
            scanner.setInfo(false, "Scan Failed: data already scanned", { UUID: newVal });
            return scanner.setValue({ MFPC_UUID: null });            
        }

        const response = await this.getMFPCData({ dataUtil: dataUtil, serviceUri: _SERVICE_GET_MFPC_DATA, uuid: newVal });
        const data = response?.result?.data?.body ? JSON.parse(response.result.data.body) : null;

        if(!data) {
            scanner.setInfo(false, "Scan Failed: data not found", { UUID: newVal });
            return scanner.setValue({ MFPC_UUID: null });
        }

        scanner.setValue({
            MFPC_ID: data.MFPC_ID,
            MFPC_DOC_NO: data.MFPC_DOC_NO,
            MFPC_DOC_NAME: data.MFPC_DOC_NAME,
            MFPC_USERNAME: data.MFPC_USERNAME,
            MFPC_SSO: data.MFPC_SSO,
            MFPC_CARD_ID: data.MFPC_CARD_ID,
            MFPC_MACHINE_NAME: data.MFPC_MACHINE_NAME,
            MFPC_PRINTER_NAME: data.MFPC_PRINTER_NAME,
            MFPC_PRINT_TIME: data.MFPC_PRINT_TIME,
            MFPC_COUNT_PAGE: data.MFPC_COUNT_PAGE
        });

        scanner.setInfo(true, "Scan Success", { UUID: newVal });
        setTimeout(() => scanner.close(), 1000);
    },
    getMFPCData: async function ({ dataUtil, serviceUri, uuid }) {
        let response;

        try {
            $$.Loading.show();

            response = await $$.Ajax.callService(
                dataUtil,
                serviceUri,
                {
                    UUID: uuid
                },
                "json",
                "POST"
            );
        } catch (e) {
            $$.Alert.show(e.message);
        } finally {
            $$.Loading.hide();
        }

        return response;
    }
}

export default logic;

