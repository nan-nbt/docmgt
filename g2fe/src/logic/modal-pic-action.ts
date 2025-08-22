import { $$, DataModel, DataUnit } from "g2fw";

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

const ExportModalPicAction = {
    /**
     * Handle Modal Form Action Transfer, Return, Destroy
     * @param param0 { dataUtil }
     */
    modalFormId: "MODAL_ACTION",
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
            [this.fieldName.GROUPM_ID_MODAL]: mainRow.getData().GROUPM_ID,
            [this.fieldName.GROUPD_ID_MODAL]: mainRow.getData().GROUPD_ID
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
                        label: "Group Name",
                        rules: [{ required: true, message: "Group Name is required" }],
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
                        label: "Person In Charge",
                        rules: [{ required: true, message: "Person In Charge is required" }],
                        col: 6,
                        editor: {
                            valueField: "VALUE",
                            labelField: "LABEL",
                            options: ComboGroupDetail,
                            allowClear: false,
                            onFilter: ({ item, values }) => {
                                console.log("onFilter:", item, values);
                                return item?.REF === values?.GROUPM_ID_MODAL;
                            }
                        },
                        dependencies: [this.fieldName.GROUPM_ID_MODAL]
                    }
                ]
            }
        ]
    },
    onClosing: async function () {
        return true;
    },
    onConfirm: async function () {

    },
    onInputed: async function ({ field, dataUtil }) {
        console.log("onInputedModal:", field, dataUtil);
        if (field === this.fieldName.GROUPM_ID_MODAL) {
            //
        }
    }
}

export { ExportModalPicAction } 