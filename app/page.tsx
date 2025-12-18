import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white antialiased">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/97 backdrop-blur-md z-50 border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#34CED6] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="font-bold text-xl text-gray-900">SPUN</span>
            <span className="text-sm text-gray-500 font-medium">Factura</span>
          </Link>
          
          <div className="hidden sm:block bg-[#F0FCFD] border border-[#9EE8EC] px-3.5 py-2 rounded-lg text-center">
            <span className="block text-xs font-semibold text-[#2BB5BD]">Preparado para Verifactu</span>
            <span className="text-[11px] text-[#2BB5BD]/80">RD 1007/2023</span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white border border-gray-200 px-3.5 py-2 rounded-lg text-sm text-gray-500 mb-5 shadow-sm">
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
              Fecha límite: 1 julio 2026
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4 text-gray-900 tracking-tight">
              La facturación que <span className="text-[#2BB5BD]">entiende tu obra</span>
            </h1>
            
            <p className="text-lg text-gray-500 mb-4 leading-relaxed">
              Sistema de facturación diseñado para profesionales de construcción y reformas que necesitan cumplir con Verifactu sin complicaciones.
            </p>
            
            <div className="text-base text-gray-900 mb-8 px-4 py-3 bg-gray-50 border-l-[3px] border-[#34CED6] rounded-r-lg">
              Olvídate de calcular el IVA en cada factura. Nosotros sabemos cuándo aplicar el 10% en reformas.
            </div>
            
            {/* Features */}
            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex items-center gap-2 text-sm text-gray-900">
                <span className="w-5 h-5 rounded-full bg-[#34CED6]/20 flex items-center justify-center text-[#2BB5BD] text-xs">✓</span>
                IVA reducido automático
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-900">
                <span className="w-5 h-5 rounded-full bg-[#34CED6]/20 flex items-center justify-center text-[#2BB5BD] text-xs">✓</span>
                Verifactu integrado
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-900">
                <span className="w-5 h-5 rounded-full bg-[#34CED6]/20 flex items-center justify-center text-[#2BB5BD] text-xs">✓</span>
                Sin conocimientos fiscales
              </div>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link 
                href="/auth/registro"
                className="bg-[#34CED6] hover:bg-[#2BB5BD] text-white px-6 py-3 rounded-xl font-semibold text-center transition-colors shadow-md"
              >
                Solicitar acceso anticipado →
              </Link>
              <Link 
                href="#como-funciona"
                className="border border-gray-300 hover:bg-gray-50 px-6 py-3 rounded-xl font-medium text-center transition-colors"
              >
                Ver cómo funciona
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="py-6 border-y border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <span>🛡️</span> Cumple RD 1007/2023
            </div>
            <div className="flex items-center gap-2">
              <span>🔒</span> Datos cifrados
            </div>
            <div className="flex items-center gap-2">
              <span>⚡</span> Envío automático AEAT
            </div>
            <div className="flex items-center gap-2">
              <span>📱</span> Funciona en móvil
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 bg-[#F0FCFD]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              El problema que resolvemos
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Los profesionales de la construcción tienen necesidades fiscales únicas que los programas genéricos no entienden.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center text-2xl mb-4">😤</div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900">IVA complicado</h3>
              <p className="text-gray-500 text-sm">¿10% o 21%? ¿Cuándo aplica el reducido en reformas? ¿Y si el cliente es empresa?</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center text-2xl mb-4">📋</div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900">Verifactu obligatorio</h3>
              <p className="text-gray-500 text-sm">Desde julio 2026 todas tus facturas deben enviarse a Hacienda. Sin excusas.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center text-2xl mb-4">⏰</div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900">Tiempo perdido</h3>
              <p className="text-gray-500 text-sm">Horas calculando IVA, buscando NIFs, llamando al gestor... Tiempo que no cobras.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section id="como-funciona" className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Cómo funciona SPUN Factura
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Facturar debería ser tan fácil como enviar un WhatsApp. Y lo es.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#34CED6]/10 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">1️⃣</div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900">Rellena lo básico</h3>
              <p className="text-gray-500 text-sm">Cliente, concepto y precio. Nosotros calculamos el IVA correcto automáticamente.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-[#34CED6]/10 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">2️⃣</div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900">Revisa y envía</h3>
              <p className="text-gray-500 text-sm">Un click y tu factura viaja a Hacienda con código QR Verifactu incluido.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-[#34CED6]/10 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">3️⃣</div>
              <h3 className="font-semibold text-lg mb-2 text-gray-900">Descarga el PDF</h3>
              <p className="text-gray-500 text-sm">PDF profesional listo para enviar a tu cliente. Con tu logo y todo legal.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Professionals Grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Diseñado para profesionales como tú
            </h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: "Albañiles", emoji: "🧱" },
              { name: "Electricistas", emoji: "⚡" },
              { name: "Fontaneros", emoji: "🔧" },
              { name: "Pintores", emoji: "🎨" },
              { name: "Carpinteros", emoji: "🪚" },
              { name: "Jardineros", emoji: "🌿" },
            ].map((prof) => (
              <div key={prof.name} className="bg-white p-4 rounded-xl border border-gray-200 text-center hover:border-[#34CED6] transition-colors">
                <span className="text-2xl block mb-2">{prof.emoji}</span>
                <span className="text-sm font-medium text-gray-700">{prof.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#2BB5BD]">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Prepárate para Verifactu antes que nadie
          </h2>
          <p className="text-white/90 mb-8 text-lg">
            Únete a la lista de espera y sé de los primeros en probar SPUN Factura. Sin compromiso.
          </p>
          <Link 
            href="/auth/registro"
            className="inline-block bg-white text-[#2BB5BD] px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg"
          >
            Solicitar acceso anticipado →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-[#34CED6] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">S</span>
              </div>
              <span className="font-bold text-white">SPUN</span>
              <span className="text-sm text-gray-400">Factura</span>
            </div>
            
            <div className="text-sm text-gray-400">
              © 2024 Homedome Ibérica S.L. Todos los derechos reservados.
            </div>
            
            <div className="flex gap-6 text-sm">
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                Privacidad
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                Aviso Legal
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
