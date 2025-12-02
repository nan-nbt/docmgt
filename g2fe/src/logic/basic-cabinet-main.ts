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
    onInputed: function ({ field, oldVal, newVal, row, cmp, setParam }) {
        Common.onInputedSetFormParams({ field: field, oldVal: oldVal, newVal: newVal, row: row, cmp: cmp, setParam: setParam });
    },
    onNewRowing: function ({ dataUtil, cmp }) {
        return Common.onNewRowingControl({ dataUtil: dataUtil, cmp: cmp });
    },
    onNewRowedFloor: function ({ dataUtil, cmp }) {
        const dm: DataModel = dataUtil.getDataModel("DM_BASIC_CABINET");
        const du: DataUnit = dm.getUnit("DU_BASIC_FLOOR");
        const row = du.getCurrentRow();

        if (!row) {
            return $$.Alert.show({ type: "warning", text: "No row selected or missing ID.", timeout: 2000 });
        }

        row.input({
            SITE_NO: Common.getDefaultParams().SITE_NO
        });
    },
    onNewRowedCabinet: function ({ dataUtil, cmp }) {
        const dm: DataModel = dataUtil.getDataModel("DM_BASIC_CABINET");
        const du: DataUnit = dm.getUnit("DU_BASIC_CABINET");
        const row = du.getCurrentRow();

        if (!row) {
            return $$.Alert.show({ type: "warning", text: "No row selected or missing ID.", timeout: 2000 });
        }

        row.input({
            SITE_NO: Common.getDefaultParams().SITE_NO
        });
    },
    onNewRowedCabin: function ({ dataUtil, cmp }) {
        const dm: DataModel = dataUtil.getDataModel("DM_BASIC_CABINET");
        const du: DataUnit = dm.getUnit("DU_BASIC_CABIN");
        const row = du.getCurrentRow();

        if (!row) {
            return $$.Alert.show({ type: "warning", text: "No row selected or missing ID.", timeout: 2000 });
        }

        row.input({
            SITE_NO: Common.getDefaultParams().SITE_NO
        });
    },
    onNewRowedBox: function ({ dataUtil, cmp }) {
        const dm: DataModel = dataUtil.getDataModel("DM_BASIC_CABINET");
        const du: DataUnit = dm.getUnit("DU_BASIC_BOX");
        const row = du.getCurrentRow();

        if (!row) {
            return $$.Alert.show({ type: "warning", text: "No row selected or missing ID.", timeout: 2000 });
        }

        row.input({
            SITE_NO: Common.getDefaultParams().SITE_NO
        });
    }
}

export default logic;