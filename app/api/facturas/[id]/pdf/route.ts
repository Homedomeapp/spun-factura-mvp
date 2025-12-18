import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import ReactPDF from "@react-pdf/renderer";
import { FacturaPDF } from "@/lib/pdf/factura-template";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  // Get profesional
  const { data: prof } = await supabase
    .from("profesionales")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!prof) {
    return NextResponse.json({ error: "Sin perfil" }, { status: 403 });
  }

  // Get factura with relations
  const { data: factura } = await supabase
    .from("facturas")
    .select(`
      *,
      cliente:clientes(*),
      profesional:profesionales(*)
    `)
    .eq("id", id)
    .eq("profesional_id", prof.id)
    .single();

  if (!factura) {
    return NextResponse.json({ error: "Factura no encontrada" }, { status: 404 });
  }

  // Get lineas
  const { data: lineas } = await supabase
    .from("lineas_factura")
    .select("*")
    .eq("factura_id", id)
    .order("orden");

  // Get desglose IVA
  const { data: desglose } = await supabase
    .from("desglose_iva")
    .select("*")
    .eq("factura_id", id)
    .order("tipo_iva", { ascending: false });

  // Generate PDF
  const pdfStream = await ReactPDF.renderToStream(
    FacturaPDF({
      factura,
      lineas: lineas || [],
      desglose: desglose || [],
    })
  );

  // Convert stream to buffer
  const chunks: Uint8Array[] = [];
  for await (const chunk of pdfStream) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  const pdfBuffer = Buffer.concat(chunks);

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="Factura-${factura.serie}-${factura.numero}.pdf"`,
    },
  });
}
