'use client';

import React from 'react';
import { ShoppingBag, Globe, Palette, ShieldCheck, Check } from 'lucide-react';
import { LanguageDto, ThemeDto } from '../../lib/types/fenix';

interface StoreHeaderProps {
  tenantName: string;
  domainName: string;
  languages: LanguageDto[];
  currentLanguage: string;
  onLanguageChange: (code: string) => void;
  themes: ThemeDto[];
  activeThemeSlug: string;
  onThemeChange: (slug: string) => void;
  cartCount: number;
  onOpenCart: () => void;
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
}

export default function StoreHeader({
  tenantName,
  domainName,
  languages,
  currentLanguage,
  onLanguageChange,
  themes,
  activeThemeSlug,
  onThemeChange,
  cartCount,
  onOpenCart,
  categories,
  selectedCategory,
  onSelectCategory,
}: StoreHeaderProps) {
  const [langMenuOpen, setLangMenuOpen] = React.useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = React.useState(false);

  return (
    <div className="w-full border-b border-zinc-800 bg-zinc-900/90 backdrop-blur-md">
      {/* Top Banner: Tenant Domain & Multilingual / Theme Selectors */}
      <div className="border-b border-zinc-800/80 px-4 py-2 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-zinc-400">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-zinc-300 font-semibold">{domainName}</span>
            <span className="hidden sm:inline-block text-zinc-600">|</span>
            <span className="hidden sm:inline-block text-zinc-400">Tenant Aislado FenixCMS</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Selector Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setThemeMenuOpen(!themeMenuOpen)}
                className="flex items-center gap-1.5 rounded bg-zinc-800 px-2.5 py-1 text-zinc-200 hover:bg-zinc-700 transition font-medium"
                aria-label="Seleccionar tema visual"
              >
                <Palette className="h-3 w-3 text-red-500" />
                <span>Tema: {themes.find((t) => t.slug === activeThemeSlug)?.name.split(' ')[1] || 'Fénix'}</span>
              </button>

              {themeMenuOpen && (
                <div className="absolute right-0 mt-1 w-64 rounded-md border border-zinc-700 bg-zinc-900 p-2 shadow-2xl z-50">
                  <div className="text-[11px] font-bold text-zinc-400 px-2 py-1 uppercase tracking-wider">
                    Temas del Tenant
                  </div>
                  {themes.map((theme) => (
                    <button
                      key={theme.slug}
                      type="button"
                      onClick={() => {
                        onThemeChange(theme.slug);
                        setThemeMenuOpen(false);
                      }}
                      className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-xs text-zinc-200 hover:bg-zinc-800 transition"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="h-3 w-3 rounded-full border border-zinc-600"
                          style={{ backgroundColor: theme.previewColor }}
                        />
                        <span>{theme.name}</span>
                      </div>
                      {theme.isActive && <Check className="h-3.5 w-3.5 text-red-500" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-1.5 rounded bg-zinc-800 px-2.5 py-1 text-zinc-200 hover:bg-zinc-700 transition font-medium uppercase"
                aria-label="Seleccionar idioma"
              >
                <Globe className="h-3 w-3 text-red-500" />
                <span>{currentLanguage}</span>
              </button>

              {langMenuOpen && (
                <div className="absolute right-0 mt-1 w-36 rounded-md border border-zinc-700 bg-zinc-900 p-1.5 shadow-2xl z-50">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => {
                        onLanguageChange(lang.code);
                        setLangMenuOpen(false);
                      }}
                      className="flex w-full items-center justify-between rounded px-2.5 py-1 text-left text-xs text-zinc-200 hover:bg-zinc-800 transition"
                    >
                      <span>{lang.name}</span>
                      {currentLanguage === lang.code && <Check className="h-3.5 w-3.5 text-red-500" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Store Brand Bar - NO SEARCH BAR */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <span>{tenantName}</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-red-400 bg-red-950/60 border border-red-800/60 px-2 py-0.5 rounded">
              Tienda Oficial
            </span>
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">Catálogo oficial con garantía y checkout protegido</p>
        </div>

        {/* Cart Trigger */}
        <button
          type="button"
          onClick={onOpenCart}
          className="relative flex items-center gap-2.5 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-950/50 hover:bg-red-500 transition active:scale-95"
          aria-label={`Ver cesta con ${cartCount} artículos`}
        >
          <ShoppingBag className="h-4 w-4" />
          <span className="hidden sm:inline">Cesta de Compra</span>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-950 text-xs font-black text-white border border-red-400">
            {cartCount}
          </span>
        </button>
      </div>

      {/* Category Pills Navigation - Prohibida la barra de búsqueda */}
      <div className="mx-auto max-w-7xl px-4 pb-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider whitespace-nowrap mr-1">
            Categorías:
          </span>
          {categories.map((category) => {
            const isSelected = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => onSelectCategory(category)}
                className={`rounded-full px-3.5 py-1 text-xs font-medium whitespace-nowrap transition ${
                  isSelected
                    ? 'bg-red-600 text-white font-semibold shadow-md shadow-red-950/40'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
