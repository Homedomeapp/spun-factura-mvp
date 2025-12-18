"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Cliente {
  id: string;
  nombre: string;
  nif: string;
  tipo: string;
}

interface Linea {
  id: string;
  descripcion: string;
  cantidad: number;
  precio_unitario: number;
  tipo_iva: number;
}

export default function NuevaFacturaPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [profesionalId, setProfesionalId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    cliente_id: "",
    fecha_expedicion: new Date().toISOString().split("T")[0],
    descripcion: "",
    aplicar_retencion: false,
    porcentaje_retencion: 15,
    es_vivienda_particular: false,
  });

  const [lineas, setLineas] = useState<Linea[]>([
    { id: "1", descripcion: "", cantidad: 1, precio_unitario: 0, tipo_iva: 21 },
  ]);

  const [serie, setSerie] = useState("A");
  const [numero, setNumero] = useState(1);

  useEffect(() => {
    loadData();
  }, []);

  // Cuando cambia "es_vivienda_particular", actualizar IVA de todas las líneas
  useEffect(() => {
    if (formData.es_vivienda_particular) {
      setLineas(lineas.map(l => ({ ...l, tipo_iva: 10 })));
    } else {
      setLineas(lineas.map(l => ({ ...l, tipo_iva: 21 })));
    }
  }, [formData.es_vivienda_particular]);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth/login");
      return;
    }

    const { data: prof } = await supabase
      .from("profesionales")
      .select("id, serie_factura, ultimo_numero")
      .eq("user_id", user.id)
      .single();

    if (prof) {
      setProfesionalId(prof.id);
      setSerie(prof.serie_factura || "A");
      setNumero((prof.ultimo_numero || 0) + 1);

      const { data: clientesData } = await supabase
        .from("clientes")
        .select("id, nombre, nif, tipo")
        .eq("profesional_id", prof.id)
        .order("nombre");

      if (clientesData) setClientes(clientesData);
    }
    setLoading(false);
  };

  const addLinea = () => {
    const tipoIva = formData.es_vivienda_particular ? 10 : 21;
    setLineas([
      ...lineas,
      { id: Date.now().toString(), descripcion: "", cantidad: 1, precio_unitario: 0, tipo_iva: tipoIva },
    ]);
  };

  const removeLinea = (id: string) => {
    if (lineas.length > 1) {
      setLineas(lineas.filter((l) => l.id !== id));
    }
  };

  const updateLinea = (id: string, field: string, value: string | number) => {
    setLineas(lineas.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
  };

  // Calculations
  const calcularBaseLinea = (linea: Linea) => {
    return linea.cantidad * linea.precio_unitario;
  };

  const calcularIvaLinea = (linea: Linea) => {
    return calcularBaseLinea(linea) * (linea.tipo_iva / 100);
  };

  const totalBase = lineas.reduce((sum, l) => sum + calcularBaseLinea(l), 0);
  const totalIva = lineas.reduce((sum, l) => sum + calcularIvaLinea(l), 0);
  const totalRetencion = formData.aplicar_retencion 
    ? totalBase * (formData.porcentaje_retencion / 100) 
    : 0;
  const totalFactura = totalBase + totalIva - totalRetencion;

  const handleSubmit = async () => {
    setError("");
    
    if (!formData.cliente_id) {
      setError("Selecciona un cliente");
      return;
    }

    if (lineas.some((l) => !l.descripcion || l.precio_unitario <= 0)) {
      setError("Completa todas las líneas con descripción y precio");
      return;
    }

    setSaving(true);

    // Create factura
    const { data: factura, error: facturaError } = await supabase
      .from("facturas")
      .insert({
        profesional_id: profesionalId,
        cliente_id: formData.cliente_id,
        serie: serie,
        numero: numero,
        tipo: "F1",
        fecha_expedicion: formData.fecha_expedicion,
        descripcion: formData.descripcion || null,
        base_imponible: totalBase,
        total_iva: totalIva,
        total_retencion: totalRetencion,
        total: totalFactura,
        estado: "borrador",
      })
      .select()
      .single();

    if (facturaError) {
      setError("Error al crear factura: " + facturaError.message);
      setSaving(false);
      return;
    }

    // Create lineas
    const lineasToInsert = lineas.map((l, index) => ({
      factura_id: factura.id,
      orden: index + 1,
      descripcion: l.descripcion,
      cantidad: l.cantidad,
      precio_unitario: l.precio_unitario,
      tipo_iva: l.tipo_iva,
      base_linea: calcularBaseLinea(l),
      cuota_iva: calcularIvaLinea(l),
    }));

    const { error: lineasError } = await supabase
      .from("lineas_factura")
      .insert(lineasToInsert);

    if (lineasError) {
      setError("Error al crear líneas: " + lineasError.message);
      setSaving(false);
      return;
    }

    // Create desglose IVA
    const desgloseMap = new Map<number, { base: number; cuota: number }>();
    lineas.forEach((l) => {
      const base = calcularBaseLinea(l);
      const cuota = calcularIvaLinea(l);
      const existing = desgloseMap.get(l.tipo_iva) || { base: 0, cuota: 0 };
      desgloseMap.set(l.tipo_iva, { base: existing.base + base, cuota: existing.cuota + cuota });
    });

    const desgloseToInsert = Array.from(desgloseMap.entries()).map(([tipo, values]) => ({
      factura_id: factura.id,
      tipo_iva: tipo,
      base_imponible: values.base,
      cuota: values.cuota,
    }));

    await supabase.from("desglose_iva").insert(desgloseToInsert);

    // Update ultimo_numero
    await supabase
      .from("profesionales")
      .update({ ultimo_numero: numero })
      .eq("id", profesionalId);

    // Redirect to factura
    router.push(`/dashboard/facturas/${factura.id}`);
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
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-gray-400 hover:text-gray-600">
              ← Volver
            </Link>
            <h1 className="font-bold text-xl text-gray-900">Nueva factura</h1>
          </div>
          <span className="text-sm text-gray-500 font-mono">{serie}-{numero}</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Cliente y fecha */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Datos generales</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
                {clientes.length === 0 ? (
                  <div className="text-sm text-gray-500">
                    No tienes clientes.{" "}
                    <Link href="/dashboard/clientes" className="text-[#34CED6] hover:underline">
                      Crear cliente
                    </Link>
                  </div>
                ) : (
                  <select
                    value={formData.cliente_id}
                    onChange={(e) => setFormData({ ...formData, cliente_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34CED6] outline-none bg-white"
                  >
                    <option value="">Seleccionar cliente</option>
                    {clientes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre} {c.nif ? `(${c.nif})` : ""}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
                <input
                  type="date"
                  value={formData.fecha_expedicion}
                  onChange={(e) => setFormData({ ...formData, fecha_expedicion: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34CED6] outline-none"
                />
              </div>
            </div>
          </div>

          {/* IVA Reducido */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200 p-6">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <h2 className="font-semibold text-gray-900 mb-1">🏠 IVA Reducido para reformas</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Si el trabajo es en una vivienda particular con más de 2 años de antigüedad, 
                  puedes aplicar el 10% de IVA en lugar del 21%.
                </p>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.es_vivienda_particular}
                    onChange={(e) => setFormData({ ...formData, es_vivienda_particular: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-[#34CED6] focus:ring-[#34CED6]"
                  />
                  <span className="text-sm font-medium text-gray-900">
                    Aplicar IVA reducido (10%) - Vivienda particular &gt; 2 años
                  </span>
                </label>
              </div>
              {formData.es_vivienda_particular && (
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  IVA 10%
                </div>
              )}
            </div>
          </div>

          {/* Retención IRPF */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <h2 className="font-semibold text-gray-900 mb-1">📋 Retención IRPF</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Si facturas a una empresa o autónomo, pueden requerirte aplicar retención.
                </p>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.aplicar_retencion}
                    onChange={(e) => setFormData({ ...formData, aplicar_retencion: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-[#34CED6] focus:ring-[#34CED6]"
                  />
                  <span className="text-sm font-medium text-gray-900">
                    Aplicar retención IRPF
                  </span>
                </label>
                {formData.aplicar_retencion && (
                  <div className="mt-3 flex items-center gap-3">
                    <select
                      value={formData.porcentaje_retencion}
                      onChange={(e) => setFormData({ ...formData, porcentaje_retencion: parseInt(e.target.value) })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34CED6] outline-none bg-white"
                    >
                      <option value={7}>7% (nuevos autónomos)</option>
                      <option value={15}>15% (general)</option>
                      <option value={19}>19% (profesionales)</option>
                    </select>
                    <span className="text-sm text-gray-500">del total de la base imponible</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Líneas */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Conceptos</h2>
              <button
                onClick={addLinea}
                className="text-sm text-[#34CED6] hover:text-[#2BB5BD] font-medium"
              >
                + Añadir línea
              </button>
            </div>

            <div className="space-y-4">
              {lineas.map((linea, index) => (
                <div key={linea.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start gap-4">
                    <span className="text-sm text-gray-400 mt-2">{index + 1}.</span>
                    <div className="flex-1 space-y-3">
                      <input
                        type="text"
                        placeholder="Descripción del servicio o trabajo"
                        value={linea.descripcion}
                        onChange={(e) => updateLinea(linea.id, "descripcion", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34CED6] outline-none"
                      />
                      <div className="grid grid-cols-4 gap-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Cantidad</label>
                          <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={linea.cantidad}
                            onChange={(e) => updateLinea(linea.id, "cantidad", parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34CED6] outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Precio €</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={linea.precio_unitario}
                            onChange={(e) => updateLinea(linea.id, "precio_unitario", parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34CED6] outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">IVA %</label>
                          <select
                            value={linea.tipo_iva}
                            onChange={(e) => updateLinea(linea.id, "tipo_iva", parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34CED6] outline-none bg-white"
                          >
                            <option value={21}>21%</option>
                            <option value={10}>10%</option>
                            <option value={4}>4%</option>
                            <option value={0}>0%</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Subtotal</label>
                          <div className="px-3 py-2 bg-gray-100 rounded-lg text-gray-700">
                            {calcularBaseLinea(linea).toFixed(2)} €
                          </div>
                        </div>
                      </div>
                    </div>
                    {lineas.length > 1 && (
                      <button
                        onClick={() => removeLinea(linea.id)}
                        className="text-gray-400 hover:text-red-500 mt-2"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totales */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Totales</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Base imponible</span>
                <span>{totalBase.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>IVA</span>
                <span>{totalIva.toFixed(2)} €</span>
              </div>
              {formData.aplicar_retencion && (
                <div className="flex justify-between text-red-600">
                  <span>Retención IRPF ({formData.porcentaje_retencion}%)</span>
                  <span>-{totalRetencion.toFixed(2)} €</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span>{totalFactura.toFixed(2)} €</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Link
              href="/dashboard"
              className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium text-center hover:bg-gray-50"
            >
              Cancelar
            </Link>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex-1 bg-[#34CED6] hover:bg-[#2BB5BD] disabled:bg-gray-300 text-white py-3 rounded-lg font-semibold transition-colors"
            >
              {saving ? "Guardando..." : "Crear factura"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
