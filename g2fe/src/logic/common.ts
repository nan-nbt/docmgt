const logic = {
    /**
     * set default value for query area onCreated event
     * @param param0 { args, query }
     */
    onCreatedSetQueryCondition: function ({ dataUtil, args, query }) {
        const today = new Date();
        const som = new Date(today.getFullYear(), today.getMonth(), 1);
        const eom = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        const ctb = som.getTime();
        const cte = eom.getTime();

        query.CREATE_TIME_B = ctb;
        query.CREATE_TIME_E = cte;
    }
}

export default logic;