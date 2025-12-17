/**
 * Verifacti API Client
 *
 * SPUN usa Verifacti como SIF (Sistema Informático de Facturación).
 * Este cliente maneja toda la comunicación con la API de Verifacti.
 *
 * Documentación: https://www.verifacti.com/docs
 */

const VERIFACTI_API_URL = process.env.VERIFACTI_API_URL || "https://sandbox.verifacti.com/api";
const VERIFACTI_API_KEY = process.env.VERIFACTI_API_KEY;

if (!VERIFACTI_API_KEY) {
  console.warn("⚠️ VERIFACTI_API_KEY no configurada. Las facturas no se enviarán a AEAT.");
}

// =====================================================
// TIPOS
// =====================================================

export interface EmisorVerifacti {
  nif: string;
  nombre: string;
  direccion?: string;
  codigoPostal?: string;
  municipio?: string;
  provincia?: string;
}

export interface ReceptorVerifacti {
  nif?: string;
  nombre: string;
  direccion?: string;
  codigoPostal?: string;
  pais?: string;
}

export interface DesgloseIvaVerifacti {
  base: number;
  tipo: number; // 0, 4, 10, 21
  cuota: number;
  /** Para ISP, tipo = 0 y se indica aquí */
  inversionSujetoPasivo?: boolean;
}

export interface FacturaVerifacti {
  emisor: EmisorVerifacti;
  receptor?: ReceptorVerifacti;
  factura: {
    serie: string;
    numero: string;
    fecha: string; // YYYY-MM-DD
    tipo: "F1" | "F2" | "R1" | "R2" | "R3" | "R4" | "R5";
    descripcion?: string;
    /** Si es rectificativa */
    facturaRectificada?: {
      serie: string;
      numero: string;
      fecha: string;
    };
  };
  desglose: DesgloseIvaVerifacti[];
  /** Total factura */
  total: number;
}

export interface VerifactiResponse {
  success: boolean;
  id?: string;
  csv?: string;
  qrData?: string;
  qrUrl?: string;
  estado: "Pendiente" | "Correcto" | "Error";
  mensaje?: string;
  errores?: string[];
  respuestaAeat?: Record<string, unknown>;
}

export interface CrearEmisorRequest {
  nif: string;
  nombre: string;
  direccion?: string;
  codigoPostal?: string;
  municipio?: string;
  provincia?: string;
  email?: string;
}

export interface CrearEmisorResponse {
  success: boolean;
  emisorId?: string;
  urlRepresentacion?: string; // URL para que el usuario firme
  mensaje?: string;
}

// =====================================================
// CLIENTE API
// =====================================================

class VerifactiClient {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = VERIFACTI_API_URL;
    this.apiKey = VERIFACTI_API_KEY || "";
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Verifacti API Error:", data);
      throw new VerifactiError(
        data.message || "Error en la API de Verifacti",
        response.status,
        data
      );
    }

    return data as T;
  }

  // -------------------------------------------------
  // EMISORES
  // -------------------------------------------------

  /**
   * Crea un nuevo emisor en Verifacti.
   * El usuario deberá firmar la representación posteriormente.
   */
  async crearEmisor(data: CrearEmisorRequest): Promise<CrearEmisorResponse> {
    return this.request<CrearEmisorResponse>("/v1/emisores", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /**
   * Obtiene la URL para que el usuario firme la representación.
   */
  async obtenerUrlRepresentacion(emisorId: string): Promise<{ url: string }> {
    return this.request<{ url: string }>(
      `/v1/emisores/${emisorId}/representacion`
    );
  }

  /**
   * Verifica si el emisor tiene la representación firmada.
   */
  async verificarRepresentacion(
    emisorId: string
  ): Promise<{ firmada: boolean; fecha?: string }> {
    return this.request<{ firmada: boolean; fecha?: string }>(
      `/v1/emisores/${emisorId}/representacion/estado`
    );
  }

  // -------------------------------------------------
  // FACTURAS
  // -------------------------------------------------

  /**
   * Envía una factura a Verifacti para su registro en AEAT.
   */
  async enviarFactura(factura: FacturaVerifacti): Promise<VerifactiResponse> {
    return this.request<VerifactiResponse>("/v1/facturas", {
      method: "POST",
      body: JSON.stringify(factura),
    });
  }

  /**
   * Consulta el estado de una factura enviada.
   */
  async consultarFactura(facturaId: string): Promise<VerifactiResponse> {
    return this.request<VerifactiResponse>(`/v1/facturas/${facturaId}`);
  }

  /**
   * Anula una factura registrada.
   * Nota: En Verifactu, las anulaciones se hacen mediante facturas rectificativas.
   */
  async anularFactura(
    facturaId: string,
    motivo: string
  ): Promise<VerifactiResponse> {
    return this.request<VerifactiResponse>(`/v1/facturas/${facturaId}/anular`, {
      method: "POST",
      body: JSON.stringify({ motivo }),
    });
  }
}

// =====================================================
// ERROR HANDLING
// =====================================================

export class VerifactiError extends Error {
  public statusCode: number;
  public data: unknown;

  constructor(message: string, statusCode: number, data?: unknown) {
    super(message);
    this.name = "VerifactiError";
    this.statusCode = statusCode;
    this.data = data;
  }
}

// =====================================================
// EXPORT SINGLETON
// =====================================================

export const verifacti = new VerifactiClient();

// =====================================================
// HELPERS
// =====================================================

/**
 * Convierte datos de factura de SPUN al formato de Verifacti.
 */
export function formatearFacturaParaVerifacti(
  factura: {
    serie: string;
    numero: number;
    fechaExpedicion: Date;
    tipo: string;
    descripcion?: string;
    total: number;
    inversionSujetoPasivo: boolean;
    facturaRectificadaNumero?: string;
    facturaRectificadaSerie?: string;
    facturaRectificadaFecha?: Date;
  },
  profesional: {
    nif: string;
    nombreFiscal: string;
    direccionFiscal: string;
    codigoPostal: string;
    municipio: string;
    provincia: string;
  },
  cliente: {
    nif?: string;
    nombre: string;
    direccion?: string;
    codigoPostal?: string;
    pais?: string;
  },
  desglose: { tipoIva: number; baseImponible: number; cuota: number }[]
): FacturaVerifacti {
  const facturaVerifacti: FacturaVerifacti = {
    emisor: {
      nif: profesional.nif,
      nombre: profesional.nombreFiscal,
      direccion: profesional.direccionFiscal,
      codigoPostal: profesional.codigoPostal,
      municipio: profesional.municipio,
      provincia: profesional.provincia,
    },
    factura: {
      serie: factura.serie,
      numero: factura.numero.toString().padStart(6, "0"),
      fecha: factura.fechaExpedicion.toISOString().split("T")[0],
      tipo: factura.tipo as FacturaVerifacti["factura"]["tipo"],
      descripcion: factura.descripcion,
    },
    desglose: desglose.map((d) => ({
      base: d.baseImponible,
      tipo: d.tipoIva,
      cuota: d.cuota,
      inversionSujetoPasivo: factura.inversionSujetoPasivo && d.tipoIva === 0,
    })),
    total: factura.total,
  };

  // Añadir receptor si tiene NIF
  if (cliente.nif || cliente.nombre) {
    facturaVerifacti.receptor = {
      nif: cliente.nif,
      nombre: cliente.nombre,
      direccion: cliente.direccion,
      codigoPostal: cliente.codigoPostal,
      pais: cliente.pais || "ES",
    };
  }

  // Añadir referencia a factura rectificada si aplica
  if (factura.facturaRectificadaNumero) {
    facturaVerifacti.factura.facturaRectificada = {
      serie: factura.facturaRectificadaSerie || factura.serie,
      numero: factura.facturaRectificadaNumero,
      fecha: factura.facturaRectificadaFecha?.toISOString().split("T")[0] || "",
    };
  }

  return facturaVerifacti;
}
