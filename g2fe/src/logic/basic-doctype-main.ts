import Common from "./common";
import { $$, DataModel, DataUnit } from "g2fw";

const logic = {
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
        const dm: DataModel = dataUtil.getDataModel("DM_BASIC_DOCTYPE");
        const query = dm.getQuery();

        return Common.onNewRowingControl({ dataUtil: dataUtil, cmp: cmp, query: query });
    },
    /**
     * handle onNewRowed event
     * @param param0 { dataUtil, cmp }
     */
    onNewRowed: function ({ dataUtil, cmp }) {
        const dm: DataModel = dataUtil.getDataModel("DM_BASIC_DOCTYPE");
        const du: DataUnit = dm.getUnit("DU_BASIC_DOCTYPE");
        const row = du.getCurrentRow();
        const query = dm.getQuery();

        if (!row) {
            return $$.Alert.show({ type: "warning", text: "No row selected or missing ID.", timeout: 2000 });
        }

        row.input({
            SITE_NO: query["SITE_NO"]
        });
    }
}

export default logic;