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
        const dm: DataModel = dataUtil.getDataModel("DM_BASIC_CABINET");
        const query = dm.getQuery();

        return Common.onNewRowingControl({ dataUtil: dataUtil, cmp: cmp, query: query });
    },
    /**
     * handle onNewRowed event
     * @param param0 { dataUtil, cmp }
     */
    onNewRowedFloor: function ({ dataUtil, cmp }) {
        const dm: DataModel = dataUtil.getDataModel("DM_BASIC_CABINET");
        const du: DataUnit = dm.getUnit("DU_BASIC_FLOOR");
        const row = du.getCurrentRow();
        const query = dm.getQuery();

        if (!row) {
            return $$.Alert.show({ type: "warning", text: "No row selected or missing ID.", timeout: 2000 });
        }

        row.input({
            SITE_NO: query["SITE_NO"]
        });
    },
    onNewRowedCabinet: function ({ dataUtil, cmp }) {
        const dm: DataModel = dataUtil.getDataModel("DM_BASIC_CABINET");
        const du: DataUnit = dm.getUnit("DU_BASIC_CABINET");
        const row = du.getCurrentRow();
        const query = dm.getQuery();

        if (!row) {
            return $$.Alert.show({ type: "warning", text: "No row selected or missing ID.", timeout: 2000 });
        }

        row.input({
            SITE_NO: query["SITE_NO"]
        });
    },
    onNewRowedCabin: function ({ dataUtil, cmp }) {
        const dm: DataModel = dataUtil.getDataModel("DM_BASIC_CABINET");
        const du: DataUnit = dm.getUnit("DU_BASIC_CABIN");
        const row = du.getCurrentRow();
        const query = dm.getQuery();

        if (!row) {
            return $$.Alert.show({ type: "warning", text: "No row selected or missing ID.", timeout: 2000 });
        }

        row.input({
            SITE_NO: query["SITE_NO"]
        });
    },
    onNewRowedBox: function ({ dataUtil, cmp }) {
        const dm: DataModel = dataUtil.getDataModel("DM_BASIC_CABINET");
        const du: DataUnit = dm.getUnit("DU_BASIC_BOX");
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
     * handle onBeginEditing event
     * @param param0 { dataUtil }
     * @returns 
     */
    onBeginEditing: function ({ dataUtil }) {
        const dm: DataModel = dataUtil.getDataModel("DM_BASIC_CABINET");
        const du: DataUnit = dm.getUnit("DU_BASIC_FLOOR");
        const row = du.getCurrentRow();

        return Common.onBeginEditingPage({ dataUtil: dataUtil, row: row });
    },
    /**
     * handle onDeleteRowing event
     * @param param0 
     * @returns 
     */
    onDeleteRowing: function ({ dataUtil, rows, index }) {
        const dm: DataModel = dataUtil.getDataModel("DM_BASIC_CABINET");
        const du: DataUnit = dm.getUnit("DU_BASIC_FLOOR");
        const row = du.getCurrentRow();

        return Common.onDeleteRowingTable({ dataUtil: dataUtil, row: row });
    }
}

export default logic;