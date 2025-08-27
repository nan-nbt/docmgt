import { $$, DataModel, DataUnit } from "g2fw";
import logic, { _SERVICE_UPDATE_TRANS_TIME } from "./main-doc-manage";

/**
 * Declare global variables for service uri and others
 */
const _SERVICE_GET_COMBO_GROUP_MASTER = "/p/restws/com.pouchen.docmgt.service.MainDocManageService.getComboGroupMaster";
const _SERVICE_GET_COMBO_GROUP_DETAIL = "/p/restws/com.pouchen.docmgt.service.MainDocManageService.getComboGroupDetail";

const getComboGroupMaster = async function ({ dataUtil }) {
    try {
        const response = await $$.Ajax.callService(
            dataUtil,
            _SERVICE_GET_COMBO_GROUP_MASTER,
            {},
            "json",
            "GET"
        );

        if (response.result) {
            return response.result;
        }
    } catch (e) {
        return $$.Alert.show(e.message);
    }
}
const getComboGroupDetail = async function ({ dataUtil }) {
    try {
        const response = await $$.Ajax.callService(
            dataUtil,
            _SERVICE_GET_COMBO_GROUP_DETAIL,
            {},
            "json",
            "GET"
        );

        if (response.result) {
            return response.result;
        }
    } catch (e) {
        return $$.Alert.show(e.message);
    }
}

const ExportModalPIC = {
    /**
     * Handle Modal Form Action Transfer, Return, Destroy
     * @param param0 { dataUtil }
     */
    modalFormId: "MODAL_PIC",
    fieldName: {
        GROUPM_ID_MODAL: "GROUPM_ID_MODAL",
        GROUPD_ID_MODAL: "GROUPD_ID_MODAL"
    },
    initialValues: async function ({ dataUtil, cmp }) {
        const dm: DataModel = dataUtil.getDataModel("DM_DOC_MANAGE");
        const du: DataUnit = dm.getUnit("DU_DOC_MANAGE");
        const mainRow = du.getCurrentRow();

        if (!mainRow) {
            $$.Alert.show({ type: "warning", text: "No row selected or missing ID.", timeout: 2000 });
            cmp(this.modalFormId).close();
            return;
        }

        return {
            [this.fieldName.GROUPM_ID_MODAL]: mainRow.getData().GROUPM_BO_ID,
            [this.fieldName.GROUPD_ID_MODAL]: mainRow.getData().GROUPD_BO_ID
        };
    },
    config: async function (args) {
        const ComboGroupMaster = await getComboGroupMaster(args);
        const ComboGroupDetail = await getComboGroupDetail(args);

        return [
            {
                isNoWrapper: true,
                columns: [
                    {
                        component: "Select",
                        name: this.fieldName.GROUPM_ID_MODAL,
                        label: "PIC Group",
                        rules: [{ required: true, message: "PIC Group is required" }],
                        col: 6,
                        editor: {
                            valueField: "VALUE",
                            labelField: "LABEL",
                            options: ComboGroupMaster,
                            allowClear: false
                        }
                    },
                    {
                        component: "Select",
                        name: this.fieldName.GROUPD_ID_MODAL,
                        label: "PIC",
                        rules: [{ required: true, message: "PIC is required" }],
                        col: 6,
                        editor: {
                            valueField: "VALUE",
                            labelField: "LABEL",
                            options: ComboGroupDetail,
                            allowClear: false,
                            onFilter: ({ item, values }) => {
                                return item?.REF === values?.GROUPM_ID_MODAL;
                            }
                        },
                        dependencies: [this.fieldName.GROUPM_ID_MODAL]
                    }
                ]
            }
        ]
    },
    onOpen: async function ({ dataUtil }) {
        return true;
    },
    onClosing: async function () {
        return true;
    },
    onClose: async function ({ dataUtil }) {
        return true;
    },
    onConfirm: async function ({ dataUtil, values }) {
        const dm: DataModel = dataUtil.getDataModel("DM_DOC_MANAGE");
        const du: DataUnit = dm.getUnit("DU_DOC_MANAGE");
        const row = du.getCurrentRow();

        if (values[this.fieldName.GROUPM_ID_MODAL] !== null && values[this.fieldName.GROUPD_ID_MODAL] !== null) {
            row.setInitialData({
                GROUPM_BO_ID: values[this.fieldName.GROUPM_ID_MODAL],
                GROUPD_BO_ID: values[this.fieldName.GROUPD_ID_MODAL]
            });
            await logic.syncDocStatus("TRANSFER", dataUtil, _SERVICE_UPDATE_TRANS_TIME);
        } else {
            $$.Alert.show({ type: "warning", text: "PIC Group and PIC is required.", timeout: 2000 });
        }
        return true;
    },
    onConfirming: async function ({ dataUtil }) {
        return true;
    },
    onInputed: async function ({ field, cmp }) {
        const cmpModal = cmp(this.modalFormId);
        if (field === this.fieldName.GROUPM_ID_MODAL) {
            cmpModal.setValue({ 
                [this.fieldName.GROUPD_ID_MODAL]: null 
            });
        }
    }
}

export { ExportModalPIC } 