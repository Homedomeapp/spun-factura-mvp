import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  CheckCircle, 
  Shield, 
  Zap,
  Building2,
  ArrowRight
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-spun-500 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl">SPUN Factura</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm text-gray-600 hover:text-gray-900">
              Características
            </Link>
            <Link href="#pricing" className="text-sm text-gray-600 hover:text-gray-900">
              Precios
            </Link>
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
              Iniciar sesión
            </Link>
            <Link href="/registro">
              <Button size="sm">Empezar gratis</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-spun-50 text-spun-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <CheckCircle className="w-4 h-4" />
            Compatible con Verifactu y AEAT
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 mb-6">
            Facturación electrónica para{" "}
            <span className="text-spun-600">construcción</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            La única plataforma de facturación diseñada para profesionales de la 
            construcción. Cumple con Verifactu, gestiona IVA reducido en reformas 
            e Inversión del Sujeto Pasivo automáticamente.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/registro">
              <Button size="lg" className="w-full sm:w-auto">
                Crear cuenta gratis
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="#demo">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Ver demostración
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto px-4 py-20 border-t">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">
            Diseñado para el sector construcción
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            No es otro programa de facturación genérico. SPUN Factura entiende 
            las particularidades fiscales de tu sector.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Shield className="w-6 h-6" />}
            title="Verifactu automático"
            description="Tus facturas se envían automáticamente a la AEAT. QR de verificación incluido en cada factura."
          />
          <FeatureCard
            icon={<Zap className="w-6 h-6" />}
            title="IVA inteligente"
            description="Detecta automáticamente cuándo aplicar IVA reducido (10%) en reformas de vivienda y gestiona ISP."
          />
          <FeatureCard
            icon={<FileText className="w-6 h-6" />}
            title="PDFs profesionales"
            description="Facturas con tu logo, adjunta planos y fotos de obra. Perfectas para tus clientes y gestoría."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="bg-spun-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Empieza a facturar en 5 minutos
          </h2>
          <p className="text-spun-100 mb-8 max-w-xl mx-auto">
            Regístrate gratis, completa tus datos fiscales y emite tu primera 
            factura Verifactu hoy mismo.
          </p>
          <Link href="/registro">
            <Button size="lg" variant="secondary">
              Crear cuenta gratis
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-spun-500 rounded flex items-center justify-center">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold">SPUN Factura</span>
            </div>
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} Homedome Ibérica S.L. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm">
      <div className="w-12 h-12 bg-spun-50 rounded-lg flex items-center justify-center text-spun-600 mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}
