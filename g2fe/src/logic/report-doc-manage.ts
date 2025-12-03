import Common from "./common";
import { $$ } from "g2fw";

const logic = {
    /**
     * set default value for query area
     * @param param0 { args, query }
     */
    onCreated: Common.onCreatedSetQueryParams,
    /**
     * handle onQuerying event
     * @param param0 { obj, query, cmp }
     */
    onQuerying: function ({ obj, query, cmp }) {
        return Common.onQueryingControl({ obj: obj, query: query, cmp: cmp });
    },
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
    },
    /**
     * Handle export functionality for document report
     * @param param0 { dataUtil }
     */
    onClickExport: function ({ dataUtil }) {
        try {
            $$.Loading.show();

            const detailRows = this.getDetailRows(dataUtil);
            if (!detailRows?.length) {
                $$.Alert.show({
                    type: "warning",
                    text: "No data available for export",
                    timeout: 3000
                });
                return;
            }

            const kindStatusFilter = this.getDocStatusFilter(dataUtil);
            const filteredRows = this.applyFilters(detailRows, dataUtil, kindStatusFilter);
            const csvData = this.processDataForExport(filteredRows);

            this.generateCsvFile(csvData);

            $$.Alert.show({
                type: "success",
                text: "CSV file exported successfully",
                timeout: 2000
            });

        } catch (error) {
            console.error("onClickExport error:", error);
            $$.Alert.show({
                type: "error",
                text: "Export failed: " + (error?.message || "Unknown error"),
                timeout: 3000
            });
        } finally {
            $$.Loading.hide();
        }
    },
    /**
     * Get detail rows from data models with fallback strategies
     * @param dataUtil
     * @returns Array of detail rows or null
     */
    getDetailRows: function (dataUtil) {
        const dataSources = [
            // Report data model with detail unit
            () => {
                const dm = dataUtil.getDataModel("DM_RPT_DOC_MANAGE");
                return dm?.getUnit("V_RPT_DOC_MANAGE_DETAIL")?.getRows?.();
            },
            // Fallback units in report data model
            ...["DU_RPT_DOC_MANAGE", "DU_DOC_MANAGE", "DU_REPORT", "DU_DETAIL"].map(unitName =>
                () => dataUtil.getDataModel("DM_RPT_DOC_MANAGE")?.getUnit(unitName)?.getRows?.()
            ),
            // Document management data model
            () => dataUtil.getDataModel("DM_DOC_MANAGE")?.getUnit("DU_DOC_MANAGE")?.getRows?.(),
            // Direct data access methods
            () => (dataUtil as any).getQueryResult?.(),
            () => (dataUtil as any).getCurrentData?.(),
            () => (dataUtil as any).data,
            () => (dataUtil as any).resultSet
        ];

        for (const getData of dataSources) {
            try {
                const result = getData();
                if (result && (Array.isArray(result) ? result.length > 0 : Object.keys(result || {}).length > 0)) {
                    return Array.isArray(result) ? result : [result];
                }
            } catch (error) {
                // Continue to next data source
            }
        }

        return null;
    },
    /**
     * Get KIND_STATUS filter value from master table current row
     * @param dataUtil
     * @returns KIND_STATUS value or null
     */
    getDocStatusFilter: function (dataUtil) {
        try {
            const currentRow = dataUtil.getDataModel("DM_RPT_DOC_MANAGE")
                ?.getUnit("V_RPT_DOC_MANAGE_MAIN")
                ?.getCurrentRow?.();

            return currentRow ? this.extractRowData(currentRow)?.KIND_STATUS || null : null;
        } catch (error) {
            console.error("Error getting KIND_STATUS filter:", error);
            return null;
        }
    },
    /**
     * Apply filters to detail rows based on master selection and KIND_STATUS
     * @param detailRows
     * @param dataUtil
     * @param kindStatusFilter
     * @returns Filtered array of detail rows
     */
    applyFilters: function (detailRows, dataUtil, kindStatusFilter) {
        try {
            const selectedMasterRows = this.getSelectedMasterRows(dataUtil);
            if (!selectedMasterRows?.length) return detailRows;

            if (kindStatusFilter) {
                // Filter by KIND_STATUS from master table
                return detailRows.filter(row =>
                    this.extractRowData(row)?.KIND_STATUS === kindStatusFilter
                );
            }

            // Filter by master record relationships (GROUPM_ID)
            const masterData = selectedMasterRows.map(row => this.extractRowData(row));
            return detailRows.filter(detailRow => {
                const detailData = this.extractRowData(detailRow);
                return masterData.some(master =>
                    master.GROUPM_ID && detailData.GROUPM_ID &&
                    master.GROUPM_ID === detailData.GROUPM_ID
                );
            });
        } catch (error) {
            console.error("Error applying filters:", error);
            return detailRows; // Return unfiltered data on error
        }
    },
    /**
     * Get selected master rows from document management data model
     * @param dataUtil
     * @returns Array of selected master rows or empty array
     */
    getSelectedMasterRows: function (dataUtil) {
        try {
            const masterDu = dataUtil.getDataModel("DM_RPT_DOC_MANAGE")?.getUnit("V_RPT_DOC_MANAGE_MAIN");
            if (!masterDu) return [];

            // Try to get selected rows first, fallback to current row
            const selectedRows = (masterDu as any).getSelectedRows?.() || [];
            return selectedRows.length > 0 ? selectedRows : [masterDu.getCurrentRow?.()].filter(Boolean);
        } catch (error) {
            console.error("Error getting selected master rows:", error);
            return [];
        }
    },
    /**
     * Extract data from a row object handling different data access patterns
     * @param row
     * @returns Extracted row data object
     */
    extractRowData: function (row) {
        if (typeof row === 'object' && row !== null) {
            if (row.getData && typeof row.getData === 'function') {
                return row.getData();
            } else if (row.data) {
                return row.data;
            } else {
                return row;
            }
        }
        return row;
    },
    /**
     * Format timestamp from milliseconds to YYYY/MM/DD HH24:MI:SS format
     * @param timestamp - Timestamp in milliseconds or string format
     * @returns Formatted date string in YYYY/MM/DD HH24:MI:SS format or empty string if invalid
     */
    formatTimestamp: function (timestamp) {
        try {
            if (!timestamp) return '';

            // If already a string, check if it's already formatted
            if (typeof timestamp === 'string') {
                // Check if it's already in YYYY/MM/DD HH24:MI:SS format
                if (/^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2}$/.test(timestamp)) {
                    return timestamp;
                }
                // Check if it's already in YYYY/MM/DD format (without time)
                if (/^\d{4}\/\d{2}\/\d{2}$/.test(timestamp)) {
                    return timestamp + ' 00:00:00';
                }
                // Try to parse as number
                const numValue = parseInt(timestamp);
                if (!isNaN(numValue)) {
                    timestamp = numValue;
                } else {
                    return timestamp; // Return as-is if can't parse
                }
            }

            // Convert milliseconds to Date object
            const date = new Date(timestamp);

            // Check if date is valid
            if (isNaN(date.getTime())) {
                return '';
            }

            // Format as YYYY/MM/DD HH24:MI:SS
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');

            return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
        } catch (error) {
            console.error("Error formatting timestamp:", error);
            return '';
        }
    },
    /**
     * Process detail rows for CSV export
     * @param detailRows
     * @returns Array of processed data objects
     */
    processDataForExport: function (detailRows) {
        // Define field mappings in the specified order
        const fieldMappings = [
            { key: 'DOC_NO', variants: ['DOC_NO', 'DOC_ID', 'docNo'] },
            { key: 'DOC_NAME', variants: ['DOC_NAME', 'docName'] },
            { key: 'DOC_TYPE_DESC', variants: ['DOC_TYPE_DESC', 'docTypeDesc'] },
            { key: 'DOC_CAT_DESC', variants: ['DOC_CAT_DESC', 'docCatDesc'] },
            { key: 'DOC_STATUS_DESC', variants: ['DOC_STATUS_DESC', 'docStatusDesc'] },
            { key: 'OWNER_GROUP', variants: ['OWNER_GROUP', 'ownerGroup'] },
            { key: 'OWNER_NAME', variants: ['OWNER_NAME', 'ownerName'] },
            { key: 'BO_GROUP', variants: ['BO_GROUP', 'boGroup'] },
            { key: 'BO_NAME', variants: ['BO_NAME', 'boName'] },
            { key: 'FLOOR_NAME', variants: ['FLOOR_NAME', 'floorName'] },
            { key: 'CABINET_NAME', variants: ['CABINET_NAME', 'cabinetName'] },
            { key: 'CABIN_NAME', variants: ['CABIN_NAME', 'cabinName'] },
            { key: 'BOX_NAME', variants: ['BOX_NAME', 'boxName'] },
            { key: 'MFPC_ID', variants: ['MFPC_ID', 'mfpcId'] },
            { key: 'MFPC_USERNAME', variants: ['MFPC_USERNAME', 'mfpcUsername'] },
            { key: 'MFPC_SSO', variants: ['MFPC_SSO', 'mfpcSso'] },
            { key: 'MFPC_CARD_ID', variants: ['MFPC_CARD_ID', 'mfpcCardId'] },
            { key: 'MFPC_MACHINE_NAME', variants: ['MFPC_MACHINE_NAME', 'mfpcMachineName'] },
            { key: 'MFPC_PRINTER_NAME', variants: ['MFPC_PRINTER_NAME', 'mfpcPrinterName'] },
            { key: 'MFPC_PRINT_TIME', variants: ['MFPC_PRINT_TIME', 'mfpcPrintTime'] },
            { key: 'MFPC_COUNT_PAGE', variants: ['MFPC_COUNT_PAGE', 'mfpcCountPage'] },
            { key: 'CREATE_USER_NM', variants: ['CREATE_USER_NM', 'createUserNm'] },
            { key: 'UPDATE_USER_NM', variants: ['UPDATE_USER_NM', 'updateUserNm'] },
            { key: 'SITE_NO', variants: ['SITE_NO', 'siteNo'] }
        ];

        const timestampFieldMappings = [
            { key: 'TRANS_TIME', variants: ['TRANS_TIME', 'transTime'] },
            { key: 'RETURN_TIME', variants: ['RETURN_TIME', 'returnTime'] },
            { key: 'DESTROY_TIME', variants: ['DESTROY_TIME', 'destroyTime'] },
            { key: 'CREATE_TIME', variants: ['CREATE_TIME', 'createTime'] },
            { key: 'UPDATE_TIME', variants: ['UPDATE_TIME', 'updateTime'] }
        ];

        // Define the export header order
        const exportHeaderOrder = [
            'DOC_NO', 'DOC_NAME', 'DOC_TYPE_DESC', 'DOC_CAT_DESC', 'DOC_STATUS_DESC',
            'TRANS_TIME', 'RETURN_TIME', 'DESTROY_TIME',
            'OWNER_GROUP', 'OWNER_NAME', 'BO_GROUP', 'BO_NAME',
            'FLOOR_NAME', 'CABINET_NAME', 'CABIN_NAME', 'BOX_NAME',
            'MFPC_ID', 'MFPC_USERNAME', 'MFPC_SSO', 'MFPC_CARD_ID', 'MFPC_MACHINE_NAME', 'MFPC_PRINTER_NAME', 'MFPC_PRINT_TIME', 'MFPC_COUNT_PAGE',
            'CREATE_USER_NM', 'CREATE_TIME', 'UPDATE_USER_NM', 'UPDATE_TIME',
            'SITE_NO'
        ];

        return detailRows.map(row => {
            const rowData = this.extractRowData(row);
            const processedRow = {};

            // Map all fields in the specified export order
            exportHeaderOrder.forEach(fieldKey => {
                // Check if it's a regular field
                const fieldMapping = fieldMappings.find(mapping => mapping.key === fieldKey);
                if (fieldMapping) {
                    processedRow[fieldKey] = fieldMapping.variants.reduce((value, variant) => value || rowData[variant], '') || '';
                } else {
                    // Check if it's a timestamp field
                    const timestampMapping = timestampFieldMappings.find(mapping => mapping.key === fieldKey);
                    if (timestampMapping) {
                        const timestamp = timestampMapping.variants.reduce((value, variant) => value || rowData[variant], null);
                        processedRow[fieldKey] = this.formatTimestamp(timestamp);
                    }
                }
            });

            return processedRow;
        });
    },
    /**
     * Generate and download CSV file from processed data
     * @param csvData Array of data objects to export
     */
    generateCsvFile: function (csvData) {
        if (!csvData || csvData.length === 0) {
            throw new Error("No data to export");
        }

        // Define dynamic header mapping
        const headerMapping = {
            'DOC_NO': 'Document No.',
            'DOC_NAME': 'Document Name',
            'DOC_TYPE_DESC': 'Type',
            'DOC_CAT_DESC': 'Category',
            'DOC_STATUS_DESC': 'Status',
            'TRANS_TIME': 'Transfer Time',
            'RETURN_TIME': 'Return Time',
            'DESTROY_TIME': 'Destroy Time',
            'OWNER_GROUP': 'Owner Group',
            'OWNER_NAME': 'Owner',
            'BO_GROUP': 'PIC Group',
            'BO_NAME': 'PIC',
            'FLOOR_NAME': 'Floor',
            'CABINET_NAME': 'Cabinet',
            'CABIN_NAME': 'Cabin',
            'BOX_NAME': 'Box',
            'MFPC_ID': 'MFPC ID',
            'MFPC_USERNAME': 'Username',
            'MFPC_SSO': 'SSO',
            'MFPC_CARD_ID': 'ID Card',
            'MFPC_MACHINE_NAME': 'Machine Name',
            'MFPC_PRINTER_NAME': 'Printer Name',
            'MFPC_PRINT_TIME': 'Print Time',
            'MFPC_COUNT_PAGE': 'Page Count',
            'CREATE_USER_NM': 'Create User',
            'CREATE_TIME': 'Create Time',
            'UPDATE_USER_NM': 'Update User',
            'UPDATE_TIME': 'Update Time',
            'SITE_NO': 'Site'
        };

        // Generate CSV content
        const headers = Object.keys(csvData[0]);
        const displayHeaders = headers.map(header => headerMapping[header] || header);
        const csvContent = [
            displayHeaders.join(','), // Header row
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
        const fileName = `Document_Report_${timestamp}.csv`;

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
};

export default logic;
