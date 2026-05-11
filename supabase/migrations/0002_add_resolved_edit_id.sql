-- Add resolved_edit_id to track which element the agent actually wrote to.
-- Distinct from edit_id (where the visitor clicked) — they diverge when a
-- visitor comments on one element about a different element's property.
alter table comments add column resolved_edit_id text;
