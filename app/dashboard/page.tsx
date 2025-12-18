"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Profesional {
  id: string;
  nombre_fiscal: string;
  nif: string;
  categoria_principal: string;
  subservicios: string[];
  serie_factura: string;
  ultimo_numero: number;
}

interface Factura {
  id: string;
  serie: string;
  numero: number;
  fecha_expedicion: string;
  cliente: {
    nombre: string;
  };
  total: number;
  estado: string;
}

export default function DashboardPage() {
  const [profesional, setProfesional] = useState<Profesional | null>(null);
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/auth/login");
        return;
      }

      // Load profesional
      const { data: prof } = await supabase
        .from("profesionales")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!prof) {
        router.push("/onboarding");
        return;
      }

      setProfesional(prof);

      // Load facturas
      const { data: facts } = await supabase
        .from("facturas")
        .select(`
          id,
          serie,
          numero,
          fecha_expedicion,
          total,
          estado,
          cliente:clientes(nombre)
        `)
        .eq("profesional_id", prof.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (facts) {
        setFacturas(facts as unknown as Factura[]);
      }

      setLoading(false);
    };

    loadData();
  }, [supabase, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "registrada": return "bg-green-100 text-green-800";
      case "pendiente": return "bg-yellow-100 text-yellow-800";
      case "borrador": return "bg-gray-100 text-gray-800";
      case "error": return "bg-red-100 text-red-800";
      case "anulada": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#34CED6] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#34CED6] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="font-bold text-xl text-gray-900">SPUN</span>
            <span className="text-gray-400 text-sm">Factura</span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 hidden sm:block">{profesional?.nombre_fiscal}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Welcome + Stats */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Hola, {profesional?.nombre_fiscal.split(" ")[0]}!
          </h1>
          <p className="text-gray-500">{profesional?.categoria_principal}</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Facturas este mes</p>
            <p className="text-2xl font-bold text-gray-900">{facturas.length}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Próxima factura</p>
            <p className="text-2xl font-bold text-gray-900">{profesional?.serie_factura}-{(profesional?.ultimo_numero || 0) + 1}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Total facturado</p>
            <p className="text-2xl font-bold text-gray-900">
              {facturas.reduce((sum, f) => sum + Number(f.total), 0).toLocaleString("es-ES", { style: "currency", currency: "EUR" })}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Verifactu</p>
            <p className="text-sm font-medium text-yellow-600">⏳ Pendiente</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Link
            href="/dashboard/facturas/nueva"
            className="bg-[#34CED6] hover:bg-[#2BB5BD] text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
          >
            <span className="text-xl">+</span> Nueva factura
          </Link>
          <Link
            href="/dashboard/clientes"
            className="bg-white hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg font-medium border border-gray-300 transition-colors"
          >
            Mis clientes
          </Link>
          <Link
            href="/dashboard/facturas"
            className="bg-white hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg font-medium border border-gray-300 transition-colors"
          >
            Todas las facturas
          </Link>
        </div>

        {/* Recent Invoices */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Últimas facturas</h2>
          </div>

          {facturas.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📄</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Aún no tienes facturas</h3>
              <p className="text-gray-500 text-sm mb-4">Crea tu primera factura y empieza a facturar con Verifactu</p>
              <Link
                href="/dashboard/facturas/nueva"
                className="inline-flex items-center gap-2 bg-[#34CED6] hover:bg-[#2BB5BD] text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <span>+</span> Crear primera factura
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {facturas.map((factura) => (
                <Link
                  key={factura.id}
                  href={`/dashboard/facturas/${factura.id}`}
                  className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-lg">📄</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{factura.serie}-{factura.numero}</p>
                      <p className="text-sm text-gray-500">{factura.cliente?.nombre || "Sin cliente"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {Number(factura.total).toLocaleString("es-ES", { style: "currency", currency: "EUR" })}
                    </p>
                    <span className={`text-xs px-2 py-1 rounded-full ${getEstadoColor(factura.estado)}`}>
                      {factura.estado}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Verifactu Banner */}
        <div className="mt-8 bg-gradient-to-r from-[#34CED6] to-[#2BB5BD] rounded-xl p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-lg mb-2">🔐 Activa Verifactu</h3>
              <p className="text-white/90 text-sm mb-4">
                Conecta tu cuenta con la Agencia Tributaria y cumple con la normativa antes de 2027.
              </p>
              <button className="bg-white text-[#2BB5BD] px-4 py-2 rounded-lg font-medium text-sm hover:bg-white/90 transition-colors">
                Configurar Verifactu
              </button>
            </div>
            <span className="text-4xl">🏛️</span>
          </div>
        </div>
      </main>
    </div>
  );
}
