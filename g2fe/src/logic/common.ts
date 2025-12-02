import { $$ } from "g2fw";

let _defaultSiteMap = null;

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
    onInputedSetFormParams: function ({ field, oldVal, newVal, row, cmp, setParam }) {
        if (field === "SITE_NO") {
            _defaultSiteMap = newVal;
        }
    },
    onNewRowingControl: function ({ dataUtil, cmp }) {
        if (_defaultSiteMap === null) {
            $$.Alert.show({ type: "warning", text: "Please select a Site", timeout: 2000 });
            return false;
        }

        return true;
    },
    getDefaultParams: function () {
        return { 
            SITE_NO: _defaultSiteMap 
        };
    }
}

export default logic;