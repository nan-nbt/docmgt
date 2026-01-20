import Common from "./common";
import { DataModel, DataUnit } from "g2fw";

const logic = {
    /**
     * handle onQuerying event
     * @param param0 { obj, query, cmp }
     */
    onQuerying: function ({ obj, query, cmp }) {
        return Common.onQueryingControl({ obj: obj, query: query, cmp: cmp });
    },
    /**
     * handle onBeginEditing event
     * @param param0 { dataUtil }
     * @returns 
     */
    onBeginEditing: function ({ dataUtil }) {
        const dm: DataModel = dataUtil.getDataModel("DM_BASIC_SITE");
        const du: DataUnit = dm.getUnit("DU_BASIC_SITE");
        const row = du.getCurrentRow();

        return Common.onBeginEditingPage({ dataUtil: dataUtil, row: row });
    },
    /**
     * handle onDeleteRowing event
     * @param param0 
     * @returns 
     */
    onDeleteRowing: function ({ dataUtil, rows, index }) {
        const dm: DataModel = dataUtil.getDataModel("DM_BASIC_SITE");
        const du: DataUnit = dm.getUnit("DU_BASIC_SITE");
        const row = du.getCurrentRow();

        return Common.onDeleteRowingTable({ dataUtil: dataUtil, row: row });
    }
}

export default logic;