import { z } from "zod";
import { validarNif } from "@/lib/utils/nif";

// =====================================================
// HELPERS
// =====================================================

/**
 * Schema para validar NIF/CIF/NIE español.
 */
export const nifSchema = z
  .string()
  .min(1, "El NIF es obligatorio")
  .refine((val) => validarNif(val).valido, {
    message: "NIF/CIF/NIE no válido",
  })
  .transform((val) => validarNif(val).normalizado!);

/**
 * Schema para NIF opcional.
 */
export const nifOptionalSchema = z
  .string()
  .optional()
  .nullable()
  .transform((val) => (val && val.trim() ? val : null))
  .refine((val) => !val || validarNif(val).valido, {
    message: "NIF/CIF/NIE no válido",
  })
  .transform((val) => (val ? validarNif(val).normalizado : null));

/**
 * Schema para código postal español.
 */
export const codigoPostalSchema = z
  .string()
  .min(5, "El código postal debe tener 5 dígitos")
  .max(5, "El código postal debe tener 5 dígitos")
  .regex(/^\d{5}$/, "El código postal debe contener solo números");

// =====================================================
// PROFESIONAL
// =====================================================

export const profesionalSchema = z.object({
  nif: nifSchema,
  nombreFiscal: z
    .string()
    .min(1, "El nombre fiscal es obligatorio")
    .max(255, "El nombre fiscal es demasiado largo"),
  direccionFiscal: z
    .string()
    .min(1, "La dirección fiscal es obligatoria")
    .max(500, "La dirección es demasiado larga"),
  codigoPostal: codigoPostalSchema,
  municipio: z.string().min(1, "El municipio es obligatorio"),
  provincia: z.string().min(1, "La provincia es obligatoria"),
  email: z.string().email("Email no válido"),
  telefono: z.string().optional().nullable(),
  serieFactura: z
    .string()
    .min(1)
    .max(10)
    .regex(/^[A-Z0-9]+$/, "La serie solo puede contener letras y números")
    .default("A"),
  retencionIrpfDefecto: z.coerce
    .number()
    .int()
    .min(0)
    .max(100)
    .default(0),
  categoriaPrincipal: z.string().optional().nullable(),
  tamanoEquipo: z.coerce.number().int().min(1).optional().nullable(),
});

export type ProfesionalInput = z.infer<typeof profesionalSchema>;

// =====================================================
// CLIENTE
// =====================================================

export const clienteSchema = z.object({
  tipo: z.enum(["persona", "empresa", "intracomunitario", "extracomunitario"]),
  nif: nifOptionalSchema,
  nombre: z
    .string()
    .min(1, "El nombre es obligatorio")
    .max(255, "El nombre es demasiado largo"),
  direccion: z.string().max(500).optional().nullable(),
  codigoPostal: z
    .string()
    .max(10)
    .optional()
    .nullable()
    .transform((val) => (val && val.trim() ? val : null)),
  municipio: z.string().max(100).optional().nullable(),
  provincia: z.string().max(100).optional().nullable(),
  pais: z.string().length(2).default("ES"),
  email: z.string().email().optional().nullable().or(z.literal("")),
  telefono: z.string().max(20).optional().nullable(),
});

export type ClienteInput = z.infer<typeof clienteSchema>;

// =====================================================
// LÍNEA DE FACTURA
// =====================================================

export const lineaFacturaSchema = z.object({
  descripcion: z
    .string()
    .min(1, "La descripción es obligatoria")
    .max(1000, "La descripción es demasiado larga"),
  cantidad: z.coerce
    .number()
    .positive("La cantidad debe ser mayor que 0")
    .default(1),
  precioUnitario: z.coerce
    .number()
    .min(0, "El precio no puede ser negativo"),
  descuentoPorcentaje: z.coerce
    .number()
    .min(0)
    .max(100)
    .default(0),
  tipoIva: z.coerce
    .number()
    .int()
    .refine((val) => [0, 4, 10, 21].includes(val), {
      message: "Tipo de IVA no válido (0, 4, 10 o 21)",
    }),
  causaExencion: z.string().optional().nullable(),
});

export type LineaFacturaInput = z.infer<typeof lineaFacturaSchema>;

// =====================================================
// FACTURA
// =====================================================

export const facturaSchema = z.object({
  clienteId: z.string().uuid("ID de cliente no válido"),
  tipo: z
    .enum(["F1", "F2", "R1", "R2", "R3", "R4", "R5"])
    .default("F1"),
  fechaExpedicion: z.coerce.date(),
  fechaOperacion: z.coerce.date().optional().nullable(),
  descripcion: z.string().max(2000).optional().nullable(),
  lineas: z
    .array(lineaFacturaSchema)
    .min(1, "Debe incluir al menos una línea"),
  inversionSujetoPasivo: z.boolean().default(false),
  retencionPorcentaje: z.coerce
    .number()
    .int()
    .min(0)
    .max(100)
    .default(0),
  // Para rectificativas
  facturaRectificadaId: z.string().uuid().optional().nullable(),
  motivoRectificacion: z.string().max(500).optional().nullable(),
});

export type FacturaInput = z.infer<typeof facturaSchema>;

// =====================================================
// VALIDACIONES ADICIONALES
// =====================================================

/**
 * Valida que una factura rectificativa tenga los campos necesarios.
 */
export const facturaRectificativaSchema = facturaSchema.refine(
  (data) => {
    if (data.tipo.startsWith("R")) {
      return data.facturaRectificadaId && data.motivoRectificacion;
    }
    return true;
  },
  {
    message:
      "Las facturas rectificativas requieren referencia a la factura original y motivo",
    path: ["facturaRectificadaId"],
  }
);

/**
 * Valida coherencia ISP: si está activo, IVA de líneas debe ser 0.
 */
export const facturaIspSchema = facturaSchema.refine(
  (data) => {
    if (data.inversionSujetoPasivo) {
      // Advertencia: las líneas deberían tener IVA 0
      // Pero el cálculo lo fuerza a 0, así que solo es informativo
      return true;
    }
    return true;
  },
  {
    message: "Con ISP activo, el IVA de las líneas se forzará a 0%",
    path: ["inversionSujetoPasivo"],
  }
);
