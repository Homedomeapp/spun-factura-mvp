"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

const CATEGORIAS = [
  "Dirección y gestión técnica",
  "Reformas integrales y obra mayor",
  "Albañilería y obra base",
  "Envolvente y rehabilitación",
  "Instalaciones eléctricas y domótica",
  "Fontanería, saneamiento y gas",
  "Climatización y aerotermia",
  "Energías renovables",
  "Carpintería y cerramientos",
  "Acabados y pintura",
  "Artesanía premium",
  "Exterior y paisajismo",
  "Alquiler de maquinaria",
  "Mantenimiento",
];

const SUBSERVICIOS: Record<string, string[]> = {
  "Dirección y gestión técnica": [
    "Arquitecto/a",
    "Arquitecto técnico / Aparejador",
    "Project Manager de obra",
    "Topógrafo/a",
    "Auditor energético certificado",
    "Técnico de certificación energética (CEE)",
    "Consultor en sostenibilidad",
    "Especialista en certificaciones (LEED, BREEAM, Passivhaus)",
  ],
  "Reformas integrales y obra mayor": [
    "Empresa constructora integral",
    "Reforma integral de vivienda",
    "Reforma parcial (redistribución, ampliaciones)",
    "Reforma de local comercial / oficinas",
    "Rehabilitación de edificio residencial",
    "Demolición controlada",
    "Estructuras / hormigonado / forjados",
    "Cubiertas y tejados",
  ],
  "Albañilería y obra base": [
    "Albañil oficial",
    "Revestimientos cerámicos (solados y alicatados)",
    "Tabiques, trasdosados y recrecidos",
    "Falsos techos (yeso, pladur)",
    "Microcemento y pavimentos continuos",
    "Impermeabilización de terrazas",
  ],
  "Envolvente y rehabilitación": [
    "Instalador de SATE",
    "Fachada ventilada",
    "Rehabilitación integral de fachada",
    "Aislamiento térmico interior",
    "Impermeabilización de cubiertas",
    "Rehabilitación energética de edificios",
  ],
  "Instalaciones eléctricas y domótica": [
    "Electricista de baja tensión",
    "Reforma de instalación eléctrica",
    "Cuadros eléctricos y protecciones",
    "Iluminación interior / técnica",
    "Iluminación exterior",
    "Boletines y legalización",
    "Integrador de domótica (KNX)",
    "Integrador smart home (WiFi / IoT)",
    "Redes y cableado estructurado",
  ],
  "Fontanería, saneamiento y gas": [
    "Fontanero oficial",
    "Instalación completa fontanería",
    "Sustitución de bajantes / colectores",
    "Instalador de gas certificado",
    "Revisión instalaciones de gas",
  ],
  "Climatización y aerotermia": [
    "Aire acondicionado (split, conductos)",
    "Sistemas VRV/VRF",
    "Instalación de calderas",
    "Suelo radiante / refrescante",
    "Aerotermia / bombas de calor",
    "Climatización industrial / comercial",
    "Ventilación mecánica controlada (VMC)",
  ],
  "Energías renovables": [
    "Instalador fotovoltaico residencial",
    "Fotovoltaico industrial / grandes cubiertas",
    "Solar térmica (ACS)",
    "Sistemas híbridos",
    "Calderas de biomasa / pellets",
    "Mini eólica",
    "Empresa de servicios energéticos (ESCO)",
    "Consultor en optimización energética",
  ],
  "Carpintería y cerramientos": [
    "Carpintero ebanista",
    "Carpintería interior (puertas, armarios)",
    "Cocinas a medida",
    "Carpintería exterior aluminio",
    "Carpintería exterior PVC",
    "Carpintería exterior madera",
    "Ventanas alta eficiencia / Passivhaus",
    "Cerrajero / automatismos",
    "Cristalero / mamparas / barandillas",
  ],
  "Acabados y pintura": [
    "Pintor decorador",
    "Alta decoración / estucos",
    "Empapelador",
    "Escayolista y molduras",
    "Suelos laminados / tarima / parquet",
    "Pavimentos vinílicos / técnicos",
    "Decorador / interiorista",
  ],
  "Artesanía premium": [
    "Carpintero ebanista de lujo",
    "Muebles de diseño exclusivo",
    "Cerrajero artístico / forja",
    "Vidriero de diseño artístico",
    "Ceramista de autor",
    "Escultor en piedra o madera",
    "Tapicero de alta gama",
    "Interiorista viviendas premium",
  ],
  "Exterior y paisajismo": [
    "Paisajista diseñador",
    "Arquitecto de exteriores",
    "Jardinero profesional",
    "Biojardinería / xerojardinería",
    "Poda en altura",
    "Césped natural o artificial",
    "Riego automático",
    "Iluminación exterior LED",
    "Pérgolas bioclimáticas / porches",
    "Constructor de piscinas y spas",
    "Pavimentos exteriores",
  ],
  "Alquiler de maquinaria": [
    "Alquiler maquinaria de obra",
    "Alquiler herramientas especializadas",
    "Alquiler equipos de medición",
    "Alquiler equipos de limpieza técnica",
    "Transporte de maquinaria",
  ],
  "Mantenimiento": [
    "Mantenimiento integral de edificios",
    "Mantenimiento climatización / calderas",
    "Mantenimiento instalaciones fotovoltaicas",
    "Mantenimiento jardines y piscinas",
    "Limpieza post-obra",
    "Manitas / pequeñas reparaciones",
  ],
};

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  // Form data
  const [formData, setFormData] = useState({
    nif: "",
    nombre_fiscal: "",
    direccion_fiscal: "",
    codigo_postal: "",
    municipio: "",
    provincia: "",
    telefono: "",
    categoria_principal: "",
    subservicios: [] as string[],
    tamano_equipo: "",
    tipo_cliente_principal: "",
    volumen_mensual: "",
  });

  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setUserEmail(user.email);
      }
    };
    getUser();
  }, [supabase.auth]);

  const updateField = (field: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleSubservicio = (subservicio: string) => {
    const current = formData.subservicios;
    if (current.includes(subservicio)) {
      updateField("subservicios", current.filter((s) => s !== subservicio));
    } else if (current.length < 3) {
      updateField("subservicios", [...current, subservicio]);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setError("No se encontró el usuario");
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from("profesionales").insert({
      user_id: user.id,
      nif: formData.nif.toUpperCase(),
      nombre_fiscal: formData.nombre_fiscal,
      direccion_fiscal: formData.direccion_fiscal,
      codigo_postal: formData.codigo_postal,
      municipio: formData.municipio,
      provincia: formData.provincia,
      email: userEmail,
      telefono: formData.telefono || null,
      categoria_principal: formData.categoria_principal,
      subservicios: formData.subservicios,
      tamano_equipo: formData.tamano_equipo,
      tipo_cliente_principal: formData.tipo_cliente_principal,
      volumen_mensual: formData.volumen_mensual,
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-[#34CED6] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">S</span>
            </div>
            <span className="font-bold text-2xl text-gray-900">SPUN</span>
            <span className="text-gray-500">Factura</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Completa tu perfil</h1>
          <p className="text-gray-500 mt-2">Paso {step} de 3</p>
          
          {/* Progress bar */}
          <div className="flex gap-2 mt-4 max-w-xs mx-auto">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 flex-1 rounded-full ${s <= step ? "bg-[#34CED6]" : "bg-gray-200"}`}
              />
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
          {/* Step 1: Datos fiscales */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Datos fiscales</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">NIF / CIF *</label>
                <input
                  type="text"
                  value={formData.nif}
                  onChange={(e) => updateField("nif", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34CED6] focus:border-[#34CED6] outline-none"
                  placeholder="12345678A"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre fiscal *</label>
                <input
                  type="text"
                  value={formData.nombre_fiscal}
                  onChange={(e) => updateField("nombre_fiscal", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34CED6] focus:border-[#34CED6] outline-none"
                  placeholder="Juan García López o Reformas García S.L."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección fiscal *</label>
                <input
                  type="text"
                  value={formData.direccion_fiscal}
                  onChange={(e) => updateField("direccion_fiscal", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34CED6] focus:border-[#34CED6] outline-none"
                  placeholder="Calle Mayor 123, 2º B"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Código postal *</label>
                  <input
                    type="text"
                    value={formData.codigo_postal}
                    onChange={(e) => updateField("codigo_postal", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34CED6] focus:border-[#34CED6] outline-none"
                    placeholder="28001"
                    maxLength={5}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Municipio *</label>
                  <input
                    type="text"
                    value={formData.municipio}
                    onChange={(e) => updateField("municipio", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34CED6] focus:border-[#34CED6] outline-none"
                    placeholder="Madrid"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Provincia *</label>
                  <input
                    type="text"
                    value={formData.provincia}
                    onChange={(e) => updateField("provincia", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34CED6] focus:border-[#34CED6] outline-none"
                    placeholder="Madrid"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => updateField("telefono", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34CED6] focus:border-[#34CED6] outline-none"
                    placeholder="612 345 678"
                  />
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!formData.nif || !formData.nombre_fiscal || !formData.direccion_fiscal || !formData.codigo_postal || !formData.municipio || !formData.provincia}
                className="w-full bg-[#34CED6] hover:bg-[#2BB5BD] disabled:bg-gray-300 text-white py-3 rounded-lg font-semibold transition-colors mt-6"
              >
                Continuar
              </button>
            </div>
          )}

          {/* Step 2: Actividad */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Tu actividad</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría principal *</label>
                <select
                  value={formData.categoria_principal}
                  onChange={(e) => {
                    updateField("categoria_principal", e.target.value);
                    updateField("subservicios", []);
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34CED6] focus:border-[#34CED6] outline-none bg-white"
                  required
                >
                  <option value="">Selecciona tu actividad</option>
                  {CATEGORIAS.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {formData.categoria_principal && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Especialidades (máx. 3) <span className="text-gray-400">({formData.subservicios.length}/3)</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {SUBSERVICIOS[formData.categoria_principal]?.map((sub) => (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => toggleSubservicio(sub)}
                        className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                          formData.subservicios.includes(sub)
                            ? "bg-[#34CED6] text-white border-[#34CED6]"
                            : "bg-white text-gray-700 border-gray-300 hover:border-[#34CED6]"
                        } ${formData.subservicios.length >= 3 && !formData.subservicios.includes(sub) ? "opacity-50 cursor-not-allowed" : ""}`}
                        disabled={formData.subservicios.length >= 3 && !formData.subservicios.includes(sub)}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Atrás
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!formData.categoria_principal}
                  className="flex-1 bg-[#34CED6] hover:bg-[#2BB5BD] disabled:bg-gray-300 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Perfil de negocio */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Tu negocio</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tamaño del equipo *</label>
                <select
                  value={formData.tamano_equipo}
                  onChange={(e) => updateField("tamano_equipo", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34CED6] focus:border-[#34CED6] outline-none bg-white"
                  required
                >
                  <option value="">Selecciona</option>
                  <option value="autonomo">Autónomo (solo yo)</option>
                  <option value="2-5">2-5 personas</option>
                  <option value="6-10">6-10 personas</option>
                  <option value="10+">Más de 10 personas</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de cliente principal *</label>
                <select
                  value={formData.tipo_cliente_principal}
                  onChange={(e) => updateField("tipo_cliente_principal", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34CED6] focus:border-[#34CED6] outline-none bg-white"
                  required
                >
                  <option value="">Selecciona</option>
                  <option value="particular">Particulares</option>
                  <option value="empresa">Empresas / Promotoras</option>
                  <option value="mixto">Mixto (ambos)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Facturas al mes (aprox.) *</label>
                <select
                  value={formData.volumen_mensual}
                  onChange={(e) => updateField("volumen_mensual", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#34CED6] focus:border-[#34CED6] outline-none bg-white"
                  required
                >
                  <option value="">Selecciona</option>
                  <option value="1-5">1-5 facturas</option>
                  <option value="6-15">6-15 facturas</option>
                  <option value="16-30">16-30 facturas</option>
                  <option value="30+">Más de 30 facturas</option>
                </select>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Atrás
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || !formData.tamano_equipo || !formData.tipo_cliente_principal || !formData.volumen_mensual}
                  className="flex-1 bg-[#34CED6] hover:bg-[#2BB5BD] disabled:bg-gray-300 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  {loading ? "Guardando..." : "Completar registro"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
