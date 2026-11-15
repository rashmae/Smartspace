import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { BUSINESS_CONFIG } from '../config/business';

export const CONSENT_STORAGE_KEY = 'smartspace_consent_v1';
export const FORM_CONSENT_LOG_KEY = 'smartspace_form_consents_v1';

export interface ConsentRecord {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
  policyVersion: string;
}

export interface FormConsentRecord {
  id: string;
  formName: string;
  policyVersion: string;
  consentText: string;
  marketingOptIn: boolean;
  timestamp: string;
}

interface ConsentContextValue {
  consent: ConsentRecord | null;
  formConsents: FormConsentRecord[];
  hasResponded: boolean;
  isBannerVisible: boolean;
  isPreferencesOpen: boolean;
  canUseAnalytics: boolean;
  canUseMarketing: boolean;
  openPreferences: () => void;
  closePreferences: () => void;
  acceptAll: () => void;
  rejectNonEssential: () => void;
  savePreferences: (prefs: { analytics: boolean; marketing: boolean }) => void;
  recordFormConsent: (entry: {
    formName: string;
    consentText: string;
    marketingOptIn?: boolean;
  }) => FormConsentRecord;
}

const ConsentContext = createContext<ConsentContextValue | undefined>(undefined);

function readStoredConsent(): ConsentRecord | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ConsentRecord>;
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      parsed.necessary !== true ||
      typeof parsed.analytics !== 'boolean' ||
      typeof parsed.marketing !== 'boolean' ||
      typeof parsed.timestamp !== 'string'
    ) {
      return null;
    }
    return {
      necessary: true,
      analytics: parsed.analytics,
      marketing: parsed.marketing,
      timestamp: parsed.timestamp,
      policyVersion:
        typeof parsed.policyVersion === 'string'
          ? parsed.policyVersion
          : BUSINESS_CONFIG.policyVersion,
    };
  } catch {
    return null;
  }
}

function readStoredFormConsents(): FormConsentRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(FORM_CONSENT_LOG_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistConsentRecord(record: ConsentRecord): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record));
  } catch {
    // Ignore storage quota / private-browsing write errors cleanly
  }
}

function persistFormConsentLog(records: FormConsentRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(FORM_CONSENT_LOG_KEY, JSON.stringify(records.slice(0, 100)));
  } catch {
    // Ignore storage quota / private-browsing write errors cleanly
  }
}

export const ConsentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [consent, setConsent] = useState<ConsentRecord | null>(() => readStoredConsent());
  const [formConsents, setFormConsents] = useState<FormConsentRecord[]>(() =>
    readStoredFormConsents()
  );
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);

  // Sync changes across tabs if user updates consent in another tab
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === CONSENT_STORAGE_KEY) {
        setConsent(readStoredConsent());
      } else if (e.key === FORM_CONSENT_LOG_KEY) {
        setFormConsents(readStoredFormConsents());
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const savePreferences = useCallback(
    ({ analytics, marketing }: { analytics: boolean; marketing: boolean }) => {
      const next: ConsentRecord = {
        necessary: true,
        analytics: Boolean(analytics),
        marketing: Boolean(marketing),
        timestamp: new Date().toISOString(),
        policyVersion: BUSINESS_CONFIG.policyVersion,
      };
      persistConsentRecord(next);
      setConsent(next);
      setIsPreferencesOpen(false);
    },
    []
  );

  const acceptAll = useCallback(() => {
    savePreferences({ analytics: true, marketing: true });
  }, [savePreferences]);

  const rejectNonEssential = useCallback(() => {
    savePreferences({ analytics: false, marketing: false });
  }, [savePreferences]);

  const openPreferences = useCallback(() => {
    setIsPreferencesOpen(true);
  }, []);

  const closePreferences = useCallback(() => {
    setIsPreferencesOpen(false);
  }, []);

  const recordFormConsent = useCallback(
    ({
      formName,
      consentText,
      marketingOptIn = false,
    }: {
      formName: string;
      consentText: string;
      marketingOptIn?: boolean;
    }): FormConsentRecord => {
      const record: FormConsentRecord = {
        id: `consent-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
        formName,
        policyVersion: BUSINESS_CONFIG.policyVersion,
        consentText,
        marketingOptIn: Boolean(marketingOptIn),
        timestamp: new Date().toISOString(),
      };
      setFormConsents((prev) => {
        const next = [record, ...prev];
        persistFormConsentLog(next);
        return next;
      });
      return record;
    },
    []
  );

  const hasResponded = consent !== null;
  const isBannerVisible = !hasResponded && !isPreferencesOpen;

  // Strict default-deny: non-essential capabilities stay false until explicitly opted in
  const canUseAnalytics = consent?.analytics === true;
  const canUseMarketing = consent?.marketing === true;

  return (
    <ConsentContext.Provider
      value={{
        consent,
        formConsents,
        hasResponded,
        isBannerVisible,
        isPreferencesOpen,
        canUseAnalytics,
        canUseMarketing,
        openPreferences,
        closePreferences,
        acceptAll,
        rejectNonEssential,
        savePreferences,
        recordFormConsent,
      }}
    >
      {children}
    </ConsentContext.Provider>
  );
};

export function useConsent(): ConsentContextValue {
  const ctx = useContext(ConsentContext);
  if (!ctx) {
    throw new Error('useConsent must be used within a ConsentProvider');
  }
  return ctx;
}
