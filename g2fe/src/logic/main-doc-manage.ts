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

let _SELECTED_DOC_ID_ROW: string | null = null;
let _SELECTED_SITE_NO_ROW: string | null = null;

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
    onCreated: function ({  dataUtil, args, query }) {
        Common.onCreatedSetQueryParams({ dataUtil: dataUtil, args: args, query: query });
    },
    /**
     * Filter combo [groupd, cabinet, column, box] data in form area v2
     * @param param0 { item, values }
     */
    onFilterDoctype: function ({ item, values }) {
        return item?.REF === values?.SITE_NO;
    },
    onFilterGroupm: function ({ item, values }) {
        return item?.REF === values?.SITE_NO;
    },
    onFilterGroupd: function ({ item, values }) {
        return item?.REF === values?.GROUPM_ID;
    },
    onFilterGroupmBO: function ({ item, values }) {
        return item?.REF === values?.SITE_NO;
    },
    onFilterGroupdBO: function ({ item, values }) {
        return item?.REF === values?.GROUPM_BO_ID;
    },
    onFilterFloor: function ({ item, values }) {
        return item?.REF === values.SITE_NO;
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
    onInputedQuery: function ({ cmp, newVal, field, setParam }) {
        try {
            switch (field) {
                case "SITE_NO": {
                    const doctype = cmp("CMP_COMBO_DOCTYPE");
                    doctype.filter((value, key) => value["REF"] === newVal);

                    const category = cmp("CMP_COMBO_CATEGORY");
                    category.filter((value, key) => value["REF"] === newVal);

                    const status = cmp("CMP_COMBO_STATUS");
                    status.filter((value, key) => value["REF"] === newVal);

                    setParam({
                        DOC_TYPE_DESC: null,
                        DOC_CAT_DESC: null,
                        DOC_STATUS_DESC: null
                    })
                    break;
                }                   
            
                default:
                    break;
            }
        } catch (error) {
            console.error("onInputed error:", error);
        }
    },
    onInputedForm: function ({ field, dataUtil }) {
        const dm: DataModel = dataUtil.getDataModel("DM_DOC_MANAGE");
        const du: DataUnit = dm.getUnit("DU_DOC_MANAGE");
        const row = du.getCurrentRow();

        switch (field) {
            case "GROUPM_ID": {
                row.input({
                    GROUPD_ID: null
                });                
                break;
            }
            case "GROUPM_BO_ID": {
                row.input({
                    GROUPD_BO_ID: null
                });
                break;
            }
            case "FLOOR_ID": {
                row.input({
                    CABINET_ID: null,
                    CABIN_ID: null,
                    BOX_ID: null
                });
                break;
            }
            case "CABINET_ID": {
                row.input({
                    CABIN_ID: null,
                    BOX_ID: null
                });
                break;
            }
            case "CABIN_ID": {
                row.input({
                    BOX_ID: null
                });
                break;
            }
            default:
                break;
        }
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
        const dm: DataModel = dataUtil.getDataModel("DM_DOC_MANAGE");
        const query = dm.getQuery();

        return Common.onNewRowingControl({ dataUtil: dataUtil, cmp: cmp, query: query });
    },
    /**
     * handle onNewRowed event
     * @param param0 { dataUtil, cmp }
     */
    onNewRowed: function ({ dataUtil, cmp }) {
        const dm: DataModel = dataUtil.getDataModel("DM_DOC_MANAGE");
        const du: DataUnit = dm.getUnit("DU_DOC_MANAGE");
        const row = du.getCurrentRow();
        const query = dm.getQuery();

        if (!row) {
            return $$.Alert.show({ type: "warning", text: "No index row selected", timeout: 2000 });
        }

        row.input({
            SITE_NO: query["SITE_NO"]
        });
    },
    /**
     * handle onBeginEditing event
     * @param param0 { dataUtil }
     * @returns 
     */
    onBeginEditing: function ({ dataUtil }) {
        const dm: DataModel = dataUtil.getDataModel("DM_DOC_MANAGE");
        const du: DataUnit = dm.getUnit("DU_DOC_MANAGE");
        const row = du.getCurrentRow();

        return Common.onBeginEditingPage({ dataUtil: dataUtil, row: row });
    },
    /**
     * handle onDeleteRowing event
     * @param param0 
     * @returns 
     */
    onDeleteRowing: function ({ dataUtil, rows, index }) {
        const dm: DataModel = dataUtil.getDataModel("DM_DOC_MANAGE");
        const du: DataUnit = dm.getUnit("DU_DOC_MANAGE");
        const row = du.getCurrentRow();

        return Common.onDeleteRowingTable({ dataUtil: dataUtil, row: row });
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
     * Handle onDataLoaded event from DataProvider
     * @param param0 { dataUtil }
     * @returns 
     */
    onDataLoaded: function ({ dataUtil }) {
        if (_SELECTED_DOC_ID_ROW === null) return;

        const dm: DataModel = dataUtil.getDataModel("DM_DOC_MANAGE");
        const du: DataUnit = dm.getUnit("DU_DOC_MANAGE");
        const targetRow = du.findRows({ DOC_ID: _SELECTED_DOC_ID_ROW })[0];

        if (targetRow) du.setCurrentRow(targetRow);

        _SELECTED_DOC_ID_ROW = null;
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
            $$.Alert.show({ type: "warning", text: "No index row selected", timeout: 2000 });
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
            "1. CREATE": {
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

            _SELECTED_DOC_ID_ROW = row ? row.getData().DOC_ID : null;
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
        if (!row) return false;

        _SELECTED_SITE_NO_ROW = row.getData().SITE_NO;

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
    onQueryingPicker: async function ({ obj, query }) {
        if (_SELECTED_SITE_NO_ROW) {
            obj["SITE_NO"] = _SELECTED_SITE_NO_ROW;
        }

        return true;
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
    onOpenScanner: async function ({ dataUtil, cmp }) {
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
    onCloseScanner: async function ({ dataUtil, cmp }) {
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
        const site = du.getCurrentRow().getData().SITE_NO;

        const scanner = cmp("CMP_MFPC_SCAN");

        const response = await this.getMFPCData({ dataUtil: dataUtil, serviceUri: _SERVICE_GET_MFPC_DATA, site: site, uuid: newVal });
        const data = response?.result?.data?.body ? JSON.parse(response.result.data.body) : null;

        if (rows.length > 0) {
            scanner.setInfo(false, "Scan Failed: data already scanned", { UUID: newVal });
            return scanner.setValue({ MFPC_UUID: null });
        }

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
    getMFPCData: async function ({ dataUtil, serviceUri, uuid, site }) {
        let response;

        try {
            $$.Loading.show();

            response = await $$.Ajax.callService(
                dataUtil,
                serviceUri,
                {
                    SITE_NO: site,
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

