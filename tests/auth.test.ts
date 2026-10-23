import test from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, verifyPassword, validateTenantAccess, hasPermission, verifyPaymentTransaction } from '../lib/security/auth';
import { createSessionToken, verifySessionToken, isSuperAdminSession } from '../lib/auth/session';

test('Password hashing and verification with bcrypt', async () => {
  const password = 'SuperSecretPassword2026!';
  const hash = await hashPassword(password);
  
  assert.ok(hash.startsWith('$2'), 'Hash should be a valid bcrypt hash');
  assert.notEqual(hash, password, 'Hash should not match plain password');

  const isValid = await verifyPassword(password, hash);
  assert.equal(isValid, true, 'Verification should succeed for correct password');

  const isInvalid = await verifyPassword('WrongPassword123', hash);
  assert.equal(isInvalid, false, 'Verification should fail for incorrect password');
});

test('Session token creation and verification', () => {
  const sessionToken = createSessionToken({
    userId: 'super_admin_01',
    email: 'superadmin@fenixcms.io',
    name: 'SuperAdmin Master',
    type: 'SUPERADMIN',
  });

  assert.ok(typeof sessionToken === 'string');
  assert.ok(sessionToken.includes('.'));

  const verification = verifySessionToken(sessionToken);
  assert.equal(verification.isAuthenticated, true);
  assert.equal(verification.session?.userId, 'super_admin_01');
  assert.equal(isSuperAdminSession(verification.session), true);
});

test('Session token expiration and tamper resistance', () => {
  // Token expirado
  const expiredToken = createSessionToken(
    {
      userId: 'user_exp',
      email: 'exp@fenixcms.io',
      name: 'Expired User',
      type: 'SUPERADMIN',
    },
    -1 // Expired 1 hour ago
  );

  const expiredVerification = verifySessionToken(expiredToken);
  assert.equal(expiredVerification.isAuthenticated, false);
  assert.equal(expiredVerification.error, 'La sesión ha expirado');

  // Token inválido
  const invalidVerification = verifySessionToken('invalid.token.string');
  assert.equal(invalidVerification.isAuthenticated, false);
});
