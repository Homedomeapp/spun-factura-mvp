import Link from "next/link";

export default function RegistroPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-[#34CED6] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">S</span>
            </div>
            <span className="font-bold text-2xl text-gray-900">SPUN</span>
            <span className="text-gray-500">Factura</span>
          </Link>
        </div>

        {/* Form */}
        <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Solicitar acceso</h1>
          <p className="text-gray-500 mb-6">Únete a la lista de espera de SPUN Factura</p>

          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34CED6] focus:border-[#34CED6] outline-none transition-colors"
                placeholder="Tu nombre"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34CED6] focus:border-[#34CED6] outline-none transition-colors"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono (opcional)</label>
              <input
                type="tel"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34CED6] focus:border-[#34CED6] outline-none transition-colors"
                placeholder="612 345 678"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">¿A qué te dedicas?</label>
              <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34CED6] focus:border-[#34CED6] outline-none transition-colors bg-white">
                <option value="">Selecciona tu actividad</option>
                <option value="albanil">Albañilería / Obra</option>
                <option value="electricista">Electricidad</option>
                <option value="fontanero">Fontanería</option>
                <option value="pintor">Pintura</option>
                <option value="carpintero">Carpintería</option>
                <option value="reformas">Reformas integrales</option>
                <option value="climatizacion">Climatización</option>
                <option value="jardineria">Jardinería</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-[#34CED6] hover:bg-[#2BB5BD] text-white py-3 rounded-lg font-semibold transition-colors"
            >
              Solicitar acceso anticipado
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            ¿Ya tienes cuenta?{" "}
            <Link href="/auth/login" className="text-[#2BB5BD] hover:underline font-medium">
              Inicia sesión
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          <Link href="/" className="hover:text-gray-600">← Volver al inicio</Link>
        </p>
      </div>
    </div>
  );
}
