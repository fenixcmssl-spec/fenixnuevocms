'use client';

import React from 'react';
import { Sliders, Database, ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';
import { superAdminService } from '../../../lib/services/superadmin.service';
import { fenixDb } from '../../../lib/db/client';

export default function SuperAdminSettingsPage() {
  const [settings, setSettings] = React.useState(() => superAdminService.getSettings());
  const dbStatus = fenixDb.getPersistenceStatus();
  const [saved, setSaved] = React.useState(false);

  const handleToggle = (key: keyof typeof settings) => {
    const updated = superAdminService.updateSettings({
      [key]: !settings[key],
    });
    setSettings({ ...updated });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 sm:p-8 lg:p-10 max-w-7xl w-full">
      <div className="pb-6 border-b border-zinc-800 flex justify-between items-center">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-red-500 uppercase tracking-widest mb-1">
            <Sliders className="h-4 w-4" />
            <span>Parámetros Operativos</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Configuración de Sistema
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Gestión de persistencia PostgreSQL, directivas de seguridad y políticas de plataforma
          </p>
        </div>

        {saved && (
          <div className="flex items-center gap-1.5 rounded-lg bg-emerald-950 border border-emerald-700 px-3 py-1.5 text-xs font-bold text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            <span>Configuración Guardada</span>
          </div>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Persistence Status */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 space-y-4">
          <div className="flex items-center gap-2.5 text-white">
            <Database className="h-5 w-5 text-red-500" />
            <h2 className="text-sm font-bold uppercase tracking-wider">
              Diagnóstico de Base de Datos
            </h2>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
              <span className="text-zinc-500 block text-[10px]">MOTOR RELACIONAL:</span>
              <span className="text-white font-bold">{dbStatus.engine}</span>
            </div>
            <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
              <span className="text-zinc-500 block text-[10px]">ESTADO DE CONEXIÓN:</span>
              <span className="text-red-400 font-bold">{dbStatus.mode}</span>
            </div>
            <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
              <span className="text-zinc-500 block text-[10px]">ESQUEMA PRISMA:</span>
              <span className="text-zinc-200">{dbStatus.schemaPath}</span>
            </div>
            <p className="text-[11px] text-zinc-400 font-sans leading-relaxed pt-1">
              {dbStatus.note}
            </p>
          </div>
        </div>

        {/* Policies Toggles */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 space-y-5">
          <div className="flex items-center gap-2.5 text-white">
            <ShieldCheck className="h-5 w-5 text-red-500" />
            <h2 className="text-sm font-bold uppercase tracking-wider">
              Directivas Operativas de Plataforma
            </h2>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 rounded-lg border border-zinc-800 bg-zinc-900/60">
              <div>
                <div className="font-bold text-white">Verificación Criptográfica Estricta de Pagos</div>
                <div className="text-[11px] text-zinc-400 mt-0.5">
                  Obliga a registrar token criptográfico bancario antes de completar pedidos.
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.enforceVerifiedPayments}
                onChange={() => handleToggle('enforceVerifiedPayments')}
                className="rounded border-zinc-700 text-red-600 focus:ring-red-500 h-4 w-4"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-zinc-800 bg-zinc-900/60">
              <div>
                <div className="font-bold text-white">Aprovisionamiento Automático SSL</div>
                <div className="text-[11px] text-zinc-400 mt-0.5">
                  Generación de certificados TLS para nuevos dominios enlazados a tenants.
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.sslAutoProvisioning}
                onChange={() => handleToggle('sslAutoProvisioning')}
                className="rounded border-zinc-700 text-red-600 focus:ring-red-500 h-4 w-4"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-zinc-800 bg-zinc-900/60">
              <div>
                <div className="font-bold text-white">Registro Público de Nuevos Tenants Abierto</div>
                <div className="text-[11px] text-zinc-400 mt-0.5">
                  Permite contrataciones y altas directas a través de la ruta /checkout.
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.registrationOpen}
                onChange={() => handleToggle('registrationOpen')}
                className="rounded border-zinc-700 text-red-600 focus:ring-red-500 h-4 w-4"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-zinc-800 bg-zinc-900/60">
              <div>
                <div className="font-bold text-white">Modo Mantenimiento Global</div>
                <div className="text-[11px] text-zinc-400 mt-0.5">
                  Suspende accesos no root para tareas de migración de base de datos.
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={() => handleToggle('maintenanceMode')}
                className="rounded border-zinc-700 text-red-600 focus:ring-red-500 h-4 w-4"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
