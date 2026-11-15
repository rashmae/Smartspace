/**
 * SmartSpace Business & Compliance Single Source of Truth
 *
 * HARD RULE: Never invent unverified legal, contact, registration, pricing, or
 * certification facts. All unconfirmed items use explicit `[TO BE CONFIRMED: ...]`
 * placeholders verified by `npm run check:placeholders`.
 */

export interface IndicativePlan {
  id: 'basic' | 'professional' | 'enterprise';
  name: string;
  indicativeMonthlyPhp: number;
  displayPrice: string;
  label: string;
  scopeSummary: string;
}

export const BUSINESS_CONFIG = {
  // Confirmed product identity
  brandName: 'SmartSpace',
  tagline: 'Book It, Track It, Use It.',
  description:
    'A software-as-a-service platform for facility search, availability checking, booking requests, approvals, reservation records and utilization reports for colleges and universities in Cebu City.',
  stage: 'Pilot-stage prototype' as const,
  stageNote:
    'Pilot-stage prototype evaluated with a small group of users in October 2026.',
  serviceArea: 'Higher-education institutions in Cebu City, Philippines',
  country: 'Philippines',
  defaultCity: 'Cebu City',
  language: 'en-PH',

  // Indicative pricing only (proposed estimates, NOT verified commercial offers)
  indicativePricingDisclaimer: 'Indicative pricing, subject to confirmation',
  indicativePlans: [
    {
      id: 'basic',
      name: 'Basic',
      indicativeMonthlyPhp: 3000,
      displayPrice: '₱3,000 / institution / month',
      label: 'Indicative pricing, subject to confirmation',
      scopeSummary:
        'Digital facility profiles, schedule availability viewing, and conflict-checked booking requests.',
    },
    {
      id: 'professional',
      name: 'Professional',
      indicativeMonthlyPhp: 6000,
      displayPrice: '₱6,000 / institution / month',
      label: 'Indicative pricing, subject to confirmation',
      scopeSummary:
        'Multi-tier approval workflows, facility custodian verification, and utilization reporting.',
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      indicativeMonthlyPhp: 10000,
      displayPrice: '₱10,000 / institution / month',
      label: 'Indicative pricing, subject to confirmation',
      scopeSummary:
        'Multi-campus administration, reservation audit logs, QR gate-pass workflow support, and dedicated onboarding support.',
    },
  ] satisfies IndicativePlan[],

  // Policy versioning
  policyVersion: '0.1.0-draft',
  legalBannerText:
    'DRAFT - pending legal review. Nothing on this page constitutes legal advice; text will be reviewed by a Philippine lawyer before commercial launch.',

  // Placeholders requiring confirmation by the business owner / legal counsel
  legalEntityName: '[TO BE CONFIRMED: legal entity name]',
  businessRegistrationNo: '[TO BE CONFIRMED: DTI / SEC registration number]',
  registeredAddress: '[TO BE CONFIRMED: registered business address]',
  supportEmail: '[TO BE CONFIRMED: support email]',
  supportPhone: '[TO BE CONFIRMED: support phone]',
  dpoName: '[TO BE CONFIRMED: Data Protection Officer name]',
  dpoEmail: '[TO BE CONFIRMED: Data Protection Officer email]',
  npcRegistrationStatus: '[TO BE CONFIRMED: NPC registration status]',
  domainOwnership: '[TO BE CONFIRMED: verified production domain]',
  effectiveDate: '[TO BE CONFIRMED: effective date]',
  governingLaw: 'Republic of the Philippines',
  governingLawVenue: '[TO BE CONFIRMED: governing law venue in Cebu City, Philippines]',
  hostingProvider:
    'Google Firebase (pilot auth/Firestore) & [TO BE CONFIRMED: production hosting provider and deployment region]',
  registrationNote:
    'Academic pilot-stage venture; formal commercial business registration and permits are deferred pending pilot validation (Case Study 6).',
  paymentMethods: '[TO BE CONFIRMED: accepted payment methods]',
  billingCycle:
    'Monthly institutional subscription (proposed billing model; formal invoicing terms subject to institutional agreement)',
  refundEligibility: '[TO BE CONFIRMED: refund eligibility criteria and request window]',
  partialMonthRefunds: '[TO BE CONFIRMED: partial-month refund rule unless required by law]',
  refundResponseTime: '[TO BE CONFIRMED: refund request acknowledgement timeline]',
  refundProcessingTime: '[TO BE CONFIRMED: refund processing timeline]',
  retentionPeriods: {
    demoInquiries: '[TO BE CONFIRMED: retention period for demo request records]',
    accountProfiles: '[TO BE CONFIRMED: retention period for user account records]',
    bookingAndAuditLogs: '[TO BE CONFIRMED: retention period for booking records and audit logs]',
    consentRecords: '[TO BE CONFIRMED: retention period for consent records]',
  },
  accessibilityResponseTime: '[TO BE CONFIRMED: accessibility barrier response time]',

  // Prospective student team members — render publicly ONLY after written permission from each person
  teamRequiresWrittenConsent: true,
  prospectiveTeamMembers: [
    'Ansay, Rash Mae Crystelle',
    'Coloyan, Karl Hadriel',
    'Gonzales, Angel Mae',
    'Miñoza, Krisha',
  ],

  // Legal routes
  legalRoutes: {
    privacy: '/privacy',
    terms: '/terms',
    cookies: '/cookies',
    refunds: '/refunds',
    accessibility: '/accessibility',
  },
} as const;
