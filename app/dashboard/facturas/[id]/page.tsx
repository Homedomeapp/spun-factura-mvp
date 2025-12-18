"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface Factura {
  id: string;
  serie: string;
  numero: number;
  tipo: string;
  fecha_expedicion: string;
  descripcion: string;
  base_imponible: number;
  total_iva: number;
  total_retencion: number;
  total: number;
  estado: string;
  verifacti_csv: string;
  created_at: string;
  cliente: {
    nombre: string;
    nif: string;
    direccion: string;
    codigo_postal: string;
    municipio: string;
    provincia: string;
  };
  profesional: {
    nombre_fiscal: string;
    nif: string;
    direccion_fiscal: string;
    codigo_postal: string;
    municipio: string;
    provincia: string;
  };
}

interface Linea {
  id: string;
  orden: number;
  descripcion: string;
  cantidad: number;
  precio_unitario: number;
  tipo_iva: number;
  base_linea: number;
  cuota_iva: number;
}

interface DesgloseIva {
  tipo_iva: number;
  base_imponible: number;
  cuota: number;
}

export default function FacturaDetailPage() {
  const [factura, setFactura] = useState<Factura | null>(null);
  const [lineas, setLineas] = useState<Linea[]>([]);
  const [desglose, setDesglose] = useState<DesgloseIva[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();

  useEffect(() => {
    loadFactura();
  }, [params.id]);

  const loadFactura = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth/login");
      return;
    }

    // Get profesional ID
    const { data: prof } = await supabase
      .from("profesionales")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!prof) {
      router.push("/onboarding");
      return;
    }

    // Load factura with relations
    const { data: facturaData } = await supabase
      .from("facturas")
      .select(`
        *,
        cliente:clientes(*),
        profesional:profesionales(*)
      `)
      .eq("id", params.id)
      .eq("profesional_id", prof.id)
      .single();

    if (!facturaData) {
      router.push("/dashboard");
      return;
    }

    setFactura(facturaData as unknown as Factura);

    // Load lineas
    const { data: lineasData } = await supabase
      .from("lineas_factura")
      .select("*")
      .eq("factura_id", params.id)
      .order("orden");

    if (lineasData) setLineas(lineasData);

    // Load desglose
    const { data: desgloseData } = await supabase
      .from("desglose_iva")
      .select("*")
      .eq("factura_id", params.id)
      .order("tipo_iva", { ascending: false });

    if (desgloseData) setDesglose(desgloseData);

    setLoading(false);
  };

  const handleDownloadPdf = async () => {
    setDownloadingPdf(true);
    try {
      const response = await fetch(`/api/facturas/${params.id}/pdf`);
      if (!response.ok) throw new Error("Error al generar PDF");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Factura-${factura?.serie}-${factura?.numero}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error descargando PDF:", error);
      alert("Error al descargar el PDF. Inténtalo de nuevo.");
    }
    setDownloadingPdf(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#34CED6] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!factura) return null;

  const hasIvaReducido = lineas.some((l) => l.tipo_iva === 10);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-gray-400 hover:text-gray-600">
              ← Volver
            </Link>
            <div>
              <h1 className="font-bold text-xl text-gray-900">
                Factura {factura.serie}-{factura.numero}
              </h1>
              <span className={`text-xs px-2 py-1 rounded-full ${getEstadoColor(factura.estado)}`}>
                {factura.estado}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            {factura.estado === "borrador" && (
              <button className="bg-[#34CED6] hover:bg-[#2BB5BD] text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors">
                Enviar a Verifactu
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Factura Preview */}
        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
          {/* Header factura */}
          <div className="flex justify-between items-start mb-8 pb-8 border-b border-gray-200">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-[#34CED6] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">S</span>
                </div>
                <span className="font-bold text-xl">SPUN</span>
              </div>
              <div className="text-sm text-gray-600">
                <p className="font-medium text-gray-900">{factura.profesional.nombre_fiscal}</p>
                <p>NIF: {factura.profesional.nif}</p>
                <p>{factura.profesional.direccion_fiscal}</p>
                <p>{factura.profesional.codigo_postal} {factura.profesional.municipio}</p>
                <p>{factura.profesional.provincia}</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">FACTURA</h2>
              <p className="text-lg font-mono">{factura.serie}-{factura.numero}</p>
              <p className="text-sm text-gray-500 mt-2">Fecha: {formatDate(factura.fecha_expedicion)}</p>
              {factura.verifacti_csv && (
                <p className="text-xs text-gray-400 mt-1">CSV: {factura.verifacti_csv}</p>
              )}
            </div>
          </div>

          {/* Cliente */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-500 mb-2">FACTURAR A</h3>
            <div className="text-sm text-gray-600">
              <p className="font-medium text-gray-900">{factura.cliente.nombre}</p>
              {factura.cliente.nif && <p>NIF: {factura.cliente.nif}</p>}
              {factura.cliente.direccion && <p>{factura.cliente.direccion}</p>}
              {factura.cliente.codigo_postal && (
                <p>{factura.cliente.codigo_postal} {factura.cliente.municipio}</p>
              )}
              {factura.cliente.provincia && <p>{factura.cliente.provincia}</p>}
            </div>
          </div>

          {/* Líneas */}
          <table className="w-full mb-8">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 text-sm font-medium text-gray-500">Descripción</th>
                <th className="text-right py-3 text-sm font-medium text-gray-500 w-20">Cant.</th>
                <th className="text-right py-3 text-sm font-medium text-gray-500 w-24">Precio</th>
                <th className="text-right py-3 text-sm font-medium text-gray-500 w-16">IVA</th>
                <th className="text-right py-3 text-sm font-medium text-gray-500 w-24">Importe</th>
              </tr>
            </thead>
            <tbody>
              {lineas.map((linea) => (
                <tr key={linea.id} className="border-b border-gray-100">
                  <td className="py-3 text-sm text-gray-900">{linea.descripcion}</td>
                  <td className="py-3 text-sm text-gray-600 text-right">{linea.cantidad}</td>
                  <td className="py-3 text-sm text-gray-600 text-right">{Number(linea.precio_unitario).toFixed(2)} €</td>
                  <td className="py-3 text-sm text-gray-600 text-right">{linea.tipo_iva}%</td>
                  <td className="py-3 text-sm text-gray-900 text-right font-medium">{Number(linea.base_linea).toFixed(2)} €</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totales */}
          <div className="flex justify-end">
            <div className="w-64">
              <div className="flex justify-between py-2 text-sm">
                <span className="text-gray-500">Base imponible</span>
                <span className="text-gray-900">{Number(factura.base_imponible).toFixed(2)} €</span>
              </div>
              {desglose.map((d) => (
                <div key={d.tipo_iva} className="flex justify-between py-2 text-sm">
                  <span className="text-gray-500">IVA {d.tipo_iva}%</span>
                  <span className="text-gray-900">{Number(d.cuota).toFixed(2)} €</span>
                </div>
              ))}
              {Number(factura.total_retencion) > 0 && (
                <div className="flex justify-between py-2 text-sm">
                  <span className="text-gray-500">Retención IRPF</span>
                  <span className="text-red-600">-{Number(factura.total_retencion).toFixed(2)} €</span>
                </div>
              )}
              <div className="flex justify-between py-3 border-t border-gray-200 mt-2">
                <span className="font-bold text-gray-900">TOTAL</span>
                <span className="font-bold text-gray-900 text-lg">{Number(factura.total).toFixed(2)} €</span>
              </div>
            </div>
          </div>

          {/* Nota IVA reducido */}
          {hasIvaReducido && (
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700">
                IVA reducido del 10% aplicado conforme al artículo 91.Uno.2.10º de la Ley 37/1992 del IVA,
                para obras de renovación y reparación en viviendas particulares con más de 2 años de antigüedad,
                donde el coste de materiales no supera el 40% del total.
              </p>
            </div>
          )}

          {/* Verifactu badge */}
          {factura.estado === "registrada" && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm text-green-700">
                <span>✓</span>
                <span>Factura registrada en Verifactu</span>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-4 mt-6">
          <button 
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
            className="flex-1 bg-[#34CED6] hover:bg-[#2BB5BD] disabled:bg-gray-300 text-white py-3 rounded-lg font-semibold transition-colors"
          >
            {downloadingPdf ? "Generando PDF..." : "📄 Descargar PDF"}
          </button>
          <button className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">
            ✉️ Enviar por email
          </button>
        </div>
      </main>
    </div>
  );
}
