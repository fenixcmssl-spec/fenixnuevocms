'use client';

import React from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import StoreHeader from '../../components/tienda/StoreHeader';
import ProductCard from '../../components/tienda/ProductCard';
import CartDrawer from '../../components/tienda/CartDrawer';
import { fenixDb } from '../../lib/db/client';
import { ProductDto, CartItemDto, TenantDto } from '../../lib/types/fenix';
import { ShieldCheck, Truck, RotateCcw, Award } from 'lucide-react';

import { resolveTenantByHostname } from '../../lib/tenancy/resolver';
import { AlertCircle, Globe, ExternalLink } from 'lucide-react';

export default function StoreFrontPage() {
  const [activeHostname, setActiveHostname] = React.useState('modaurbana.fenixcms.app');

  // Strict domain-based tenant resolution
  const resolutionResult = React.useMemo(() => {
    return resolveTenantByHostname(activeHostname);
  }, [activeHostname]);

  const activeTenant = resolutionResult.success ? resolutionResult.tenant : null;

  // Tenant Resources
  const [products, setProducts] = React.useState<ProductDto[]>(() =>
    activeTenant ? fenixDb.getProducts(activeTenant.id) : []
  );
  const [languages, setLanguages] = React.useState(() =>
    activeTenant ? fenixDb.getLanguages(activeTenant.id) : []
  );
  const [currentLanguage, setCurrentLanguage] = React.useState('es');
  const [themes, setThemes] = React.useState(() =>
    activeTenant ? fenixDb.getThemes(activeTenant.id) : []
  );
  const [activeThemeSlug, setActiveThemeSlug] = React.useState('fenix-dark-crimson');
  const [cartItems, setCartItems] = React.useState<CartItemDto[]>([]);
  const [isCartOpen, setIsCartOpen] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState('Todos los Artículos');

  // Update resources when tenant changes
  React.useEffect(() => {
    if (activeTenant) {
      setProducts(fenixDb.getProducts(activeTenant.id));
      setLanguages(fenixDb.getLanguages(activeTenant.id));
      setThemes(fenixDb.getThemes(activeTenant.id));
      setSelectedCategory('Todos los Artículos');
      setCartItems([]);
    } else {
      setProducts([]);
      setLanguages([]);
      setThemes([]);
      setCartItems([]);
    }
  }, [activeTenant?.id]);

  const handleLanguageChange = (code: string) => {
    setCurrentLanguage(code);
  };

  const handleThemeChange = (slug: string) => {
    setActiveThemeSlug(slug);
    if (activeTenant) {
      fenixDb.setActiveTheme(activeTenant.id, slug);
      setThemes(fenixDb.getThemes(activeTenant.id));
    }
  };

  // Cart Handlers
  const handleAddToCart = (product: ProductDto) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          title: product.title,
          price: product.price,
          quantity: 1,
          imageUrl: product.imageUrl,
        },
      ];
    });
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    setCartItems((prev) =>
      prev.map((item) => (item.productId === productId ? { ...item, quantity } : item))
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  const handleCheckout = async (customer: {
    name: string;
    email: string;
    simulateVerifiedPayment: boolean;
  }) => {
    // Generar o no el token de verificación de pago según la regla de seguridad
    const verificationCode = customer.simulateVerifiedPayment
      ? `FENIX_PAY_${Date.now()}`
      : undefined;

    if (!activeTenant) throw new Error('No se pudo resolver el tenant');

    const order = fenixDb.createOrder(activeTenant.id, {
      customerName: customer.name,
      customerEmail: customer.email,
      items: cartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
      paymentVerificationId: verificationCode,
    });

    // Vaciar carrito
    setCartItems([]);

    return {
      orderNumber: order.orderNumber,
      status: order.status,
    };
  };

  const categories = React.useMemo(() => {
    const unique = Array.from(new Set(products.map((p) => p.categoryName)));
    return ['Todos los Artículos', ...unique];
  }, [products]);

  // Filter products by category
  const filteredProducts =
    selectedCategory === 'Todos los Artículos'
      ? products
      : products.filter((p) => p.categoryName === selectedCategory);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col">
      <Navbar />

      {/* Selector de Hostname / Dominio Validado */}
      <div className="bg-zinc-950 border-b border-zinc-800 px-4 py-2 text-xs">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-zinc-400">
            <span className="font-semibold text-zinc-300">Resolución de Hostname:</span>
            <div className="flex items-center gap-1.5 font-mono text-[11px]">
              <button
                type="button"
                onClick={() => setActiveHostname('modaurbana.fenixcms.app')}
                className={`rounded px-2.5 py-1 transition ${
                  activeHostname === 'modaurbana.fenixcms.app'
                    ? 'bg-red-600 text-white font-bold'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                modaurbana.fenixcms.app
              </button>
              <button
                type="button"
                onClick={() => setActiveHostname('techgadgets.fenixcms.app')}
                className={`rounded px-2.5 py-1 transition ${
                  activeHostname === 'techgadgets.fenixcms.app'
                    ? 'bg-red-600 text-white font-bold'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                techgadgets.fenixcms.app
              </button>
              <button
                type="button"
                onClick={() => setActiveHostname('tienda-no-registrada.com')}
                className={`rounded px-2.5 py-1 transition ${
                  activeHostname === 'tienda-no-registrada.com'
                    ? 'bg-amber-600 text-white font-bold'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                [Probar Host No Registrado]
              </button>
            </div>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">
            {resolutionResult.success
              ? `Tenant resuelto: ${resolutionResult.tenant.name} (${resolutionResult.resolvedVia})`
              : 'Estado: Resolución Rechazada'}
          </span>
        </div>
      </div>

      {/* Si la resolución del tenant falla, mostramos pantalla controlada de fallo sin seleccionar tenant por defecto */}
      {!resolutionResult.success || !activeTenant ? (
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-8 text-center shadow-2xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-950/40 border border-amber-800 text-amber-500 mb-6">
              <AlertCircle className="h-7 w-7" />
            </div>

            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400 bg-amber-950/80 border border-amber-800 px-2 py-0.5 rounded">
              Resolución Fallida de Tenant
            </span>

            <h1 className="mt-3 text-2xl font-black text-white">
              Dominio No Asociado o No Verificado
            </h1>

            <p className="mt-3 text-xs text-zinc-400 leading-relaxed">
              {!resolutionResult.success ? resolutionResult.message : 'Dominio no resuelto'}
            </p>

            <div className="mt-6 p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 text-left text-xs font-mono text-zinc-400 space-y-1">
              <div className="text-zinc-500 text-[10px]">REGLA DE RESOLUCIÓN EN SERVIDOR:</div>
              <div>&bull; No se selecciona automáticamente el primer tenant disponible.</div>
              <div>&bull; El host debe coincidir con un registro validado en la tabla `domains`.</div>
              <div>&bull; Los clientes nunca acceden a catálogos ajenos ante hosts inválidos.</div>
            </div>

            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={() => setActiveHostname('modaurbana.fenixcms.app')}
                className="rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-red-500 transition"
              >
                Restablecer a Dominio Verificado
              </button>
            </div>
          </div>
        </main>
      ) : (
        <>
          {/* Tenant Store Header - NO SEARCH BAR */}
          <StoreHeader
            tenantName={activeTenant.name}
            domainName={activeTenant.customDomain || `${activeTenant.slug}.fenixcms.app`}
            languages={languages}
            currentLanguage={currentLanguage}
            onLanguageChange={handleLanguageChange}
            themes={themes}
            activeThemeSlug={activeThemeSlug}
            onThemeChange={handleThemeChange}
            cartCount={cartCount}
            onOpenCart={() => setIsCartOpen(true)}
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />

      <main className="flex-1 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Trust Guarantees */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10 text-xs">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3.5 flex items-center gap-3">
              <Truck className="h-5 w-5 text-red-500 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-white">Envío Rápido 24/48h</h4>
                <p className="text-[10px] text-zinc-500">Envíos asegurados y trazables</p>
              </div>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3.5 flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-red-500 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-white">Pago 100% Protegido</h4>
                <p className="text-[10px] text-zinc-500">Validación criptográfica segura</p>
              </div>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3.5 flex items-center gap-3">
              <RotateCcw className="h-5 w-5 text-red-500 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-white">Devolución 30 Días</h4>
                <p className="text-[10px] text-zinc-500">Garantía sin complicaciones</p>
              </div>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3.5 flex items-center gap-3">
              <Award className="h-5 w-5 text-red-500 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-white">Garantía Oficial</h4>
                <p className="text-[10px] text-zinc-500">Fabricación y acabados de calidad</p>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex items-center justify-between mb-6 border-b border-zinc-800/80 pb-3">
            <div>
              <h2 className="text-lg font-bold text-white">
                {selectedCategory} ({filteredProducts.length})
              </h2>
              <p className="text-xs text-zinc-400">
                Catálogo exclusivo del tenant {activeTenant.name}
              </p>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-12 text-center text-zinc-400">
              <p className="text-sm font-semibold">No hay artículos disponibles en esta categoría.</p>
              <button
                type="button"
                onClick={() => setSelectedCategory('Todos los Artículos')}
                className="mt-3 rounded-lg bg-zinc-800 px-4 py-2 text-xs font-bold text-white hover:bg-zinc-700"
              >
                Ver todos los productos
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={handleCheckout}
      />
        </>
      )}

      <Footer />
    </div>
  );
}
