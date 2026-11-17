-- Remove only the legacy Formmy/Sirius AI chat tables.
-- Child table first to preserve foreign-key order.
DROP TABLE IF EXISTS "AssistantMessage";
DROP TABLE IF EXISTS "AssistantConversation";
