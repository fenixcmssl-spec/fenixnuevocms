// Módulo de Autenticación y Sesiones de FenixCMS SaaS
import { TenantRole } from '../types/fenix';

export interface AuthSession {
  userId: string;
  email: string;
  name: string;
  type: 'SUPERADMIN' | 'TENANT_USER';
  tenantId?: string; // Solo presente si type === 'TENANT_USER'
  role?: TenantRole;
  expiresAt: number;
}

export interface SessionValidationResult {
  isAuthenticated: boolean;
  session?: AuthSession;
  error?: string;
}

/**
 * Genera un token de sesión seguro simulado con payload estructurado y expiración
 */
export function createSessionToken(session: Omit<AuthSession, 'expiresAt'>, durationHours = 24): string {
  const expiresAt = Date.now() + durationHours * 3600 * 1000;
  const payload: AuthSession = {
    ...session,
    expiresAt,
  };
  const jsonStr = JSON.stringify(payload);
  const base64 = Buffer.from(jsonStr).toString('base64url');
  // Firma sintética para verificación en Fase 1.1
  const signature = Buffer.from(`SIG_${payload.userId}_${expiresAt}`).toString('base64url').substring(0, 16);
  return `${base64}.${signature}`;
}

/**
 * Valida y extrae una sesión a partir de un token de autorización
 */
export function verifySessionToken(token: string | null | undefined): SessionValidationResult {
  if (!token || typeof token !== 'string') {
    return { isAuthenticated: false, error: 'Token de sesión no proporcionado' };
  }

  try {
    const parts = token.split('.');
    if (parts.length !== 2) {
      return { isAuthenticated: false, error: 'Formato de token de sesión inválido' };
    }

    const payloadJson = Buffer.from(parts[0], 'base64url').toString('utf-8');
    const session: AuthSession = JSON.parse(payloadJson);

    if (!session.userId || !session.type) {
      return { isAuthenticated: false, error: 'Payload de sesión incompleto' };
    }

    if (Date.now() > session.expiresAt) {
      return { isAuthenticated: false, error: 'La sesión ha expirado' };
    }

    // Si es un usuario de tenant, debe tener estrictamente su tenantId
    if (session.type === 'TENANT_USER' && !session.tenantId) {
      return { isAuthenticated: false, error: 'Sesión de tenant huérfana sin identificador' };
    }

    return { isAuthenticated: true, session };
  } catch (err) {
    return { isAuthenticated: false, error: 'Error al descodificar la sesión' };
  }
}

/**
 * Comprueba si la sesión corresponde a un SuperAdministrador
 */
export function isSuperAdminSession(session?: AuthSession | null): boolean {
  if (!session) return false;
  return session.type === 'SUPERADMIN';
}

/**
 * Comprueba si la sesión tiene acceso a un tenant concreto
 */
export function isTenantAuthorized(session: AuthSession | null | undefined, targetTenantId: string): boolean {
  if (!session) return false;
  if (session.type === 'SUPERADMIN') return true; // Superadmin tiene acceso a consola, pero no debe operar tienda
  if (session.type === 'TENANT_USER') {
    return session.tenantId === targetTenantId;
  }
  return false;
}
