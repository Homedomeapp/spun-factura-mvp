import Link from "next/link";

export default function RegistroPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-spun-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">S</span>
            </div>
            <span className="font-bold text-2xl">SPUN Factura</span>
          </Link>
        </div>

        <div className="bg-white p-8 rounded-xl border shadow-sm">
          <h1 className="text-2xl font-bold mb-2">Crear cuenta</h1>
          <p className="text-gray-500 mb-6">Empieza a facturar en 5 minutos</p>

          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre</label>
              <input
                type="text"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-spun-500 focus:border-spun-500 outline-none"
                placeholder="Tu nombre"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-spun-500 focus:border-spun-500 outline-none"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Contraseña</label>
              <input
                type="password"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-spun-500 focus:border-spun-500 outline-none"
                placeholder="Mínimo 8 caracteres"
              />
            </div>

            <Link
              href="/dashboard"
              className="w-full bg-spun-500 text-white py-2 rounded-lg hover:bg-spun-600 font-medium block text-center"
            >
              Crear cuenta gratis
            </Link>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            ¿Ya tienes cuenta?{" "}
            <Link href="/auth/login" className="text-spun-600 hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
