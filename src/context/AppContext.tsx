import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  UserRole,
  Institution,
  Facility,
  BookingRequest,
  ParticipantRecord,
  TaskObservation,
  OpenEndedResponses,
  ParticipantRating,
  InstitutionalRegistrationRequest,
  InstitutionalDemoRequest,
  RegisteredUserAccount,
  PlatformSettings,
} from '../types';
import { formatTo12Hour } from '../utils/timeFormat';
import {
  DEMO_INSTITUTIONS,
  INITIAL_FACILITIES,
  INITIAL_BOOKINGS,
  INITIAL_PARTICIPANTS,
} from '../data/initialData';
import {
  getInstitutionsFromCloud,
  saveInstitutionToCloud,
  getFacilitiesFromCloud,
  saveFacilityToCloud,
  deleteFacilityFromCloud,
  getBookingsFromCloud,
  saveBookingToCloud,
  deleteBookingFromCloud,
  getRegistrationsFromCloud,
  saveRegistrationToCloud,
  getDemoRequestsFromCloud,
  saveDemoRequestToCloud,
  getUsersFromCloud,
  saveUserToCloud,
  getSettingsFromCloud,
  saveSettingsToCloud,
  seedFirestoreIfEmpty,
} from '../lib/firestoreService';

export type AppView = 
  | 'landing'
  | 'auth'
  | 'facilities'
  | 'new-booking'
  | 'my-bookings'
  | 'admin-requests'
  | 'admin-facilities'
  | 'admin-records'
  | 'reports'
  | 'super-admin'
  | 'usability-testing';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}

export interface DemoUserSession {
  name: string;
  email: string;
  role: UserRole;
  organization: string;
}

export interface AuthFlowState {
  audience: 'selection' | 'institution' | 'user' | 'super_admin';
  tab: 'login' | 'register';
  highlight: 'login' | 'demo';
}

interface AppContextType {
  // Navigation & Auth
  isLoggedIn: boolean;
  currentUser: DemoUserSession | null;
  loginAs: (role: UserRole, email?: string, name?: string) => void;
  logout: () => void;
  currentInstitution: Institution;
  allInstitutions: Institution[];
  setInstitutionId: (id: string) => void;
  addInstitution: (inst: Omit<Institution, 'id' | 'registeredAt'>) => { success: boolean; institution?: Institution; error?: string };
  updateInstitution: (id: string, updates: Partial<Institution>) => void;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  activeView: AppView;
  setActiveView: (view: AppView) => void;
  selectedFacility: Facility | null;
  setSelectedFacility: (facility: Facility | null) => void;

  // Dedicated Access Portal & Authentication Flow
  authFlowState: AuthFlowState;
  setAuthFlowState: React.Dispatch<React.SetStateAction<AuthFlowState>>;
  openAuthPortal: (
    audience?: 'selection' | 'institution' | 'user' | 'super_admin',
    tab?: 'login' | 'register',
    highlight?: 'login' | 'demo'
  ) => void;
  isDemoModalOpen: boolean;
  setIsDemoModalOpen: (open: boolean) => void;

  // Institutional Registration & Demo Inquiries
  institutionalRegistrations: InstitutionalRegistrationRequest[];
  submitInstitutionalRegistration: (data: {
    institutionName: string;
    institutionType: 'Public University' | 'Private University' | 'College' | 'Other';
    officialEmail: string;
    contactPerson: string;
    contactNumber: string;
    password?: string;
  }) => { success: boolean; message: string; error?: string };
  approveInstitutionalRegistration: (requestId: string) => { success: boolean; error?: string };
  rejectInstitutionalRegistration: (requestId: string, reason: string) => { success: boolean; error?: string };

  demoRequests: InstitutionalDemoRequest[];
  submitDemoRequest: (data: {
    institutionName: string;
    contactName: string;
    contactEmail: string;
    contactNumber: string;
    designation: string;
    estimatedFacilities: string;
    preferredDate?: string;
    message?: string;
  }) => { success: boolean; message: string; error?: string };

  // User Accounts & Authentication
  registeredUsers: RegisteredUserAccount[];
  registerUserAccount: (data: {
    fullName: string;
    email: string;
    institutionId: string;
    userType: RegisteredUserAccount['userType'];
    organizationOrDept: string;
    password?: string;
  }) => { success: boolean; user?: RegisteredUserAccount; error?: string };
  loginWithCredentials: (
    email: string,
    password: string,
    portalType: 'institution' | 'user' | 'super_admin'
  ) => { success: boolean; error?: string };
  updateUserAccountStatus: (userId: string, status: 'active' | 'suspended') => void;
  updateUserAccountRole: (userId: string, role: UserRole) => void;

  // Platform Settings & Configuration
  platformSettings: PlatformSettings;
  updatePlatformSettings: (updates: Partial<PlatformSettings>) => void;

  // Cloud Storage (Firebase Firestore)
  cloudSyncStatus: 'idle' | 'syncing' | 'synced' | 'offline';
  syncWithFirestore: () => Promise<void>;

  // Facilities & Management
  allFacilities: Facility[];
  institutionFacilities: Facility[];
  addFacility: (facility: Omit<Facility, 'id'>) => { success: boolean; facility?: Facility; error?: string };
  updateFacility: (id: string, updates: Partial<Facility>) => void;
  deleteFacility: (id: string) => void;

  // Bookings
  allBookings: BookingRequest[];
  institutionBookings: BookingRequest[];
  userBookings: BookingRequest[];
  checkTimeConflict: (
    facilityId: string,
    date: string,
    startTime: string,
    endTime: string,
    excludeBookingId?: string
  ) => { hasConflict: boolean; conflictingBooking?: BookingRequest };
  submitBooking: (data: {
    facilityId: string;
    eventName: string;
    purpose: string;
    date: string;
    startTime: string;
    endTime: string;
    attendees: number;
    requesterName: string;
    requesterRole: 'Student' | 'Faculty';
    requesterEmail: string;
    organization?: string;
    notes?: string;
  }) => { success: boolean; booking?: BookingRequest; error?: string };
  approveBooking: (bookingId: string) => { success: boolean; error?: string };
  rejectBooking: (bookingId: string, reason: string) => { success: boolean; error?: string };
  cancelBooking: (bookingId: string) => void;
  resetBookingsToDefault: () => void;

  // Usability Testing
  participants: ParticipantRecord[];
  activeParticipantId: number;
  setActiveParticipantId: (id: number) => void;
  activeParticipant: ParticipantRecord;
  updateTaskObservation: (
    participantId: number,
    taskId: number,
    updates: Partial<TaskObservation>
  ) => void;
  updateOpenEnded: (
    participantId: number,
    updates: Partial<OpenEndedResponses>
  ) => void;
  updateRatings: (
    participantId: number,
    updates: Partial<ParticipantRating>
  ) => void;
  updateParticipantInfo: (
    participantId: number,
    userType: 'Student' | 'Faculty' | 'Staff',
    dept: string
  ) => void;
  updateParticipantNotes: (
    participantId: number,
    testerNotes: string,
    interviewSummary: string
  ) => void;
  resetParticipantsToDefault: () => void;
  exportValidationDataCsv: () => void;

  // Toast notifications
  toasts: ToastMessage[];
  addToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => void;
  removeToast: (id: string) => void;

  // Prototype Disclaimer Info
  disclaimerDismissed: boolean;
  setDisclaimerDismissed: (d: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const BOOKINGS_STORAGE_KEY = 'smartspace_mvp_bookings_v3';
const PARTICIPANTS_STORAGE_KEY = 'smartspace_mvp_participants_v3';
const INSTITUTION_STORAGE_KEY = 'smartspace_mvp_active_institution_v3';
const AUTH_STORAGE_KEY = 'smartspace_mvp_auth_session_v3';
const INST_REGISTRATIONS_KEY = 'smartspace_mvp_inst_registrations_v4';
const DEMO_REQUESTS_KEY = 'smartspace_mvp_demo_requests_v4';
const REGISTERED_USERS_KEY = 'smartspace_mvp_registered_users_v4';

const DEFAULT_INST_REGISTRATIONS: InstitutionalRegistrationRequest[] = [
  {
    id: 'req-swu-phinma',
    institutionName: 'Southwestern University PHINMA',
    institutionType: 'Private University',
    officialEmail: 'facilities.admin@swu.edu.ph',
    contactPerson: 'Dr. Cheryl Gantuangco (VP Administration)',
    contactNumber: '+63 (32) 415-5555',
    submittedAt: '2026-10-28',
    status: 'pending',
    assignedAdminName: 'Engr. Michael Alcantara',
    assignedAdminEmail: 'facilities.admin@swu.edu.ph',
    notes: 'Urgent need to centralize 4 campus gymnasiums and medical simulation labs.',
  },
  {
    id: 'req-cnu-main',
    institutionName: 'Cebu Normal University',
    institutionType: 'Public University',
    officialEmail: 'procurement.facilities@cnu.edu.ph',
    contactPerson: 'Prof. Reynaldo Inocian',
    contactNumber: '+63 (32) 254-1456',
    submittedAt: '2026-10-29',
    status: 'pending',
    assignedAdminName: 'Arch. Gina Dela Torre',
    assignedAdminEmail: 'procurement.facilities@cnu.edu.ph',
    notes: 'Inquiry for State University facility reservation compliance and audit tracking.',
  },
];

const DEFAULT_DEMO_REQUESTS: InstitutionalDemoRequest[] = [
  {
    id: 'demo-uv-cebu',
    institutionName: 'University of the Visayas',
    contactName: 'Atty. Paulino Yabao',
    contactEmail: 'administration@uv.edu.ph',
    contactNumber: '+63 (32) 255-2566',
    designation: 'Vice President for Administration',
    estimatedFacilities: '25-50 Spaces across 3 satellite campuses',
    preferredDate: '2026-11-05',
    message: 'Seeking a platform to eliminate paper request slips across our downtown and Gullas medical campuses.',
    submittedAt: '2026-10-29',
    status: 'new',
  },
];

const DEFAULT_REGISTERED_USERS: RegisteredUserAccount[] = [
  {
    id: 'user-juan-ctu',
    fullName: 'Juan Dela Cruz',
    email: 'juan.delacruz@ctu.edu.ph',
    institutionId: 'ctu-main',
    userType: 'Student Organization Officer',
    organizationOrDept: 'Supreme Student Government (SSG)',
    role: 'student',
    createdAt: '2026-02-01',
    status: 'active',
  },
  {
    id: 'user-maria-ctu',
    fullName: 'Dr. Maria Fernandez',
    email: 'maria.fernandez@ctu.edu.ph',
    institutionId: 'ctu-main',
    userType: 'Faculty Member',
    organizationOrDept: 'College of Technology / Computer Studies',
    role: 'faculty',
    createdAt: '2026-02-05',
    status: 'active',
  },
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Authentication & Session
  const [currentUser, setCurrentUser] = useState<DemoUserSession | null>(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse auth session:', e);
    }
    return null;
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return !!localStorage.getItem(AUTH_STORAGE_KEY);
  });

  // Active institution
  const [institutionId, setInstitutionIdState] = useState<string>(() => {
    return localStorage.getItem(INSTITUTION_STORAGE_KEY) || 'ctu-main';
  });

  // Active Role
  const [currentRole, setCurrentRole] = useState<UserRole>(currentUser?.role || 'student');

  // Active View
  const [activeView, setActiveView] = useState<AppView>('facilities');

  // Dedicated Access Portal & Authentication Flow State
  const [authFlowState, setAuthFlowState] = useState<AuthFlowState>({
    audience: 'selection',
    tab: 'login',
    highlight: 'login',
  });

  const [isDemoModalOpen, setIsDemoModalOpen] = useState<boolean>(false);

  const openAuthPortal = (
    audience: 'selection' | 'institution' | 'user' | 'super_admin' = 'selection',
    tab: 'login' | 'register' = 'login',
    highlight: 'login' | 'demo' = 'login'
  ) => {
    setAuthFlowState({ audience, tab, highlight });
    setActiveView('auth');
  };

  // Institutional Registration Requests State
  const [institutionalRegistrations, setInstitutionalRegistrations] = useState<InstitutionalRegistrationRequest[]>(() => {
    try {
      const stored = localStorage.getItem(INST_REGISTRATIONS_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to parse institutional registrations:', e);
    }
    return DEFAULT_INST_REGISTRATIONS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(INST_REGISTRATIONS_KEY, JSON.stringify(institutionalRegistrations));
    } catch (e) {
      console.warn('Failed to save institutional registrations:', e);
    }
  }, [institutionalRegistrations]);

  // Demo Inquiries State
  const [demoRequests, setDemoRequests] = useState<InstitutionalDemoRequest[]>(() => {
    try {
      const stored = localStorage.getItem(DEMO_REQUESTS_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to parse demo requests:', e);
    }
    return DEFAULT_DEMO_REQUESTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(DEMO_REQUESTS_KEY, JSON.stringify(demoRequests));
    } catch (e) {
      console.warn('Failed to save demo requests:', e);
    }
  }, [demoRequests]);

  // Registered End Users State
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUserAccount[]>(() => {
    try {
      const stored = localStorage.getItem(REGISTERED_USERS_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to parse registered users:', e);
    }
    return DEFAULT_REGISTERED_USERS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(registeredUsers));
    } catch (e) {
      console.warn('Failed to save registered users:', e);
    }
  }, [registeredUsers]);

  // Platform Settings & Configuration
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>(() => {
    try {
      const stored = localStorage.getItem('smartspace_mvp_platform_settings_v4');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to parse platform settings:', e);
    }
    return {
      platformName: 'SmartSpace',
      platformTagline: 'University Facility Booking & Resource Management Platform',
      primaryColor: '#0284c7',
      globalAnnouncement: 'Centralized multi-university facility discovery is active. Cross-campus requests are routed to host institution administrators.',
      allowCrossUniversityDiscovery: true,
      defaultAdvanceBookingDays: 30,
      requireInstitutionalEmailVerification: true,
      autoConflictDetection: true,
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem('smartspace_mvp_platform_settings_v4', JSON.stringify(platformSettings));
    } catch (e) {
      console.warn('Failed to save platform settings:', e);
    }
  }, [platformSettings]);

  const [cloudSyncStatus, setCloudSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'offline'>('idle');

  // Firestore Cloud Synchronization
  const syncWithFirestore = async () => {
    try {
      setCloudSyncStatus('syncing');
      await seedFirestoreIfEmpty();

      const [cloudInsts, cloudFacs, cloudBookings, cloudRegs, cloudDemos, cloudUsers, cloudSettings] = await Promise.all([
        getInstitutionsFromCloud().catch(() => null),
        getFacilitiesFromCloud().catch(() => null),
        getBookingsFromCloud().catch(() => null),
        getRegistrationsFromCloud().catch(() => null),
        getDemoRequestsFromCloud().catch(() => null),
        getUsersFromCloud().catch(() => null),
        getSettingsFromCloud().catch(() => null),
      ]);

      if (cloudInsts && cloudInsts.length > 0) {
        setInstitutions(cloudInsts);
      }
      if (cloudFacs && cloudFacs.length > 0) {
        setFacilities(cloudFacs);
      }
      if (cloudBookings && cloudBookings.length > 0) {
        setBookings(cloudBookings);
      }
      if (cloudRegs && cloudRegs.length > 0) {
        setInstitutionalRegistrations(cloudRegs);
      }
      if (cloudDemos && cloudDemos.length > 0) {
        setDemoRequests(cloudDemos);
      }
      if (cloudUsers && cloudUsers.length > 0) {
        setRegisteredUsers(cloudUsers);
      }
      if (cloudSettings) {
        setPlatformSettings(cloudSettings);
      }

      setCloudSyncStatus('synced');
    } catch (err) {
      console.warn('Firestore initial sync:', err);
      setCloudSyncStatus('offline');
    }
  };

  useEffect(() => {
    syncWithFirestore();
  }, []);

  const updatePlatformSettings = (updates: Partial<PlatformSettings>) => {
    const updated = { ...platformSettings, ...updates };
    setPlatformSettings(updated);
    saveSettingsToCloud(updated).catch((err) => console.warn('Cloud sync (settings):', err));
    addToast('success', 'Settings Updated', 'Platform configurations have been updated.');
  };

  const updateUserAccountStatus = (userId: string, status: 'active' | 'suspended') => {
    setRegisteredUsers((prev) => {
      const next = prev.map((u) => (u.id === userId ? { ...u, status } : u));
      const target = next.find((u) => u.id === userId);
      if (target) {
        saveUserToCloud(target).catch((err) => console.warn('Cloud sync (user status):', err));
      }
      return next;
    });
    addToast('info', 'User Status Updated', `User account status set to ${status}.`);
  };

  const updateUserAccountRole = (userId: string, role: UserRole) => {
    setRegisteredUsers((prev) => {
      const next = prev.map((u) => {
        if (u.id === userId) {
          const newUserType: RegisteredUserAccount['userType'] =
            role === 'faculty' ? 'Faculty Member' : 'Student Organization Officer';
          return { ...u, role, userType: newUserType };
        }
        return u;
      });
      const target = next.find((u) => u.id === userId);
      if (target) {
        saveUserToCloud(target).catch((err) => console.warn('Cloud sync (user role):', err));
      }
      return next;
    });
    addToast('info', 'User Role Updated', `User permissions updated.`);
  };

  // Selected facility for modal / prefilling
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);

  // Prototype banner state
  const [disclaimerDismissed, setDisclaimerDismissed] = useState<boolean>(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Institutions state
  const [institutions, setInstitutions] = useState<Institution[]>(() => {
    try {
      const stored = localStorage.getItem('smartspace_mvp_institutions_v4');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse stored institutions:', e);
    }
    return DEMO_INSTITUTIONS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('smartspace_mvp_institutions_v4', JSON.stringify(institutions));
    } catch (e) {
      console.warn('Failed to save institutions to localStorage:', e);
    }
  }, [institutions]);

  // Facilities state
  const [facilities, setFacilities] = useState<Facility[]>(() => {
    try {
      const stored = localStorage.getItem('smartspace_mvp_facilities_v4');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse stored facilities:', e);
    }
    return INITIAL_FACILITIES;
  });

  useEffect(() => {
    try {
      localStorage.setItem('smartspace_mvp_facilities_v4', JSON.stringify(facilities));
    } catch (e) {
      console.warn('Failed to save facilities to localStorage:', e);
    }
  }, [facilities]);

  // Login handler
  const loginAs = (role: UserRole, email?: string, name?: string) => {
    let userSession: DemoUserSession;
    if (role === 'super_admin') {
      userSession = {
        name: name || 'SmartSpace Platform Super Admin',
        email: email || 'superadmin@smartspace.ph',
        role: 'super_admin',
        organization: 'SmartSpace Platform Operations',
      };
      setCurrentRole('super_admin');
      setActiveView('super-admin');
    } else if (role === 'university_admin' || role === 'admin') {
      const activeInst = institutions.find((i) => i.id === institutionId) || institutions[0];
      userSession = {
        name: name || activeInst.assignedAdminName || 'Engr. R. Santos',
        email: email || activeInst.assignedAdminEmail || 'admin.facilities@ctu.edu.ph',
        role: 'university_admin',
        organization: `${activeInst.shortName} Facilities Office`,
      };
      setCurrentRole('university_admin');
      setActiveView('admin-requests');
    } else {
      userSession = {
        name: name || (role === 'faculty' ? 'Dr. Maria Fernandez' : 'Juan Dela Cruz'),
        email: email || (role === 'faculty' ? 'maria.fernandez@ctu.edu.ph' : 'juan.delacruz@ctu.edu.ph'),
        role,
        organization: role === 'faculty' ? 'College of Technology' : 'BS Information Technology',
      };
      setCurrentRole(role);
      setActiveView('facilities');
    }

    setCurrentUser(userSession);
    setIsLoggedIn(true);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userSession));
    } catch (e) {
      console.warn('Failed to save auth session:', e);
    }

    addToast(
      'success',
      'Signed In',
      `Signed in as ${userSession.name} (${role === 'super_admin' ? 'Super Admin' : role === 'university_admin' || role === 'admin' ? 'University Facility Admin' : 'Student / Faculty'}).`
    );
  };

  const logout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setActiveView('landing');
    addToast('info', 'Logged Out', 'You have been signed out of your SmartSpace account.');
  };

  // Dynamic institution & facility management
  const addInstitution = (instData: Omit<Institution, 'id' | 'registeredAt'>) => {
    const id = instData.shortName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.random().toString(36).substring(2, 6);
    const newInst: Institution = {
      ...instData,
      id,
      registeredAt: new Date().toISOString().split('T')[0],
      status: 'active',
    };
    setInstitutions((prev) => [newInst, ...prev]);
    saveInstitutionToCloud(newInst).catch((err) => console.warn('Cloud sync (addInstitution):', err));
    addToast('success', 'University Registered', `${newInst.name} enrolled onto SmartSpace.`);
    return { success: true, institution: newInst };
  };

  const updateInstitution = (id: string, updates: Partial<Institution>) => {
    setInstitutions((prev) => {
      const next = prev.map((inst) => (inst.id === id ? { ...inst, ...updates } : inst));
      const target = next.find((i) => i.id === id);
      if (target) {
        saveInstitutionToCloud(target).catch((err) => console.warn('Cloud sync (updateInstitution):', err));
      }
      return next;
    });
    addToast('info', 'University Updated', 'Institutional configuration and subscription details updated.');
  };

  const addFacility = (facData: Omit<Facility, 'id'>) => {
    const id = `${facData.institutionId}-fac-${Date.now().toString(36)}`;
    const newFacility: Facility = {
      ...facData,
      id,
    };
    setFacilities((prev) => [newFacility, ...prev]);
    saveFacilityToCloud(newFacility).catch((err) => console.warn('Cloud sync (addFacility):', err));
    addToast('success', 'Facility Added', `${newFacility.name} has been added to inventory.`);
    return { success: true, facility: newFacility };
  };

  const updateFacility = (id: string, updates: Partial<Facility>) => {
    setFacilities((prev) => {
      const next = prev.map((f) => (f.id === id ? { ...f, ...updates } : f));
      const target = next.find((f) => f.id === id);
      if (target) {
        saveFacilityToCloud(target).catch((err) => console.warn('Cloud sync (updateFacility):', err));
      }
      return next;
    });
    addToast('info', 'Facility Updated', 'Facility details and specifications saved.');
  };

  const deleteFacility = (id: string) => {
    setFacilities((prev) => prev.filter((f) => f.id !== id));
    deleteFacilityFromCloud(id).catch((err) => console.warn('Cloud sync (deleteFacility):', err));
    addToast('warning', 'Facility Removed', 'Facility was removed from inventory.');
  };

  // Institutional Registration Handler
  const submitInstitutionalRegistration = (data: {
    institutionName: string;
    institutionType: 'Public University' | 'Private University' | 'College' | 'Other';
    officialEmail: string;
    contactPerson: string;
    contactNumber: string;
    password?: string;
  }): { success: boolean; message: string; error?: string } => {
    const cleanEmail = data.officialEmail.trim().toLowerCase();
    if (!data.institutionName.trim()) {
      return { success: false, message: '', error: 'Institution name is required.' };
    }
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return { success: false, message: '', error: 'Please enter a valid official institutional email address.' };
    }
    if (!data.contactPerson.trim()) {
      return { success: false, message: '', error: 'Official contact person name is required.' };
    }
    if (!data.contactNumber.trim()) {
      return { success: false, message: '', error: 'Contact phone/telephone number is required.' };
    }

    // Check duplicate pending or active
    const existing = institutions.find(
      (i) => i.name.toLowerCase() === data.institutionName.trim().toLowerCase()
    );
    if (existing) {
      return {
        success: false,
        message: '',
        error: `An institutional workspace for "${existing.name}" is already registered on SmartSpace.`,
      };
    }

    const newRequest: InstitutionalRegistrationRequest = {
      id: `req-${Date.now().toString(36)}`,
      institutionName: data.institutionName.trim(),
      institutionType: data.institutionType,
      officialEmail: cleanEmail,
      contactPerson: data.contactPerson.trim(),
      contactNumber: data.contactNumber.trim(),
      submittedAt: new Date().toISOString().split('T')[0],
      status: 'pending',
      assignedAdminName: data.contactPerson.trim(),
      assignedAdminEmail: cleanEmail,
      notes: 'New institutional onboarding application submitted via SmartSpace Access Portal.',
    };

    setInstitutionalRegistrations((prev) => [newRequest, ...prev]);
    saveRegistrationToCloud(newRequest).catch((err) => console.warn('Cloud sync (registration):', err));
    addToast(
      'info',
      'Registration Submitted',
      'Your institutional application is under pending review. Platform administrator verification is required before activation.'
    );

    return {
      success: true,
      message:
        'Institutional registration received. In accordance with SmartSpace governance policies, a platform administrator will review and authorize your university credentials before workspace activation.',
    };
  };

  // Approve Institutional Registration (Super Admin Action)
  const approveInstitutionalRegistration = (requestId: string): { success: boolean; error?: string } => {
    const req = institutionalRegistrations.find((r) => r.id === requestId);
    if (!req) return { success: false, error: 'Registration request not found.' };

    const words = req.institutionName.split(' ').filter((w) => w.length > 2);
    const shortCode = (words.map((w) => w[0]).join('') || 'UNIV').toUpperCase().substring(0, 6);

    const newInst: Institution = {
      id: `${shortCode.toLowerCase()}-${Date.now().toString(36).substring(2, 6)}`,
      name: req.institutionName,
      shortName: shortCode,
      campus: 'Main Campus, Cebu',
      city: 'Cebu City',
      type: req.institutionType === 'Public University' ? 'Public' : 'Private',
      isPilot: false,
      status: 'active',
      subscriptionPlan: 'Standard',
      contactName: req.contactPerson,
      contactEmail: req.officialEmail,
      assignedAdminName: req.assignedAdminName || req.contactPerson,
      assignedAdminEmail: req.assignedAdminEmail || req.officialEmail,
      registeredAt: new Date().toISOString().split('T')[0],
      statusNote: `Authorized by Super Admin on ${new Date().toISOString().split('T')[0]}`,
      allowExternalBookings: true,
      bookingPolicy: 'approval_required',
      externalBookingNotice: 'External requests permitted upon university dean or facility administration clearance.',
      timeZone: 'Asia/Manila (PHT)',
    };

    setInstitutions((prev) => [newInst, ...prev]);
    saveInstitutionToCloud(newInst).catch((err) => console.warn('Cloud sync (newInst):', err));

    const updatedReq: InstitutionalRegistrationRequest = { ...req, status: 'approved' };
    setInstitutionalRegistrations((prev) =>
      prev.map((r) => (r.id === requestId ? updatedReq : r))
    );
    saveRegistrationToCloud(updatedReq).catch((err) => console.warn('Cloud sync (approveReg):', err));

    addToast(
      'success',
      'Institution Authorized',
      `${newInst.name} is now an active university workspace. University Admin privileges authorized for ${newInst.assignedAdminEmail}.`
    );

    return { success: true };
  };

  // Reject Institutional Registration (Super Admin Action)
  const rejectInstitutionalRegistration = (requestId: string, reason: string): { success: boolean; error?: string } => {
    if (!reason.trim()) {
      return { success: false, error: 'A rejection reason is required for institutional audit records.' };
    }

    setInstitutionalRegistrations((prev) =>
      prev.map((r) => {
        if (r.id === requestId) {
          const updated = { ...r, status: 'rejected' as const, rejectionReason: reason };
          saveRegistrationToCloud(updated).catch((err) => console.warn('Cloud sync (rejectReg):', err));
          return updated;
        }
        return r;
      })
    );

    addToast('warning', 'Registration Declined', 'Institutional registration request has been rejected.');
    return { success: true };
  };

  // Submit Institutional Demo Request
  const submitDemoRequest = (data: {
    institutionName: string;
    contactName: string;
    contactEmail: string;
    contactNumber: string;
    designation: string;
    estimatedFacilities: string;
    preferredDate?: string;
    message?: string;
  }): { success: boolean; message: string; error?: string } => {
    if (!data.institutionName.trim() || !data.contactName.trim() || !data.contactEmail.trim()) {
      return {
        success: false,
        message: '',
        error: 'Please provide university name, contact person name, and official email.',
      };
    }

    const newDemo: InstitutionalDemoRequest = {
      id: `demo-${Date.now().toString(36)}`,
      institutionName: data.institutionName.trim(),
      contactName: data.contactName.trim(),
      contactEmail: data.contactEmail.trim().toLowerCase(),
      contactNumber: data.contactNumber.trim(),
      designation: data.designation.trim() || 'Institutional Administrator',
      estimatedFacilities: data.estimatedFacilities || '10-25 Spaces',
      preferredDate: data.preferredDate || '',
      message: data.message?.trim() || '',
      submittedAt: new Date().toISOString().split('T')[0],
      status: 'new',
    };

    setDemoRequests((prev) => [newDemo, ...prev]);
    saveDemoRequestToCloud(newDemo).catch((err) => console.warn('Cloud sync (demo):', err));
    addToast(
      'success',
      'Demo Request Received',
      'A SmartSpace onboarding coordinator will reach out to schedule your personalized live demo.'
    );

    return {
      success: true,
      message:
        'Thank you! Your institutional demo request has been recorded. Our team will coordinate with your campus administration to schedule a live presentation.',
    };
  };

  // User Registration Handler
  const registerUserAccount = (data: {
    fullName: string;
    email: string;
    institutionId: string;
    userType: RegisteredUserAccount['userType'];
    organizationOrDept: string;
    password?: string;
  }): { success: boolean; user?: RegisteredUserAccount; error?: string } => {
    const cleanEmail = data.email.trim().toLowerCase();
    if (!data.fullName.trim()) return { success: false, error: 'Full name is required.' };
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return { success: false, error: 'Valid institutional email address is required.' };
    }
    if (!data.organizationOrDept.trim()) {
      return { success: false, error: 'Organization or academic department name is required.' };
    }

    const targetInst = institutions.find((i) => i.id === data.institutionId);
    if (!targetInst) {
      return { success: false, error: 'Selected institution does not exist in SmartSpace.' };
    }
    if (targetInst.status !== 'active') {
      return {
        success: false,
        error: `Institutional access for ${targetInst.name} is not currently active. User registration is unavailable until the institution completes onboarding.`,
      };
    }

    // Check duplicate
    if (registeredUsers.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return {
        success: false,
        error: 'An account with this institutional email already exists. Please log in directly.',
      };
    }

    const role: UserRole = data.userType === 'Faculty Member' ? 'faculty' : 'student';
    const newUser: RegisteredUserAccount = {
      id: `usr-${Date.now().toString(36)}`,
      fullName: data.fullName.trim(),
      email: cleanEmail,
      institutionId: data.institutionId,
      userType: data.userType,
      organizationOrDept: data.organizationOrDept.trim(),
      role,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'active',
    };

    setRegisteredUsers((prev) => [newUser, ...prev]);
    saveUserToCloud(newUser).catch((err) => console.warn('Cloud sync (newUser):', err));
    setInstitutionId(data.institutionId);
    loginAs(role, cleanEmail, newUser.fullName);
    setActiveView('facilities');

    addToast('success', 'Account Created', `Welcome to SmartSpace, ${newUser.fullName}!`);
    return { success: true, user: newUser };
  };

  // Credential-Based Login Handler
  const loginWithCredentials = (
    email: string,
    password: string,
    portalType: 'institution' | 'user' | 'super_admin'
  ): { success: boolean; error?: string } => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      return { success: false, error: 'Please enter your institutional email address.' };
    }
    if (!password) {
      return { success: false, error: 'Please enter your account password.' };
    }

    // Super Admin Flow
    if (portalType === 'super_admin') {
      if (cleanEmail === 'superadmin@smartspace.ph' || cleanEmail.includes('superadmin')) {
        loginAs('super_admin', cleanEmail, 'Super Administrator');
        return { success: true };
      }
      if (cleanEmail.startsWith('rashmae')) {
        loginAs('super_admin', cleanEmail, 'Rashmae');
        return { success: true };
      }
      if (cleanEmail.startsWith('krisha')) {
        loginAs('super_admin', cleanEmail, 'Krisha');
        return { success: true };
      }
      if (cleanEmail.startsWith('gonzales')) {
        loginAs('super_admin', cleanEmail, 'Angel Mae');
        return { success: true };
      }
      if (cleanEmail.startsWith('karl')) {
        loginAs('super_admin', cleanEmail, 'Karl Hadriel');
        return { success: true };
      }
      return {
        success: false,
        error: 'Unable to sign in. Check your credentials or contact the platform administrator.',
      };
    }

    // University Admin / Institutional Flow
    if (portalType === 'institution') {
      const matchedInst = institutions.find(
        (i) =>
          i.assignedAdminEmail.toLowerCase() === cleanEmail ||
          i.contactEmail.toLowerCase() === cleanEmail
      );

      if (!matchedInst) {
        return {
          success: false,
          error: 'No authorized university administrator account found for this email. Please verify credentials or register your institution.',
        };
      }

      if (matchedInst.status !== 'active') {
        return {
          success: false,
          error: `The institutional workspace for ${matchedInst.name} is currently ${matchedInst.status}. Access is pending administrator review.`,
        };
      }

      setInstitutionId(matchedInst.id);
      loginAs('university_admin', cleanEmail, matchedInst.assignedAdminName || 'University Facility Administrator');
      setActiveView('admin-requests');
      return { success: true };
    }

    // User Flow (Students, Orgs, Faculty)
    const matchedUser = registeredUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    if (matchedUser) {
      const userInst = institutions.find((i) => i.id === matchedUser.institutionId);
      if (userInst && userInst.status !== 'active') {
        return {
          success: false,
          error: `Your institution (${userInst.name}) is not currently active on SmartSpace. Registration is paused until institutional onboarding is complete.`,
        };
      }
      if (userInst) {
        setInstitutionId(userInst.id);
      }
      loginAs(matchedUser.role, matchedUser.email, matchedUser.fullName);
      setActiveView('facilities');
      return { success: true };
    }

    // Default demo fallback accounts
    if (cleanEmail === 'juan.delacruz@ctu.edu.ph' || cleanEmail.includes('juan')) {
      setInstitutionId('ctu-main');
      loginAs('student', 'juan.delacruz@ctu.edu.ph', 'Juan Dela Cruz');
      setActiveView('facilities');
      return { success: true };
    }

    if (cleanEmail === 'maria.fernandez@ctu.edu.ph' || cleanEmail.includes('maria')) {
      setInstitutionId('ctu-main');
      loginAs('faculty', 'maria.fernandez@ctu.edu.ph', 'Dr. Maria Fernandez');
      setActiveView('facilities');
      return { success: true };
    }

    return {
      success: false,
      error: 'Unrecognized user credentials. Please create an account or verify your institutional email.',
    };
  };

  // Bookings state
  const [bookings, setBookings] = useState<BookingRequest[]>(() => {
    try {
      const stored = localStorage.getItem(BOOKINGS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse stored bookings, fallback to initial:', e);
    }
    return INITIAL_BOOKINGS;
  });

  // Save bookings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));
    } catch (e) {
      console.warn('Failed to save bookings to localStorage:', e);
    }
  }, [bookings]);

  // Participants state
  const [participants, setParticipants] = useState<ParticipantRecord[]>(() => {
    try {
      const stored = localStorage.getItem(PARTICIPANTS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse stored participants, fallback to initial:', e);
    }
    return INITIAL_PARTICIPANTS;
  });

  // Save participants to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(PARTICIPANTS_STORAGE_KEY, JSON.stringify(participants));
    } catch (e) {
      console.warn('Failed to save participants to localStorage:', e);
    }
  }, [participants]);

  // Active participant
  const [activeParticipantId, setActiveParticipantId] = useState<number>(1);

  // Set institution helper
  const setInstitutionId = (id: string) => {
    setInstitutionIdState(id);
    localStorage.setItem(INSTITUTION_STORAGE_KEY, id);
    setSelectedFacility(null);
  };

  const currentInstitution = useMemo(() => {
    return institutions.find((i) => i.id === institutionId) || institutions[0] || DEMO_INSTITUTIONS[0];
  }, [institutions, institutionId]);

  // Filter facilities by active institution
  const institutionFacilities = useMemo(() => {
    return facilities.filter((f) => f.institutionId === institutionId);
  }, [facilities, institutionId]);

  // Filter bookings by active institution
  const institutionBookings = useMemo(() => {
    return bookings.filter((b) => b.institutionId === institutionId);
  }, [bookings, institutionId]);

  const userBookings = useMemo(() => {
    return bookings.filter(
      (b) =>
        b.institutionId === institutionId ||
        b.requesterInstitutionId === institutionId ||
        (currentUser?.email && b.requesterEmail?.toLowerCase() === currentUser.email?.toLowerCase())
    );
  }, [bookings, institutionId, currentUser]);

  // Time overlap utility: Returns true if two time ranges on the same date overlap
  const checkTimeConflict = (
    facilityId: string,
    date: string,
    startTime: string,
    endTime: string,
    excludeBookingId?: string
  ): { hasConflict: boolean; conflictingBooking?: BookingRequest } => {
    const toMinutes = (timeStr: string) => {
      const [h, m] = timeStr.split(':').map(Number);
      return h * 60 + (m || 0);
    };

    const targetStart = toMinutes(startTime);
    const targetEnd = toMinutes(endTime);

    // Only compare against APPROVED bookings for the same facility on the same date
    const approvedSameDay = bookings.filter(
      (b) =>
        b.facilityId === facilityId &&
        b.date === date &&
        b.status === 'approved' &&
        (!excludeBookingId || b.id !== excludeBookingId)
    );

    for (const b of approvedSameDay) {
      const bStart = toMinutes(b.startTime);
      const bEnd = toMinutes(b.endTime);

      if (targetStart < bEnd && targetEnd > bStart) {
        return { hasConflict: true, conflictingBooking: b };
      }
    }

    return { hasConflict: false };
  };

  // Submit a new booking request
  const submitBooking = (data: {
    facilityId: string;
    eventName: string;
    purpose: string;
    date: string;
    startTime: string;
    endTime: string;
    attendees: number;
    requesterName: string;
    requesterRole: 'Student' | 'Faculty';
    requesterEmail: string;
    organization?: string;
    notes?: string;
  }) => {
    // Look up facility across all facilities (supporting cross-university bookings)
    const facility = facilities.find((f) => f.id === data.facilityId);
    if (!facility) {
      return { success: false, error: 'Selected facility was not found.' };
    }

    const hostInstitution = institutions.find((i) => i.id === facility.institutionId) || currentInstitution;
    const requesterInstitution = institutions.find((i) => i.id === institutionId) || currentInstitution;
    const isExternal = facility.institutionId !== institutionId;

    // Institution-level booking policy check
    if (isExternal) {
      if (!hostInstitution.allowExternalBookings || hostInstitution.bookingPolicy === 'internal_only') {
        return {
          success: false,
          error: `${hostInstitution.name} does not permit external booking requests. This facility is reserved exclusively for verified internal ${hostInstitution.shortName} faculty and students.`,
        };
      }
    }

    // Validation
    if (!data.eventName.trim()) {
      return { success: false, error: 'Event or activity title is required.' };
    }
    if (!data.date) {
      return { success: false, error: 'Reservation date is required.' };
    }
    if (!data.startTime || !data.endTime) {
      return { success: false, error: 'Both start time and end time are required.' };
    }

    const [sh, sm] = data.startTime.split(':').map(Number);
    const [eh, em] = data.endTime.split(':').map(Number);
    const startMins = sh * 60 + sm;
    const endMins = eh * 60 + em;

    if (endMins <= startMins) {
      return { success: false, error: 'End time must be later than start time.' };
    }

    if (data.attendees <= 0) {
      return { success: false, error: 'Expected attendees must be at least 1 person.' };
    }

    if (data.attendees > facility.capacity) {
      return {
        success: false,
        error: `Expected attendees (${data.attendees}) exceed the maximum seating capacity (${facility.capacity} seats) for ${facility.name}.`,
      };
    }

    // Check conflict with existing approved bookings
    const conflict = checkTimeConflict(data.facilityId, data.date, data.startTime, data.endTime);
    if (conflict.hasConflict && conflict.conflictingBooking) {
      return {
        success: false,
        error: `Schedule Conflict: This slot overlaps with an already APPROVED booking "${conflict.conflictingBooking.eventName}" (${formatTo12Hour(conflict.conflictingBooking.startTime)} – ${formatTo12Hour(conflict.conflictingBooking.endTime)}). Please select an alternate date or time range.`,
      };
    }

    // Generate unique demo reference
    const prefix = `${isExternal ? 'EXT-' : ''}${hostInstitution.shortName.replace(/[^A-Z]/g, '') || 'SS'}`;
    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const referenceNumber = `${prefix}-${year}-${randomSuffix}`;

    const newBooking: BookingRequest = {
      id: 'req-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 5),
      referenceNumber,
      institutionId: hostInstitution.id, // Host university owns the facility & review queue
      facilityId: data.facilityId,
      facilityName: facility.name,
      eventName: data.eventName.trim(),
      purpose: data.purpose.trim() || 'Academic Activity',
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      attendees: data.attendees,
      requesterName: data.requesterName.trim() || (currentUser?.name || 'Demo Requester'),
      requesterRole: data.requesterRole,
      requesterEmail: data.requesterEmail.trim() || (currentUser?.email || 'user@ctu.edu.ph'),
      organization: data.organization?.trim(),
      notes: data.notes?.trim(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      requesterInstitutionId: requesterInstitution.id,
      requesterInstitutionName: requesterInstitution.name,
      isExternalRequest: isExternal,
    };

    setBookings((prev) => [newBooking, ...prev]);
    saveBookingToCloud(newBooking).catch((err) => console.warn('Cloud sync (newBooking):', err));
    addToast(
      'success',
      isExternal ? 'External Request Submitted' : 'Request Submitted (Pending)',
      isExternal
        ? `Cross-university booking request ${referenceNumber} sent to ${hostInstitution.name} administrator queue.`
        : `Booking request ${referenceNumber} logged. It is now awaiting Administrator review.`
    );

    return { success: true, booking: newBooking };
  };

  // Administrator approval
  const approveBooking = (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) {
      return { success: false, error: 'Booking record not found.' };
    }

    // Double check conflict before approving
    const conflict = checkTimeConflict(
      booking.facilityId,
      booking.date,
      booking.startTime,
      booking.endTime,
      booking.id
    );

    if (conflict.hasConflict && conflict.conflictingBooking) {
      const err = `Cannot approve request: Schedule conflicts with existing approved reservation "${conflict.conflictingBooking.eventName}" (${formatTo12Hour(conflict.conflictingBooking.startTime)} – ${formatTo12Hour(conflict.conflictingBooking.endTime)}).`;
      addToast('error', 'Approval Blocked (Conflict)', err);
      return { success: false, error: err };
    }

    const permitRef = `PERMIT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    const updatedBooking: BookingRequest = {
      ...booking,
      status: 'approved',
      reviewedAt: new Date().toISOString(),
      reviewedBy: 'Engr. R. Santos (Demo Facility Administrator)',
      permitReference: permitRef,
      rejectionReason: undefined,
    };

    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? updatedBooking : b))
    );
    saveBookingToCloud(updatedBooking).catch((err) => console.warn('Cloud sync (approveBooking):', err));

    addToast(
      'success',
      'Request Approved',
      `Booking ${booking.referenceNumber} is officially Approved (Permit: ${permitRef}).`
    );

    return { success: true };
  };

  // Administrator rejection
  const rejectBooking = (bookingId: string, reason: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) {
      return { success: false, error: 'Booking record not found.' };
    }

    if (!reason.trim()) {
      return { success: false, error: 'A justification reason is required when rejecting a reservation.' };
    }

    const updatedBooking: BookingRequest = {
      ...booking,
      status: 'rejected',
      reviewedAt: new Date().toISOString(),
      reviewedBy: 'Engr. R. Santos (Demo Facility Administrator)',
      rejectionReason: reason.trim(),
    };

    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? updatedBooking : b))
    );
    saveBookingToCloud(updatedBooking).catch((err) => console.warn('Cloud sync (rejectBooking):', err));

    addToast(
      'info',
      'Request Rejected',
      `Booking ${booking.referenceNumber} marked as Rejected. Reason recorded for applicant.`
    );

    return { success: true };
  };

  // User cancels request
  const cancelBooking = (bookingId: string) => {
    const target = bookings.find((b) => b.id === bookingId);
    setBookings((prev) => prev.filter((b) => b.id !== bookingId));
    if (target) {
      deleteBookingFromCloud(bookingId).catch((err) => console.warn('Cloud sync (cancelBooking):', err));
    }
    addToast('info', 'Request Cancelled', `Booking ${target?.referenceNumber || ''} was removed.`);
  };

  // Reset bookings
  const resetBookingsToDefault = () => {
    setBookings(INITIAL_BOOKINGS);
    localStorage.removeItem(BOOKINGS_STORAGE_KEY);
    addToast('info', 'Bookings Reset', 'Reservation records have been reset to default demo state.');
  };

  // Participant updates
  const activeParticipant = useMemo(() => {
    return participants.find((p) => p.id === activeParticipantId) || participants[0];
  }, [participants, activeParticipantId]);

  const updateTaskObservation = (
    participantId: number,
    taskId: number,
    updates: Partial<TaskObservation>
  ) => {
    setParticipants((prev) =>
      prev.map((p) => {
        if (p.id === participantId) {
          const currentTask = p.tasks[taskId] || {
            taskId,
            completed: null,
            neededAssistance: null,
            completionTimeSeconds: null,
            difficultyNotes: '',
            participantComments: '',
          };
          return {
            ...p,
            tasks: {
              ...p.tasks,
              [taskId]: {
                ...currentTask,
                ...updates,
              },
            },
          };
        }
        return p;
      })
    );
  };

  const updateOpenEnded = (
    participantId: number,
    updates: Partial<OpenEndedResponses>
  ) => {
    setParticipants((prev) =>
      prev.map((p) => {
        if (p.id === participantId) {
          return {
            ...p,
            openEnded: {
              ...p.openEnded,
              ...updates,
            },
          };
        }
        return p;
      })
    );
  };

  const updateRatings = (
    participantId: number,
    updates: Partial<ParticipantRating>
  ) => {
    setParticipants((prev) =>
      prev.map((p) => {
        if (p.id === participantId) {
          return {
            ...p,
            ratings: {
              ...p.ratings,
              ...updates,
            },
          };
        }
        return p;
      })
    );
  };

  const updateParticipantInfo = (
    participantId: number,
    userType: 'Student' | 'Faculty' | 'Staff',
    dept: string
  ) => {
    setParticipants((prev) =>
      prev.map((p) => {
        if (p.id === participantId) {
          return {
            ...p,
            userType,
            collegeOrDepartment: dept,
          };
        }
        return p;
      })
    );
  };

  const updateParticipantNotes = (
    participantId: number,
    testerNotes: string,
    interviewSummary: string
  ) => {
    setParticipants((prev) =>
      prev.map((p) => {
        if (p.id === participantId) {
          return {
            ...p,
            testerNotes,
            interviewSummary,
          };
        }
        return p;
      })
    );
  };

  const resetParticipantsToDefault = () => {
    setParticipants(INITIAL_PARTICIPANTS);
    localStorage.removeItem(PARTICIPANTS_STORAGE_KEY);
    addToast(
      'info',
      'Validation Data Reset',
      'All 5 participant task recordings, open-ended answers, and ratings have been reset.'
    );
  };

  // CSV Export
  const exportValidationDataCsv = () => {
    const headers = [
      'Participant ID',
      'User Type',
      'Department / College',
      'Task 1 (Find Facility) Done',
      'Task 1 Assistance',
      'Task 1 Time (s)',
      'Task 2 (Book Request) Done',
      'Task 2 Assistance',
      'Task 2 Time (s)',
      'Task 3 (Check Pending) Done',
      'Task 3 Assistance',
      'Task 3 Time (s)',
      'Task 4 (Admin Approve/Reject) Done',
      'Task 4 Assistance',
      'Task 4 Time (s)',
      'Task 5 (Verify Status) Done',
      'Task 5 Assistance',
      'Task 5 Time (s)',
      'Task 6 (View Records/Reports) Done',
      'Task 6 Assistance',
      'Task 6 Time (s)',
      'Rating: Ease of Use (1-5)',
      'Rating: Usefulness (1-5)',
      'Rating: Overall Experience (1-5)',
      'Q Easy to Find Facility',
      'Q Availability Clear',
      'Q Booking Form Clear',
      'Q Status Easy to Locate',
      'Q Confusion or Difficulty',
      'Q What to Change',
      'Q1 Current Process',
      'Q2 Current Difficulties',
      'Tester Notes',
      'Interview Summary',
    ];

    const rows = participants.map((p) => {
      const t = p.tasks;
      const fmtBool = (val: boolean | null) => (val === null ? 'Not recorded' : val ? 'Yes' : 'No');
      const fmtNum = (val: number | null) => (val === null ? 'Not recorded' : val.toString());

      return [
        `"${p.identifier}"`,
        `"${p.userType}"`,
        `"${p.collegeOrDepartment}"`,
        fmtBool(t[1]?.completed),
        fmtBool(t[1]?.neededAssistance),
        fmtNum(t[1]?.completionTimeSeconds),
        fmtBool(t[2]?.completed),
        fmtBool(t[2]?.neededAssistance),
        fmtNum(t[2]?.completionTimeSeconds),
        fmtBool(t[3]?.completed),
        fmtBool(t[3]?.neededAssistance),
        fmtNum(t[3]?.completionTimeSeconds),
        fmtBool(t[4]?.completed),
        fmtBool(t[4]?.neededAssistance),
        fmtNum(t[4]?.completionTimeSeconds),
        fmtBool(t[5]?.completed),
        fmtBool(t[5]?.neededAssistance),
        fmtNum(t[5]?.completionTimeSeconds),
        fmtBool(t[6]?.completed),
        fmtBool(t[6]?.neededAssistance),
        fmtNum(t[6]?.completionTimeSeconds),
        fmtNum(p.ratings.easeOfUse),
        fmtNum(p.ratings.usefulness),
        fmtNum(p.ratings.overallExperience),
        `"${(p.openEnded.qFindFacilityEasy || '').replace(/"/g, '""')}"`,
        `"${(p.openEnded.qAvailabilityClear || '').replace(/"/g, '""')}"`,
        `"${(p.openEnded.qBookingFormClear || '').replace(/"/g, '""')}"`,
        `"${(p.openEnded.qStatusEasyToLocate || '').replace(/"/g, '""')}"`,
        `"${(p.openEnded.qConfusionOrDifficulty || '').replace(/"/g, '""')}"`,
        `"${(p.openEnded.qWhatToChange || '').replace(/"/g, '""')}"`,
        `"${(p.openEnded.q1CurrentProcess || '').replace(/"/g, '""')}"`,
        `"${(p.openEnded.q2CurrentDifficulties || '').replace(/"/g, '""')}"`,
        `"${(p.testerNotes || '').replace(/"/g, '""')}"`,
        `"${(p.interviewSummary || '').replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `smartspace_validation_data_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast('success', 'CSV Exported', 'Downloaded validation session data.');
  };

  return (
    <AppContext.Provider
      value={{
        isLoggedIn,
        currentUser,
        loginAs,
        logout,
        currentInstitution,
        allInstitutions: institutions,
        setInstitutionId,
        addInstitution,
        updateInstitution,
        currentRole,
        setCurrentRole,
        activeView,
        setActiveView,
        selectedFacility,
        setSelectedFacility,
        allFacilities: facilities,
        institutionFacilities,
        addFacility,
        updateFacility,
        deleteFacility,
        allBookings: bookings,
        institutionBookings,
        userBookings,
        checkTimeConflict,
        submitBooking,
        approveBooking,
        rejectBooking,
        cancelBooking,
        resetBookingsToDefault,
        participants,
        activeParticipantId,
        setActiveParticipantId,
        activeParticipant,
        updateTaskObservation,
        updateOpenEnded,
        updateRatings,
        updateParticipantInfo,
        updateParticipantNotes,
        resetParticipantsToDefault,
        exportValidationDataCsv,
        toasts,
        addToast,
        removeToast,
        disclaimerDismissed,
        setDisclaimerDismissed,
        // Auth Portal & Registration
        authFlowState,
        setAuthFlowState,
        openAuthPortal,
        isDemoModalOpen,
        setIsDemoModalOpen,
        institutionalRegistrations,
        submitInstitutionalRegistration,
        approveInstitutionalRegistration,
        rejectInstitutionalRegistration,
        demoRequests,
        submitDemoRequest,
        registeredUsers,
        registerUserAccount,
        loginWithCredentials,
        updateUserAccountStatus,
        updateUserAccountRole,
        platformSettings,
        updatePlatformSettings,
        cloudSyncStatus,
        syncWithFirestore,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
