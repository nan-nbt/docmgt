import Common from "./common";
import { $$, DataModel, DataUnit } from "g2fw";

const logic = {
    /**
     * set default value for query area
     * @param param0 { args, query }
     */
    onCreated: function ({ dataUtil, args, query }) { 
        Common.onCreatedSetQueryParams({ dataUtil: dataUtil, args: args, query: query });
    },
    /**
     * handle onQuerying event
     * @param param0 { obj, query, cmp }
     */
    onQuerying: function ({ obj, query, cmp }) {
        return Common.onQueryingControl({ obj: obj, query: query, cmp: cmp });
    },
    /**
     * Handle export functionality for main document query
     * @param param0 { dataUtil }
     */
    onClickExport: function ({ dataUtil }) {
        try {
            $$.Loading.show();

            // Get all available data from the data model
            const allData = this.getAllMasterRows(dataUtil);

            if (allData && allData.length > 0) {
                // Process data for CSV export
                const csvData = this.processDataForExport(allData);

                // Generate and download CSV file
                this.generateCsvFile(csvData);

                $$.Alert.show({
                    type: "success",
                    text: `Exported ${allData.length} records successfully`,
                    timeout: 2000
                });
            } else {
                $$.Alert.show({
                    type: "warning",
                    text: "No data available for export",
                    timeout: 3000
                });
            }

        } catch (error) {
            console.error("Export error:", error);
            $$.Alert.show({
                type: "error",
                text: "Export failed",
                timeout: 3000
            });
        } finally {
            $$.Loading.hide();
        }
    },
    /**
     * Get all available master rows from the data model
     * @param dataUtil
     * @returns Array of all available rows
     */
    getAllMasterRows: function (dataUtil) {
        try {
            // Get data model and unit
            const dm: DataModel = dataUtil.getDataModel("DM_DOC_MANAGE");
            const du: DataUnit = dm.getUnit("DU_DOC_MANAGE");

            // Try to get all available rows from the data unit
            const rows = du.getRows();

            if (rows && rows.length > 0) {
                return rows;
            }

            return null;
        } catch (error) {
            console.error("Error getting master rows:", error);
            return null;
        }
    },
    /**
     * Process rows for CSV export
     * @param rows
     * @returns Array of processed data objects
     */
    processDataForExport: function (rows) {
        return rows.map(row => {
            const data = row.getData ? row.getData() : row;

            return {
                DOC_NO: data.DOC_NO || '',
                DOC_NAME: data.DOC_NAME || '',
                DOC_TYPE_DESC: data.DOC_TYPE_DESC || '',
                DOC_STATUS_DESC: data.DOC_STATUS_DESC || '',
                TRANS_TIME: this.formatTimestamp(data.TRANS_TIME),
                RETURN_TIME: this.formatTimestamp(data.RETURN_TIME),
                DESTROY_TIME: this.formatTimestamp(data.DESTROY_TIME),
                OWNER_GROUP: data.OWNER_GROUP || '',
                OWNER_NAME: data.OWNER_NAME || '',
                BO_GROUP: data.BO_GROUP || '',
                BO_NAME: data.BO_NAME || '',
                FLOOR_NAME: data.FLOOR_NAME || '',
                CABINET_NAME: data.CABINET_NAME || '',
                CABIN_NAME: data.CABIN_NAME || '',
                BOX_NAME: data.BOX_NAME || '',
                CREATE_USER_NM: data.CREATE_USER_NM || '',
                CREATE_TIME: this.formatTimestamp(data.CREATE_TIME),
                UPDATE_USER_NM: data.UPDATE_USER_NM || '',
                UPDATE_TIME: this.formatTimestamp(data.UPDATE_TIME)
            };
        });
    },
    /**
     * Format timestamp to YYYY/MM/DD HH24:MI:SS format
     * @param timestamp
     * @returns Formatted date string
     */
    formatTimestamp: function (timestamp) {
        if (!timestamp) return '';

        const date = new Date(timestamp);
        if (isNaN(date.getTime())) return '';

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
    },
    /**
     * Generate and download CSV file from processed data
     * @param csvData Array of data objects to export
     */
    generateCsvFile: function (csvData) {
        if (!csvData || csvData.length === 0) {
            throw new Error("No data to export");
        }

        // Generate CSV content
        const headers = Object.keys(csvData[0]);
        const csvContent = [
            headers.join(','),
            ...csvData.map(row =>
                headers.map(header => {
                    const value = row[header];
                    // Escape commas and quotes in CSV
                    if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                        return '"' + value.replace(/"/g, '""') + '"';
                    }
                    return value || '';
                }).join(',')
            )
        ].join('\n');

        // Generate filename with timestamp
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const fileName = `Document_Query_${timestamp}.csv`;

        // Create and trigger download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(downloadUrl);
    }
}

export default logic;