const logic = {
    /**
     * filter combo [cabinet, column, box] data in query area
     * @param param0 {cmp, newVal, field}
     */
    onInputed: function ({ cmp, newVal, field }) {
        try {
            if (field === "FLOOR") {
                let cabinet = cmp("CMP_COMBO_CABINET");
                cabinet.filter((value, key) => value["FLOOR_NO"] === newVal);
            }
            else if (field === "CABINET") {
                let column = cmp("CMP_COMBO_CABIN");
                column.filter((value, key) => value["CABINET_NO"] === newVal);
            }
            else if (field === "CABIN") {
                let box = cmp("CMP_COMBO_BOX");
                box.filter((value, key) => value["CABIN_NO"] === newVal);
            }
        } catch (error) {
            console.error("onInputed error:", error);
        }
    }
}

export default logic;
