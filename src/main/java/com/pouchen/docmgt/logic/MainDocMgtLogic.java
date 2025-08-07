package com.pouchen.docmgt.logic;

import com.pouchen.module.datamodel.DataRow;
import com.pouchen.module.datamodel.EventArgsDataUpdate;
import com.pouchen.module.event.EventResponse;
import java.util.Map;
import java.util.Optional;

/**
 * Converted logic from PL/pgSQL trigger to Java for doc_manage and doc_manage_his.
 * File: MainDocMgtLogic.java
 * Class: handleDocMgtLog
 *
 * NOTE:
 * - This is a template. Database access logic must be implemented using your persistence/repository pattern.
 * - It expects a data structure (DataRow/NewRow/Map) for input, and repository/service classes to provide queries/updates/inserts.
 */
public class MainDocMgtLogic {

    public static class handleDocMgtLog implements EventResponse<EventArgsDataUpdate> {

        /**
         * Handle document history log logic for doc_manage table operations.
         * @param arg EventArgsDataUpdate argument containing the modified table rows and metadata.
         */
        @Override
        public void response(EventArgsDataUpdate args) {
            for (DataRow row : args.getRows()) {
                String opType = row.getState().name().toLowerCase(); // added, modified, deleted
                try {
                    switch (opType) {
                        case "added":
                            handleInsert(row);
                            break;
                        case "modified":
                            handleUpdate(row);
                            break;
                        case "deleted":
                            throw new RuntimeException("DELETE operation is restricted on doc_manage table");
                        default:
                            break;
                    }
                } catch (Exception e) {
                    throw new RuntimeException("Error in handleDocMgtLog: " + e.getMessage(), e);
                }
            }
        }

        private void handleInsert(DataRow row) {
            // Insert new history row with his_type = 'C' ("Created")
            String hisType = "C";
            long hisTime = System.currentTimeMillis();
            insertHistory(row, hisType, hisTime);
        }

        private void handleUpdate(DataRow row) {
            // Determine logic branch by row values
            Object transTime = row.get("trans_time");
            Object returnTime = row.get("return_time");
            Object destroyTime = row.get("destroy_time");

            boolean onlyMetaUpdate = (isNull(transTime) && isNull(returnTime) && isNull(destroyTime));
            String docId = asStr(row.get("doc_id"));
            String docNo = asStr(row.get("doc_no"));

            if (onlyMetaUpdate) {
                // Update latest history row (any type)
                Optional<Map<String, Object>> latest =
                    getLatestHistoryRow(docId, docNo, new String[] {"C", "T", "R", "D"});
                latest.ifPresent(targetRow -> updateHistoryMeta(targetRow, row));
                return;
            }

            String hisType = null;
            if (notNull(transTime) && isNull(returnTime) && isNull(destroyTime)) {
                hisType = "T"; // Transition (e.g. checkout/transfer)
            } else if (notNull(transTime) && notNull(returnTime) && isNull(destroyTime)) {
                hisType = "R"; // Returned
            } else if (notNull(transTime) && notNull(returnTime) && notNull(destroyTime)) {
                hisType = "D"; // Destroyed/Disposed
            } else {
                // No valid transition type, do nothing (matches `RETURN NULL`)
                return;
            }

            // Check if this hisType already exists for doc_id/doc_no
            boolean exists = historyTypeExists(docId, docNo, hisType);
            if (exists) {
                // Update existing row of this his_type (latest one)
                Optional<Map<String, Object>> target =
                    getLatestHistoryRow(docId, docNo, new String[] {hisType});
                target.ifPresent(targetRow -> updateHistoryFull(targetRow, row));
                return;
            }

            // Not exists, insert new history row
            long hisTime = System.currentTimeMillis();
            insertHistory(row, hisType, hisTime);
        }

        private void insertHistory(DataRow row, String hisType, long hisTime) {
            // Construct new history entry from row + history type/time.
            // TODO: Replace with real DB insertion using your repository/service/data util.
            // Example:
            /*
                INSERT INTO doc_manage_his (...) VALUES (...);
             */
        }

        private void updateHistoryMeta(Map<String, Object> targetRow, DataRow row) {
            // Update doc_manage_his: only metadata fields (no time/change events)
            // TODO: Implement actual DB update
        }

        private void updateHistoryFull(Map<String, Object> targetRow, DataRow row) {
            // Update doc_manage_his: full info (all columns: name, type, status, times, locations, user/time)
            // TODO: Implement actual DB update
        }

        private boolean historyTypeExists(String docId, String docNo, String hisType) {
            // TODO: Check if doc_manage_his row exists by doc_id, doc_no, his_type
            return false;
        }

        private Optional<Map<String, Object>> getLatestHistoryRow(String docId, String docNo, String[] hisTypes) {
            // TODO: Query doc_manage_his to get the latest row (by his_time desc) with doc_id, doc_no, and any his_type in hisTypes.
            // Return the map/object representing the row (for updates)
            return Optional.empty();
        }

        private boolean isNull(Object val) {
            return (val == null || "".equals(val));
        }

        private boolean notNull(Object val) {
            return !isNull(val);
        }

        private String asStr(Object val) {
            return val == null ? null : String.valueOf(val);
        }
    }
}