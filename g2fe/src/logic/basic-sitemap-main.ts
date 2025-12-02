import { DataModel, DataUnit } from "g2fw";
import Common from "./common";

const logic = {
    /**
     * handle onQuerying event
     * @param param0 { obj, query, cmp }
     */
    onQuerying: function ({ obj, query, cmp }) {
        return Common.onQueryingControl({ obj: obj, query: query, cmp: cmp });
    },
    onClickPicker: function ({ cmp, dataUtil }) {
        return Common.onNewRowingControl({ dataUtil: dataUtil, cmp: cmp });
    },
    onInputed: function ({ field, oldVal, newVal, row, cmp, setParam }) {
        return Common.onInputedSetFormParams({
            field: field,
            oldVal: oldVal,
            newVal: newVal,
            row: row,
            cmp: cmp,
            setParam: setParam,
        });
    },
    /**
     * handle onNewRowed event
     * @param param0 { dataUtil, cmp }
     */
    onConfirmPicker: function ({ dataUtil, checkedRows }) {
        const dm: DataModel = dataUtil.getDataModel("DM_BASIC_SITEMAP");
        const du: DataUnit = dm.getUnit("DU_BASIC_SITEMAP");

        checkedRows[0] = { ...checkedRows[0], SITE_NO: Common.getDefaultParams().SITE_NO };
        du.newRow(checkedRows);
    },
};

export default logic;
