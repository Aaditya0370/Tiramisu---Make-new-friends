/**
 * Firestore Security Rules Test Suite
 * Validates Dirty Dozen payload rejection and data invariants.
 */

export interface TestPayload {
  name: string
  collection: string
  docId: string
  authUid: string | null
  payload: Record<string, unknown>
  expectedStatus: 'PERMISSION_DENIED' | 'ALLOWED'
}

export const DIRTY_DOZEN_TESTS: TestPayload[] = [
  {
    name: '1. Impersonate another user profile write',
    collection: 'users',
    docId: 'alice',
    authUid: 'bob',
    payload: { id: 'alice', displayName: 'Hacked Alice' },
    expectedStatus: 'PERMISSION_DENIED',
  },
  {
    name: '2. Unauthenticated profile read',
    collection: 'users',
    docId: 'alice',
    authUid: null,
    payload: {},
    expectedStatus: 'PERMISSION_DENIED',
  },
  {
    name: '3. Ghost privilege escalation in profile',
    collection: 'users',
    docId: 'alice',
    authUid: 'alice',
    payload: { id: 'alice', displayName: 'Alice', isAdmin: true, role: 'superadmin' },
    expectedStatus: 'PERMISSION_DENIED',
  },
  {
    name: '4. Oversized string payload (bio > 1000 chars)',
    collection: 'users',
    docId: 'alice',
    authUid: 'alice',
    payload: { id: 'alice', displayName: 'Alice', bio: 'a'.repeat(2000) },
    expectedStatus: 'PERMISSION_DENIED',
  },
  {
    name: '5. ID poisoning with invalid characters',
    collection: 'users',
    docId: '$$evil%20id!!',
    authUid: '$$evil%20id!!',
    payload: { id: '$$evil%20id!!', displayName: 'Poison' },
    expectedStatus: 'PERMISSION_DENIED',
  },
  {
    name: '6. Message sender forgery (senderId != auth.uid)',
    collection: 'conversations/chat1/messages',
    docId: 'msg1',
    authUid: 'attacker',
    payload: { id: 'msg1', conversationId: 'chat1', senderId: 'victim', text: 'Forged!' },
    expectedStatus: 'PERMISSION_DENIED',
  },
  {
    name: '7. Non-participant eavesdropping on private conversation',
    collection: 'conversations',
    docId: 'chat_alice_bob',
    authUid: 'charlie',
    payload: {},
    expectedStatus: 'PERMISSION_DENIED',
  },
  {
    name: '8. Oversized chat message (> 2000 chars)',
    collection: 'conversations/chat1/messages',
    docId: 'msg2',
    authUid: 'alice',
    payload: { id: 'msg2', conversationId: 'chat1', senderId: 'alice', text: 'x'.repeat(4000) },
    expectedStatus: 'PERMISSION_DENIED',
  },
  {
    name: '9. Unauthorized conversation modification',
    collection: 'conversations',
    docId: 'chat1',
    authUid: 'stranger',
    payload: { title: 'Hijacked title' },
    expectedStatus: 'PERMISSION_DENIED',
  },
  {
    name: '10. Shadow key injection in user profile',
    collection: 'users',
    docId: 'alice',
    authUid: 'alice',
    payload: { id: 'alice', displayName: 'Alice', backdoor: true, shadowKey: 'token' },
    expectedStatus: 'PERMISSION_DENIED',
  },
  {
    name: '11. Unauthenticated write to conversation message',
    collection: 'conversations/chat1/messages',
    docId: 'msg3',
    authUid: null,
    payload: { id: 'msg3', conversationId: 'chat1', senderId: 'anon', text: 'Hi' },
    expectedStatus: 'PERMISSION_DENIED',
  },
  {
    name: '12. Invalid document schema write',
    collection: 'users',
    docId: 'alice',
    authUid: 'alice',
    payload: { id: 12345 },
    expectedStatus: 'PERMISSION_DENIED',
  },
]
