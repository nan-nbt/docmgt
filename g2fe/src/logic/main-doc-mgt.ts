// import { $$ } from "g2fw";

const logic = {
    /**
     * filter combo [cabinet, column, box] data in query area
     * @param param0 {cmp, newVal, field}
     */
    onInputed: function ({ cmp, newVal, field }) {
        try {
            if (field === "FLOOR_ID") {
                // console.log("onFloorInputed:", cmp, newVal, field);
                const cabinet = cmp("CMP_COMBO_CABINET");
                if (cabinet && typeof cabinet.filter === "function") {
                    cabinet.filter((value, key) => value["FLOOR_ID"] === newVal);
                } else {
                    console.warn("[cmp] id CMP_COMBO_CABINET not found or filter() not available!");
                }
            }
            else if (field === "CABINET_ID") {
                // console.log("onCabinetInputed:", cmp, newVal, field);
                const column = cmp("CMP_COMBO_CABIN");
                if (column && typeof column.filter === "function") {
                    column.filter((value, key) => value["CABINET_ID"] === newVal);
                } else {
                    console.warn("[cmp] id CMP_COMBO_CABIN not found or filter() not available!");
                }
            }
            else if (field === "CABIN_ID") {
                // console.log("onColumnInputed:", cmp, newVal, field);
                const box = cmp("CMP_COMBO_BOX");
                if (box && typeof box.filter === "function") {
                    box.filter((value, key) => value["CABIN_ID"] === newVal);
                } else {
                    console.warn("[cmp] id CMP_COMBO_BOX not found or filter() not available!");
                }
            }
        } catch (error) {
            console.error("onInputed error:", error);
        }
    },
    onFilterCabinet: function({ item, values }) {
        // Show only cabinets under the selected FLOOR_ID
        return item.FLOOR_ID === values.FLOOR_ID;
    },
    onFilterCabin: function({ item, values }) {
        // Show only cabins under the selected CABINET_ID
        return item.CABINET_ID === values.CABINET_ID;
    },
    onFilterBox: function({ item, values }) {
        // Show only boxes under the selected CABIN_ID
        return item.CABIN_ID === values.CABIN_ID;
    }
}

export default logic;
