export type UserRole = 'super_admin' | 'university_admin' | 'admin' | 'facility_handler' | 'student' | 'faculty';

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
  institutionType?: string;
  contactName: string;
  contactEmail: string;
  contactNumber: string;
  designation: string;
  estimatedFacilities: string;
  preferredDate?: string;
  message?: string;
  submittedAt: string;
  status: 'new' | 'contacted' | 'scheduled';
  aiRecommendedTier?: string;
  aiLeadWarmth?: 'Hot' | 'Warm' | 'Nurture';
  aiTeamSummary?: string;
  aiEmailDraft?: string;
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
    | 'Facility Personnel'
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
  | 'Lecture Hall'
  | 'Computer Laboratory'
  | 'Conference Room'
  | 'University Auditorium'
  | 'Student Activity Room'
  | 'Multimedia Presentation Hall'
  | 'Gymnasium'
  | 'Open Court';

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

// ========================================================
// FACILITY PERSONNEL & SECURE HANDLER APPROVALS
// ========================================================
export interface FacilityHandler {
  id: string;
  institutionId: string;
  fullName: string;
  name: string;
  email: string;
  phone?: string;
  titleOrDesignation: string;
  department: string;
  status: 'active' | 'suspended';
  assignedFacilityIds: string[];
  isPrimary: boolean;
  hasAccessCode: boolean;
  approvalCount: number;
  lastActive?: string;
  lastActiveAt?: string;
  createdAt: string;
  notes?: string;
}

export interface HandlerApprovalVerificationRequest {
  handlerId: string;
  facilityId: string;
  bookingId: string;
  accessCode: string;
  decision: 'approve' | 'reject';
  rejectionReason?: string;
}

// ========================================================
// AGENTIC AI AUTOMATION, WORKFLOW BUILDER & OPAL BRIDGE
// ========================================================
export type AutomationJobType =
  | 'demo_categorization'
  | 'booking_notification'
  | 'handler_alert'
  | 'utilization_summary'
  | 'reminder_dispatch'
  | 'opal_workflow_run';

export type AutomationJobStatus =
  | 'queued'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'requires_human_approval';

export interface AIAutomationJob {
  id: string;
  type: AutomationJobType;
  status: AutomationJobStatus;
  title: string;
  institutionId?: string;
  relatedEntityId?: string; // bookingId, demoRequestId, or workflowId
  aiSummary?: string;
  aiDraftContent?: string;
  aiCategory?: 'Enterprise Onboarding' | 'Public Pilot' | 'Collegiate Competition' | 'General Inquiry' | 'Standard Reservation';
  recommendedTier?: string;
  leadWarmth?: 'Hot' | 'Warm' | 'Nurture';
  suggestedSuperAdmin?: string;
  executionLogs: string[];
  retryCount: number;
  maxRetries: number;
  createdAt: string;
  processedAt?: string;
  approvedBy?: string;
  error?: string;
}

export type AIWorkflowNodeKind = 'trigger' | 'gemini_generate' | 'structured_extract' | 'dispatch_action';

export interface AIWorkflowStep {
  id: string;
  order: number;
  kind: AIWorkflowNodeKind;
  title: string;
  model: 'gemini-4-hydrogen' | 'gemini-3.1-flash-lite';
  systemInstruction?: string;
  promptTemplate: string; // Supports {{input}} and {{prev_output}}
  outputFormat?: 'text' | 'json';
}

export interface AIWorkflowDefinition {
  id: string;
  name: string;
  description: string;
  triggerType: 'manual' | 'demo_request' | 'booking_created' | 'opal_webhook';
  isActive: boolean;
  steps: AIWorkflowStep[];
  createdAt: string;
  updatedAt: string;
  lastRunAt?: string;
  runCount: number;
  opalCompatibleVersion: string;
}

export interface AIWorkflowStepTrace {
  stepId: string;
  title: string;
  kind: AIWorkflowNodeKind;
  model: string;
  output: string;
  durationMs: number;
  status: 'completed' | 'failed';
}

export interface AIWorkflowRunResult {
  success: boolean;
  workflowId: string;
  workflowName: string;
  traces: AIWorkflowStepTrace[];
  finalOutput: string;
  totalDurationMs: number;
  error?: string;
}

// ========================================================
// EMAIL DISPATCH & DELIVERY AUDIT RECORDS
// ========================================================
export type EmailDeliveryStatus = 'queued' | 'sending' | 'sent' | 'delivered' | 'failed' | 'retry_scheduled';

export interface EmailDeliveryRecord {
  id: string;
  jobId?: string;
  subject: string;
  inquiryType?: string;
  recipientCount: number; // Stored securely; addresses kept private
  status: EmailDeliveryStatus;
  timestamp: string;
  formattedTime: string;
  provider: 'Resend' | 'SmartSpace Cloud Dispatcher';
  idempotencyKey: string;
  errorMessage?: string;
  retryAttempt: number;
  isPrivateBcc: boolean;
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

// FacilityHandler is unified above.

export interface FacilityAssignment {
  id: string; // e.g. "asgn-ctu-julia-cn-hall"
  institutionId: string;
  facilityId: string;
  facilityName: string;
  handlerUserId: string;
  handlerName: string;
  handlerEmail: string;
  assignmentRole: 'primary' | 'backup';
  assignmentStatus: 'active' | 'revoked';
  assignedAt: string;
  assignedBy: string; // name or email of University Admin
  accessCodeConfigured: boolean;
  notes?: string;
}

export interface FacilityApprovalLog {
  id: string;
  institutionId: string;
  facilityId: string;
  facilityName: string;
  handlerUserId: string;
  handlerName: string;
  handlerRole: 'primary' | 'backup';
  bookingId: string;
  bookingReference: string;
  eventName: string;
  requesterName: string;
  requesterOrg?: string;
  decision: 'approved' | 'rejected' | 'code_verified' | 'verification_failed' | 'assignment_revoked';
  reason?: string;
  timestamp: string; // ISO
  formattedTime: string; // 12-hour AM/PM e.g. "2:30 PM"
  formattedDate: string; // e.g. "Oct 30, 2026"
  ipAddress?: string;
}

export interface VerifiedFacilitySession {
  assignmentId: string;
  facilityId: string;
  facilityName: string;
  handlerId: string;
  handlerName: string;
  handlerEmail: string;
  role: 'primary' | 'backup';
  token: string;
  verifiedAt: string; // ISO
  expiresAt: number; // timestamp in ms
}
