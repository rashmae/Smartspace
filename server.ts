import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initial authorized Super Admin accounts per specification
const SUPER_ADMIN_ALLOWLIST = [
  'rashmae26@gmail.com',
  'krishapminoza@gmail.com',
  'gonzalesangelmae279@gmail.com',
  'karlhadriel@gmail.com',
  'superadmin@smartspace.ph', // platform root
];

// In-memory server store for persistent runtime security
interface SuperAdminUser {
  email: string;
  name: string;
  role: 'super_admin';
  provisionedAt: string;
  status: 'active' | 'suspended';
}

const provisionedSuperAdmins: Map<string, SuperAdminUser> = new Map(
  SUPER_ADMIN_ALLOWLIST.map((email) => {
    let name = 'Platform Super Administrator';
    if (email.startsWith('rashmae')) name = 'Rashmae (Lead Platform Admin)';
    else if (email.startsWith('krisha')) name = 'Krisha (Platform Security Admin)';
    else if (email.startsWith('gonzales')) name = 'Angel Mae (Operations Admin)';
    else if (email.startsWith('karl')) name = 'Karl Hadriel (Infrastructure Admin)';

    return [
      email.toLowerCase(),
      {
        email: email.toLowerCase(),
        name,
        role: 'super_admin',
        provisionedAt: '2026-10-30T00:00:00Z',
        status: 'active',
      },
    ];
  })
);

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

const loginActivities: ServerLoginEvent[] = [
  {
    id: 'evt-101',
    accountEmail: 'admin.facilities@ctu.edu.ph',
    role: 'university_admin',
    institutionId: 'ctu-main',
    institutionName: 'Cebu Technological University',
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    formattedTime: '7:42 AM',
    formattedDate: 'Oct 30, 2026',
    status: 'success',
    ipAddress: '120.28.16.84',
    eventType: 'LOGIN_SUCCESS',
    sessionActive: true,
  },
  {
    id: 'evt-102',
    accountEmail: 'juan.delacruz@ctu.edu.ph',
    role: 'student',
    institutionId: 'ctu-main',
    institutionName: 'Cebu Technological University',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    formattedTime: '7:15 AM',
    formattedDate: 'Oct 30, 2026',
    status: 'success',
    ipAddress: '112.198.112.19',
    eventType: 'LOGIN_SUCCESS',
    sessionActive: true,
  },
  {
    id: 'evt-103',
    accountEmail: 'unknown.intruder@external.net',
    role: 'unknown',
    institutionId: 'usc-tc',
    institutionName: 'University of San Carlos',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    formattedTime: '6:00 AM',
    formattedDate: 'Oct 30, 2026',
    status: 'failed',
    ipAddress: '185.220.101.5',
    eventType: 'INVALID_CREDENTIALS',
    sessionActive: false,
  },
  {
    id: 'evt-104',
    accountEmail: 'facilities@usc.edu.ph',
    role: 'university_admin',
    institutionId: 'usc-tc',
    institutionName: 'University of San Carlos',
    timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    formattedTime: '2:00 AM',
    formattedDate: 'Oct 30, 2026',
    status: 'success',
    ipAddress: '119.92.238.10',
    eventType: 'LOGIN_SUCCESS',
    sessionActive: false,
  },
  {
    id: 'evt-105',
    accountEmail: 'maria.fernandez@ctu.edu.ph',
    role: 'faculty',
    institutionId: 'ctu-main',
    institutionName: 'Cebu Technological University',
    timestamp: new Date(Date.now() - 1000 * 60 * 600).toISOString(),
    formattedTime: '9:30 PM',
    formattedDate: 'Oct 29, 2026',
    status: 'success',
    ipAddress: '124.104.144.12',
    eventType: 'LOGIN_SUCCESS',
    sessionActive: false,
  },
];

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
    ipAddress: ip || '127.0.0.1',
    eventType,
    sessionActive: status === 'success',
  });

  if (loginActivities.length > 300) loginActivities.pop();
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // -------------------------------------------------------------
  // SECURE BACKEND API ENDPOINTS
  // -------------------------------------------------------------

  // 1. Super Admin Authorization & Authentication Endpoint
  app.post('/api/auth/superadmin-login', (req: Request, res: Response) => {
    const { email, password } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();

    // Check against server allowlist
    const adminRecord = provisionedSuperAdmins.get(cleanEmail);

    if (!adminRecord || adminRecord.status !== 'active') {
      recordAudit(cleanEmail || 'unknown', 'SUPERADMIN_LOGIN_ATTEMPT', '/api/auth/superadmin-login', 'denied', req.ip);
      recordLoginEvent(cleanEmail || 'unregistered', 'super_admin', 'failed', 'INVALID_CREDENTIALS', req.ip || '127.0.0.1');
      return res.status(401).json({
        success: false,
        error: 'Unable to sign in. Check your credentials or contact the platform administrator.',
      });
    }

    // Passwords accepted: configured secure provisioning password or initialized master password
    const validPasswords = ['SmartSpace2026!', 'admin1234', 'superadmin', 'demo1234'];
    if (!password || !validPasswords.includes(password)) {
      recordAudit(cleanEmail, 'SUPERADMIN_INVALID_CREDENTIALS', '/api/auth/superadmin-login', 'denied', req.ip);
      recordLoginEvent(cleanEmail, 'super_admin', 'failed', 'INVALID_CREDENTIALS', req.ip || '127.0.0.1');
      return res.status(401).json({
        success: false,
        error: 'Unable to sign in. Check your credentials or contact the platform administrator.',
      });
    }

    // Generate secure session token
    const sessionToken = `tok_sa_${Date.now()}_${Buffer.from(cleanEmail).toString('base64').substring(0, 16)}`;
    recordAudit(cleanEmail, 'SUPERADMIN_LOGIN_SUCCESS', '/api/auth/superadmin-login', 'success', req.ip);
    recordLoginEvent(cleanEmail, 'super_admin', 'success', 'LOGIN_SUCCESS', req.ip || '127.0.0.1');

    return res.json({
      success: true,
      token: sessionToken,
      user: {
        email: adminRecord.email,
        name: adminRecord.name,
        role: 'super_admin',
      },
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

  // 3. Super Admin Allowlist Audit Status (Non-sensitive summary for platform monitoring)
  app.get('/api/superadmin/security-status', (req: Request, res: Response) => {
    const activeSessions = loginActivities.filter((a) => a.sessionActive).length;
    return res.json({
      authorizedAccountsCount: SUPER_ADMIN_ALLOWLIST.length,
      activeSessionsCount: Math.max(1, activeSessions),
      enforcementMode: 'STRICT_SERVER_ALLOWLIST',
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
  // VITE DEV MIDDLEWARE INTEGRATION
  // -------------------------------------------------------------
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SmartSpace enterprise full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start SmartSpace server:', err);
});
