-- Migration to update existing report types to new names
UPDATE report_logs SET report_type = 'SEMI_ANNUAL' WHERE report_type = 'DAILY';
UPDATE report_logs SET report_type = 'ANNUAL' WHERE report_type = 'WEEKLY';
