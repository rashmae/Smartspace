import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import {
  Institution,
  Facility,
  BookingRequest,
  InstitutionalRegistrationRequest,
  InstitutionalDemoRequest,
  RegisteredUserAccount,
  PlatformSettings,
  FacilityHandler,
  FacilityAssignment,
  FacilityApprovalLog,
  AIAutomationJob,
  EmailDeliveryRecord,
  AIWorkflowDefinition,
} from '../types';
import {
  DEMO_INSTITUTIONS,
  INITIAL_FACILITIES,
  INITIAL_BOOKINGS,
  INITIAL_FACILITY_HANDLERS,
  INITIAL_FACILITY_ASSIGNMENTS,
} from '../data/initialData';

const COLLECTIONS = {
  INSTITUTIONS: 'institutions',
  FACILITIES: 'facilities',
  BOOKINGS: 'bookings',
  REGISTRATIONS: 'institutionalRegistrations',
  DEMO_REQUESTS: 'demoRequests',
  USERS: 'registeredUsers',
  SETTINGS: 'platformSettings',
  FACILITY_HANDLERS: 'facilityHandlers',
  FACILITY_ASSIGNMENTS: 'facilityAssignments',
  FACILITY_APPROVAL_LOGS: 'facilityApprovalLogs',
};

const BOOTSTRAPPED_SUPER_ADMIN_EMAILS = new Set([
  'leahansay19@gmail.com',
  'rashmae26@gmail.com',
  'ansayrashmae05@gmail.com',
  'krishapminoza@gmail.com',
  'gonzalesangelmae279@gmail.com',
  'karlhadrielc@gmail.com',
  'smartspaceinquiries0@gmail.com',
]);

function getVerifiedAuthUser() {
  const user = auth.currentUser;
  if (!user || !user.emailVerified) return null;
  return user;
}

export function isBootstrappedSuperAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return BOOTSTRAPPED_SUPER_ADMIN_EMAILS.has(email.trim().toLowerCase());
}

export async function checkSuperAdminCloudAccess(uid: string, email?: string | null): Promise<boolean> {
  if (isBootstrappedSuperAdminEmail(email)) return true;
  if (!uid) return false;

  try {
    const adminSnap = await getDoc(doc(db, 'admins', uid));
    if (adminSnap.exists()) return true;
  } catch {
    // Expected permission denial for non-admins
  }

  try {
    const userSnap = await getDoc(doc(db, COLLECTIONS.USERS, uid));
    if (userSnap.exists()) {
      const data = userSnap.data() as RegisteredUserAccount;
      if (data.role === 'super_admin' && data.status === 'active') return true;
    }
  } catch {
    // Ignore if user doc not present
  }

  return false;
}

export async function getUserAccountProfileFromCloud(
  uid: string,
  email?: string | null
): Promise<RegisteredUserAccount | null> {
  if (!getVerifiedAuthUser()) return null;
  try {
    if (uid) {
      const directSnap = await getDoc(doc(db, COLLECTIONS.USERS, uid));
      if (directSnap.exists()) {
        return directSnap.data() as RegisteredUserAccount;
      }
    }
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail) return null;
    const q = query(collection(db, COLLECTIONS.USERS), where('email', '==', cleanEmail));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs[0].data() as RegisteredUserAccount;
    }
    return null;
  } catch {
    return null;
  }
}

export async function getFacilityHandlerProfileFromCloud(
  email?: string | null
): Promise<FacilityHandler | null> {
  if (!getVerifiedAuthUser() || !email) return null;
  try {
    const cleanEmail = email.trim().toLowerCase();
    const q = query(collection(db, COLLECTIONS.FACILITY_HANDLERS), where('email', '==', cleanEmail));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs[0].data() as FacilityHandler;
    }
    return null;
  } catch {
    return null;
  }
}

// ==========================================
// 1. INSTITUTIONS
// ==========================================
export async function getInstitutionsFromCloud(): Promise<Institution[] | null> {
  const user = getVerifiedAuthUser();
  if (!user) return null;
  try {
    const q = isBootstrappedSuperAdminEmail(user.email)
      ? collection(db, COLLECTIONS.INSTITUTIONS)
      : query(collection(db, COLLECTIONS.INSTITUTIONS), where('status', '==', 'active'));
    const snap = await getDocs(q);
    const items: Institution[] = [];
    snap.forEach((d) => items.push(d.data() as Institution));
    return items;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, COLLECTIONS.INSTITUTIONS);
  }
}

export async function saveInstitutionToCloud(inst: Institution): Promise<void> {
  if (!getVerifiedAuthUser()) return;
  const path = `${COLLECTIONS.INSTITUTIONS}/${inst.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.INSTITUTIONS, inst.id), inst, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// ==========================================
// 2. FACILITIES
// ==========================================
export async function getFacilitiesFromCloud(): Promise<Facility[] | null> {
  if (!getVerifiedAuthUser()) return null;
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.FACILITIES));
    const items: Facility[] = [];
    snap.forEach((d) => items.push(d.data() as Facility));
    return items;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, COLLECTIONS.FACILITIES);
  }
}

export async function saveFacilityToCloud(fac: Facility): Promise<void> {
  if (!getVerifiedAuthUser()) return;
  const path = `${COLLECTIONS.FACILITIES}/${fac.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.FACILITIES, fac.id), fac, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function deleteFacilityFromCloud(facilityId: string): Promise<void> {
  if (!getVerifiedAuthUser()) return;
  const path = `${COLLECTIONS.FACILITIES}/${facilityId}`;
  try {
    await deleteDoc(doc(db, COLLECTIONS.FACILITIES, facilityId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// ==========================================
// 3. BOOKINGS (Authenticated & Scoped Queries)
// ==========================================
export async function getBookingsFromCloud(): Promise<BookingRequest[] | null> {
  const user = getVerifiedAuthUser();
  if (!user) return null;
  try {
    const email = (user.email || '').trim().toLowerCase();
    const q = isBootstrappedSuperAdminEmail(email)
      ? collection(db, COLLECTIONS.BOOKINGS)
      : query(collection(db, COLLECTIONS.BOOKINGS), where('requesterEmail', '==', email));
    const snap = await getDocs(q);
    const items: BookingRequest[] = [];
    snap.forEach((d) => items.push(d.data() as BookingRequest));
    return items;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, COLLECTIONS.BOOKINGS);
  }
}

export async function saveBookingToCloud(booking: BookingRequest): Promise<void> {
  const user = getVerifiedAuthUser();
  if (!user) return;
  const path = `${COLLECTIONS.BOOKINGS}/${booking.id}`;
  try {
    const payload = {
      ...booking,
      uid: user.uid,
    };
    await setDoc(doc(db, COLLECTIONS.BOOKINGS, booking.id), payload, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function deleteBookingFromCloud(bookingId: string): Promise<void> {
  if (!getVerifiedAuthUser()) return;
  const path = `${COLLECTIONS.BOOKINGS}/${bookingId}`;
  try {
    await deleteDoc(doc(db, COLLECTIONS.BOOKINGS, bookingId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// ==========================================
// 4. INSTITUTIONAL REGISTRATIONS (Public Intake Create; Super-Admin List)
// ==========================================
export async function getRegistrationsFromCloud(): Promise<InstitutionalRegistrationRequest[] | null> {
  const user = getVerifiedAuthUser();
  if (!user || !isBootstrappedSuperAdminEmail(user.email)) return null;
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.REGISTRATIONS));
    const items: InstitutionalRegistrationRequest[] = [];
    snap.forEach((d) => items.push(d.data() as InstitutionalRegistrationRequest));
    return items;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, COLLECTIONS.REGISTRATIONS);
  }
}

export async function saveRegistrationToCloud(reg: InstitutionalRegistrationRequest): Promise<void> {
  const path = `${COLLECTIONS.REGISTRATIONS}/${reg.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.REGISTRATIONS, reg.id), reg, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// ==========================================
// 5. DEMO REQUESTS (Public Intake Create; Super-Admin List)
// ==========================================
export async function getDemoRequestsFromCloud(): Promise<InstitutionalDemoRequest[] | null> {
  const user = getVerifiedAuthUser();
  if (!user || !isBootstrappedSuperAdminEmail(user.email)) return null;
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.DEMO_REQUESTS));
    const items: InstitutionalDemoRequest[] = [];
    snap.forEach((d) => items.push(d.data() as InstitutionalDemoRequest));
    return items;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, COLLECTIONS.DEMO_REQUESTS);
  }
}

export async function saveDemoRequestToCloud(demo: InstitutionalDemoRequest): Promise<void> {
  const path = `${COLLECTIONS.DEMO_REQUESTS}/${demo.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.DEMO_REQUESTS, demo.id), demo, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// ==========================================
// 6. REGISTERED USERS (Strict Self / Admin Scoped Queries)
// ==========================================
export async function getUsersFromCloud(): Promise<RegisteredUserAccount[] | null> {
  const user = getVerifiedAuthUser();
  if (!user) return null;
  try {
    const email = (user.email || '').trim().toLowerCase();
    const q = isBootstrappedSuperAdminEmail(email)
      ? collection(db, COLLECTIONS.USERS)
      : query(collection(db, COLLECTIONS.USERS), where('email', '==', email));
    const snap = await getDocs(q);
    const items: RegisteredUserAccount[] = [];
    snap.forEach((d) => items.push(d.data() as RegisteredUserAccount));
    return items;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, COLLECTIONS.USERS);
  }
}

export async function saveUserToCloud(userAccount: RegisteredUserAccount): Promise<void> {
  const user = getVerifiedAuthUser();
  if (!user) return;
  const path = `${COLLECTIONS.USERS}/${userAccount.id}`;
  try {
    const payload = {
      ...userAccount,
      uid: user.uid,
    };
    await setDoc(doc(db, COLLECTIONS.USERS, userAccount.id), payload, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// ==========================================
// 7. PLATFORM SETTINGS
// ==========================================
export async function getSettingsFromCloud(): Promise<PlatformSettings | null> {
  if (!getVerifiedAuthUser()) return null;
  const path = `${COLLECTIONS.SETTINGS}/global`;
  try {
    const snap = await getDoc(doc(db, COLLECTIONS.SETTINGS, 'global'));
    return snap.exists() ? (snap.data() as PlatformSettings) : null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}

export async function saveSettingsToCloud(settings: PlatformSettings): Promise<void> {
  if (!getVerifiedAuthUser()) return;
  const path = `${COLLECTIONS.SETTINGS}/global`;
  try {
    await setDoc(doc(db, COLLECTIONS.SETTINGS, 'global'), { ...settings, id: 'global' }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// ==========================================
// 8. FACILITY HANDLERS (Dedicated Collection)
// ==========================================
export async function getFacilityHandlersFromCloud(): Promise<FacilityHandler[] | null> {
  const user = getVerifiedAuthUser();
  if (!user) return null;
  try {
    const email = (user.email || '').trim().toLowerCase();
    const q = isBootstrappedSuperAdminEmail(email)
      ? collection(db, COLLECTIONS.FACILITY_HANDLERS)
      : query(collection(db, COLLECTIONS.FACILITY_HANDLERS), where('email', '==', email));
    const snap = await getDocs(q);
    const items: FacilityHandler[] = [];
    snap.forEach((d) => items.push(d.data() as FacilityHandler));
    return items;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, COLLECTIONS.FACILITY_HANDLERS);
  }
}

export async function saveFacilityHandlerToCloud(handler: FacilityHandler): Promise<void> {
  if (!getVerifiedAuthUser()) return;
  const path = `${COLLECTIONS.FACILITY_HANDLERS}/${handler.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.FACILITY_HANDLERS, handler.id), handler, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function saveFacilityHandlersToCloud(handlers: FacilityHandler[]): Promise<void> {
  if (!getVerifiedAuthUser()) return;
  for (const handler of handlers) {
    await saveFacilityHandlerToCloud(handler);
  }
}

export async function deleteFacilityHandlerFromCloud(handlerId: string): Promise<void> {
  if (!getVerifiedAuthUser()) return;
  const path = `${COLLECTIONS.FACILITY_HANDLERS}/${handlerId}`;
  try {
    await deleteDoc(doc(db, COLLECTIONS.FACILITY_HANDLERS, handlerId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// ==========================================
// 9. FACILITY ASSIGNMENTS (Dedicated Collection)
// ==========================================
export async function getFacilityAssignmentsFromCloud(): Promise<FacilityAssignment[] | null> {
  const user = getVerifiedAuthUser();
  if (!user) return null;
  try {
    const email = (user.email || '').trim().toLowerCase();
    const q = isBootstrappedSuperAdminEmail(email)
      ? collection(db, COLLECTIONS.FACILITY_ASSIGNMENTS)
      : query(collection(db, COLLECTIONS.FACILITY_ASSIGNMENTS), where('handlerEmail', '==', email));
    const snap = await getDocs(q);
    const items: FacilityAssignment[] = [];
    snap.forEach((d) => items.push(d.data() as FacilityAssignment));
    return items;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, COLLECTIONS.FACILITY_ASSIGNMENTS);
  }
}

export async function saveFacilityAssignmentToCloud(asgn: FacilityAssignment): Promise<void> {
  if (!getVerifiedAuthUser()) return;
  const path = `${COLLECTIONS.FACILITY_ASSIGNMENTS}/${asgn.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.FACILITY_ASSIGNMENTS, asgn.id), asgn, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function deleteFacilityAssignmentFromCloud(assignmentId: string): Promise<void> {
  if (!getVerifiedAuthUser()) return;
  const path = `${COLLECTIONS.FACILITY_ASSIGNMENTS}/${assignmentId}`;
  try {
    await deleteDoc(doc(db, COLLECTIONS.FACILITY_ASSIGNMENTS, assignmentId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// ==========================================
// 10. FACILITY APPROVAL LOGS (Dedicated Immutable Audit Collection)
// ==========================================
export async function getFacilityApprovalLogsFromCloud(): Promise<FacilityApprovalLog[] | null> {
  const user = getVerifiedAuthUser();
  if (!user) return null;
  try {
    const q = isBootstrappedSuperAdminEmail(user.email)
      ? collection(db, COLLECTIONS.FACILITY_APPROVAL_LOGS)
      : query(collection(db, COLLECTIONS.FACILITY_APPROVAL_LOGS), where('handlerUserId', '==', user.uid));
    const snap = await getDocs(q);
    const items: FacilityApprovalLog[] = [];
    snap.forEach((d) => items.push(d.data() as FacilityApprovalLog));
    return items;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, COLLECTIONS.FACILITY_APPROVAL_LOGS);
  }
}

export async function saveFacilityApprovalLogToCloud(log: FacilityApprovalLog): Promise<void> {
  if (!getVerifiedAuthUser()) return;
  const path = `${COLLECTIONS.FACILITY_APPROVAL_LOGS}/${log.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.FACILITY_APPROVAL_LOGS, log.id), log);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

// ==========================================
// 11. AI WORKFLOWS, AUTOMATION JOBS & DISPATCH LOGS (Super-Admin Only)
// ==========================================
export async function getAIWorkflowsFromCloud(): Promise<AIWorkflowDefinition[] | null> {
  const user = getVerifiedAuthUser();
  if (!user || !isBootstrappedSuperAdminEmail(user.email)) return null;
  const path = `${COLLECTIONS.SETTINGS}/ai_workflows`;
  try {
    const snap = await getDoc(doc(db, COLLECTIONS.SETTINGS, 'ai_workflows'));
    if (snap.exists() && Array.isArray(snap.data()?.items)) {
      return snap.data().items as AIWorkflowDefinition[];
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}

export async function saveAIWorkflowsToCloud(workflows: AIWorkflowDefinition[]): Promise<void> {
  const user = getVerifiedAuthUser();
  if (!user || !isBootstrappedSuperAdminEmail(user.email)) return;
  const path = `${COLLECTIONS.SETTINGS}/ai_workflows`;
  try {
    await setDoc(
      doc(db, COLLECTIONS.SETTINGS, 'ai_workflows'),
      {
        id: 'ai_workflows',
        items: workflows,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function getAIAutomationJobsFromCloud(): Promise<AIAutomationJob[] | null> {
  const user = getVerifiedAuthUser();
  if (!user || !isBootstrappedSuperAdminEmail(user.email)) return null;
  const path = `${COLLECTIONS.SETTINGS}/ai_automation_jobs`;
  try {
    const snap = await getDoc(doc(db, COLLECTIONS.SETTINGS, 'ai_automation_jobs'));
    if (snap.exists() && Array.isArray(snap.data()?.items)) {
      return snap.data().items as AIAutomationJob[];
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}

export async function saveAIAutomationJobsToCloud(jobs: AIAutomationJob[]): Promise<void> {
  const user = getVerifiedAuthUser();
  if (!user || !isBootstrappedSuperAdminEmail(user.email)) return;
  const path = `${COLLECTIONS.SETTINGS}/ai_automation_jobs`;
  try {
    await setDoc(
      doc(db, COLLECTIONS.SETTINGS, 'ai_automation_jobs'),
      {
        id: 'ai_automation_jobs',
        items: jobs.slice(0, 100),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function getEmailDeliveryRecordsFromCloud(): Promise<EmailDeliveryRecord[] | null> {
  const user = getVerifiedAuthUser();
  if (!user || !isBootstrappedSuperAdminEmail(user.email)) return null;
  const path = `${COLLECTIONS.SETTINGS}/email_delivery_records`;
  try {
    const snap = await getDoc(doc(db, COLLECTIONS.SETTINGS, 'email_delivery_records'));
    if (snap.exists() && Array.isArray(snap.data()?.items)) {
      return snap.data().items as EmailDeliveryRecord[];
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}

export async function saveEmailDeliveryRecordsToCloud(records: EmailDeliveryRecord[]): Promise<void> {
  const user = getVerifiedAuthUser();
  if (!user || !isBootstrappedSuperAdminEmail(user.email)) return;
  const path = `${COLLECTIONS.SETTINGS}/email_delivery_records`;
  try {
    await setDoc(
      doc(db, COLLECTIONS.SETTINGS, 'email_delivery_records'),
      {
        id: 'email_delivery_records',
        items: records.slice(0, 100),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// ==========================================
// INITIAL DATABASE SEEDER (Super-Admin Only)
// ==========================================
export async function seedFirestoreIfEmpty(): Promise<{ seeded: boolean; count: number }> {
  const user = getVerifiedAuthUser();
  if (!user || !isBootstrappedSuperAdminEmail(user.email)) {
    return { seeded: false, count: 0 };
  }
  try {
    const existingInstitutions = await getDocs(collection(db, COLLECTIONS.INSTITUTIONS));
    if (!existingInstitutions.empty) {
      return { seeded: false, count: existingInstitutions.size };
    }

    for (const inst of DEMO_INSTITUTIONS) {
      await setDoc(doc(db, COLLECTIONS.INSTITUTIONS, inst.id), inst);
    }
    for (const fac of INITIAL_FACILITIES) {
      await setDoc(doc(db, COLLECTIONS.FACILITIES, fac.id), fac);
    }
    for (const b of INITIAL_BOOKINGS) {
      await setDoc(doc(db, COLLECTIONS.BOOKINGS, b.id), b);
    }
    for (const h of INITIAL_FACILITY_HANDLERS) {
      await setDoc(doc(db, COLLECTIONS.FACILITY_HANDLERS, h.id), h);
    }
    for (const a of INITIAL_FACILITY_ASSIGNMENTS) {
      await setDoc(doc(db, COLLECTIONS.FACILITY_ASSIGNMENTS, a.id), a);
    }

    return {
      seeded: true,
      count: DEMO_INSTITUTIONS.length + INITIAL_FACILITIES.length + INITIAL_BOOKINGS.length,
    };
  } catch (err) {
    console.warn('Firestore initial seeding deferred:', err);
    return { seeded: false, count: 0 };
  }
}
