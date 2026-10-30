export type UserRole = 'super_admin' | 'university_admin' | 'admin' | 'student' | 'faculty';

export interface InstitutionalRegistrationRequest {
  id: string;
  institutionName: string;
  institutionType: 'Public University' | 'Private University' | 'College' | 'Other';
  officialEmail: string;
  contactPerson: string;
  contactNumber: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  assignedAdminName?: string;
  assignedAdminEmail?: string;
  notes?: string;
}

export interface InstitutionalDemoRequest {
  id: string;
  institutionName: string;
  contactName: string;
  contactEmail: string;
  contactNumber: string;
  designation: string;
  estimatedFacilities: string;
  preferredDate?: string;
  message?: string;
  submittedAt: string;
  status: 'new' | 'contacted' | 'scheduled';
}

export interface RegisteredUserAccount {
  id: string;
  fullName: string;
  email: string;
  institutionId: string;
  userType: 
    | 'Student Organization Officer'
    | 'Faculty Member'
    | 'Department Representative'
    | 'Campus Office Representative'
    | 'Other Authorized User';
  organizationOrDept: string;
  role: UserRole;
  createdAt: string;
  status: 'active' | 'suspended';
}

export interface Institution {
  id: string;
  name: string;
  shortName: string;
  campus: string;
  city: string;
  type: 'Public' | 'Private';
  isPilot: boolean;
  status: 'active' | 'inactive' | 'trial';
  subscriptionPlan?: 'Pilot' | 'Standard' | 'Enterprise';
  contactName: string;
  contactEmail: string;
  assignedAdminName: string;
  assignedAdminEmail: string;
  registeredAt: string;
  statusNote?: string;
  // Cross-University Booking Policies
  allowExternalBookings: boolean;
  bookingPolicy: 'internal_only' | 'external_allowed' | 'approval_required';
  externalBookingNotice?: string;
  logoUrl?: string;
  description?: string;
  timeZone?: string;
  brandColor?: string;
  announcement?: string;
}

export type FacilityType = 
  | 'Lecture Room'
  | 'Computer Laboratory'
  | 'Conference Room'
  | 'University Auditorium'
  | 'Student Activity Room'
  | 'Multimedia Presentation Hall';

export interface Facility {
  id: string;
  institutionId: string;
  name: string;
  type: FacilityType;
  building: string;
  floor: string;
  capacity: number;
  equipment: string[];
  operatingHours: {
    open: string;
    close: string;
    days: string;
  };
  rules: string[];
  bookingRequirements: string[];
  imageUrl: string;
  description: string;
  status?: 'active' | 'inactive' | 'maintenance';
}

export type BookingStatus = 'pending' | 'approved' | 'rejected';

export interface BookingRequest {
  id: string;
  referenceNumber: string;
  institutionId: string; // The host university owning the facility
  facilityId: string;
  facilityName: string;
  eventName: string;
  purpose: string;
  date: string; // YYYY-MM-DD
  startTime: string; // stored format (normalized or HH:mm)
  endTime: string; // stored format (normalized or HH:mm)
  attendees: number;
  requesterName: string;
  requesterRole: 'Student' | 'Faculty';
  requesterEmail: string;
  organization?: string;
  notes?: string;
  status: BookingStatus;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  permitReference?: string;
  // Cross-University Request Tracking
  requesterInstitutionId?: string; // The university where the requester belongs
  requesterInstitutionName?: string;
  isExternalRequest?: boolean;
}

export interface LoginSecurityEvent {
  id: string;
  accountEmail: string;
  role: UserRole;
  institutionId?: string;
  institutionName?: string;
  timestamp: string;
  formattedTime: string;
  formattedDate: string;
  status: 'success' | 'failed';
  ipAddress: string;
  userAgent?: string;
  eventType: 'LOGIN_SUCCESS' | 'INVALID_CREDENTIALS' | 'ACCOUNT_SUSPENDED' | 'LOGOUT' | 'SESSION_REVOKED';
  sessionActive?: boolean;
}

export interface PlatformSettings {
  platformName: string;
  platformTagline: string;
  primaryColor: string;
  globalAnnouncement: string;
  announcementActive?: boolean;
  allowCrossUniversityDiscovery: boolean;
  defaultAdvanceBookingDays: number;
  requireInstitutionalEmailVerification: boolean;
  autoConflictDetection: boolean;
}

export interface TaskDefinition {
  id: number;
  number: number;
  title: string;
  prompt: string;
  instructions: string;
  expectedOutcome: string;
  shortcutView: 'facilities' | 'new-booking' | 'my-bookings' | 'admin-requests' | 'admin-records' | 'reports' | 'super-admin-universities' | 'admin-facilities';
  requiredRole: UserRole;
}

export interface TaskObservation {
  taskId: number;
  completed: boolean | null; // null = not recorded
  neededAssistance: boolean | null; // null = not recorded
  completionTimeSeconds: number | null; // null = not recorded
  difficultyNotes: string;
  participantComments: string;
}

export interface OpenEndedResponses {
  // Usability Specific Questions
  qFindFacilityEasy: string; // Was it easy to find a suitable facility?
  qAvailabilityClear: string; // Was the availability information clear?
  qBookingFormClear: string; // Was the booking form easy to understand?
  qStatusEasyToLocate: string; // Was the booking status easy to locate?
  qConfusionOrDifficulty: string; // What caused confusion or difficulty?
  qWhatToChange: string; // What would you change about SmartSpace?

  // Background & Process Questions
  q1CurrentProcess: string;
  q2CurrentDifficulties: string;
  q3ConfusingParts: string;
  q4MostUsefulFeature: string;
  q5SuggestedChanges: string;
  q6WillingnessToUse: string;
}

export interface ParticipantRating {
  easeOfUse: number | null; // 1-5
  usefulness: number | null; // 1-5
  overallExperience: number | null; // 1-5
}

export interface ParticipantRecord {
  id: number; // 1 to 5
  identifier: string; // "Participant 1"
  userType: 'Student' | 'Faculty' | 'Staff';
  collegeOrDepartment: string;
  tasks: Record<number, TaskObservation>;
  openEnded: OpenEndedResponses;
  ratings: ParticipantRating;
  testerNotes?: string;
  interviewSummary?: string;
  startedAt?: string;
  completedAt?: string;
  isCompleted: boolean;
}
