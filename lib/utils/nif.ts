/**
 * Validación de NIF/CIF/NIE españoles.
 *
 * Tipos:
 * - NIF: Número de Identificación Fiscal (personas físicas)
 * - CIF: Código de Identificación Fiscal (personas jurídicas)
 * - NIE: Número de Identificación de Extranjero
 */

// Letras para validación de NIF
const NIF_LETTERS = "TRWAGMYFPDXBNJZSQVHLCKE";

// Letras iniciales de CIF y su tipo de control
const CIF_REGEX = /^([ABCDEFGHJNPQRSUVW])(\d{7})([0-9A-J])$/;

// NIE: X, Y, Z seguido de 7 dígitos y letra
const NIE_REGEX = /^([XYZ])(\d{7})([A-Z])$/;

// NIF: 8 dígitos y letra
const NIF_REGEX = /^(\d{8})([A-Z])$/;

export interface ValidacionNif {
  valido: boolean;
  tipo?: "NIF" | "CIF" | "NIE";
  mensaje?: string;
  normalizado?: string;
}

/**
 * Valida y normaliza un NIF/CIF/NIE español.
 */
export function validarNif(nif: string): ValidacionNif {
  if (!nif) {
    return { valido: false, mensaje: "NIF/CIF vacío" };
  }

  // Normalizar: mayúsculas, sin espacios ni guiones
  const normalizado = nif.toUpperCase().replace(/[\s-]/g, "");

  // Intentar validar como NIF
  const nifMatch = normalizado.match(NIF_REGEX);
  if (nifMatch) {
    const [, numeros, letra] = nifMatch;
    const letraCalculada = NIF_LETTERS[parseInt(numeros) % 23];

    if (letra === letraCalculada) {
      return { valido: true, tipo: "NIF", normalizado };
    } else {
      return {
        valido: false,
        tipo: "NIF",
        mensaje: `Letra incorrecta. Debería ser ${letraCalculada}`,
      };
    }
  }

  // Intentar validar como NIE
  const nieMatch = normalizado.match(NIE_REGEX);
  if (nieMatch) {
    const [, primeraLetra, numeros, letra] = nieMatch;

    // Convertir primera letra a número
    let numeroNie: string;
    switch (primeraLetra) {
      case "X":
        numeroNie = "0" + numeros;
        break;
      case "Y":
        numeroNie = "1" + numeros;
        break;
      case "Z":
        numeroNie = "2" + numeros;
        break;
      default:
        return { valido: false, mensaje: "NIE con formato incorrecto" };
    }

    const letraCalculada = NIF_LETTERS[parseInt(numeroNie) % 23];

    if (letra === letraCalculada) {
      return { valido: true, tipo: "NIE", normalizado };
    } else {
      return {
        valido: false,
        tipo: "NIE",
        mensaje: `Letra incorrecta. Debería ser ${letraCalculada}`,
      };
    }
  }

  // Intentar validar como CIF
  const cifMatch = normalizado.match(CIF_REGEX);
  if (cifMatch) {
    const [, letraInicial, numeros, control] = cifMatch;
    const cifValido = validarCif(letraInicial, numeros, control);

    if (cifValido) {
      return { valido: true, tipo: "CIF", normalizado };
    } else {
      return { valido: false, tipo: "CIF", mensaje: "CIF con dígito de control incorrecto" };
    }
  }

  return {
    valido: false,
    mensaje: "Formato de NIF/CIF/NIE no reconocido",
  };
}

/**
 * Valida el dígito de control de un CIF.
 */
function validarCif(
  letraInicial: string,
  numeros: string,
  control: string
): boolean {
  // Suma de dígitos pares
  let sumaPares = 0;
  for (let i = 1; i < 7; i += 2) {
    sumaPares += parseInt(numeros[i]);
  }

  // Suma de dígitos impares (multiplicados por 2)
  let sumaImpares = 0;
  for (let i = 0; i < 7; i += 2) {
    const doble = parseInt(numeros[i]) * 2;
    sumaImpares += doble > 9 ? doble - 9 : doble;
  }

  const sumaTotal = sumaPares + sumaImpares;
  const digitoControl = (10 - (sumaTotal % 10)) % 10;

  // Algunas letras iniciales usan letra de control, otras número
  const letrasConLetraControl = "KPQRSNW";
  const letrasConNumeroControl = "ABEH";

  const letraControl = String.fromCharCode(64 + digitoControl); // A=1, B=2, etc.

  if (letrasConLetraControl.includes(letraInicial)) {
    // Control debe ser letra (A-J)
    return control === (digitoControl === 0 ? "J" : letraControl);
  } else if (letrasConNumeroControl.includes(letraInicial)) {
    // Control debe ser número
    return control === digitoControl.toString();
  } else {
    // Puede ser cualquiera
    return (
      control === digitoControl.toString() ||
      control === (digitoControl === 0 ? "J" : letraControl)
    );
  }
}

/**
 * Formatea un NIF para mostrar (añade guión).
 */
export function formatearNif(nif: string): string {
  const { normalizado, tipo, valido } = validarNif(nif);

  if (!valido || !normalizado) {
    return nif;
  }

  switch (tipo) {
    case "NIF":
      return `${normalizado.slice(0, 8)}-${normalizado.slice(8)}`;
    case "NIE":
      return `${normalizado[0]}-${normalizado.slice(1, 8)}-${normalizado.slice(8)}`;
    case "CIF":
      return `${normalizado[0]}-${normalizado.slice(1, 8)}-${normalizado.slice(8)}`;
    default:
      return normalizado;
  }
}

/**
 * Determina si es un NIF de persona física (NIF o NIE) o jurídica (CIF).
 */
export function esPersonaFisica(nif: string): boolean {
  const { tipo } = validarNif(nif);
  return tipo === "NIF" || tipo === "NIE";
}

/**
 * Determina si es un NIF de empresa (CIF).
 */
export function esEmpresa(nif: string): boolean {
  const { tipo } = validarNif(nif);
  return tipo === "CIF";
}
