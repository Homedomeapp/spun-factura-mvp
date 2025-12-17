import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FileText, 
  Plus, 
  TrendingUp,
  Euro,
  Clock,
  AlertCircle
} from "lucide-react";

export default function DashboardPage() {
  // TODO: Fetch real data from DB
  const stats = {
    facturadoMes: 0,
    facturasPendientes: 0,
    ivaTrimestreActual: 0,
    ultimasFacturas: [],
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-gray-500">Resumen de tu actividad de facturación</p>
        </div>
        <Link href="/(dashboard)/facturas/nueva">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nueva factura
          </Button>
        </Link>
      </div>

      {/* Onboarding alert si no está configurado */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-amber-800">Completa tu configuración</h3>
              <p className="text-sm text-amber-700 mt-1">
                Para emitir facturas Verifactu necesitas completar tus datos fiscales 
                y autorizar la representación.
              </p>
              <Link href="/(dashboard)/ajustes">
                <Button size="sm" variant="outline" className="mt-3">
                  Completar configuración
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Facturado este mes"
          value={`${stats.facturadoMes.toFixed(2)} €`}
          icon={<Euro className="w-5 h-5" />}
          description="Total base imponible"
        />
        <StatsCard
          title="Facturas pendientes"
          value={stats.facturasPendientes.toString()}
          icon={<Clock className="w-5 h-5" />}
          description="Por enviar a AEAT"
        />
        <StatsCard
          title="IVA trimestre actual"
          value={`${stats.ivaTrimestreActual.toFixed(2)} €`}
          icon={<TrendingUp className="w-5 h-5" />}
          description="IVA repercutido"
        />
        <StatsCard
          title="Total facturas"
          value="0"
          icon={<FileText className="w-5 h-5" />}
          description="Este año"
        />
      </div>

      {/* Recent invoices */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Últimas facturas</CardTitle>
            <Link href="/(dashboard)/facturas">
              <Button variant="ghost" size="sm">Ver todas</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {stats.ultimasFacturas.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No tienes facturas todavía</p>
              <p className="text-sm mt-1">Crea tu primera factura para empezar</p>
              <Link href="/(dashboard)/facturas/nueva">
                <Button className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Crear factura
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {/* TODO: Map ultimasFacturas */}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatsCard({
  title,
  value,
  icon,
  description,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  description: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <div className="text-gray-400">{icon}</div>
        </div>
        <p className="text-2xl font-bold mt-2">{value}</p>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}
