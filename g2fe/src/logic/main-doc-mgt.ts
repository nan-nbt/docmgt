// import { $$ } from "g2fw";

const DATA_UNIT: string = "DU_DOC_MANAGE";

const logic = {
    /**
     * Auto-clear child combos when parent is changed,
     * to be used in onInputed event for parent fields (FLOOR_ID, CABINET_ID, CABIN_ID)
     */
    onInputed: function ({ field, oldVal, newVal, dataUtil }) {
        const row = dataUtil.getUnit(DATA_UNIT).getCurrentRow();
        if (field === "FLOOR_ID" && oldVal !== newVal) {
            row.input({
                CABINET_ID: null,
                CABIN_ID: null,
                BOX_ID: null
            });
        }
        else if (field === "CABINET_ID" && oldVal !== newVal) {
            row.input({
                CABIN_ID: null,
                BOX_ID: null
            });
        }
        else if (field === "CABIN_ID" && oldVal !== newVal) {
            row.input({
                BOX_ID: null
            });
        }
    },
    /**
     * Filter combo [cabinet, column, box] data in table area
     * @param param0 { item, values }
     */
    onFilterCabinet: function ({ item, values }) {
        return item?.REF === values?.FLOOR_ID;
    },
    onFilterCabin: function ({ item, values }) {
        return item?.REF === values?.CABINET_ID;
    },
    onFilterBox: function ({ item, values }) {
        return item?.REF === values?.CABIN_ID;
    }
}

export default logic;
