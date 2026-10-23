import test from 'node:test';
import assert from 'node:assert/strict';
import { fenixDb } from '../lib/db/client';
import { resolveTenantByHostname, resolveTenantBySession } from '../lib/tenancy/resolver';
import { AuthSession } from '../lib/auth/session';

test('Tenant products isolation: Tenant A products are never returned for Tenant B', () => {
  const tenantModaId = 'tenant_moda_01';
  const tenantTechId = 'tenant_tech_02';

  const modaProducts = fenixDb.getProducts(tenantModaId);
  const techProducts = fenixDb.getProducts(tenantTechId);

  assert.ok(modaProducts.length > 0, 'Moda tenant should have products');
  assert.ok(techProducts.length > 0, 'Tech tenant should have products');

  modaProducts.forEach((p) => {
    assert.equal(p.tenantId, tenantModaId, 'Moda product list contains only Moda items');
    assert.notEqual(p.tenantId, tenantTechId);
  });

  techProducts.forEach((p) => {
    assert.equal(p.tenantId, tenantTechId, 'Tech product list contains only Tech items');
    assert.notEqual(p.tenantId, tenantModaId);
  });
});

test('Tenant Resolution by Domain: Does NOT select first tenant automatically if domain is unknown', () => {
  // Regla estricta: No seleccionar automáticamente el primer tenant disponible
  const result = resolveTenantByHostname('tienda-desconocida-no-registrada.com');
  assert.equal(result.success, false);
  if (!result.success) {
    assert.equal(result.error, 'DOMAIN_NOT_REGISTERED');
  }
});

test('Tenant Resolution by Domain: Resolves successfully for verified registered domains', () => {
  const resultModa = resolveTenantByHostname('modaurbana.fenixcms.app');
  assert.equal(resultModa.success, true);
  if (resultModa.success) {
    assert.equal(resultModa.tenant.id, 'tenant_moda_01');
    assert.equal(resultModa.domain?.isVerified, true);
  }

  const resultTech = resolveTenantByHostname('techgadgets.fenixcms.app');
  assert.equal(resultTech.success, true);
  if (resultTech.success) {
    assert.equal(resultTech.tenant.id, 'tenant_tech_02');
  }
});

test('Tenant Resolution by Session: Blocks cross-tenant access attempts', () => {
  const tenantUserSession: AuthSession = {
    userId: 'usr_moda_admin',
    email: 'admin@modaurbana.es',
    name: 'Admin Moda',
    type: 'TENANT_USER',
    tenantId: 'tenant_moda_01',
    role: 'TENANT_ADMIN',
    expiresAt: Date.now() + 3600000,
  };

  // Acceder a su propio tenant debe ser exitoso
  const ownTenantResult = resolveTenantBySession(tenantUserSession, 'tenant_moda_01');
  assert.equal(ownTenantResult.success, true);
  if (ownTenantResult.success) {
    assert.equal(ownTenantResult.tenant.id, 'tenant_moda_01');
  }

  // Intentar acceder al tenant B con sesión del tenant A debe ser estrictamente denegado
  const crossTenantResult = resolveTenantBySession(tenantUserSession, 'tenant_tech_02');
  assert.equal(crossTenantResult.success, false);
  if (!crossTenantResult.success) {
    assert.equal(crossTenantResult.error, 'UNAUTHORIZED_ACCESS');
  }
});
