"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

interface Cliente {
  id: string;
  tipo: string;
  nif: string;
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  codigo_postal: string;
  municipio: string;
  provincia: string;
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profesionalId, setProfesionalId] = useState<string>("");
  const supabase = createClient();

  const [formData, setFormData] = useState({
    tipo: "persona",
    nif: "",
    nombre: "",
    email: "",
    telefono: "",
    direccion: "",
    codigo_postal: "",
    municipio: "",
    provincia: "",
  });

  useEffect(() => {
    loadClientes();
  }, []);

  const loadClientes = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: prof } = await supabase
      .from("profesionales")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (prof) {
      setProfesionalId(prof.id);
      const { data } = await supabase
        .from("clientes")
        .select("*")
        .eq("profesional_id", prof.id)
        .order("nombre");

      if (data) setClientes(data);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    
    const { error } = await supabase.from("clientes").insert({
      profesional_id: profesionalId,
      tipo: formData.tipo,
      nif: formData.nif || null,
      nombre: formData.nombre,
      email: formData.email || null,
      telefono: formData.telefono || null,
      direccion: formData.direccion || null,
      codigo_postal: formData.codigo_postal || null,
      municipio: formData.municipio || null,
      provincia: formData.provincia || null,
    });

    if (!error) {
      setShowModal(false);
      setFormData({
        tipo: "persona",
        nif: "",
        nombre: "",
        email: "",
        telefono: "",
        direccion: "",
        codigo_postal: "",
        municipio: "",
        provincia: "",
      });
      loadClientes();
    }
    setSaving(false);
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
            <h1 className="font-bold text-xl text-gray-900">Mis clientes</h1>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-[#34CED6] hover:bg-[#2BB5BD] text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <span>+</span> Nuevo cliente
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {clientes.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">👥</span>
            </div>
            <h3 className="font-medium text-gray-900 mb-2">Aún no tienes clientes</h3>
            <p className="text-gray-500 text-sm mb-4">Añade tu primer cliente para empezar a facturar</p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 bg-[#34CED6] hover:bg-[#2BB5BD] text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <span>+</span> Añadir cliente
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-200">
            {clientes.map((cliente) => (
              <div key={cliente.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <span>{cliente.tipo === "empresa" ? "🏢" : "👤"}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{cliente.nombre}</p>
                    <p className="text-sm text-gray-500">{cliente.nif || "Sin NIF"} · {cliente.email || "Sin email"}</p>
                  </div>
                </div>
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full capitalize">
                  {cliente.tipo}
                </span>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Nuevo cliente</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34CED6] outline-none"
                >
                  <option value="persona">Particular</option>
                  <option value="empresa">Empresa</option>
                  <option value="intracomunitario">Intracomunitario</option>
                  <option value="extracomunitario">Extracomunitario</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre / Razón social *</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34CED6] outline-none"
                  placeholder="Nombre completo o empresa"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">NIF / CIF</label>
                <input
                  type="text"
                  value={formData.nif}
                  onChange={(e) => setFormData({ ...formData, nif: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34CED6] outline-none"
                  placeholder="12345678A"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34CED6] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34CED6] outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                <input
                  type="text"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34CED6] outline-none"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">C.P.</label>
                  <input
                    type="text"
                    value={formData.codigo_postal}
                    onChange={(e) => setFormData({ ...formData, codigo_postal: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34CED6] outline-none"
                    maxLength={5}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Municipio</label>
                  <input
                    type="text"
                    value={formData.municipio}
                    onChange={(e) => setFormData({ ...formData, municipio: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34CED6] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Provincia</label>
                  <input
                    type="text"
                    value={formData.provincia}
                    onChange={(e) => setFormData({ ...formData, provincia: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34CED6] outline-none"
                  />
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !formData.nombre}
                className="flex-1 bg-[#34CED6] hover:bg-[#2BB5BD] disabled:bg-gray-300 text-white py-2 rounded-lg font-medium"
              >
                {saving ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
