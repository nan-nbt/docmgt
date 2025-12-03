import Common from "./common";
import { $$, DataModel, DataUnit } from "g2fw";

const logic = {
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
        const dm: DataModel = dataUtil.getDataModel("DM_BASIC_SITEMAP");
        const query = dm.getQuery();

        return Common.onNewRowingControl({ dataUtil: dataUtil, cmp: row, query: query });
    },
    /**
     * handle onConfirmPicker event
     * @param param0 { dataUtil, checkedRows }
     */
    onConfirmPicker: function ({ dataUtil, checkedRows }) {
        const dm: DataModel = dataUtil.getDataModel("DM_BASIC_SITEMAP");
        const du: DataUnit = dm.getUnit("DU_BASIC_SITEMAP");
        const query = dm.getQuery();

        if (!checkedRows) {
            return $$.Alert.show({ type: "warning", text: "No row selected or missing ID.", timeout: 2000 });
        }

        for (let i = 0; i < checkedRows.length; i++) {
            du.newRow({ SITE_NO: query["SITE_NO"], ...checkedRows[i] });            
        }
    }
}

export default logic;