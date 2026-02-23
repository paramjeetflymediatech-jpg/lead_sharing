-- Migration to fix budget range issue
ALTER TABLE jobs MODIFY budget_min BIGINT;
ALTER TABLE jobs MODIFY budget_max BIGINT;
