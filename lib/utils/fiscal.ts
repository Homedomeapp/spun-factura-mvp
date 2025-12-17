/**
 * Utilidades para cálculos fiscales (IVA, retenciones, etc.)
 *
 * Tipos de IVA en España:
 * - 21%: Tipo general
 * - 10%: Tipo reducido (reformas vivienda > 2 años, entre otros)
 * - 4%: Tipo superreducido
 * - 0%: Exento o ISP (Inversión Sujeto Pasivo)
 */

// =====================================================
// CONSTANTES
// =====================================================

export const TIPOS_IVA = {
  GENERAL: 21,
  REDUCIDO: 10,
  SUPERREDUCIDO: 4,
  EXENTO: 0,
} as const;

export const TIPOS_RETENCION_IRPF = {
  NINGUNA: 0,
  REDUCIDA: 7, // Nuevos autónomos primeros 3 años
  GENERAL: 15,
} as const;

export type TipoIva = (typeof TIPOS_IVA)[keyof typeof TIPOS_IVA];
export type TipoRetencion =
  (typeof TIPOS_RETENCION_IRPF)[keyof typeof TIPOS_RETENCION_IRPF];

// =====================================================
// CÁLCULOS BÁSICOS
// =====================================================

/**
 * Calcula la cuota de IVA dado una base y tipo.
 */
export function calcularCuotaIva(base: number, tipoIva: number): number {
  return redondear(base * (tipoIva / 100));
}

/**
 * Calcula la retención de IRPF sobre la base imponible.
 */
export function calcularRetencionIrpf(
  base: number,
  porcentaje: number
): number {
  return redondear(base * (porcentaje / 100));
}

/**
 * Calcula el importe de una línea de factura.
 */
export function calcularImporteLinea(
  cantidad: number,
  precioUnitario: number,
  descuentoPorcentaje: number = 0
): number {
  const subtotal = cantidad * precioUnitario;
  const descuento = subtotal * (descuentoPorcentaje / 100);
  return redondear(subtotal - descuento);
}

/**
 * Redondea a 2 decimales (estándar para euros).
 */
export function redondear(valor: number, decimales: number = 2): number {
  const factor = Math.pow(10, decimales);
  return Math.round(valor * factor) / factor;
}

// =====================================================
// CÁLCULOS DE FACTURA
// =====================================================

export interface LineaParaCalculo {
  cantidad: number;
  precioUnitario: number;
  descuentoPorcentaje?: number;
  tipoIva: number;
}

export interface ResultadoCalculoLinea {
  baseLinea: number;
  cuotaIva: number;
  totalLinea: number;
}

export interface ResultadoCalculoFactura {
  lineas: ResultadoCalculoLinea[];
  baseImponible: number;
  desgloseIva: { tipoIva: number; base: number; cuota: number }[];
  totalIva: number;
  totalRetencion: number;
  total: number;
}

/**
 * Calcula todos los importes de una factura.
 */
export function calcularFactura(
  lineas: LineaParaCalculo[],
  retencionPorcentaje: number = 0,
  inversionSujetoPasivo: boolean = false
): ResultadoCalculoFactura {
  // Calcular cada línea
  const lineasCalculadas: ResultadoCalculoLinea[] = lineas.map((linea) => {
    const baseLinea = calcularImporteLinea(
      linea.cantidad,
      linea.precioUnitario,
      linea.descuentoPorcentaje
    );

    // Si es ISP, el IVA es 0 aunque la línea diga otro tipo
    const tipoIvaEfectivo = inversionSujetoPasivo ? 0 : linea.tipoIva;
    const cuotaIva = calcularCuotaIva(baseLinea, tipoIvaEfectivo);

    return {
      baseLinea,
      cuotaIva,
      totalLinea: redondear(baseLinea + cuotaIva),
    };
  });

  // Base imponible total
  const baseImponible = redondear(
    lineasCalculadas.reduce((sum, l) => sum + l.baseLinea, 0)
  );

  // Desglose por tipo de IVA
  const desgloseMap = new Map<number, { base: number; cuota: number }>();

  lineas.forEach((linea, index) => {
    const tipoIvaEfectivo = inversionSujetoPasivo ? 0 : linea.tipoIva;
    const { baseLinea, cuotaIva } = lineasCalculadas[index];

    const existing = desgloseMap.get(tipoIvaEfectivo) || { base: 0, cuota: 0 };
    desgloseMap.set(tipoIvaEfectivo, {
      base: existing.base + baseLinea,
      cuota: existing.cuota + cuotaIva,
    });
  });

  const desgloseIva = Array.from(desgloseMap.entries())
    .map(([tipoIva, { base, cuota }]) => ({
      tipoIva,
      base: redondear(base),
      cuota: redondear(cuota),
    }))
    .sort((a, b) => b.tipoIva - a.tipoIva); // Mayor a menor

  // Totales
  const totalIva = redondear(desgloseIva.reduce((sum, d) => sum + d.cuota, 0));
  const totalRetencion = calcularRetencionIrpf(baseImponible, retencionPorcentaje);
  const total = redondear(baseImponible + totalIva - totalRetencion);

  return {
    lineas: lineasCalculadas,
    baseImponible,
    desgloseIva,
    totalIva,
    totalRetencion,
    total,
  };
}

// =====================================================
// VALIDACIONES Y ASISTENTES
// =====================================================

/**
 * Determina si una reforma puede aplicar IVA reducido (10%).
 * Requisitos:
 * - Vivienda particular (no local comercial)
 * - Antigüedad > 2 años
 * - Materiales < 40% del total
 * - El destinatario es el propietario/arrendatario
 */
export interface DatosReformaParaIva {
  esViviendaParticular: boolean;
  antiguedadMasDe2Anos: boolean;
  materialesMenosDel40Porciento: boolean;
  destinatarioEsPropietarioOArrendatario: boolean;
}

export function puedeAplicarIvaReducidoReforma(
  datos: DatosReformaParaIva
): { aplica: boolean; motivo?: string } {
  if (!datos.esViviendaParticular) {
    return {
      aplica: false,
      motivo: "No es vivienda particular (local comercial, oficina, etc.)",
    };
  }

  if (!datos.antiguedadMasDe2Anos) {
    return {
      aplica: false,
      motivo: "La vivienda tiene menos de 2 años de antigüedad",
    };
  }

  if (!datos.materialesMenosDel40Porciento) {
    return {
      aplica: false,
      motivo: "Los materiales superan el 40% del coste total",
    };
  }

  if (!datos.destinatarioEsPropietarioOArrendatario) {
    return {
      aplica: false,
      motivo: "El destinatario no es propietario ni arrendatario",
    };
  }

  return { aplica: true };
}

/**
 * Determina si aplica Inversión del Sujeto Pasivo (ISP).
 * Aplica principalmente en:
 * - Ejecuciones de obra entre empresarios del sector construcción
 * - Urbanización de terrenos
 * - Rehabilitación de edificaciones
 */
export interface DatosParaIsp {
  emisorEsEmpresarioConstruccion: boolean;
  receptorEsEmpresarioConstruccion: boolean;
  esEjecucionObra: boolean;
  esUrbanizacionTerrenos?: boolean;
  esRehabilitacion?: boolean;
}

export function debeAplicarIsp(datos: DatosParaIsp): {
  aplica: boolean;
  motivo?: string;
} {
  // Ambos deben ser empresarios/profesionales del sector
  if (!datos.emisorEsEmpresarioConstruccion) {
    return { aplica: false, motivo: "El emisor no es del sector construcción" };
  }

  if (!datos.receptorEsEmpresarioConstruccion) {
    return {
      aplica: false,
      motivo: "El receptor no es empresario del sector construcción",
    };
  }

  // Debe ser ejecución de obra
  if (
    !datos.esEjecucionObra &&
    !datos.esUrbanizacionTerrenos &&
    !datos.esRehabilitacion
  ) {
    return {
      aplica: false,
      motivo:
        "No es ejecución de obra, urbanización ni rehabilitación",
    };
  }

  return { aplica: true };
}

// =====================================================
// TEXTOS LEGALES
// =====================================================

/**
 * Genera el texto legal para facturas con ISP.
 */
export function getTextoLegalIsp(): string {
  return "Operación con inversión del sujeto pasivo conforme al artículo 84.Uno.2º de la Ley 37/1992 del IVA";
}

/**
 * Genera el texto legal para facturas Verifactu.
 */
export function getTextoLegalVerifactu(): string {
  return "Factura verificable en la sede electrónica de la AEAT";
}

/**
 * Genera el texto para facturas rectificativas.
 */
export function getTextoRectificativa(
  serieOriginal: string,
  numeroOriginal: string,
  fechaOriginal: string
): string {
  return `Factura rectificativa de la factura ${serieOriginal}-${numeroOriginal} de fecha ${fechaOriginal}`;
}
