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
        const dm: DataModel = dataUtil.getDataModel("DM_BASIC_GROUP");
        const query = dm.getQuery();

        return Common.onNewRowingControl({ dataUtil: dataUtil, cmp: cmp, query: query });
    },
    /**
     * handle onNewRowed event
     * @param param0 { dataUtil, cmp }
     */
    onNewRowed: function ({ dataUtil, cmp }) {
        const dm: DataModel = dataUtil.getDataModel("DM_BASIC_GROUP");
        const du: DataUnit = dm.getUnit("DU_BASIC_GROUPM");
        const row = du.getCurrentRow();
        const query = dm.getQuery();

        if (!row) {
            return $$.Alert.show({ type: "warning", text: "No row selected or missing ID.", timeout: 2000 });
        }

        row.input({
            SITE_NO: query["SITE_NO"]
        });
    },
    /**
     * handle onClickPicker event
     * @param param0 { dataUtil, row }
     * @returns 
     */
    onClickPicker: function ({ dataUtil, row }) {
        return Common.onNewRowingControl({ dataUtil: dataUtil, cmp: row, query: {} });
    },
    /**
     * handle onConfirmPicker event
     * @param param0 { dataUtil, checkedRows }
     */
    onConfirmPicker: function ({ dataUtil, checkedRows }) {
        const dm: DataModel = dataUtil.getDataModel("DM_BASIC_GROUP");
        const du: DataUnit = dm.getUnit("DU_BASIC_GROUPD");
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