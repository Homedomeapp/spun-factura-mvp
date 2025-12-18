"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

interface Factura {
  id: string;
  serie: string;
  numero: number;
  fecha_expedicion: string;
  total: number;
  estado: string;
  cliente: {
    nombre: string;
  };
}

export default function FacturasPage() {
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("todas");
  const supabase = createClient();

  useEffect(() => {
    loadFacturas();
  }, []);

  const loadFacturas = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: prof } = await supabase
      .from("profesionales")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (prof) {
      const { data } = await supabase
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
        .order("fecha_expedicion", { ascending: false });

      if (data) setFacturas(data as unknown as Factura[]);
    }
    setLoading(false);
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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const filteredFacturas = facturas.filter((f) => {
    if (filter === "todas") return true;
    return f.estado === filter;
  });

  const totals = {
    count: filteredFacturas.length,
    amount: filteredFacturas.reduce((sum, f) => sum + Number(f.total), 0),
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#34CED6] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-gray-400 hover:text-gray-600">
              ← Volver
            </Link>
            <h1 className="font-bold text-xl text-gray-900">Facturas</h1>
          </div>
          <Link
            href="/dashboard/facturas/nueva"
            className="bg-[#34CED6] hover:bg-[#2BB5BD] text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <span>+</span> Nueva factura
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Total facturas</p>
            <p className="text-2xl font-bold text-gray-900">{facturas.length}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Borradores</p>
            <p className="text-2xl font-bold text-gray-900">
              {facturas.filter((f) => f.estado === "borrador").length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Registradas</p>
            <p className="text-2xl font-bold text-green-600">
              {facturas.filter((f) => f.estado === "registrada").length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Total facturado</p>
            <p className="text-2xl font-bold text-gray-900">
              {totals.amount.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {["todas", "borrador", "pendiente", "registrada", "anulada"].map((estado) => (
            <button
              key={estado}
              onClick={() => setFilter(estado)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filter === estado
                  ? "bg-[#34CED6] text-white"
                  : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              {estado.charAt(0).toUpperCase() + estado.slice(1)}
            </button>
          ))}
        </div>

        {/* List */}
        {filteredFacturas.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📄</span>
            </div>
            <h3 className="font-medium text-gray-900 mb-2">
              {filter === "todas" ? "Aún no tienes facturas" : `No hay facturas con estado "${filter}"`}
            </h3>
            <p className="text-gray-500 text-sm mb-4">
              {filter === "todas" && "Crea tu primera factura y empieza a facturar"}
            </p>
            {filter === "todas" && (
              <Link
                href="/dashboard/facturas/nueva"
                className="inline-flex items-center gap-2 bg-[#34CED6] hover:bg-[#2BB5BD] text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <span>+</span> Crear factura
              </Link>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Table header */}
            <div className="hidden md:grid md:grid-cols-6 gap-4 p-4 border-b border-gray-200 bg-gray-50 text-sm font-medium text-gray-500">
              <div>Número</div>
              <div>Fecha</div>
              <div className="col-span-2">Cliente</div>
              <div className="text-right">Importe</div>
              <div className="text-right">Estado</div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-gray-200">
              {filteredFacturas.map((factura) => (
                <Link
                  key={factura.id}
                  href={`/dashboard/facturas/${factura.id}`}
                  className="grid grid-cols-2 md:grid-cols-6 gap-4 p-4 hover:bg-gray-50 transition-colors items-center"
                >
                  <div className="font-medium text-gray-900 font-mono">
                    {factura.serie}-{factura.numero}
                  </div>
                  <div className="text-sm text-gray-500 hidden md:block">
                    {formatDate(factura.fecha_expedicion)}
                  </div>
                  <div className="col-span-2 hidden md:block">
                    <p className="text-gray-900">{factura.cliente?.nombre || "Sin cliente"}</p>
                  </div>
                  <div className="text-right font-medium text-gray-900">
                    {Number(factura.total).toLocaleString("es-ES", { style: "currency", currency: "EUR" })}
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded-full ${getEstadoColor(factura.estado)}`}>
                      {factura.estado}
                    </span>
                  </div>
                  {/* Mobile: extra info */}
                  <div className="col-span-2 md:hidden text-sm text-gray-500">
                    {factura.cliente?.nombre || "Sin cliente"} · {formatDate(factura.fecha_expedicion)}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
