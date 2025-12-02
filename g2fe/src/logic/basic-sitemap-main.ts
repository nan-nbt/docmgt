import Common from "./common";

const logic = {
    /**
     * handle onQuerying event
     * @param param0 { obj, query, cmp }
     */
    onQuerying: function ({ obj, query, cmp }) {
        return Common.onQueryingControl({ obj: obj, query: query, cmp: cmp });
    }    
}

export default logic;