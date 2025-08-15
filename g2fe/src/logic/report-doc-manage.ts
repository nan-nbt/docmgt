// import { $$ } from "g2fw";

const logic = {
    /**
     * Filter combo [cabinet, column, box] data in query area v2
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
    onInputed: function ({ field, setParam }) {
        if (field === "FLOOR_ID") {
            setParam({
                CABINET_ID: null,
                CABIN_ID: null,
                BOX_ID: null
            });
        }
        else if (field === "CABINET_ID") {
            setParam({
                CABIN_ID: null,
                BOX_ID: null
            });
        }
        else if (field === "CABIN_ID") {
            setParam({
                BOX_ID: null
            });
        }
    }
};

export default logic;