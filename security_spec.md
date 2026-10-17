# Security Specification & Threat Model for Tiramisu

## 1. Data Invariants
1. **User Identity Invariant**: A user profile document at `/users/{userId}` can only be created or modified by the authenticated user whose `request.auth.uid == userId`.
2. **PII & Private Data Protection**: Unauthenticated requests are denied access to user profiles. Authenticated users can read public profile cards for discovery, but cannot modify other users' documents.
3. **Conversation Participant Isolation**: Conversations at `/conversations/{conversationId}` can only be read, created, or updated by users who are included in `participantIds`.
4. **Message Integrity**: A message at `/conversations/{conversationId}/messages/{messageId}` must have `senderId == request.auth.uid`. No user may forge another user's messages.
5. **Path ID Integrity**: All document IDs must adhere to `^[a-zA-Z0-9_-]+$` and have length `<= 128`.
6. **Payload Size Bounds**: Text messages cannot exceed 2000 characters; profile bios cannot exceed 1000 characters.

## 2. The "Dirty Dozen" Threat Payloads (Targeting PERMISSION_DENIED)
1. **Anonymous Impersonation on Profile**: Write to `/users/alice` with `request.auth.uid == 'bob'`.
2. **Unauthenticated Profile Harvest**: Read `/users/alice` with `request.auth == null`.
3. **Ghost Privilege Escalation**: Send `{ "isAdmin": true, "role": "admin" }` inside `/users/{userId}` payload.
4. **Oversized String Buffer Exhaustion**: Send a bio of 100,000 characters into `/users/{userId}`.
5. **ID Poisoning Attack**: Attempting to write with a 2KB junk character ID like `/users/$$\\000evil%20id`.
6. **Message Sender Forgery**: Writing to `/conversations/chat1/messages/msg1` where `senderId: "victim"` while authenticated as `"attacker"`.
7. **Eavesdropping on Private Conversation**: Read `/conversations/chat_alice_bob` when authenticated user is `"charlie"`.
8. **Message Length Injection**: Attempting to send a 50,000 character string in `text` field.
9. **Conversation Hijack**: Modifying `participantIds` of a conversation when not a participant.
10. **Shadow Key Injection**: Sending undocumented fields `{ "shadowToken": "xyz", "backdoor": true }` into `/users/{userId}`.
11. **Timestamp Tampering**: Sending a client timestamp in the past or future instead of `request.time`.
12. **Blanket Collection Scrape**: Unrestricted `list` query across `/conversations` without participant filter.

## 3. Test Runner
Defined in `firestore.rules.test.ts`.
