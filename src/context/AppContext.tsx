import React, { createContext, useContext, useState, useEffect, useMemo, useRef, ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import {
  auth,
  signInWithGooglePopup,
  signOutFromFirebase,
  formatFirebaseAuthError,
  consumeGoogleRedirectResult,
} from '../lib/firebase';
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
  LoginSecurityEvent,
  FacilityHandler,
  FacilityAssignment,
  FacilityApprovalLog,
  VerifiedFacilitySession,
  HandlerApprovalVerificationRequest,
  AIAutomationJob,
  EmailDeliveryRecord,
  AIWorkflowDefinition,
  AIWorkflowRunResult,
} from '../types';
import { formatTo12Hour } from '../utils/timeFormat';
import { BUSINESS_CONFIG } from '../config/business';
import {
  DEMO_INSTITUTIONS,
  INITIAL_FACILITIES,
  INITIAL_BOOKINGS,
  INITIAL_PARTICIPANTS,
  INITIAL_FACILITY_HANDLERS,
  INITIAL_FACILITY_ASSIGNMENTS,
  INITIAL_FACILITY_APPROVAL_LOGS,
  INITIAL_AI_AUTOMATION_JOBS,
  INITIAL_EMAIL_DELIVERY_RECORDS,
  INITIAL_AI_WORKFLOWS,
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
  getFacilityHandlersFromCloud,
  saveFacilityHandlerToCloud,
  saveFacilityHandlersToCloud,
  deleteFacilityHandlerFromCloud,
  getFacilityAssignmentsFromCloud,
  saveFacilityAssignmentToCloud,
  deleteFacilityAssignmentFromCloud,
  getFacilityApprovalLogsFromCloud,
  saveFacilityApprovalLogToCloud,
  getAIWorkflowsFromCloud,
  saveAIWorkflowsToCloud,
  getAIAutomationJobsFromCloud,
  saveAIAutomationJobsToCloud,
  getEmailDeliveryRecordsFromCloud,
  saveEmailDeliveryRecordsToCloud,
  checkSuperAdminCloudAccess,
  getUserAccountProfileFromCloud,
  getFacilityHandlerProfileFromCloud,
} from '../lib/firestoreService';

async function hashAccessCodeClient(assignmentId: string, code: string): Promise<string> {
  const input = `smartspace_pin_v2:${assignmentId}:${code.trim()}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  throw new Error('Secure Web Crypto hashing is required to configure or verify facility access codes.');
}

export type AppView = 
  | 'landing'
  | 'auth'
  | 'facilities'
  | 'new-booking'
  | 'my-bookings'
  | 'admin-requests'
  | 'admin-facilities'
  | 'admin-records'
  | 'admin-handlers'
  | 'facility-handler-workspace'
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
  signInWithGoogle: (
    portalType: 'institution' | 'user' | 'super_admin'
  ) => Promise<{
    success: boolean;
    role?: UserRole;
    error?: string;
    needsRegistration?: boolean;
    suggestedName?: string;
    suggestedEmail?: string;
  }>;
  logout: () => Promise<void>;
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
  }) => { success: boolean; message: string; error?: string };
  approveInstitutionalRegistration: (requestId: string) => { success: boolean; error?: string };
  rejectInstitutionalRegistration: (requestId: string, reason: string) => { success: boolean; error?: string };

  demoRequests: InstitutionalDemoRequest[];
  submitDemoRequest: (data: {
    institutionName: string;
    institutionType?: string;
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
    email?: string;
    institutionId: string;
    userType: RegisteredUserAccount['userType'];
    organizationOrDept: string;
  }) => Promise<{ success: boolean; user?: RegisteredUserAccount; error?: string }>;
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

  // Facility Handler Personnel & Approval Architecture
  facilityHandlers: FacilityHandler[];
  institutionHandlers: FacilityHandler[];
  facilityAssignments: FacilityAssignment[];
  facilityApprovalLogs: FacilityApprovalLog[];
  verifiedFacilitySessions: Record<string, VerifiedFacilitySession>;
  activeFacilityWorkspace: { facility: Facility; assignment: FacilityAssignment } | null;
  setActiveFacilityWorkspace: (data: { facility: Facility; assignment: FacilityAssignment } | null) => void;
  addFacilityHandler: (data: {
    name: string;
    email: string;
    phone?: string;
    institutionId: string;
    department: string;
    status: 'active' | 'suspended';
    assignedFacilityIds: string[];
    isPrimary: boolean;
    hasAccessCode: boolean;
    initialAccessCode?: string;
  }) => Promise<void>;
  updateFacilityHandler: (handlerId: string, updates: Partial<FacilityHandler> & { newAccessCode?: string }) => Promise<void>;
  deleteFacilityHandler: (handlerId: string) => void;
  verifyAndExecuteHandlerApproval: (
    req: HandlerApprovalVerificationRequest
  ) => Promise<{ success: boolean; error?: string }>;
  verifyFacilityAccessCode: (params: {
    assignmentId: string;
    facilityId: string;
    handlerId: string;
    accessCode: string;
    facilityName: string;
    handlerName: string;
    handlerRole: 'primary' | 'backup';
  }) => Promise<{ success: boolean; error?: string; isLocked?: boolean; remainingSeconds?: number; attemptsRemaining?: number }>;
  clearVerifiedFacilitySession: (facilityId: string) => void;
  assignFacilityHandler: (data: {
    facilityId: string;
    facilityName: string;
    handlerUserId: string;
    handlerName: string;
    handlerEmail: string;
    assignmentRole: 'primary' | 'backup';
    initialAccessCode?: string;
    notes?: string;
  }) => Promise<{ success: boolean; assignment?: FacilityAssignment; error?: string }>;
  revokeFacilityAssignment: (assignmentId: string) => Promise<{ success: boolean; error?: string }>;
  resetFacilityAccessCode: (assignmentId: string, newAccessCode: string) => Promise<{ success: boolean; error?: string }>;
  createFacilityHandlerAccount: (data: {
    fullName: string;
    email: string;
    phone?: string;
    titleOrDesignation: string;
    notes?: string;
  }) => Promise<{ success: boolean; handler?: FacilityHandler; error?: string }>;
  updateFacilityHandlerStatus: (handlerId: string, status: 'active' | 'suspended') => void;
  approveBookingAsHandler: (params: { bookingId: string; facilityId: string; notes?: string }) => Promise<{ success: boolean; error?: string }>;
  rejectBookingAsHandler: (params: { bookingId: string; facilityId: string; reason: string }) => Promise<{ success: boolean; error?: string }>;
  checkHandlerFacilityAccess: (handlerId: string, facilityId: string) => { isAssigned: boolean; isVerified: boolean; assignment?: FacilityAssignment; session?: VerifiedFacilitySession };

  // AI Automation, Workflow Builder & Email Dispatch
  aiAutomationJobs: AIAutomationJob[];
  emailDeliveryRecords: EmailDeliveryRecord[];
  aiWorkflows: AIWorkflowDefinition[];
  approveAIJob: (jobId: string) => void;
  retryAIJob: (jobId: string) => void;
  retryEmailDelivery: (recordId: string) => void;
  triggerManualAIAnalysis: () => Promise<{ success: boolean; summary?: string; error?: string }>;
  saveAIWorkflow: (workflow: AIWorkflowDefinition) => void;
  deleteAIWorkflow: (workflowId: string) => void;
  runAIWorkflow: (workflowId: string, inputPayload: string) => Promise<AIWorkflowRunResult>;
  recordInboundOpalEvent: (event: { id: string; title: string; category: string; summary: string; source?: string }) => void;
  runConciergeForDemo: (demoId: string) => Promise<void>;

  // Toast notifications
  toasts: ToastMessage[];
  addToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => void;
  removeToast: (id: string) => void;

  // Session Security Events (in-memory + server audit endpoint, never localStorage)
  loginSecurityEvents: LoginSecurityEvent[];
  revokeSecurityEvent: (activityId: string) => void;

  // Prototype Disclaimer Info
  disclaimerDismissed: boolean;
  setDisclaimerDismissed: (d: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const INSTITUTION_STORAGE_KEY = 'smartspace_mvp_active_institution_v3';
const AUTH_SESSION_KEY = 'smartspace_mvp_auth_session_v3';
const VERIFIED_FACILITY_SESSIONS_KEY = 'smartspace_mvp_verified_sessions_v5';

const LEGACY_LOCALSTORAGE_PII_KEYS = [
  'smartspace_mvp_bookings_v3',
  'smartspace_mvp_participants_v3',
  'smartspace_mvp_auth_session_v3',
  'smartspace_mvp_inst_registrations_v4',
  'smartspace_mvp_demo_requests_v4',
  'smartspace_mvp_registered_users_v4',
  'smartspace_mvp_facility_handlers_v5',
  'smartspace_mvp_facility_assignments_v5',
  'smartspace_mvp_facility_logs_v5',
  'smartspace_mvp_ai_workflows_v1',
  'smartspace_mvp_ai_jobs_v1',
  'smartspace_mvp_email_records_v1',
  'smartspace_mvp_platform_settings_v4',
  'smartspace_mvp_institutions_v4',
  'smartspace_mvp_facilities_v4',
  'smartspace_security_activities_v1',
];

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
  {
    id: 'user-julia-ctu',
    fullName: 'Ms. Julia',
    email: 'julia.facilities@ctu.edu.ph',
    institutionId: 'ctu-main',
    userType: 'Facility Personnel',
    organizationOrDept: 'Executive Hall & Arena Facility Reviewer',
    role: 'facility_handler',
    createdAt: '2026-02-01',
    status: 'active',
  },
  {
    id: 'user-jomel-ctu',
    fullName: 'Mr. Jomel',
    email: 'jomel.facilities@ctu.edu.ph',
    institutionId: 'ctu-main',
    userType: 'Facility Personnel',
    organizationOrDept: 'Outdoor Quadrangle Reviewer',
    role: 'facility_handler',
    createdAt: '2026-02-01',
    status: 'active',
  },
  {
    id: 'user-daniel-ctu',
    fullName: 'Mr. Daniel',
    email: 'daniel.facilities@ctu.edu.ph',
    institutionId: 'ctu-main',
    userType: 'Facility Personnel',
    organizationOrDept: 'Computing Laboratories Reviewer',
    role: 'facility_handler',
    createdAt: '2026-02-01',
    status: 'active',
  },
  {
    id: 'user-angela-ctu',
    fullName: 'Ms. Angela',
    email: 'angela.facilities@ctu.edu.ph',
    institutionId: 'ctu-main',
    userType: 'Facility Personnel',
    organizationOrDept: 'Recreation & Auxiliary Facility Reviewer',
    role: 'facility_handler',
    createdAt: '2026-02-01',
    status: 'active',
  },
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Purge any legacy browser localStorage multi-user PII from prior builds
  useEffect(() => {
    try {
      for (const key of LEGACY_LOCALSTORAGE_PII_KEYS) {
        localStorage.removeItem(key);
      }
    } catch {
      // Ignore storage access errors in restricted browser contexts
    }
  }, []);

  // Authentication & Session (tab-scoped sessionStorage; never persistent localStorage)
  const [currentUser, setCurrentUser] = useState<DemoUserSession | null>(() => {
    try {
      const stored = sessionStorage.getItem(AUTH_SESSION_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse auth session:', e);
    }
    return null;
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    try {
      return !!sessionStorage.getItem(AUTH_SESSION_KEY);
    } catch {
      return false;
    }
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

  // Institutional Registration Requests State (in-memory + authenticated Firestore)
  const [institutionalRegistrations, setInstitutionalRegistrations] = useState<InstitutionalRegistrationRequest[]>(
    () => DEFAULT_INST_REGISTRATIONS
  );

  // Demo Inquiries State (in-memory + authenticated Firestore)
  const [demoRequests, setDemoRequests] = useState<InstitutionalDemoRequest[]>(
    () => DEFAULT_DEMO_REQUESTS
  );

  // Registered End Users State (in-memory + authenticated Firestore)
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUserAccount[]>(
    () => DEFAULT_REGISTERED_USERS
  );

  // Facility Handlers State (in-memory + authenticated Firestore)
  const [facilityHandlers, setFacilityHandlers] = useState<FacilityHandler[]>(
    () => INITIAL_FACILITY_HANDLERS
  );

  // Facility Assignments State (in-memory + authenticated Firestore)
  const [facilityAssignments, setFacilityAssignments] = useState<FacilityAssignment[]>(
    () => INITIAL_FACILITY_ASSIGNMENTS
  );

  // Facility Approval Logs State (in-memory + authenticated Firestore)
  const [facilityApprovalLogs, setFacilityApprovalLogs] = useState<FacilityApprovalLog[]>(
    () => INITIAL_FACILITY_APPROVAL_LOGS
  );

  // AI Automation Jobs, Workflows & Email Dispatch Records State (in-memory + authenticated Firestore)
  const [aiWorkflows, setAiWorkflows] = useState<AIWorkflowDefinition[]>(
    () => INITIAL_AI_WORKFLOWS
  );

  const [aiAutomationJobs, setAiAutomationJobs] = useState<AIAutomationJob[]>(
    () => INITIAL_AI_AUTOMATION_JOBS
  );

  const [emailDeliveryRecords, setEmailDeliveryRecords] = useState<EmailDeliveryRecord[]>(
    () => INITIAL_EMAIL_DELIVERY_RECORDS
  );

  // Session login security events (in-memory + server endpoint, never localStorage)
  const [loginSecurityEvents, setLoginSecurityEvents] = useState<LoginSecurityEvent[]>([]);

  // Verified Facility Sessions (in-memory + session storage)
  const [verifiedFacilitySessions, setVerifiedFacilitySessions] = useState<Record<string, VerifiedFacilitySession>>(() => {
    try {
      const stored = sessionStorage.getItem(VERIFIED_FACILITY_SESSIONS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const now = Date.now();
        const valid: Record<string, VerifiedFacilitySession> = {};
        for (const [key, session] of Object.entries(parsed as Record<string, VerifiedFacilitySession>)) {
          if (session.expiresAt > now) {
            valid[key] = session;
          }
        }
        return valid;
      }
    } catch (e) {
      console.warn('Failed to parse verified sessions:', e);
    }
    return {};
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(VERIFIED_FACILITY_SESSIONS_KEY, JSON.stringify(verifiedFacilitySessions));
    } catch (e) {
      console.warn('Failed to save verified sessions:', e);
    }
  }, [verifiedFacilitySessions]);

  const [activeFacilityWorkspace, setActiveFacilityWorkspace] = useState<{ facility: Facility; assignment: FacilityAssignment } | null>(null);

  // Platform Settings & Configuration (in-memory + authenticated Firestore)
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>(() => ({
    platformName: 'SmartSpace',
    platformTagline: 'University Facility Booking & Resource Management Platform',
    primaryColor: '#0284c7',
    globalAnnouncement:
      'Centralized multi-university facility discovery is active. Cross-campus requests are routed to host institution administrators.',
    allowCrossUniversityDiscovery: true,
    defaultAdvanceBookingDays: 30,
    requireInstitutionalEmailVerification: true,
    autoConflictDetection: true,
  }));

  const [cloudSyncStatus, setCloudSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'offline'>('idle');

  // Firestore Cloud Synchronization (strictly gated by verified Firebase Auth)
  const syncWithFirestore = async () => {
    if (!auth.currentUser || !auth.currentUser.emailVerified) {
      setCloudSyncStatus('idle');
      return;
    }
    try {
      setCloudSyncStatus('syncing');
      await seedFirestoreIfEmpty();

      const [
        cloudInsts,
        cloudFacs,
        cloudBookings,
        cloudRegs,
        cloudDemos,
        cloudUsers,
        cloudSettings,
        cloudHandlers,
        cloudAssignments,
        cloudLogs,
        cloudWorkflows,
        cloudJobs,
        cloudEmails,
      ] = await Promise.all([
        getInstitutionsFromCloud().catch(() => null),
        getFacilitiesFromCloud().catch(() => null),
        getBookingsFromCloud().catch(() => null),
        getRegistrationsFromCloud().catch(() => null),
        getDemoRequestsFromCloud().catch(() => null),
        getUsersFromCloud().catch(() => null),
        getSettingsFromCloud().catch(() => null),
        getFacilityHandlersFromCloud().catch(() => null),
        getFacilityAssignmentsFromCloud().catch(() => null),
        getFacilityApprovalLogsFromCloud().catch(() => null),
        getAIWorkflowsFromCloud().catch(() => null),
        getAIAutomationJobsFromCloud().catch(() => null),
        getEmailDeliveryRecordsFromCloud().catch(() => null),
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
      if (cloudHandlers && cloudHandlers.length > 0) {
        setFacilityHandlers(cloudHandlers);
      }
      if (cloudAssignments && cloudAssignments.length > 0) {
        setFacilityAssignments(cloudAssignments);
      }
      if (cloudLogs && cloudLogs.length > 0) {
        setFacilityApprovalLogs(cloudLogs);
      }
      if (cloudWorkflows && cloudWorkflows.length > 0) {
        const conciergeBuiltIn = INITIAL_AI_WORKFLOWS.find((w) => w.id === 'wf-enterprise-concierge');
        const merged =
          conciergeBuiltIn && !cloudWorkflows.some((w) => w.id === 'wf-enterprise-concierge')
            ? [conciergeBuiltIn, ...cloudWorkflows]
            : cloudWorkflows;
        setAiWorkflows(merged);
      }
      if (cloudJobs && cloudJobs.length > 0) {
        setAiAutomationJobs(cloudJobs);
      }
      if (cloudEmails && cloudEmails.length > 0) {
        setEmailDeliveryRecords(cloudEmails);
      }

      setCloudSyncStatus('synced');
    } catch (err) {
      console.warn('Firestore initial sync:', err);
      setCloudSyncStatus('offline');
    }
  };

  const pinLockoutRef = useRef<Record<string, { attempts: number; lockedUntil: number }>>({});

  useEffect(() => {
    consumeGoogleRedirectResult().catch(() => null);
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser && fbUser.emailVerified) {
        syncWithFirestore();
        const fbEmail = (fbUser.email || '').trim().toLowerCase();
        try {
          const stored = sessionStorage.getItem(AUTH_SESSION_KEY);
          if (stored) {
            const parsed = JSON.parse(stored) as DemoUserSession;
            if (parsed?.email && parsed.email.toLowerCase() === fbEmail) {
              setCurrentUser(parsed);
              setCurrentRole(parsed.role);
              setIsLoggedIn(true);
            }
          }
        } catch {
          // Ignore storage parse failure
        }
      } else {
        setCloudSyncStatus('idle');
        setIsLoggedIn(false);
        setCurrentUser(null);
        setVerifiedFacilitySessions({});
        setActiveFacilityWorkspace(null);
        try {
          sessionStorage.removeItem(AUTH_SESSION_KEY);
          sessionStorage.removeItem(VERIFIED_FACILITY_SESSIONS_KEY);
        } catch {
          // Ignore storage errors
        }
      }
    });
    return () => unsubscribe();
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

  // Institutions & Facilities state (in-memory + authenticated Firestore)
  const [institutions, setInstitutions] = useState<Institution[]>(() => DEMO_INSTITUTIONS);
  const [facilities, setFacilities] = useState<Facility[]>(() => INITIAL_FACILITIES);

  // Record login and security activities to server endpoint and in-memory session list (never localStorage)
  const recordAuthEvent = (eventData: {
    email: string;
    role: UserRole;
    status: 'success' | 'failed';
    eventType: 'LOGIN_SUCCESS' | 'INVALID_CREDENTIALS' | 'ACCOUNT_SUSPENDED' | 'LOGOUT' | 'SESSION_REVOKED';
    institutionId?: string;
    institutionName?: string;
  }) => {
    try {
      fetch('/api/auth/record-activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      }).catch((err) => console.warn('Could not record activity to backend API:', err));
    } catch (e) {
      console.warn('Network call error in recordAuthEvent:', e);
    }

    const d = new Date();
    const localEvt: LoginSecurityEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      accountEmail: eventData.email,
      role: eventData.role,
      institutionId: eventData.institutionId,
      institutionName: eventData.institutionName,
      timestamp: d.toISOString(),
      formattedTime: d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      formattedDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: eventData.status,
      eventType: eventData.eventType,
      ipAddress: '120.28.16.84',
      sessionActive: eventData.status === 'success' && eventData.eventType !== 'LOGOUT',
    };

    setLoginSecurityEvents((prev) => [localEvt, ...prev].slice(0, 250));
  };

  const revokeSecurityEvent = (activityId: string) => {
    setLoginSecurityEvents((prev) =>
      prev.map((a) =>
        a.id === activityId ? { ...a, sessionActive: false, eventType: 'SESSION_REVOKED' as const } : a
      )
    );
  };

  // Internal verified session setter (only called after verified Firebase Authentication)
  const establishVerifiedSession = (
    userSession: DemoUserSession,
    role: UserRole,
    targetView: AppView,
    instObj?: Institution
  ) => {
    setCurrentRole(role);
    setCurrentUser(userSession);
    setIsLoggedIn(true);
    setActiveView(targetView);

    try {
      sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(userSession));
    } catch (e) {
      console.warn('Failed to save auth session:', e);
    }

    const activeInst = instObj || institutions.find((i) => i.id === institutionId) || institutions[0];
    recordAuthEvent({
      email: userSession.email,
      role: userSession.role,
      status: 'success',
      eventType: 'LOGIN_SUCCESS',
      institutionId: activeInst?.id,
      institutionName: activeInst?.name,
    });

    addToast(
      'success',
      'Signed In',
      `Signed in as ${userSession.name} (${role === 'super_admin' ? 'Super Admin' : role === 'university_admin' || role === 'admin' ? 'University Facility Admin' : role === 'facility_handler' ? 'Authorized Facility Handler' : 'Student / Faculty'}).`
    );
  };

  // Real Firebase Google Sign-In with Firestore Role Authorization
  const signInWithGoogle = async (
    portalType: 'institution' | 'user' | 'super_admin'
  ): Promise<{
    success: boolean;
    role?: UserRole;
    error?: string;
    needsRegistration?: boolean;
    suggestedName?: string;
    suggestedEmail?: string;
  }> => {
    try {
      const fbUser = await signInWithGooglePopup();
      const cleanEmail = (fbUser.email || '').trim().toLowerCase();
      if (!cleanEmail || !fbUser.emailVerified) {
        await signOutFromFirebase().catch(() => {});
        return {
          success: false,
          error: 'Your Google account must have a verified email address to sign in to SmartSpace.',
        };
      }

      const displayName = fbUser.displayName?.trim() || cleanEmail.split('@')[0];

      // 1. Super Admin Flow
      if (portalType === 'super_admin') {
        const isAllowed = await checkSuperAdminCloudAccess(fbUser.uid, cleanEmail);
        if (!isAllowed) {
          recordAuthEvent({
            email: cleanEmail,
            role: 'super_admin',
            status: 'failed',
            eventType: 'INVALID_CREDENTIALS',
          });
          await signOutFromFirebase().catch(() => {});
          return {
            success: false,
            error: 'Unable to sign in. This Google account is not authorized for Platform Super Admin access.',
          };
        }

        const userSession: DemoUserSession = {
          name: displayName,
          email: cleanEmail,
          role: 'super_admin',
          organization: 'SmartSpace Platform Operations',
        };
        establishVerifiedSession(userSession, 'super_admin', 'super-admin');
        await syncWithFirestore();
        return { success: true, role: 'super_admin' };
      }

      const [cloudInsts, cloudUserProfile, cloudHandlerProfile] = await Promise.all([
        getInstitutionsFromCloud().catch(() => null),
        getUserAccountProfileFromCloud(fbUser.uid, cleanEmail).catch(() => null),
        getFacilityHandlerProfileFromCloud(cleanEmail).catch(() => null),
      ]);

      const activeInstList = cloudInsts && cloudInsts.length > 0 ? cloudInsts : institutions;

      // 2. University Admin / Facility Handler Flow
      if (portalType === 'institution') {
        const matchedInst = activeInstList.find(
          (i) =>
            i.assignedAdminEmail.toLowerCase() === cleanEmail ||
            i.contactEmail.toLowerCase() === cleanEmail
        );

        if (matchedInst) {
          if (matchedInst.status !== 'active') {
            recordAuthEvent({
              email: cleanEmail,
              role: 'university_admin',
              status: 'failed',
              eventType: 'ACCOUNT_SUSPENDED',
              institutionId: matchedInst.id,
              institutionName: matchedInst.name,
            });
            await signOutFromFirebase().catch(() => {});
            return {
              success: false,
              error: `The institutional workspace for ${matchedInst.name} is currently ${matchedInst.status}. Access is pending administrator review.`,
            };
          }

          setInstitutionId(matchedInst.id);
          const userSession: DemoUserSession = {
            name: matchedInst.assignedAdminName || displayName,
            email: cleanEmail,
            role: 'university_admin',
            organization: `${matchedInst.shortName} Facilities Office`,
          };
          establishVerifiedSession(userSession, 'university_admin', 'admin-requests', matchedInst);
          await syncWithFirestore();
          return { success: true, role: 'university_admin' };
        }

        const matchedHandler =
          cloudHandlerProfile || facilityHandlers.find((h) => h.email.toLowerCase() === cleanEmail);
        if (matchedHandler) {
          if (matchedHandler.status === 'suspended') {
            recordAuthEvent({
              email: cleanEmail,
              role: 'facility_handler',
              status: 'failed',
              eventType: 'ACCOUNT_SUSPENDED',
              institutionId: matchedHandler.institutionId,
            });
            await signOutFromFirebase().catch(() => {});
            return {
              success: false,
              error: 'Your facility personnel account is currently suspended. Contact your University Admin.',
            };
          }
          const handlerInst = activeInstList.find((i) => i.id === matchedHandler.institutionId);
          setInstitutionId(matchedHandler.institutionId);
          const userSession: DemoUserSession = {
            name: matchedHandler.fullName || displayName,
            email: cleanEmail,
            role: 'facility_handler',
            organization: `${handlerInst?.shortName || 'Campus'} Facility Personnel`,
          };
          establishVerifiedSession(userSession, 'facility_handler', 'facility-handler-workspace', handlerInst);
          await syncWithFirestore();
          return { success: true, role: 'facility_handler' };
        }

        const matchedAdminUser =
          cloudUserProfile || registeredUsers.find((u) => u.email.toLowerCase() === cleanEmail);

        if (
          matchedAdminUser &&
          (matchedAdminUser.role === 'university_admin' ||
            matchedAdminUser.role === 'admin' ||
            matchedAdminUser.role === 'facility_handler')
        ) {
          if (matchedAdminUser.status === 'suspended') {
            await signOutFromFirebase().catch(() => {});
            return { success: false, error: 'Your institutional account is currently suspended.' };
          }
          const inst = activeInstList.find((i) => i.id === matchedAdminUser.institutionId);
          if (inst && inst.status !== 'active') {
            await signOutFromFirebase().catch(() => {});
            return {
              success: false,
              error: `Your institution (${inst.name}) is not currently active on SmartSpace.`,
            };
          }
          setInstitutionId(matchedAdminUser.institutionId);
          const resolvedRole: UserRole =
            matchedAdminUser.role === 'facility_handler' ? 'facility_handler' : 'university_admin';
          const targetView: AppView =
            resolvedRole === 'facility_handler' ? 'facility-handler-workspace' : 'admin-requests';
          const userSession: DemoUserSession = {
            name: matchedAdminUser.fullName || displayName,
            email: cleanEmail,
            role: resolvedRole,
            organization: matchedAdminUser.organizationOrDept || inst?.shortName || 'University Office',
          };
          establishVerifiedSession(userSession, resolvedRole, targetView, inst);
          await syncWithFirestore();
          return { success: true, role: resolvedRole };
        }

        recordAuthEvent({
          email: cleanEmail,
          role: 'university_admin',
          status: 'failed',
          eventType: 'INVALID_CREDENTIALS',
        });
        await signOutFromFirebase().catch(() => {});
        return {
          success: false,
          error:
            'No authorized university administrator or facility handler account matches your Google email. Apply via Register Institution first or verify your email with your campus admin.',
        };
      }

      // 3. End-User Portal Flow (Students, Faculty, Registered Users)
      const matchedUser =
        cloudUserProfile || registeredUsers.find((u) => u.email.toLowerCase() === cleanEmail);

      if (matchedUser) {
        if (matchedUser.status === 'suspended') {
          recordAuthEvent({
            email: cleanEmail,
            role: matchedUser.role,
            status: 'failed',
            eventType: 'ACCOUNT_SUSPENDED',
          });
          await signOutFromFirebase().catch(() => {});
          return {
            success: false,
            error: 'Your SmartSpace user account is currently suspended. Contact your campus administrator.',
          };
        }
        const userInst = activeInstList.find((i) => i.id === matchedUser.institutionId);
        if (userInst && userInst.status !== 'active') {
          recordAuthEvent({
            email: cleanEmail,
            role: matchedUser.role,
            status: 'failed',
            eventType: 'ACCOUNT_SUSPENDED',
            institutionId: userInst.id,
            institutionName: userInst.name,
          });
          await signOutFromFirebase().catch(() => {});
          return {
            success: false,
            error: `Your institution (${userInst.name}) is not currently active on SmartSpace. Access is paused until institutional onboarding is complete.`,
          };
        }
        if (userInst) {
          setInstitutionId(userInst.id);
        }
        const resolvedRole: UserRole = matchedUser.role || 'student';
        const targetView: AppView =
          resolvedRole === 'facility_handler' ? 'facility-handler-workspace' : 'facilities';
        const userSession: DemoUserSession = {
          name: matchedUser.fullName || displayName,
          email: cleanEmail,
          role: resolvedRole,
          organization: matchedUser.organizationOrDept || userInst?.shortName || 'Campus Organization',
        };
        establishVerifiedSession(userSession, resolvedRole, targetView, userInst);
        await syncWithFirestore();
        return { success: true, role: resolvedRole };
      }

      const matchedHandler =
        cloudHandlerProfile || facilityHandlers.find((h) => h.email.toLowerCase() === cleanEmail);
      if (matchedHandler) {
        if (matchedHandler.status === 'suspended') {
          await signOutFromFirebase().catch(() => {});
          return { success: false, error: 'Your facility personnel account is currently suspended.' };
        }
        const handlerInst = activeInstList.find((i) => i.id === matchedHandler.institutionId);
        setInstitutionId(matchedHandler.institutionId);
        const userSession: DemoUserSession = {
          name: matchedHandler.fullName || displayName,
          email: cleanEmail,
          role: 'facility_handler',
          organization: `${handlerInst?.shortName || 'Campus'} Facility Personnel`,
        };
        establishVerifiedSession(userSession, 'facility_handler', 'facility-handler-workspace', handlerInst);
        await syncWithFirestore();
        return { success: true, role: 'facility_handler' };
      }

      return {
        success: false,
        needsRegistration: true,
        suggestedName: displayName,
        suggestedEmail: cleanEmail,
        error:
          'No SmartSpace user profile exists for this Google account yet. Complete your registration below to link your university.',
      };
    } catch (err: unknown) {
      return { success: false, error: formatFirebaseAuthError(err) };
    }
  };

  const logout = async () => {
    if (currentUser) {
      recordAuthEvent({
        email: currentUser.email,
        role: currentUser.role,
        status: 'success',
        eventType: 'LOGOUT',
      });
    }
    await signOutFromFirebase().catch((err) => console.warn('Firebase signOut:', err));
    setIsLoggedIn(false);
    setCurrentUser(null);
    setVerifiedFacilitySessions({});
    setActiveFacilityWorkspace(null);
    try {
      sessionStorage.removeItem(AUTH_SESSION_KEY);
      sessionStorage.removeItem(VERIFIED_FACILITY_SESSIONS_KEY);
    } catch {
      // Ignore storage errors
    }
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

  const runConciergePipelineForRequest = async (newDemo: InstitutionalDemoRequest) => {
    try {
      const resp = await fetch('/api/ai/categorize-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          institutionName: newDemo.institutionName,
          institutionType: newDemo.institutionType || 'Higher Education Institution',
          contactName: newDemo.contactName,
          designation: newDemo.designation,
          estimatedFacilities: newDemo.estimatedFacilities,
          message: newDemo.message,
        }),
      });
      const aiRes = await resp.json();
      if (!aiRes?.success || !aiRes.result) return;

      const validCats = ['Enterprise Onboarding', 'Public Pilot', 'Collegiate Competition', 'General Inquiry'] as const;
      const cat = validCats.includes(aiRes.result.category) ? aiRes.result.category : 'Enterprise Onboarding';
      const recommendedTier = String(aiRes.result.recommendedTier || 'Professional Scope (Pilot)');
      const validWarmth = ['Hot', 'Warm', 'Nurture'] as const;
      const leadWarmth = validWarmth.includes(aiRes.result.leadWarmth) ? aiRes.result.leadWarmth : 'Warm';
      const teamSummary = String(aiRes.result.summary || `Team Alert (Rash, Karl, Angel, Krisha): ${leadWarmth} lead — ${recommendedTier}`);
      const emailDraft = String(aiRes.result.draftReply || '');
      const nowIso = new Date().toISOString();

      const updatedDemo: InstitutionalDemoRequest = {
        ...newDemo,
        aiRecommendedTier: recommendedTier,
        aiLeadWarmth: leadWarmth,
        aiTeamSummary: teamSummary,
        aiEmailDraft: emailDraft,
      };
      setDemoRequests((prev) => prev.map((d) => (d.id === newDemo.id ? updatedDemo : d)));
      saveDemoRequestToCloud(updatedDemo).catch(() => {});

      const newJob: AIAutomationJob = {
        id: `ai-job-${Date.now().toString(36)}`,
        type: 'demo_categorization',
        status: cat === 'Enterprise Onboarding' ? 'requires_human_approval' : 'completed',
        title: `${newDemo.institutionName} — Enterprise Concierge Triage`,
        relatedEntityId: newDemo.id,
        aiCategory: cat,
        recommendedTier,
        leadWarmth,
        aiSummary: teamSummary,
        aiDraftContent: emailDraft,
        suggestedSuperAdmin: aiRes.result.suggestedLead || 'Rash, Karl, Angel & Krisha',
        executionLogs: [
          'trigger:demo_request_created',
          `gemini-4-hydrogen:concierge(${recommendedTier} | ${leadWarmth})`,
          'team_summary:Rash,Karl,Angel,Krisha',
          cat === 'Enterprise Onboarding' ? 'gate:requires_human_approval' : 'status:completed',
        ],
        retryCount: 0,
        maxRetries: 3,
        createdAt: nowIso,
        processedAt: cat === 'Enterprise Onboarding' ? undefined : nowIso,
      };

      setAiAutomationJobs((prev) => {
        const next = [newJob, ...prev];
        saveAIAutomationJobsToCloud(next).catch(() => {});
        return next;
      });

      const dNow = new Date();
      const emailRecord: EmailDeliveryRecord = {
        id: `eml-${Date.now().toString(36)}`,
        jobId: newJob.id,
        subject: `[SmartSpace Concierge · ${leadWarmth}] ${newDemo.institutionName} (${recommendedTier})`,
        inquiryType: cat,
        recipientCount: 4,
        status: 'delivered',
        timestamp: nowIso,
        formattedTime: dNow.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        provider: 'SmartSpace Cloud Dispatcher',
        idempotencyKey: `idem_${newDemo.id}`,
        retryAttempt: 0,
        isPrivateBcc: true,
      };
      setEmailDeliveryRecords((prev) => {
        const next = [emailRecord, ...prev];
        saveEmailDeliveryRecordsToCloud(next).catch(() => {});
        return next;
      });
    } catch {
      // non-blocking AI enhancement
    }
  };

  const runConciergeForDemo = async (demoId: string): Promise<void> => {
    const target = demoRequests.find((d) => d.id === demoId);
    if (!target) return;
    addToast('info', 'Running Enterprise Concierge AI', `Analyzing ${target.institutionName} tier, lead warmth & pilot reply...`);
    await runConciergePipelineForRequest(target);
    addToast('success', 'Concierge Triage Complete', `Team summary for Rash, Karl, Angel & Krisha and 15-min pilot draft ready.`);
  };

  // Submit Institutional Demo Request
  const submitDemoRequest = (data: {
    institutionName: string;
    institutionType?: string;
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
      institutionType: data.institutionType?.trim() || 'Higher Education Institution',
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

    // Trigger server-side SmartSpace Enterprise Concierge AI workflow asynchronously
    runConciergePipelineForRequest(newDemo);

    addToast(
      'success',
      'Demo Request Received',
      'SmartSpace Enterprise Concierge AI is preparing your campus walkthrough brief for the SmartSpace pilot team.'
    );

    return {
      success: true,
      message:
        'Thank you! Your institutional demo request has been recorded. Our team will coordinate with your campus administration to schedule a 15-minute live pilot walkthrough.',
    };
  };

  // User Registration Handler (Verifies identity via Firebase Google Sign-In & creates Firestore /registeredUsers/{uid})
  const registerUserAccount = async (data: {
    fullName: string;
    email?: string;
    institutionId: string;
    userType: RegisteredUserAccount['userType'];
    organizationOrDept: string;
  }): Promise<{ success: boolean; user?: RegisteredUserAccount; error?: string }> => {
    if (!data.fullName.trim()) return { success: false, error: 'Full name is required.' };
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

    try {
      const existingAuthUser = auth.currentUser;
      const fbUser =
        existingAuthUser && existingAuthUser.emailVerified && existingAuthUser.email
          ? existingAuthUser
          : await signInWithGooglePopup();
      const verifiedEmail = (fbUser.email || '').trim().toLowerCase();
      if (!verifiedEmail || !fbUser.emailVerified) {
        await signOutFromFirebase().catch(() => {});
        return {
          success: false,
          error: 'Google verification failed. Your Google account email must be verified.',
        };
      }

      if (data.email && data.email.trim() && data.email.trim().toLowerCase() !== verifiedEmail) {
        addToast(
          'info',
          'Verified Email Used',
          `Your SmartSpace profile has been linked to your verified Google email (${verifiedEmail}).`
        );
      }

      const existingProfile = await getUserAccountProfileFromCloud(fbUser.uid, verifiedEmail).catch(() => null);
      if (existingProfile || registeredUsers.some((u) => u.email.toLowerCase() === verifiedEmail)) {
        await signOutFromFirebase().catch(() => {});
        return {
          success: false,
          error: 'An account with this verified Google email already exists. Please use Sign In instead.',
        };
      }

      const role: UserRole = data.userType === 'Faculty Member' ? 'faculty' : 'student';
      const newUser: RegisteredUserAccount = {
        id: fbUser.uid,
        uid: fbUser.uid,
        fullName: data.fullName.trim(),
        email: verifiedEmail,
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

      const userSession: DemoUserSession = {
        name: newUser.fullName,
        email: verifiedEmail,
        role,
        organization: newUser.organizationOrDept,
      };
      establishVerifiedSession(userSession, role, 'facilities', targetInst);
      await syncWithFirestore();

      addToast('success', 'Account Created', `Welcome to SmartSpace, ${newUser.fullName}!`);
      return { success: true, user: newUser };
    } catch (err: unknown) {
      return { success: false, error: formatFirebaseAuthError(err) };
    }
  };

  // Bookings state (in-memory + authenticated Firestore, never localStorage)
  const [bookings, setBookings] = useState<BookingRequest[]>(() => INITIAL_BOOKINGS);

  // Participants state (in-memory only, never localStorage)
  const [participants, setParticipants] = useState<ParticipantRecord[]>(() => INITIAL_PARTICIPANTS);

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
    addToast('info', 'Bookings Reset', 'Reservation records have been reset to default demo state.');
  };

  // -------------------------------------------------------------
  // FACILITY HANDLER SECURE WORKSPACE & APPROVAL METHODS
  // -------------------------------------------------------------
  const checkHandlerFacilityAccess = (handlerId: string, facilityId: string) => {
    const assignment = facilityAssignments.find(
      (a) =>
        a.handlerUserId === handlerId &&
        a.facilityId === facilityId &&
        a.assignmentStatus === 'active'
    );
    const session = verifiedFacilitySessions[facilityId];
    const isVerified = !!(session && session.handlerId === handlerId && session.expiresAt > Date.now());

    return {
      isAssigned: !!assignment,
      isVerified,
      assignment,
      session,
    };
  };

  const verifyFacilityAccessCode = async (params: {
    assignmentId: string;
    facilityId: string;
    handlerId: string;
    accessCode: string;
    facilityName: string;
    handlerName: string;
    handlerRole: 'primary' | 'backup';
  }): Promise<{ success: boolean; error?: string; isLocked?: boolean; remainingSeconds?: number; attemptsRemaining?: number }> => {
    if (!auth.currentUser || !auth.currentUser.emailVerified) {
      return {
        success: false,
        error: 'Verified Firebase Authentication session required before unlocking a facility workspace.',
      };
    }

    const assignment = facilityAssignments.find(
      (a) =>
        (a.id === params.assignmentId ||
          (a.handlerUserId === params.handlerId && a.facilityId === params.facilityId)) &&
        a.assignmentStatus === 'active'
    );

    if (!assignment) {
      return { success: false, error: 'No active facility assignment found for this custodian.' };
    }

    const lockoutKey = assignment.id;
    const lockout = pinLockoutRef.current[lockoutKey];
    const now = Date.now();

    if (lockout && lockout.lockedUntil > now) {
      const remainingSeconds = Math.ceil((lockout.lockedUntil - now) / 1000);
      addToast('error', 'Temporarily Locked', `Too many failed attempts. Retry in ${remainingSeconds}s.`);
      return {
        success: false,
        isLocked: true,
        remainingSeconds,
        error: 'Too many invalid attempts. Workspace access temporarily locked.',
      };
    }

    if (!assignment.accessCodeConfigured || !assignment.accessCodeHash) {
      return {
        success: false,
        error: 'No facility access code is configured for this assignment yet. Ask a University Admin to set a PIN in Personnel Assignments.',
      };
    }

    try {
      const enteredHash = await hashAccessCodeClient(assignment.id, params.accessCode);
      if (enteredHash !== assignment.accessCodeHash) {
        const nextAttempts = (lockout?.attempts || 0) + 1;
        const lockedUntil = nextAttempts >= 5 ? now + 60 * 1000 : 0;
        pinLockoutRef.current[lockoutKey] = { attempts: nextAttempts, lockedUntil };
        const attemptsRemaining = Math.max(0, 5 - nextAttempts);
        const msg =
          lockedUntil > now
            ? '5 failed PIN attempts. Workspace locked for 60 seconds.'
            : `Invalid handler PIN. ${attemptsRemaining} attempt(s) remaining.`;
        addToast('error', 'Verification Failed', msg);
        return {
          success: false,
          attemptsRemaining,
          isLocked: lockedUntil > now,
          remainingSeconds: lockedUntil > now ? 60 : undefined,
          error: msg,
        };
      }

      delete pinLockoutRef.current[lockoutKey];
      const expiresAt = now + 30 * 60 * 1000;
      const newSession: VerifiedFacilitySession = {
        assignmentId: assignment.id,
        facilityId: params.facilityId,
        facilityName: params.facilityName,
        handlerId: params.handlerId,
        handlerName: params.handlerName,
        handlerEmail: currentUser?.email || '',
        role: params.handlerRole,
        token: `hnd_sha256_${now}_${Math.random().toString(36).substring(2, 10)}`,
        verifiedAt: new Date().toISOString(),
        expiresAt,
      };

      setVerifiedFacilitySessions((prev) => ({
        ...prev,
        [params.facilityId]: newSession,
      }));

      const targetFac = facilities.find((f) => f.id === params.facilityId);
      if (targetFac) {
        setActiveFacilityWorkspace({ facility: targetFac, assignment });
      }

      const verifyLog: FacilityApprovalLog = {
        id: `fac-log-${now.toString(36)}`,
        institutionId: assignment.institutionId,
        facilityId: params.facilityId,
        facilityName: params.facilityName,
        handlerUserId: params.handlerId,
        handlerName: params.handlerName,
        handlerRole: params.handlerRole,
        bookingId: 'workspace-unlock',
        bookingReference: 'WORKSPACE-PIN',
        eventName: 'Facility Workspace PIN Unlock',
        requesterName: params.handlerName,
        decision: 'code_verified',
        reason: 'SHA-256 access code verified against assignment credential.',
        timestamp: new Date(now).toISOString(),
        formattedTime: new Date(now).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        formattedDate: new Date(now).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      };
      setFacilityApprovalLogs((prev) => [verifyLog, ...prev]);
      saveFacilityApprovalLogToCloud(verifyLog).catch(() => {});

      addToast('success', 'Access Granted', `Facility workspace for ${params.facilityName} unlocked.`);
      return { success: true };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unable to verify access code.',
      };
    }
  };

  const clearVerifiedFacilitySession = (facilityId: string) => {
    setVerifiedFacilitySessions((prev) => {
      const copy = { ...prev };
      delete copy[facilityId];
      return copy;
    });
    if (activeFacilityWorkspace?.facility.id === facilityId) {
      setActiveFacilityWorkspace(null);
    }
    addToast('info', 'Workspace Locked', 'Session ended for this facility.');
  };

  const assignFacilityHandler = async (data: {
    facilityId: string;
    facilityName: string;
    handlerUserId: string;
    handlerName: string;
    handlerEmail: string;
    assignmentRole: 'primary' | 'backup';
    initialAccessCode?: string;
    notes?: string;
  }): Promise<{ success: boolean; assignment?: FacilityAssignment; error?: string }> => {
    const activeInst = institutions.find((i) => i.id === institutionId) || institutions[0];

    const existing = facilityAssignments.find(
      (a) =>
        a.facilityId === data.facilityId &&
        a.handlerUserId === data.handlerUserId &&
        a.assignmentStatus === 'active'
    );
    if (existing) {
      return { success: false, error: `${data.handlerName} is already actively assigned to ${data.facilityName}.` };
    }

    const assignmentId = `asgn-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`;
    let accessCodeHash: string | undefined;
    const trimmedCode = data.initialAccessCode?.trim() || '';
    if (trimmedCode.length >= 4) {
      accessCodeHash = await hashAccessCodeClient(assignmentId, trimmedCode);
    }

    const newAssignment: FacilityAssignment = {
      id: assignmentId,
      institutionId: activeInst.id,
      facilityId: data.facilityId,
      facilityName: data.facilityName,
      handlerUserId: data.handlerUserId,
      handlerName: data.handlerName,
      handlerEmail: data.handlerEmail,
      assignmentRole: data.assignmentRole,
      assignmentStatus: 'active',
      assignedAt: new Date().toISOString(),
      assignedBy: currentUser?.name || activeInst.assignedAdminName || 'University Admin',
      accessCodeConfigured: !!accessCodeHash,
      ...(accessCodeHash ? { accessCodeHash } : {}),
      notes: data.notes,
    };

    setFacilityAssignments((prev) => [newAssignment, ...prev]);
    saveFacilityAssignmentToCloud(newAssignment).catch((e) => console.warn('Cloud sync assignment:', e));

    addToast('success', 'Handler Assigned', `${data.handlerName} assigned as ${data.assignmentRole === 'primary' ? 'Primary' : 'Backup'} handler for ${data.facilityName}.`);
    return { success: true, assignment: newAssignment };
  };

  const revokeFacilityAssignment = async (assignmentId: string): Promise<{ success: boolean; error?: string }> => {
    const target = facilityAssignments.find((a) => a.id === assignmentId);
    if (!target) return { success: false, error: 'Assignment not found.' };

    const updated: FacilityAssignment = { ...target, assignmentStatus: 'revoked' as const };
    setFacilityAssignments((prev) => prev.map((a) => (a.id === assignmentId ? updated : a)));
    saveFacilityAssignmentToCloud(updated).catch((e) => console.warn('Cloud sync revoke assignment:', e));

    setVerifiedFacilitySessions((prev) => {
      const copy = { ...prev };
      delete copy[target.facilityId];
      return copy;
    });

    addToast('info', 'Assignment Revoked', `Access for ${target.handlerName} on ${target.facilityName} has been revoked.`);
    return { success: true };
  };

  const resetFacilityAccessCode = async (assignmentId: string, newAccessCode: string): Promise<{ success: boolean; error?: string }> => {
    if (!newAccessCode || newAccessCode.trim().length < 4) {
      return { success: false, error: 'Access code must be at least 4 characters.' };
    }

    const target = facilityAssignments.find((a) => a.id === assignmentId);
    if (!target) return { success: false, error: 'Assignment not found.' };

    try {
      const accessCodeHash = await hashAccessCodeClient(target.id, newAccessCode);
      const updatedAssignment: FacilityAssignment = {
        ...target,
        accessCodeConfigured: true,
        accessCodeHash,
      };

      setVerifiedFacilitySessions((prev) => {
        const copy = { ...prev };
        delete copy[target.facilityId];
        return copy;
      });
      delete pinLockoutRef.current[target.id];

      setFacilityAssignments((prev) =>
        prev.map((a) => (a.id === assignmentId ? updatedAssignment : a))
      );
      await saveFacilityAssignmentToCloud(updatedAssignment).catch((e) =>
        console.warn('Cloud sync reset access code:', e)
      );

      addToast('success', 'Access Code Configured', `New SHA-256 access credential configured for ${target.handlerName}.`);
      return { success: true };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to hash and save access code.',
      };
    }
  };

  const createFacilityHandlerAccount = async (data: {
    fullName: string;
    email: string;
    phone?: string;
    titleOrDesignation: string;
    notes?: string;
  }): Promise<{ success: boolean; handler?: FacilityHandler; error?: string }> => {
    const cleanEmail = data.email.trim().toLowerCase();
    if (!data.fullName.trim() || !cleanEmail) {
      return { success: false, error: 'Full name and institutional email are required.' };
    }

    if (facilityHandlers.some((h) => h.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'A facility handler account with this email already exists.' };
    }

    const activeInst = institutions.find((i) => i.id === institutionId) || institutions[0];
    const newHandler: FacilityHandler = {
      id: `hnd-${Date.now().toString(36)}`,
      institutionId: activeInst.id,
      fullName: data.fullName.trim(),
      name: data.fullName.trim(),
      email: cleanEmail,
      phone: data.phone?.trim(),
      titleOrDesignation: data.titleOrDesignation.trim() || 'Facility Personnel',
      department: data.titleOrDesignation.trim() || 'Physical Plant & Venues Desk',
      status: 'active',
      assignedFacilityIds: [],
      isPrimary: true,
      hasAccessCode: true,
      approvalCount: 0,
      createdAt: new Date().toISOString(),
      notes: data.notes?.trim(),
    };

    setFacilityHandlers((prev) => [newHandler, ...prev]);
    saveFacilityHandlerToCloud(newHandler).catch((e) => console.warn('Cloud sync handler:', e));

    // Also register in registered users so they can authenticate
    if (!registeredUsers.some((u) => u.email.toLowerCase() === cleanEmail)) {
      const userRec: RegisteredUserAccount = {
        id: `usr-${newHandler.id}`,
        fullName: newHandler.fullName,
        email: cleanEmail,
        institutionId: activeInst.id,
        userType: 'Facility Personnel',
        organizationOrDept: newHandler.titleOrDesignation,
        role: 'facility_handler',
        createdAt: new Date().toISOString().split('T')[0],
        status: 'active',
      };
      setRegisteredUsers((prev) => [userRec, ...prev]);
      saveUserToCloud(userRec).catch((e) => console.warn('Cloud sync user:', e));
    }

    addToast('success', 'Handler Account Created', `${newHandler.fullName} is now registered as facility personnel.`);
    return { success: true, handler: newHandler };
  };

  const updateFacilityHandlerStatus = (handlerId: string, status: 'active' | 'suspended') => {
    setFacilityHandlers((prev) =>
      prev.map((h) => (h.id === handlerId ? { ...h, status } : h))
    );
    const target = facilityHandlers.find((h) => h.id === handlerId);
    if (target) {
      saveFacilityHandlerToCloud({ ...target, status }).catch((e) => console.warn('Cloud sync handler status:', e));
      // Invalidate sessions if suspended
      if (status === 'suspended') {
        const revokedAssignments = facilityAssignments.filter((a) => a.handlerUserId === handlerId);
        setVerifiedFacilitySessions((prev) => {
          const copy = { ...prev };
          revokedAssignments.forEach((a) => delete copy[a.facilityId]);
          return copy;
        });
      }
    }
    addToast('info', 'Status Updated', `Handler status set to ${status}.`);
  };

  const approveBookingAsHandler = async (params: {
    bookingId: string;
    facilityId: string;
    notes?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    const booking = bookings.find((b) => b.id === params.bookingId);
    if (!booking) {
      return { success: false, error: 'Booking record not found.' };
    }

    if (booking.facilityId !== params.facilityId) {
      return { success: false, error: 'Access Denied: Booking does not belong to the selected facility.' };
    }

    // Atomic status check: cannot approve an already approved/rejected booking
    if (booking.status === 'approved') {
      return { success: false, error: 'This booking request is already approved.' };
    }

    // Check verified session for this facility
    const session = verifiedFacilitySessions[params.facilityId];
    if (!session || session.expiresAt < Date.now()) {
      return { success: false, error: 'Facility workspace access expired. Please re-enter access code.' };
    }

    // Check conflict
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
    const now = new Date();
    const formattedTime = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    const formattedDate = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const updatedBooking: BookingRequest = {
      ...booking,
      status: 'approved',
      reviewedAt: now.toISOString(),
      reviewedBy: `${session.handlerName} (${session.role === 'primary' ? 'Primary' : 'Backup'} Facility Handler)`,
      permitReference: permitRef,
      rejectionReason: undefined,
    };

    setBookings((prev) => prev.map((b) => (b.id === params.bookingId ? updatedBooking : b)));
    saveBookingToCloud(updatedBooking).catch((e) => console.warn('Cloud sync approveBookingAsHandler:', e));

    // Audit Log Entry
    const auditLog: FacilityApprovalLog = {
      id: `fac-log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      institutionId: booking.institutionId,
      facilityId: booking.facilityId,
      facilityName: booking.facilityName,
      handlerUserId: session.handlerId,
      handlerName: session.handlerName,
      handlerRole: session.role,
      bookingId: booking.id,
      bookingReference: booking.referenceNumber,
      eventName: booking.eventName,
      requesterName: booking.requesterName,
      requesterOrg: booking.organization,
      decision: 'approved',
      reason: params.notes || 'All requirements and scheduling verified.',
      timestamp: now.toISOString(),
      formattedTime,
      formattedDate,
      ipAddress: '120.28.16.84',
    };

    setFacilityApprovalLogs((prev) => [auditLog, ...prev]);
    saveFacilityApprovalLogToCloud(auditLog).catch((e) => console.warn('Cloud sync approval log:', e));

    fetch('/api/facility-handlers/record-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(auditLog),
    }).catch((e) => console.warn('Backend record-log:', e));

    addToast('success', 'Permit Issued', `Booking ${booking.referenceNumber} approved by ${session.handlerName} (Permit: ${permitRef}).`);
    return { success: true };
  };

  const rejectBookingAsHandler = async (params: {
    bookingId: string;
    facilityId: string;
    reason: string;
  }): Promise<{ success: boolean; error?: string }> => {
    const booking = bookings.find((b) => b.id === params.bookingId);
    if (!booking) {
      return { success: false, error: 'Booking record not found.' };
    }

    if (booking.facilityId !== params.facilityId) {
      return { success: false, error: 'Access Denied: Booking does not belong to the selected facility.' };
    }

    if (!params.reason.trim()) {
      return { success: false, error: 'Rejection reason is required.' };
    }

    const session = verifiedFacilitySessions[params.facilityId];
    if (!session || session.expiresAt < Date.now()) {
      return { success: false, error: 'Facility workspace access expired. Please re-enter access code.' };
    }

    const now = new Date();
    const formattedTime = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    const formattedDate = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const updatedBooking: BookingRequest = {
      ...booking,
      status: 'rejected',
      reviewedAt: now.toISOString(),
      reviewedBy: `${session.handlerName} (${session.role === 'primary' ? 'Primary' : 'Backup'} Facility Handler)`,
      rejectionReason: params.reason.trim(),
    };

    setBookings((prev) => prev.map((b) => (b.id === params.bookingId ? updatedBooking : b)));
    saveBookingToCloud(updatedBooking).catch((e) => console.warn('Cloud sync rejectBookingAsHandler:', e));

    // Audit Log Entry
    const auditLog: FacilityApprovalLog = {
      id: `fac-log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      institutionId: booking.institutionId,
      facilityId: booking.facilityId,
      facilityName: booking.facilityName,
      handlerUserId: session.handlerId,
      handlerName: session.handlerName,
      handlerRole: session.role,
      bookingId: booking.id,
      bookingReference: booking.referenceNumber,
      eventName: booking.eventName,
      requesterName: booking.requesterName,
      requesterOrg: booking.organization,
      decision: 'rejected',
      reason: params.reason.trim(),
      timestamp: now.toISOString(),
      formattedTime,
      formattedDate,
      ipAddress: '120.28.16.84',
    };

    setFacilityApprovalLogs((prev) => [auditLog, ...prev]);
    saveFacilityApprovalLogToCloud(auditLog).catch((e) => console.warn('Cloud sync reject log:', e));

    fetch('/api/facility-handlers/record-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(auditLog),
    }).catch((e) => console.warn('Backend record-log:', e));

    addToast('info', 'Request Rejected', `Booking ${booking.referenceNumber} rejected. Reason logged in audit history.`);
    return { success: true };
  };

  // Unified Facility Handler helpers (used by AdminPersonnelView & AdminRequestsView)
  const institutionHandlers = useMemo(() => {
    return facilityHandlers.filter((h) => h.institutionId === institutionId);
  }, [facilityHandlers, institutionId]);

  const addFacilityHandler = async (data: {
    name: string;
    email: string;
    phone?: string;
    institutionId: string;
    department: string;
    status: 'active' | 'suspended';
    assignedFacilityIds: string[];
    isPrimary: boolean;
    hasAccessCode: boolean;
    initialAccessCode?: string;
  }) => {
    const handlerId = `hnd-${Date.now().toString(36)}`;
    const hasValidPin = !!(data.initialAccessCode && data.initialAccessCode.trim().length >= 4);
    const newHandler: FacilityHandler = {
      id: handlerId,
      institutionId: data.institutionId,
      fullName: data.name.trim(),
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone?.trim(),
      titleOrDesignation: data.department.trim() || 'Facility Personnel',
      department: data.department.trim() || 'Physical Plant & Venues Desk',
      status: data.status,
      assignedFacilityIds: data.assignedFacilityIds,
      isPrimary: data.isPrimary,
      hasAccessCode: hasValidPin,
      approvalCount: 0,
      createdAt: new Date().toISOString(),
    };
    setFacilityHandlers((prev) => [newHandler, ...prev]);
    saveFacilityHandlerToCloud(newHandler).catch(() => {});

    for (const facId of data.assignedFacilityIds) {
      const fac = facilities.find((f) => f.id === facId);
      if (fac) {
        await assignFacilityHandler({
          facilityId: fac.id,
          facilityName: fac.name,
          handlerUserId: handlerId,
          handlerName: newHandler.name,
          handlerEmail: newHandler.email,
          assignmentRole: data.isPrimary ? 'primary' : 'backup',
          initialAccessCode: data.initialAccessCode,
        });
      }
    }

    addToast('success', 'Personnel Added', `${newHandler.name} assigned to ${newHandler.assignedFacilityIds.length} venue(s).`);
  };

  const updateFacilityHandler = async (
    handlerId: string,
    updates: Partial<FacilityHandler> & { newAccessCode?: string }
  ) => {
    const { newAccessCode, ...handlerUpdates } = updates;
    const existingHandler = facilityHandlers.find((h) => h.id === handlerId);
    const hasNewPin = !!(newAccessCode && newAccessCode.trim().length >= 4);

    setFacilityHandlers((prev) => {
      const next = prev.map((h) => {
        if (h.id !== handlerId) return h;
        const mergedName = handlerUpdates.name ?? handlerUpdates.fullName ?? h.name;
        const mergedDept = handlerUpdates.department ?? handlerUpdates.titleOrDesignation ?? h.department;
        return {
          ...h,
          ...handlerUpdates,
          name: mergedName,
          fullName: mergedName,
          department: mergedDept,
          titleOrDesignation: mergedDept,
          hasAccessCode: hasNewPin ? true : h.hasAccessCode,
        };
      });
      saveFacilityHandlersToCloud(next).catch(() => {});
      return next;
    });

    if (hasNewPin && newAccessCode) {
      const targetFacIds = handlerUpdates.assignedFacilityIds || existingHandler?.assignedFacilityIds || [];
      for (const facId of targetFacIds) {
        const activeAsgn = facilityAssignments.find(
          (a) => a.handlerUserId === handlerId && a.facilityId === facId && a.assignmentStatus === 'active'
        );
        if (activeAsgn) {
          await resetFacilityAccessCode(activeAsgn.id, newAccessCode);
        } else if (existingHandler) {
          const fac = facilities.find((f) => f.id === facId);
          if (fac) {
            await assignFacilityHandler({
              facilityId: fac.id,
              facilityName: fac.name,
              handlerUserId: handlerId,
              handlerName: handlerUpdates.name || existingHandler.name,
              handlerEmail: handlerUpdates.email || existingHandler.email,
              assignmentRole: (handlerUpdates.isPrimary ?? existingHandler.isPrimary) ? 'primary' : 'backup',
              initialAccessCode: newAccessCode,
            });
          }
        }
      }
    }

    addToast('info', 'Personnel Updated', 'Facility handler record updated.');
  };

  const deleteFacilityHandler = (handlerId: string) => {
    setFacilityHandlers((prev) => prev.filter((h) => h.id !== handlerId));
    deleteFacilityHandlerFromCloud(handlerId).catch(() => {});
    addToast('warning', 'Personnel Removed', 'Handler privileges revoked.');
  };

  const verifyAndExecuteHandlerApproval = async (
    req: HandlerApprovalVerificationRequest
  ): Promise<{ success: boolean; error?: string }> => {
    if (!auth.currentUser || !auth.currentUser.emailVerified) {
      return { success: false, error: 'Verified Firebase session required to authorize facility permits.' };
    }

    const handler = facilityHandlers.find((h) => h.id === req.handlerId);
    const booking = bookings.find((b) => b.id === req.bookingId);
    if (!handler || !booking) {
      return { success: false, error: 'Handler or booking record not found.' };
    }

    const assignment = facilityAssignments.find(
      (a) =>
        a.handlerUserId === req.handlerId &&
        a.facilityId === req.facilityId &&
        a.assignmentStatus === 'active'
    );
    if (!assignment) {
      return { success: false, error: 'Selected handler does not have an active assignment for this facility.' };
    }
    if (!assignment.accessCodeConfigured || !assignment.accessCodeHash) {
      return {
        success: false,
        error: 'No security PIN is configured for this handler on this facility. Configure a PIN in Personnel Assignments first.',
      };
    }

    const lockoutKey = assignment.id;
    const lockout = pinLockoutRef.current[lockoutKey];
    const nowMs = Date.now();
    if (lockout && lockout.lockedUntil > nowMs) {
      return {
        success: false,
        error: `Too many invalid PIN attempts. Retry in ${Math.ceil((lockout.lockedUntil - nowMs) / 1000)}s.`,
      };
    }

    const enteredHash = await hashAccessCodeClient(assignment.id, req.accessCode);
    if (enteredHash !== assignment.accessCodeHash) {
      const nextAttempts = (lockout?.attempts || 0) + 1;
      const lockedUntil = nextAttempts >= 5 ? nowMs + 60 * 1000 : 0;
      pinLockoutRef.current[lockoutKey] = { attempts: nextAttempts, lockedUntil };
      const attemptsRemaining = Math.max(0, 5 - nextAttempts);
      return {
        success: false,
        error:
          lockedUntil > nowMs
            ? '5 failed PIN attempts. Verification locked for 60 seconds.'
            : `Invalid handler security PIN. ${attemptsRemaining} attempt(s) remaining.`,
      };
    }

    delete pinLockoutRef.current[lockoutKey];

    if (req.decision === 'reject') {
      const rejectRes = rejectBooking(req.bookingId, req.rejectionReason || 'Rejected by designated facility handler.');
      return rejectRes;
    }

    const conflict = checkTimeConflict(booking.facilityId, booking.date, booking.startTime, booking.endTime, booking.id);
    if (conflict.hasConflict && conflict.conflictingBooking) {
      return {
        success: false,
        error: `Conflict detected with "${conflict.conflictingBooking.eventName}".`,
      };
    }

    const now = new Date();
    const permitRef = `PERMIT-${now.getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const updatedBooking: BookingRequest = {
      ...booking,
      status: 'approved',
      reviewedAt: now.toISOString(),
      reviewedBy: `${handler.name} (${handler.isPrimary ? 'Primary' : 'Backup'} Handler PIN Verified)`,
      permitReference: permitRef,
    };

    setBookings((prev) => prev.map((b) => (b.id === booking.id ? updatedBooking : b)));
    saveBookingToCloud(updatedBooking).catch(() => {});

    setFacilityHandlers((prev) => {
      const next = prev.map((h) =>
        h.id === handler.id
          ? { ...h, approvalCount: (h.approvalCount || 0) + 1, lastActive: now.toISOString(), lastActiveAt: now.toISOString() }
          : h
      );
      saveFacilityHandlersToCloud(next).catch(() => {});
      return next;
    });

    const auditLog: FacilityApprovalLog = {
      id: `fac-log-${Date.now().toString(36)}`,
      institutionId: booking.institutionId,
      facilityId: booking.facilityId,
      facilityName: booking.facilityName,
      handlerUserId: handler.id,
      handlerName: handler.name,
      handlerRole: handler.isPrimary ? 'primary' : 'backup',
      bookingId: booking.id,
      bookingReference: booking.referenceNumber,
      eventName: booking.eventName,
      requesterName: booking.requesterName,
      requesterOrg: booking.organization,
      decision: 'approved',
      reason: 'Authenticated via personnel PIN sign-off.',
      timestamp: now.toISOString(),
      formattedTime: now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      formattedDate: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      ipAddress: '120.28.16.84',
    };
    setFacilityApprovalLogs((prev) => [auditLog, ...prev]);
    saveFacilityApprovalLogToCloud(auditLog).catch(() => {});

    addToast('success', 'Handler Permit Issued', `Booking ${booking.referenceNumber} approved by ${handler.name} (${permitRef}).`);
    return { success: true };
  };

  // -------------------------------------------------------------
  // AI AUTOMATION, WORKFLOW BUILDER & EMAIL DISPATCH ACTIONS
  // -------------------------------------------------------------
  const approveAIJob = (jobId: string) => {
    const target = aiAutomationJobs.find((j) => j.id === jobId);
    if (!target) return;
    const now = new Date();

    setAiAutomationJobs((prev) => {
      const next = prev.map((j) =>
        j.id === jobId
          ? {
              ...j,
              status: 'completed' as const,
              processedAt: now.toISOString(),
              approvedBy: currentUser?.name || 'Super Admin',
              executionLogs: [...j.executionLogs, `approved_by:${currentUser?.name || 'Super Admin'}`, 'dispatch:completed'],
            }
          : j
      );
      saveAIAutomationJobsToCloud(next).catch(() => {});
      return next;
    });

    const emailRec: EmailDeliveryRecord = {
      id: `eml-${Date.now().toString(36)}`,
      jobId: target.id,
      subject: `[Approved Dispatch] ${target.title}`,
      inquiryType: target.aiCategory || 'Enterprise Onboarding',
      recipientCount: 5,
      status: 'delivered',
      timestamp: now.toISOString(),
      formattedTime: now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      provider: 'SmartSpace Cloud Dispatcher',
      idempotencyKey: `idem_${jobId}_${now.getTime()}`,
      retryAttempt: 0,
      isPrivateBcc: true,
    };
    setEmailDeliveryRecords((prev) => {
      const next = [emailRec, ...prev];
      saveEmailDeliveryRecordsToCloud(next).catch(() => {});
      return next;
    });
    addToast('success', 'AI Task Approved', `Dispatched response for "${target.title}".`);
  };

  const retryAIJob = (jobId: string) => {
    setAiAutomationJobs((prev) => {
      const next = prev.map((j) =>
        j.id === jobId
          ? {
              ...j,
              status: 'completed' as const,
              retryCount: j.retryCount + 1,
              processedAt: new Date().toISOString(),
              executionLogs: [...j.executionLogs, `retry_${j.retryCount + 1}:completed`],
            }
          : j
      );
      saveAIAutomationJobsToCloud(next).catch(() => {});
      return next;
    });
    addToast('info', 'Task Retried', 'Automation task re-executed cleanly.');
  };

  const retryEmailDelivery = (recordId: string) => {
    const now = new Date();
    setEmailDeliveryRecords((prev) => {
      const next = prev.map((r) =>
        r.id === recordId
          ? {
              ...r,
              status: 'delivered' as const,
              retryAttempt: r.retryAttempt + 1,
              timestamp: now.toISOString(),
              formattedTime: now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
            }
          : r
      );
      saveEmailDeliveryRecordsToCloud(next).catch(() => {});
      return next;
    });
    addToast('success', 'Alert Re-Dispatched', 'Private BCC notification delivered to provisioned Super Admins.');
  };

  const triggerManualAIAnalysis = async (): Promise<{ success: boolean; summary?: string; error?: string }> => {
    const pendingCount = bookings.filter((b) => b.status === 'pending').length;
    const approvedCount = bookings.filter((b) => b.status === 'approved').length;
    const rejectedCount = bookings.filter((b) => b.status === 'rejected').length;

    try {
      const resp = await fetch('/api/ai/diagnostics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          institutionsCount: institutions.length,
          facilitiesCount: facilities.length,
          bookingsSummary: {
            total: bookings.length,
            pending: pendingCount,
            approved: approvedCount,
            rejected: rejectedCount,
            demoRequestsPending: demoRequests.length,
          },
        }),
      });
      const data = await resp.json();
      if (!resp.ok || !data.success) {
        addToast('error', 'AI Diagnostics Error', data.error || 'Could not reach Gemini diagnostics endpoint.');
        return { success: false, error: data.error };
      }

      const now = new Date();
      const job: AIAutomationJob = {
        id: `ai-job-${Date.now().toString(36)}`,
        type: 'utilization_summary',
        status: 'completed',
        title: `Live Gemini Diagnostics Brief (${institutions.length} Institutions)`,
        aiCategory: 'Standard Reservation',
        aiSummary: data.summary,
        executionLogs: ['trigger:manual_diagnostics', `model:${data.model || 'gemini-4-hydrogen'}`, 'status:completed'],
        retryCount: 0,
        maxRetries: 3,
        createdAt: now.toISOString(),
        processedAt: now.toISOString(),
      };
      setAiAutomationJobs((prev) => {
        const next = [job, ...prev];
        saveAIAutomationJobsToCloud(next).catch(() => {});
        return next;
      });
      addToast('success', 'Gemini Diagnostics Ready', 'Real-time venue diagnostics generated.');
      return { success: true, summary: data.summary };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network error running AI diagnostics.' };
    }
  };

  const saveAIWorkflow = (workflow: AIWorkflowDefinition) => {
    setAiWorkflows((prev) => {
      const exists = prev.some((w) => w.id === workflow.id);
      const next = exists
        ? prev.map((w) => (w.id === workflow.id ? { ...workflow, updatedAt: new Date().toISOString() } : w))
        : [workflow, ...prev];
      saveAIWorkflowsToCloud(next).catch(() => {});
      return next;
    });
    addToast('success', 'AI Workflow Saved', `"${workflow.name}" synced to Firestore & runtime.`);
  };

  const deleteAIWorkflow = (workflowId: string) => {
    setAiWorkflows((prev) => {
      const next = prev.filter((w) => w.id !== workflowId);
      saveAIWorkflowsToCloud(next).catch(() => {});
      return next;
    });
    addToast('info', 'Workflow Removed', 'AI workflow deleted.');
  };

  const runAIWorkflow = async (workflowId: string, inputPayload: string): Promise<AIWorkflowRunResult> => {
    const wf = aiWorkflows.find((w) => w.id === workflowId);
    if (!wf) {
      return {
        success: false,
        workflowId,
        workflowName: 'Unknown Workflow',
        traces: [],
        finalOutput: '',
        totalDurationMs: 0,
        error: 'Workflow definition not found.',
      };
    }

    try {
      const resp = await fetch('/api/ai/run-workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflowId: wf.id,
          workflowName: wf.name,
          steps: wf.steps,
          initialInput: inputPayload,
        }),
      });
      const result: AIWorkflowRunResult = await resp.json();

      if (resp.ok && result.success) {
        const now = new Date().toISOString();
        setAiWorkflows((prev) => {
          const next = prev.map((w) =>
            w.id === wf.id ? { ...w, lastRunAt: now, runCount: (w.runCount || 0) + 1 } : w
          );
          saveAIWorkflowsToCloud(next).catch(() => {});
          return next;
        });

        const newJob: AIAutomationJob = {
          id: `ai-wf-job-${Date.now().toString(36)}`,
          type: 'opal_workflow_run',
          status: 'completed',
          title: `Workflow Run: ${wf.name}`,
          relatedEntityId: wf.id,
          aiCategory: 'Standard Reservation',
          aiSummary: result.finalOutput.slice(0, 360),
          executionLogs: [
            `workflow:${wf.id}`,
            ...result.traces.map((t) => `${t.title}:${t.model}(${t.durationMs}ms)`),
            `total:${result.totalDurationMs}ms`,
          ],
          retryCount: 0,
          maxRetries: 3,
          createdAt: now,
          processedAt: now,
        };
        setAiAutomationJobs((prev) => {
          const next = [newJob, ...prev];
          saveAIAutomationJobsToCloud(next).catch(() => {});
          return next;
        });
        addToast('success', 'Workflow Executed', `${wf.name} completed ${result.traces.length} step(s).`);
      } else {
        addToast('error', 'Workflow Error', result.error || 'Workflow execution failed.');
      }

      return result;
    } catch (err: any) {
      return {
        success: false,
        workflowId: wf.id,
        workflowName: wf.name,
        traces: [],
        finalOutput: '',
        totalDurationMs: 0,
        error: err?.message || 'Network error running workflow.',
      };
    }
  };

  const recordInboundOpalEvent = (event: {
    id: string;
    title: string;
    category: string;
    summary: string;
    source?: string;
  }) => {
    const now = new Date().toISOString();
    const job: AIAutomationJob = {
      id: event.id,
      type: 'opal_workflow_run',
      status: 'requires_human_approval',
      title: event.title,
      aiCategory: 'General Inquiry',
      aiSummary: event.summary,
      suggestedSuperAdmin: 'Rashmae',
      executionLogs: [`webhook:${event.source || 'opal'}`, 'received:/api/webhooks/opal', 'gate:requires_human_approval'],
      retryCount: 0,
      maxRetries: 3,
      createdAt: now,
    };
    setAiAutomationJobs((prev) => {
      const next = [job, ...prev.filter((j) => j.id !== job.id)];
      saveAIAutomationJobsToCloud(next).catch(() => {});
      return next;
    });
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
        signInWithGoogle,
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
        updateUserAccountStatus,
        updateUserAccountRole,
        platformSettings,
        updatePlatformSettings,
        cloudSyncStatus,
        syncWithFirestore,
        // Facility Handler Architecture
        facilityHandlers,
        institutionHandlers,
        facilityAssignments,
        facilityApprovalLogs,
        verifiedFacilitySessions,
        activeFacilityWorkspace,
        setActiveFacilityWorkspace,
        addFacilityHandler,
        updateFacilityHandler,
        deleteFacilityHandler,
        verifyAndExecuteHandlerApproval,
        verifyFacilityAccessCode,
        clearVerifiedFacilitySession,
        assignFacilityHandler,
        revokeFacilityAssignment,
        resetFacilityAccessCode,
        createFacilityHandlerAccount,
        updateFacilityHandlerStatus,
        approveBookingAsHandler,
        rejectBookingAsHandler,
        checkHandlerFacilityAccess,
        // AI Automation & Workflow Builder
        aiAutomationJobs,
        emailDeliveryRecords,
        aiWorkflows,
        approveAIJob,
        retryAIJob,
        retryEmailDelivery,
        triggerManualAIAnalysis,
        saveAIWorkflow,
        deleteAIWorkflow,
        runAIWorkflow,
        recordInboundOpalEvent,
        runConciergeForDemo,
        loginSecurityEvents,
        revokeSecurityEvent,
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
