import Link from "next/link";
import { 
  Building2, 
  FileText, 
  Users, 
  Settings, 
  LayoutDashboard,
  LogOut,
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-white hidden md:block">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="h-16 border-b px-6 flex items-center">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-spun-500 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg">SPUN Factura</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            <NavLink href="/(dashboard)" icon={<LayoutDashboard className="w-5 h-5" />}>
              Dashboard
            </NavLink>
            <NavLink href="/(dashboard)/facturas" icon={<FileText className="w-5 h-5" />}>
              Facturas
            </NavLink>
            <NavLink href="/(dashboard)/clientes" icon={<Users className="w-5 h-5" />}>
              Clientes
            </NavLink>
            <NavLink href="/(dashboard)/ajustes" icon={<Settings className="w-5 h-5" />}>
              Ajustes
            </NavLink>
          </nav>

          {/* User section */}
          <div className="border-t p-4">
            <Button variant="ghost" className="w-full justify-start text-gray-600">
              <LogOut className="w-5 h-5 mr-2" />
              Cerrar sesión
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="fixed top-0 left-0 right-0 h-16 border-b bg-white z-30 md:hidden">
        <div className="h-full px-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-spun-500 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold">SPUN</span>
          </Link>
          <Button variant="ghost" size="icon">
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="md:ml-64 pt-16 md:pt-0 min-h-screen">
        <div className="p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

function NavLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  // En producción, usar usePathname para detectar ruta activa
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
    >
      {icon}
      <span className="font-medium">{children}</span>
    </Link>
  );
}
