import { $$ } from "g2fw";

const logic = {
    /**
     * set default value for query area onCreated event
     * @param param0 { dataUtil, args, query }
     */
    onCreatedSetQueryParams: function ({ dataUtil, args, query }) {
        const today = new Date();

        const som = new Date(today.getFullYear(), today.getMonth(), 1);
        const eom = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        const ctb = som.getTime();
        const cte = eom.getTime();

        query.SITE_NO = null;
        
        query.CREATE_TIME_B = ctb;
        query.CREATE_TIME_E = cte;
    },
    /**
     * handle onQuerying event
     * @param param0 { obj, query, cmp }
     */
    onQueryingControl: function ({ obj, query, cmp }) {
        if ($$.Type.isEmpty(query.SITE_NO)) {
            $$.Loading.hide();
            $$.Alert.show({
                type: "warning",
                text: "Please select a Site",
                timeout: 3000
            });

            return false;
        }

        return true;
    },
    /**
     * handle onNewRowing event
     * @param param0 { dataUtil, cmp, query }
     */
    onNewRowingControl: function ({ dataUtil, cmp, query }) {
        if ($$.Type.isEmpty(query["SITE_NO"])) {
            $$.Alert.show({ type: "warning", text: "Please select a Site", timeout: 2000 });
            return false;
        }

        return true;
    },
    /**
     * handle onBeginEditingPage event
     * @param param0 { dataUtil, row }
     */
    onBeginEditingPage: function ({ dataUtil, row }) {
        if (!row) {
            return false
        }

        return true;
    },
    /**
     * handle onDeleteRowingTable event
     * @param param0 { dataUtil, row }
     */
    onDeleteRowingTable: function ({ dataUtil, row }) {
        if (!row) {
            return false
        }

        return true;
    }
}

export default logic;