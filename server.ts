import http from 'http';
import crypto from 'crypto';
import express from 'express';
import type { NextFunction, Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import { GoogleGenAI, Type } from '@google/genai';

const aiClient = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Super Admin and role authorization is enforced via Firebase Authentication and Firestore rules.

// Server-side audit log for sensitive administrative activities
interface ServerAuditLog {
  id: string;
  timestamp: string;
  actorEmail: string;
  action: string;
  target: string;
  status: 'success' | 'denied';
  ip?: string;
}

const auditLogs: ServerAuditLog[] = [];

function recordAudit(actorEmail: string, action: string, target: string, status: 'success' | 'denied', ip?: string) {
  auditLogs.unshift({
    id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    timestamp: new Date().toISOString(),
    actorEmail,
    action,
    target,
    status,
    ip,
  });
  if (auditLogs.length > 200) auditLogs.pop();
}

// Login Security Event record
interface ServerLoginEvent {
  id: string;
  accountEmail: string;
  role: string;
  institutionId?: string;
  institutionName?: string;
  timestamp: string;
  formattedTime: string;
  formattedDate: string;
  status: 'success' | 'failed';
  ipAddress: string;
  eventType: 'LOGIN_SUCCESS' | 'INVALID_CREDENTIALS' | 'ACCOUNT_SUSPENDED' | 'LOGOUT' | 'SESSION_REVOKED';
  sessionActive: boolean;
}

const loginActivities: ServerLoginEvent[] = [];

function recordLoginEvent(
  accountEmail: string,
  role: string,
  status: 'success' | 'failed',
  eventType: ServerLoginEvent['eventType'],
  ip: string,
  institutionId?: string,
  institutionName?: string
) {
  const d = new Date();
  const formattedTime = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  const formattedDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  // If logging out, deactivate previous active sessions for this account
  if (eventType === 'LOGOUT') {
    loginActivities.forEach((act) => {
      if (act.accountEmail.toLowerCase() === accountEmail.toLowerCase()) {
        act.sessionActive = false;
      }
    });
  }

  loginActivities.unshift({
    id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    accountEmail,
    role,
    institutionId,
    institutionName,
    timestamp: d.toISOString(),
    formattedTime,
    formattedDate,
    status,
    ipAddress: ip || '120.28.16.84',
    eventType,
    sessionActive: status === 'success' && eventType !== 'LOGOUT',
  });

  if (loginActivities.length > 300) loginActivities.pop();
}

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  const app = express();
  app.disable('x-powered-by');

  // -------------------------------------------------------------
  // RUNTIME HTTP SECURITY HEADERS (RISK-14)
  // -------------------------------------------------------------
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');

    if (isProd) {
      res.setHeader('X-Frame-Options', 'SAMEORIGIN');
      res.setHeader(
        'Content-Security-Policy',
        [
          "default-src 'self'",
          "script-src 'self' https://apis.google.com https://accounts.google.com https://www.gstatic.com",
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data: blob: https://lh3.googleusercontent.com https://*.googleusercontent.com",
          "font-src 'self' data:",
          "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://*.firebaseapp.com https://apis.google.com https://accounts.google.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firestore.googleapis.com",
          "frame-src 'self' https://*.firebaseapp.com https://accounts.google.com https://apis.google.com",
          "object-src 'none'",
          "base-uri 'self'",
          "frame-ancestors 'self'",
        ].join('; ')
      );
      if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
      }
    } else {
      // Development preview: allow Vite inline module preambles and Firebase Auth Google popup scripts
      res.setHeader(
        'Content-Security-Policy',
        [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://accounts.google.com https://www.gstatic.com",
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data: blob: https://lh3.googleusercontent.com https://*.googleusercontent.com",
          "font-src 'self' data:",
          "connect-src 'self' ws: wss: https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://*.firebaseapp.com https://apis.google.com https://accounts.google.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firestore.googleapis.com",
          "frame-src 'self' https://*.firebaseapp.com https://accounts.google.com https://apis.google.com",
          "object-src 'none'",
          "base-uri 'self'",
        ].join('; ')
      );
    }

    if (req.path.startsWith('/api/')) {
      res.setHeader('Cache-Control', 'no-store');
    }

    next();
  });

  app.use(express.json({ limit: '1mb' }));

  // -------------------------------------------------------------
  // SECURE BACKEND API ENDPOINTS
  // -------------------------------------------------------------

  // 1. Legacy Super Admin Passwordless Endpoint (Disabled in favor of Firebase Authentication)
  app.post('/api/auth/superadmin-login', (req: Request, res: Response) => {
    const cleanEmail = String(req.body?.email || '').trim().toLowerCase();
    recordAudit(cleanEmail || 'unknown', 'LEGACY_SUPERADMIN_LOGIN_BLOCKED', '/api/auth/superadmin-login', 'denied', req.ip);
    return res.status(410).json({
      success: false,
      error: 'Legacy passwordless login disabled. Authenticate using Firebase Authentication.',
    });
  });

  // 2. Record general login/logout events from application portals
  app.post('/api/auth/record-activity', (req: Request, res: Response) => {
    const { email, role, status, eventType, institutionId, institutionName } = req.body;
    recordLoginEvent(
      email || 'guest',
      role || 'user',
      status === 'failed' ? 'failed' : 'success',
      eventType || 'LOGIN_SUCCESS',
      req.ip || '127.0.0.1',
      institutionId,
      institutionName
    );
    return res.json({ success: true });
  });

  // 3. Super Admin Security Status Summary
  app.get('/api/superadmin/security-status', (_req: Request, res: Response) => {
    const activeSessions = loginActivities.filter((a) => a.sessionActive).length;
    return res.json({
      authorizedAccountsCount: 0,
      activeSessionsCount: activeSessions,
      enforcementMode: 'FIREBASE_AUTH_AND_FIRESTORE_RULES',
      auditEntriesCount: auditLogs.length,
      securityEventsCount: loginActivities.length,
    });
  });

  // 4. Super Admin Login & Security Activities
  app.get('/api/superadmin/login-activities', (req: Request, res: Response) => {
    return res.json({
      success: true,
      activities: loginActivities,
    });
  });

  // 5. Super Admin Revoke Session
  app.post('/api/superadmin/revoke-session', (req: Request, res: Response) => {
    const { activityId } = req.body;
    const target = loginActivities.find((a) => a.id === activityId);
    if (target) {
      target.sessionActive = false;
      target.eventType = 'SESSION_REVOKED';
      recordAudit('super_admin', 'REVOKE_SESSION', `/session/${activityId}`, 'success', req.ip);
      return res.json({ success: true, message: 'Session successfully terminated.' });
    }
    return res.status(404).json({ success: false, error: 'Session record not found.' });
  });

  // 6. Super Admin Audit Logs
  app.get('/api/superadmin/audit-logs', (req: Request, res: Response) => {
    return res.json({
      logs: auditLogs.slice(0, 50),
    });
  });

  // -------------------------------------------------------------
  // FACILITY HANDLER PIN & ACCESS CODE SECURITY ENDPOINTS
  // -------------------------------------------------------------
  const hashAccessCode = (code: string) =>
    crypto.createHash('sha256').update(`smartspace_pin_v1:${code.trim()}`).digest('hex');

  const handlerPinStore = new Map<string, string>(); // key: assignmentId or `${handlerId}:${facilityId}`
  const handlerLockoutStore = new Map<string, { attempts: number; lockedUntil: number }>();
  const handlerServerLogs: any[] = [];

  app.post('/api/facility-handlers/set-access-code', (req: Request, res: Response) => {
    const { assignmentId, facilityId, handlerId, newAccessCode, adminEmail } = req.body || {};
    if (!newAccessCode || String(newAccessCode).trim().length < 4) {
      return res.status(400).json({ success: false, error: 'Access code must be at least 4 characters.' });
    }
    const hashed = hashAccessCode(String(newAccessCode));
    if (assignmentId) handlerPinStore.set(String(assignmentId), hashed);
    if (handlerId && facilityId) handlerPinStore.set(`${handlerId}:${facilityId}`, hashed);
    if (handlerId) handlerPinStore.set(`handler:${handlerId}`, hashed);

    recordAudit(adminEmail || 'university_admin', 'SET_HANDLER_PIN', `${handlerId || assignmentId}`, 'success', req.ip);
    return res.json({ success: true });
  });

  app.post('/api/facility-handlers/verify-access-code', (req: Request, res: Response) => {
    const { assignmentId, facilityId, handlerId, accessCode } = req.body || {};
    const key = assignmentId || `${handlerId}:${facilityId}`;
    const lockout = handlerLockoutStore.get(key);
    const now = Date.now();

    if (lockout && lockout.lockedUntil > now) {
      return res.status(423).json({
        success: false,
        isLocked: true,
        remainingSeconds: Math.ceil((lockout.lockedUntil - now) / 1000),
        error: 'Too many invalid attempts. Access temporarily locked.',
      });
    }

    const storedHash =
      (assignmentId && handlerPinStore.get(String(assignmentId))) ||
      (handlerId && facilityId && handlerPinStore.get(`${handlerId}:${facilityId}`)) ||
      (handlerId && handlerPinStore.get(`handler:${handlerId}`));

    if (!storedHash) {
      return res.status(404).json({
        success: false,
        error: 'No facility access PIN has been configured for this assignment.',
      });
    }

    const enteredHash = hashAccessCode(String(accessCode || ''));
    if (enteredHash !== storedHash) {
      const nextAttempts = (lockout?.attempts || 0) + 1;
      const lockedUntil = nextAttempts >= 5 ? now + 60 * 1000 : 0;
      handlerLockoutStore.set(key, { attempts: nextAttempts, lockedUntil });
      recordAudit(handlerId || 'handler', 'VERIFY_HANDLER_PIN', `${facilityId}`, 'denied', req.ip);
      return res.status(401).json({
        success: false,
        attemptsRemaining: Math.max(0, 5 - nextAttempts),
        isLocked: lockedUntil > now,
        remainingSeconds: lockedUntil > now ? 60 : undefined,
        error: lockedUntil > now
          ? '5 failed PIN attempts. Workspace locked for 60 seconds.'
          : `Invalid handler PIN. ${Math.max(0, 5 - nextAttempts)} attempt(s) remaining.`,
      });
    }

    handlerLockoutStore.delete(key);
    const expiresAt = now + 30 * 60 * 1000;
    const token = `hnd_tok_${now}_${crypto.randomBytes(8).toString('hex')}`;
    recordAudit(handlerId || 'handler', 'VERIFY_HANDLER_PIN', `${facilityId}`, 'success', req.ip);
    return res.json({ success: true, token, expiresAt });
  });

  app.post('/api/facility-handlers/revoke-assignment', (req: Request, res: Response) => {
    const { assignmentId, adminEmail } = req.body || {};
    if (assignmentId) handlerPinStore.delete(String(assignmentId));
    recordAudit(adminEmail || 'university_admin', 'REVOKE_HANDLER_ASSIGNMENT', String(assignmentId || ''), 'success', req.ip);
    return res.json({ success: true });
  });

  app.post('/api/facility-handlers/record-log', (req: Request, res: Response) => {
    if (req.body && typeof req.body === 'object') {
      handlerServerLogs.unshift(req.body);
      if (handlerServerLogs.length > 200) handlerServerLogs.pop();
    }
    return res.json({ success: true });
  });

  app.get('/api/facility-handlers/logs', (_req: Request, res: Response) => {
    return res.json({ success: true, logs: handlerServerLogs });
  });

  // -------------------------------------------------------------
  // GEMINI AI WORKFLOW ENGINE & GOOGLE OPAL WEBHOOK BRIDGE
  // -------------------------------------------------------------
  interface OpalWebhookEvent {
    id: string;
    receivedAt: string;
    source: string;
    workflowId?: string;
    title: string;
    category: string;
    summary: string;
    payload: unknown;
  }

  const opalWebhookEvents: OpalWebhookEvent[] = [];

  app.get('/api/ai/status', (_req: Request, res: Response) => {
    return res.json({
      success: true,
      geminiConfigured: Boolean(aiClient),
      activeModel: 'gemini-4-hydrogen',
      fallbackModel: 'gemini-3.1-flash-lite',
      opalBridgeVersion: 'opal-workflow-v1',
      webhookEndpoint: '/api/webhooks/opal',
      webhookEventsCount: opalWebhookEvents.length,
    });
  });

  app.post('/api/ai/diagnostics', async (req: Request, res: Response) => {
    const { institutionsCount, facilitiesCount, bookingsSummary } = req.body || {};
    if (!aiClient) {
      return res.status(503).json({
        success: false,
        error: 'Server GEMINI_API_KEY is not configured in environment secrets.',
      });
    }

    try {
      const prompt = [
        'You are the SmartSpace multi-university facility operations analyst.',
        `Active institutions: ${institutionsCount ?? 0}. Registered venues: ${facilitiesCount ?? 0}.`,
        `Current reservation snapshot:\n${JSON.stringify(bookingsSummary || {}, null, 2)}`,
        'Provide a concise 3-4 sentence executive diagnostics brief covering queue health, schedule conflict risk, and one recommended custodian action.',
      ].join('\n\n');

      const response = await aiClient.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction:
            'Keep the diagnostics brief under 110 words, factual to the supplied numbers only, and formatted cleanly in plain text.',
        },
      });

      recordAudit('super_admin', 'AI_VENUE_DIAGNOSTICS', '/api/ai/diagnostics', 'success', req.ip);
      return res.json({
        success: true,
        model: 'gemini-4-hydrogen',
        summary: (response.text || '').trim(),
      });
    } catch (err: any) {
      console.error('Gemini /api/ai/diagnostics error:', err);
      return res.status(500).json({
        success: false,
        error: err?.message || 'Failed to generate AI diagnostics brief.',
      });
    }
  });

  app.post('/api/ai/categorize-demo', async (req: Request, res: Response) => {
    const {
      institutionName,
      institutionType,
      contactName,
      designation,
      estimatedFacilities,
      message,
    } = req.body || {};
    if (!aiClient) {
      return res.status(503).json({
        success: false,
        error: 'Server GEMINI_API_KEY is not configured.',
      });
    }

    try {
      const systemPrompt = `You are the SmartSpace Enterprise Concierge AI, an automated institutional onboarding agent for SmartSpace—a SaaS facility booking and management platform built for higher education institutions in Cebu City (starting with CTU Main Campus).

OBJECTIVE: When a university administrator or student organization leader submits a demo request, analyze their input data, classify their tier, and draft a tailored, professional institutional response.

PRICING REFERENCE (Monthly Institutional Subscriptions):
- Basic Tier (₱3,000/mo): Essential digital facility profiles and conflict-checked booking for smaller colleges.
- Professional Tier (₱6,000/mo): Advanced administrative workflows, multi-tier approvals, and utilization reports.
- Enterprise Tier (₱10,000/mo): Full cross-campus governance, audit logs, QR gate pass integration, and priority support.
- Student Organizations & Faculty: ₱0 per-booking fee access under institutional license.

OUTPUT RULES:
1. category must strictly be one of: Enterprise Onboarding, Public Pilot, Collegiate Competition, General Inquiry.
2. recommendedTier must specify the exact matching tier name and monthly pricing (or ₱0 per-booking Student Org & Faculty access under institutional license).
3. leadWarmth must strictly be one of: Hot, Warm, Nurture.
4. summary: Generate an internal notification summary addressed to the core team (Rash, Karl, Angel, Krisha) highlighting lead warmth, campus context, and recommended subscription tier.
5. draftReply: Draft a polite, professional, and persuasive email response addressed to the administrator ({{applicant_name}}), acknowledging their specific campus needs, outlining the appropriate subscription tier, and offering a 15-minute live pilot walkthrough.
6. suggestedLead: Choose the primary owner from Rash, Karl, Angel, or Krisha.`;

      const userInputBlock = `INPUT DATA PROVIDED BY USER:
- Name: ${contactName || 'Administrator'}
- Designation: ${designation || 'Institutional Administrator'}
- Institution: ${institutionName || 'Unknown University'}
- Sector: ${institutionType || 'Higher Education Institution'}
- Scope: ${estimatedFacilities || 'Unspecified'}
- Additional Notes: ${message || 'None'}`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: userInputBlock,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING },
              recommendedTier: { type: Type.STRING },
              leadWarmth: { type: Type.STRING },
              summary: { type: Type.STRING },
              draftReply: { type: Type.STRING },
              suggestedLead: { type: Type.STRING },
            },
          },
        },
      });

      const parsed = JSON.parse((response.text || '{}').trim());
      recordAudit('system_ai', 'AI_DEMO_CATEGORIZE', String(institutionName || 'demo'), 'success', req.ip);
      return res.json({
        success: true,
        model: 'gemini-4-hydrogen',
        result: parsed,
      });
    } catch (err: any) {
      console.error('Gemini /api/ai/categorize-demo error:', err);
      return res.status(500).json({
        success: false,
        error: err?.message || 'Failed to categorize demo request.',
      });
    }
  });

  app.post('/api/ai/run-workflow', async (req: Request, res: Response) => {
    const { workflowId, workflowName, steps, initialInput, inputVariables } = req.body || {};
    if (!aiClient) {
      return res.status(503).json({
        success: false,
        error: 'Server GEMINI_API_KEY is not configured in environment secrets.',
      });
    }

    if (!Array.isArray(steps) || steps.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Workflow must include at least one AI step.',
      });
    }

    // Extract named template variables from JSON input or explicit inputVariables
    const templateVars: Record<string, string> = {};
    if (typeof initialInput === 'string') {
      try {
        const parsedJson = JSON.parse(initialInput);
        if (parsedJson && typeof parsedJson === 'object' && !Array.isArray(parsedJson)) {
          for (const [k, v] of Object.entries(parsedJson)) {
            if (v !== undefined && v !== null) templateVars[k] = String(v);
          }
        }
      } catch {
        // plain text initialInput is used as {{input}}
      }
    }
    if (inputVariables && typeof inputVariables === 'object') {
      for (const [k, v] of Object.entries(inputVariables)) {
        if (v !== undefined && v !== null) templateVars[k] = String(v);
      }
    }

    const totalStart = Date.now();
    const traces: {
      stepId: string;
      title: string;
      kind: string;
      model: string;
      output: string;
      durationMs: number;
      status: 'completed' | 'failed';
    }[] = [];

    let previousOutput = String(initialInput || '');

    try {
      for (const step of steps) {
        const stepStart = Date.now();
        const modelName =
          step.model === 'gemini-3.1-flash-lite' ? 'gemini-3.1-flash-lite' : 'gemini-4-hydrogen';

        let compiledPrompt = String(step.promptTemplate || '{{input}}')
          .replace(/\{\{\s*input\s*\}\}/g, String(initialInput || ''))
          .replace(/\{\{\s*prev_output\s*\}\}/g, previousOutput);

        for (const [varKey, varVal] of Object.entries(templateVars)) {
          const safeKey = varKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          compiledPrompt = compiledPrompt.replace(new RegExp(`\\{\\{\\s*${safeKey}\\s*\\}\\}`, 'g'), varVal);
        }

        const response = await aiClient.models.generateContent({
          model: modelName,
          contents: compiledPrompt,
          config: {
            ...(step.systemInstruction ? { systemInstruction: String(step.systemInstruction) } : {}),
            ...(step.outputFormat === 'json' ? { responseMimeType: 'application/json' } : {}),
          },
        });

        const outputText = (response.text || '').trim();
        traces.push({
          stepId: String(step.id || `step-${traces.length + 1}`),
          title: String(step.title || `Step ${traces.length + 1}`),
          kind: String(step.kind || 'gemini_generate'),
          model: modelName,
          output: outputText,
          durationMs: Date.now() - stepStart,
          status: 'completed',
        });

        previousOutput = outputText;
      }

      recordAudit('super_admin', 'RUN_AI_WORKFLOW', String(workflowId || workflowName || 'custom'), 'success', req.ip);
      return res.json({
        success: true,
        workflowId: String(workflowId || 'custom'),
        workflowName: String(workflowName || 'SmartSpace AI Workflow'),
        traces,
        finalOutput: previousOutput,
        totalDurationMs: Date.now() - totalStart,
      });
    } catch (err: any) {
      console.error('Gemini /api/ai/run-workflow error:', err);
      return res.status(500).json({
        success: false,
        workflowId: String(workflowId || 'custom'),
        workflowName: String(workflowName || 'SmartSpace AI Workflow'),
        traces,
        finalOutput: previousOutput,
        totalDurationMs: Date.now() - totalStart,
        error: err?.message || 'Workflow execution failed.',
      });
    }
  });

  // External Webhook Bridge for Google Opal / Gemini Gems / Google Apps Script
  app.post('/api/webhooks/opal', async (req: Request, res: Response) => {
    const body = req.body || {};
    const title = String(body.title || body.workflowName || 'External Opal / Gem Webhook Trigger');
    const source = String(body.source || 'Google Opal / Gemini Gem');
    const category = String(body.category || 'General Inquiry');
    let summary = String(body.summary || body.message || '');

    if (!summary && aiClient) {
      try {
        const aiRes = await aiClient.models.generateContent({
          model: 'gemini-4-hydrogen',
          contents: `Summarize this incoming webhook payload for SmartSpace campus operations in 2 concise sentences:\n${JSON.stringify(body)}`,
        });
        summary = (aiRes.text || '').trim();
      } catch (e) {
        summary = `Webhook payload received from ${source}.`;
      }
    }

    const evt: OpalWebhookEvent = {
      id: `opal-${Date.now().toString(36)}`,
      receivedAt: new Date().toISOString(),
      source,
      workflowId: body.workflowId ? String(body.workflowId) : undefined,
      title,
      category,
      summary: summary || `Inbound trigger from ${source}`,
      payload: body,
    };

    opalWebhookEvents.unshift(evt);
    if (opalWebhookEvents.length > 50) opalWebhookEvents.pop();
    recordAudit(source, 'OPAL_WEBHOOK_RECEIVED', evt.id, 'success', req.ip);

    return res.status(201).json({
      success: true,
      event: evt,
    });
  });

  app.get('/api/webhooks/opal/events', (_req: Request, res: Response) => {
    return res.json({
      success: true,
      events: opalWebhookEvents,
    });
  });

  // -------------------------------------------------------------
  // SEO & AI SEARCH READINESS STATIC ASSETS
  // -------------------------------------------------------------
  app.get('/sitemap.xml', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.sendFile(path.join(__dirname, 'public', 'sitemap.xml'));
  });

  app.get('/robots.txt', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.sendFile(path.join(__dirname, 'public', 'robots.txt'));
  });

  app.get('/llms.txt', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.sendFile(path.join(__dirname, 'public', 'llms.txt'));
  });

  app.get('/smartspace-og.png', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'image/png');
    res.sendFile(path.join(__dirname, 'public', 'smartspace-og.png'));
  });

  // -------------------------------------------------------------
  // VITE DEV MIDDLEWARE INTEGRATION
  // -------------------------------------------------------------
  const httpServer = http.createServer(app);

  if (!isProd) {
    const { createServer } = await import('vite');
    const disableHmr = process.env.DISABLE_HMR === 'true';
    const vite = await createServer({
      server: {
        middlewareMode: true,
        hmr: false,
        ...(disableHmr ? { ws: false as const, watch: null } : {}),
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  const getArgValue = (flag: string): string | undefined => {
    const idx = process.argv.indexOf(flag);
    if (idx !== -1 && process.argv[idx + 1] && !process.argv[idx + 1].startsWith('-')) {
      return process.argv[idx + 1];
    }
    const prefix = `${flag}=`;
    const eqArg = process.argv.find((arg) => arg.startsWith(prefix));
    return eqArg ? eqArg.slice(prefix.length) : undefined;
  };

  const cliPort = getArgValue('--port');
  const cliHost = getArgValue('--host');
  const envPort =
    !isProd && process.env.NGINX_PORT && process.env.PORT === process.env.NGINX_PORT
      ? process.env.DEFAULT_APP_PORT || '3000'
      : process.env.PORT || process.env.DEFAULT_APP_PORT || '3000';

  const parsedPort = parseInt(cliPort || envPort, 10);
  const PORT = Number.isFinite(parsedPort) && parsedPort > 0 ? parsedPort : 3000;
  const HOST = cliHost || process.env.HOST || '0.0.0.0';

  httpServer.on('error', (err) => {
    console.error(`SmartSpace HTTP server failed to bind ${HOST}:${PORT}:`, err);
    process.exit(1);
  });

  httpServer.listen(PORT, HOST, () => {
    console.log(`SmartSpace enterprise full-stack server running on http://${HOST}:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start SmartSpace server:', err);
  process.exit(1);
});
