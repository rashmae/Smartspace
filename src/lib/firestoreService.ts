import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import {
  Institution,
  Facility,
  BookingRequest,
  InstitutionalRegistrationRequest,
  InstitutionalDemoRequest,
  RegisteredUserAccount,
  PlatformSettings,
} from '../types';
import {
  DEMO_INSTITUTIONS,
  INITIAL_FACILITIES,
  INITIAL_BOOKINGS,
} from '../data/initialData';

const COLLECTIONS = {
  INSTITUTIONS: 'institutions',
  FACILITIES: 'facilities',
  BOOKINGS: 'bookings',
  REGISTRATIONS: 'institutionalRegistrations',
  DEMO_REQUESTS: 'demoRequests',
  USERS: 'registeredUsers',
  SETTINGS: 'platformSettings',
};

// ==========================================
// 1. INSTITUTIONS
// ==========================================
export async function getInstitutionsFromCloud(): Promise<Institution[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.INSTITUTIONS));
    const items: Institution[] = [];
    snap.forEach((d) => items.push(d.data() as Institution));
    return items;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, COLLECTIONS.INSTITUTIONS);
  }
}

export async function saveInstitutionToCloud(inst: Institution): Promise<void> {
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
export async function getFacilitiesFromCloud(): Promise<Facility[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.FACILITIES));
    const items: Facility[] = [];
    snap.forEach((d) => items.push(d.data() as Facility));
    return items;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, COLLECTIONS.FACILITIES);
  }
}

export async function saveFacilityToCloud(fac: Facility): Promise<void> {
  const path = `${COLLECTIONS.FACILITIES}/${fac.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.FACILITIES, fac.id), fac, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function deleteFacilityFromCloud(facilityId: string): Promise<void> {
  const path = `${COLLECTIONS.FACILITIES}/${facilityId}`;
  try {
    await deleteDoc(doc(db, COLLECTIONS.FACILITIES, facilityId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// ==========================================
// 3. BOOKINGS
// ==========================================
export async function getBookingsFromCloud(): Promise<BookingRequest[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.BOOKINGS));
    const items: BookingRequest[] = [];
    snap.forEach((d) => items.push(d.data() as BookingRequest));
    return items;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, COLLECTIONS.BOOKINGS);
  }
}

export async function saveBookingToCloud(booking: BookingRequest): Promise<void> {
  const path = `${COLLECTIONS.BOOKINGS}/${booking.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.BOOKINGS, booking.id), booking, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function deleteBookingFromCloud(bookingId: string): Promise<void> {
  const path = `${COLLECTIONS.BOOKINGS}/${bookingId}`;
  try {
    await deleteDoc(doc(db, COLLECTIONS.BOOKINGS, bookingId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// ==========================================
// 4. INSTITUTIONAL REGISTRATIONS
// ==========================================
export async function getRegistrationsFromCloud(): Promise<InstitutionalRegistrationRequest[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.REGISTRATIONS));
    const items: InstitutionalRegistrationRequest[] = [];
    snap.forEach((d) => items.push(d.data() as InstitutionalRegistrationRequest));
    return items;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, COLLECTIONS.REGISTRATIONS);
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
// 5. DEMO REQUESTS
// ==========================================
export async function getDemoRequestsFromCloud(): Promise<InstitutionalDemoRequest[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.DEMO_REQUESTS));
    const items: InstitutionalDemoRequest[] = [];
    snap.forEach((d) => items.push(d.data() as InstitutionalDemoRequest));
    return items;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, COLLECTIONS.DEMO_REQUESTS);
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
// 6. REGISTERED USERS
// ==========================================
export async function getUsersFromCloud(): Promise<RegisteredUserAccount[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.USERS));
    const items: RegisteredUserAccount[] = [];
    snap.forEach((d) => items.push(d.data() as RegisteredUserAccount));
    return items;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, COLLECTIONS.USERS);
  }
}

export async function saveUserToCloud(user: RegisteredUserAccount): Promise<void> {
  const path = `${COLLECTIONS.USERS}/${user.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.USERS, user.id), user, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// ==========================================
// 7. PLATFORM SETTINGS
// ==========================================
export async function getSettingsFromCloud(): Promise<PlatformSettings | null> {
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.SETTINGS));
    let settings: PlatformSettings | null = null;
    snap.forEach((d) => {
      settings = d.data() as PlatformSettings;
    });
    return settings;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, COLLECTIONS.SETTINGS);
  }
}

export async function saveSettingsToCloud(settings: PlatformSettings): Promise<void> {
  const path = `${COLLECTIONS.SETTINGS}/global`;
  try {
    await setDoc(doc(db, COLLECTIONS.SETTINGS, 'global'), { ...settings, id: 'global' }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// ==========================================
// INITIAL DATABASE SEEDER
// ==========================================
export async function seedFirestoreIfEmpty(): Promise<{ seeded: boolean; count: number }> {
  try {
    const existingInstitutions = await getDocs(collection(db, COLLECTIONS.INSTITUTIONS));
    if (!existingInstitutions.empty) {
      return { seeded: false, count: existingInstitutions.size };
    }

    // Seed institutions
    for (const inst of DEMO_INSTITUTIONS) {
      await setDoc(doc(db, COLLECTIONS.INSTITUTIONS, inst.id), inst);
    }

    // Seed facilities
    for (const fac of INITIAL_FACILITIES) {
      await setDoc(doc(db, COLLECTIONS.FACILITIES, fac.id), fac);
    }

    // Seed bookings
    for (const b of INITIAL_BOOKINGS) {
      await setDoc(doc(db, COLLECTIONS.BOOKINGS, b.id), b);
    }

    return { seeded: true, count: DEMO_INSTITUTIONS.length + INITIAL_FACILITIES.length + INITIAL_BOOKINGS.length };
  } catch (err) {
    console.warn('Firestore initial seeding deferred or permissions pending:', err);
    return { seeded: false, count: 0 };
  }
}
