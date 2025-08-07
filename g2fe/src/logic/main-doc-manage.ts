// import { $$ } from "g2fw";

const logic = {
    /**
     * Filter combo [cabinet, column, box] data in form area v2
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
