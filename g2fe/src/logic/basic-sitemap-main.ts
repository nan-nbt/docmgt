import Common from "./common";
import { $$, DataModel, DataUnit } from "g2fw";

const logic = {
    /**
     * handle onInputed event
     * @param param0 { field, oldVal, newVal, row, cmp, setParam }
     */
    onInputed: function ({ field, oldVal, newVal, row, cmp, setParam }) {
        Common.onInputedSetFormParams({ field: field, oldVal: oldVal, newVal: newVal, row: row, cmp: cmp, setParam: setParam });
    },
    /**
     * handle onQuerying event
     * @param param0 { obj, query, cmp }
     */
    onQuerying: function ({ obj, query, cmp }) {
        return Common.onQueryingControl({ obj: obj, query: query, cmp: cmp });
    },
    /**
     * handle onClickPicker event
     * @param param0 { dataUtil, row }
     * @returns 
     */
    onClickPicker: function ({ dataUtil, row }) {
        return Common.onNewRowingControl({ dataUtil: dataUtil, cmp: row });
    },
    /**
     * handle onConfirmPicker event
     * @param param0 { dataUtil, checkedRows }
     */
    onConfirmPicker: function ({ dataUtil, checkedRows }) {
        const dm: DataModel = dataUtil.getDataModel("DM_BASIC_SITEMAP");
        const du: DataUnit = dm.getUnit("DU_BASIC_SITEMAP");

        if (!checkedRows) {
            return $$.Alert.show({ type: "warning", text: "No row selected or missing ID.", timeout: 2000 });
        }

        for (let i = 0; i < checkedRows.length; i++) {
            du.newRow({ SITE_NO: Common.getDefaultParams().SITE_NO, ...checkedRows[i] });            
        }
    }
}

export default logic;