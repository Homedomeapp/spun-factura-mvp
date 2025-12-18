import Link from "next/link";

export default function LoginPage() {
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Iniciar sesión</h1>
          <p className="text-gray-500 mb-6">Accede a tu cuenta de facturación</p>

          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34CED6] focus:border-[#34CED6] outline-none transition-colors"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <input
                type="password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34CED6] focus:border-[#34CED6] outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#34CED6] hover:bg-[#2BB5BD] text-white py-3 rounded-lg font-semibold transition-colors"
            >
              Entrar
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            ¿No tienes cuenta?{" "}
            <Link href="/auth/registro" className="text-[#2BB5BD] hover:underline font-medium">
              Regístrate gratis
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
