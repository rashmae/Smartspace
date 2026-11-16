/**
 * SmartSpace Business & Compliance Single Source of Truth
 *
 * All public pages, legal policies, consent notices, and metadata import
 * verified owner decisions from this module.
 */

export interface PlannedTierScope {
  id: 'basic' | 'professional' | 'enterprise';
  name: string;
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

  // Public pricing policy (paid-plan prices removed during free pilot)
  plannedPlansSummary: 'Paid plans are planned. Contact us.',
  indicativePricingDisclaimer: 'Paid plans are planned. Contact us.',
  indicativePlans: [
    {
      id: 'basic',
      name: 'Basic',
      displayPrice: 'Paid plans are planned. Contact us.',
      label: 'Paid plans are planned. Contact us.',
      scopeSummary:
        'Digital facility profiles, schedule availability viewing, and conflict-checked booking requests.',
    },
    {
      id: 'professional',
      name: 'Professional',
      displayPrice: 'Paid plans are planned. Contact us.',
      label: 'Paid plans are planned. Contact us.',
      scopeSummary:
        'Multi-tier approval workflows, facility custodian verification, and utilization reporting.',
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      displayPrice: 'Paid plans are planned. Contact us.',
      label: 'Paid plans are planned. Contact us.',
      scopeSummary:
        'Multi-campus administration, reservation audit logs, QR gate-pass workflow support, and dedicated onboarding support.',
    },
  ] satisfies PlannedTierScope[],

  // Policy versioning
  policyVersion: '0.1 DRAFT',
  effectiveDate: '15 November 2026',
  effectiveDateDisplay:
    '15 November 2026, version 0.1 DRAFT (update at launch and after legal review)',
  legalBannerText:
    'DRAFT - pending legal review. Nothing on this page constitutes legal advice; text will be reviewed by a Philippine lawyer before commercial launch.',

  // Confirmed business identity & contact (Items 1-6, 28)
  legalEntityName: 'SmartSpace (student pilot project, not yet a registered business)',
  businessRegistrationNo:
    'Not yet registered. This will be updated once DTI/SEC registration is completed.',
  registeredAddress:
    'Cebu City, Philippines. We currently handle all correspondence by email.',
  supportEmail: 'smartspaceinquiries0@gmail.com',
  supportEmailLabel: 'Email SmartSpace support',
  supportMailto: 'mailto:smartspaceinquiries0@gmail.com',
  supportPhone: 'Not offered during the pilot. Please contact us by email.',
  domainOwnership: 'https://smartspace-i7e5.vercel.app',
  canonicalHost: 'smartspace-i7e5.vercel.app',
  socialProfiles: {
    facebook: 'https://www.facebook.com/profile.php?id=61596064600234',
    facebookLabel: 'SmartSpace on Facebook',
    facebookAriaLabel: 'SmartSpace on Facebook (opens in a new tab)',
  },

  // Privacy & Governance (Items 7-12)
  dpoName: 'Privacy Contact, SmartSpace project team',
  dpoEmail: 'smartspaceinquiries0@gmail.com',
  dpoEmailLabel: 'Email SmartSpace Privacy Contact',
  dpoMailto: 'mailto:smartspaceinquiries0@gmail.com?subject=Privacy%20Request',
  npcRegistrationStatus:
    "Not yet registered. We are assessing our obligations under the National Privacy Commission's current rules and will register if required.",
  governingLaw: 'Republic of the Philippines',
  governingLawVenue:
    'Laws of the Republic of the Philippines; venue in the proper courts of Cebu City.',
  hostingProvider:
    'Vercel (front end) and Google Firebase (authentication and database). Region: [I WILL PASTE FROM VERCEL AND FIREBASE SETTINGS].',
  registrationNote:
    'Student pilot project, not yet registered. This will be updated once DTI/SEC registration is completed.',

  // Billing, Refunds, Retention & Accessibility (Items 13-22)
  paymentMethods:
    'No payments are accepted during the free pilot. Payment methods will be published before any paid plan is offered.',
  billingCycle: 'Paid plans are planned. Contact us.',
  refundEligibility:
    'Free pilot: nothing to refund. Future paid plans: refund requests within 14 days of the first payment, and for duplicate or wrongly charged amounts within 30 days.',
  partialMonthRefunds:
    'No prorated refunds for a partial billing period, except for duplicate or wrongly charged amounts or where the law requires it.',
  refundResponseTime: 'Acknowledge within 2 business days.',
  refundProcessingTime: 'Complete approved refunds within 30 days.',
  retentionPeriods: {
    demoInquiries: '12 months after the last contact, then deleted.',
    accountProfiles: 'While the account is active plus 90 days after closure.',
    bookingAndAuditLogs:
      "3 years from the booking date, or the institution's own records policy if longer.",
    consentRecords: 'As long as the related record exists, plus 12 months.',
  },
  accessibilityResponseTime:
    'Acknowledge within 5 business days and give a fix plan within 30 days.',

  // Legal routes
  legalRoutes: {
    privacy: '/privacy',
    terms: '/terms',
    cookies: '/cookies',
    refunds: '/refunds',
    accessibility: '/accessibility',
  },
} as const;
