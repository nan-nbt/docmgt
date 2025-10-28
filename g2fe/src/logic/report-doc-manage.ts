// import { $$ } from "g2fw";

const logic = {
    /**
     * Filter combo [cabinet, column, box] data in query area component v2
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
    },
    /**
     * onInputed event handler for filter combo [cabinet, column, box]
     * @param param0 { field, dataUtil }
     */
    onInputed: function ({ cmp, newVal, field, setParam }) {
        try {
            if (field === "FLOOR_ID") {
                // if you use filter combo component v2, you can remove this part
                let cabinet = cmp("CMP_COMBO_CABINET");
                cabinet.filter((value, key) => value["REF"] === newVal);
                // end
    
                setParam({
                    CABINET_ID: null,
                    CABIN_ID: null,
                    BOX_ID: null
                });
            }
            else if (field === "CABINET_ID") {
                // if you use filter combo component v2, you can remove this part
                let column = cmp("CMP_COMBO_CABIN");
                column.filter((value, key) => value["REF"] === newVal);            
                // end
    
                setParam({
                    CABIN_ID: null,
                    BOX_ID: null
                });
            }
            else if (field === "CABIN_ID") {
                // if you use filter combo component v2, you can remove this part
                let box = cmp("CMP_COMBO_BOX");
                box.filter((value, key) => value["REF"] === newVal);            
                // end
    
                setParam({
                    BOX_ID: null
                });
            }
        } catch (error) {
            console.error("onInputed error:", error);
        }
    }
};

export default logic;