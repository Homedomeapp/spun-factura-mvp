import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  logo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoBox: {
    width: 32,
    height: 32,
    backgroundColor: "#34CED6",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    color: "white",
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
  },
  brandName: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
  },
  title: {
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
    textAlign: "right",
  },
  invoiceNumber: {
    fontSize: 14,
    color: "#666",
    textAlign: "right",
    marginTop: 4,
  },
  invoiceDate: {
    fontSize: 10,
    color: "#666",
    textAlign: "right",
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 9,
    color: "#666",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  companyName: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    marginBottom: 2,
  },
  companyDetail: {
    fontSize: 10,
    color: "#444",
    marginBottom: 1,
  },
  table: {
    marginTop: 20,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
    paddingBottom: 8,
    marginBottom: 8,
  },
  tableHeaderCell: {
    fontSize: 9,
    color: "#666",
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  colDesc: { flex: 3 },
  colQty: { width: 50, textAlign: "right" },
  colPrice: { width: 70, textAlign: "right" },
  colIva: { width: 40, textAlign: "right" },
  colTotal: { width: 80, textAlign: "right" },
  totalsContainer: {
    alignItems: "flex-end",
    marginTop: 20,
  },
  totalsBox: {
    width: 220,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  totalLabel: {
    color: "#666",
  },
  totalValue: {
    fontFamily: "Helvetica-Bold",
  },
  grandTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 8,
    marginTop: 8,
    borderTopWidth: 2,
    borderTopColor: "#34CED6",
  },
  grandTotalLabel: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
  },
  grandTotalValue: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
  },
  footer: {
    position: "absolute",
    bottom: 40,
    left: 40,
    right: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
  },
  footerText: {
    fontSize: 8,
    color: "#999",
    textAlign: "center",
  },
  verifactuBadge: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#f0fdf4",
    borderRadius: 4,
  },
  verifactuText: {
    fontSize: 9,
    color: "#166534",
  },
  ivaReducidoNote: {
    marginTop: 10,
    padding: 8,
    backgroundColor: "#f0f9ff",
    borderRadius: 4,
  },
  ivaReducidoText: {
    fontSize: 8,
    color: "#0369a1",
  },
});

interface FacturaPDFProps {
  factura: {
    serie: string;
    numero: number;
    fecha_expedicion: string;
    base_imponible: number;
    total_iva: number;
    total_retencion: number;
    total: number;
    estado: string;
    verifacti_csv?: string;
    iva_reducido_vivienda?: boolean;
    profesional: {
      nombre_fiscal: string;
      nif: string;
      direccion_fiscal: string;
      codigo_postal: string;
      municipio: string;
      provincia: string;
    };
    cliente: {
      nombre: string;
      nif?: string;
      direccion?: string;
      codigo_postal?: string;
      municipio?: string;
      provincia?: string;
    };
  };
  lineas: {
    descripcion: string;
    cantidad: number;
    precio_unitario: number;
    tipo_iva: number;
    base_linea: number;
  }[];
  desglose: {
    tipo_iva: number;
    base_imponible: number;
    cuota: number;
  }[];
}

export function FacturaPDF({ factura, lineas, desglose }: FacturaPDFProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return Number(amount).toFixed(2) + " €";
  };

  const hasIvaReducido = lineas.some((l) => l.tipo_iva === 10);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <View style={styles.logo}>
              <View style={styles.logoBox}>
                <Text style={styles.logoText}>S</Text>
              </View>
              <Text style={styles.brandName}>SPUN</Text>
            </View>
            <View style={{ marginTop: 12 }}>
              <Text style={styles.companyName}>{factura.profesional.nombre_fiscal}</Text>
              <Text style={styles.companyDetail}>NIF: {factura.profesional.nif}</Text>
              <Text style={styles.companyDetail}>{factura.profesional.direccion_fiscal}</Text>
              <Text style={styles.companyDetail}>
                {factura.profesional.codigo_postal} {factura.profesional.municipio}
              </Text>
              <Text style={styles.companyDetail}>{factura.profesional.provincia}</Text>
            </View>
          </View>
          <View>
            <Text style={styles.title}>FACTURA</Text>
            <Text style={styles.invoiceNumber}>
              {factura.serie}-{factura.numero}
            </Text>
            <Text style={styles.invoiceDate}>Fecha: {formatDate(factura.fecha_expedicion)}</Text>
            {factura.verifacti_csv && (
              <Text style={styles.invoiceDate}>CSV: {factura.verifacti_csv}</Text>
            )}
          </View>
        </View>

        {/* Cliente */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Facturar a</Text>
          <Text style={styles.companyName}>{factura.cliente.nombre}</Text>
          {factura.cliente.nif && (
            <Text style={styles.companyDetail}>NIF: {factura.cliente.nif}</Text>
          )}
          {factura.cliente.direccion && (
            <Text style={styles.companyDetail}>{factura.cliente.direccion}</Text>
          )}
          {factura.cliente.codigo_postal && (
            <Text style={styles.companyDetail}>
              {factura.cliente.codigo_postal} {factura.cliente.municipio}
            </Text>
          )}
          {factura.cliente.provincia && (
            <Text style={styles.companyDetail}>{factura.cliente.provincia}</Text>
          )}
        </View>

        {/* Tabla de líneas */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colDesc]}>Descripción</Text>
            <Text style={[styles.tableHeaderCell, styles.colQty]}>Cant.</Text>
            <Text style={[styles.tableHeaderCell, styles.colPrice]}>Precio</Text>
            <Text style={[styles.tableHeaderCell, styles.colIva]}>IVA</Text>
            <Text style={[styles.tableHeaderCell, styles.colTotal]}>Importe</Text>
          </View>
          {lineas.map((linea, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.colDesc}>{linea.descripcion}</Text>
              <Text style={styles.colQty}>{linea.cantidad}</Text>
              <Text style={styles.colPrice}>{formatCurrency(linea.precio_unitario)}</Text>
              <Text style={styles.colIva}>{linea.tipo_iva}%</Text>
              <Text style={styles.colTotal}>{formatCurrency(linea.base_linea)}</Text>
            </View>
          ))}
        </View>

        {/* Totales */}
        <View style={styles.totalsContainer}>
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Base imponible</Text>
              <Text style={styles.totalValue}>{formatCurrency(factura.base_imponible)}</Text>
            </View>
            {desglose.map((d, index) => (
              <View key={index} style={styles.totalRow}>
                <Text style={styles.totalLabel}>IVA {d.tipo_iva}%</Text>
                <Text style={styles.totalValue}>{formatCurrency(d.cuota)}</Text>
              </View>
            ))}
            {Number(factura.total_retencion) > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Retención IRPF</Text>
                <Text style={[styles.totalValue, { color: "#dc2626" }]}>
                  -{formatCurrency(factura.total_retencion)}
                </Text>
              </View>
            )}
            <View style={styles.grandTotal}>
              <Text style={styles.grandTotalLabel}>TOTAL</Text>
              <Text style={styles.grandTotalValue}>{formatCurrency(factura.total)}</Text>
            </View>
          </View>
        </View>

        {/* Nota IVA reducido */}
        {hasIvaReducido && (
          <View style={styles.ivaReducidoNote}>
            <Text style={styles.ivaReducidoText}>
              IVA reducido del 10% aplicado conforme al artículo 91.Uno.2.10º de la Ley 37/1992 del IVA,
              para obras de renovación y reparación en viviendas particulares con más de 2 años de antigüedad,
              donde el coste de materiales no supera el 40% del total.
            </Text>
          </View>
        )}

        {/* Verifactu badge */}
        {factura.estado === "registrada" && (
          <View style={styles.verifactuBadge}>
            <Text style={styles.verifactuText}>
              ✓ Factura registrada en el sistema Verifactu de la Agencia Tributaria
            </Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Factura generada con SPUN Factura · factura.spun.es
          </Text>
        </View>
      </Page>
    </Document>
  );
}
