# Security Specification & Threat Model for SmartSpace

## 1. Data Invariants
- An Institution document can only be created or modified with valid schema constraints, and registration status transitions must be authorized.
- A Facility must always reference a valid institutionId.
- A BookingRequest cannot have an end time before its start time and must reference an existing facility and institution.
- Inactive or suspended user accounts cannot perform state-mutating booking operations.
- PlatformSettings cannot be modified by unprivileged standard student or faculty accounts.

## 2. The Dirty Dozen Payloads (Target Negative Scenarios)
1. **Unauthenticated Platform Settings Tamper**: An unauthenticated user attempts to update `allowCrossUniversityDiscovery` to false.
2. **Junk Character ID Injection**: An attacker attempts to write to `/facilities/` with an ID longer than 128 chars containing path traversal characters.
3. **Ghost Field Mutation**: Writing a BookingRequest with undeclared injection fields (e.g., `__adminOverride: true`).
4. **Self-Escalation**: A student user modifying their own `role` from 'student' to 'super_admin' on `registeredUsers`.
5. **Orphan Booking**: Creating a booking for a non-existent institution.
6. **Past Timestamp Spoof**: Creating a booking with manipulated client timestamps.
7. **Arbitrary Status Override**: A requester directly setting their booking status to 'approved' bypassing administrative workflow.
8. **PII Harvesting via Blanket Queries**: Querying all user profiles without legitimate scope.
9. **Deletion of Active Institutional Catalog**: Unprivileged deletion of an institution record.
10. **Re-approving Rejected Booking**: Modifying terminal state without super admin privilege.
11. **Malicious Payload Size Flooding**: Submitting a 1MB payload string to notes or announcement fields.
12. **Impersonated Institutional Registration**: Modifying an official registration submission post-approval.

All negative scenarios must be blocked by the declarative rules engine.
