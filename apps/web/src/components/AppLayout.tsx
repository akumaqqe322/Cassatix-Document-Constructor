import { Link, Outlet, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Layers, 
  FileText, 
  ShieldCheck, 
  LogOut,
  Menu
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Templates", href: "/templates", icon: Layers },
  { name: "Documents", href: "/documents", icon: FileText },
  { name: "Audit", href: "/audit", icon: ShieldCheck },
];

export default function AppLayout() {
  const location = useLocation();

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6">
        <h2 className="text-xl font-bold tracking-tight text-zinc-900">LegalConstructor</h2>
      </div>
      <nav className="flex-1 px-4 space-y-1">
        {navigation.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
              location.pathname === item.href
                ? "bg-zinc-900 text-white"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.name}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-zinc-200">
        <Button variant="ghost" className="w-full justify-start text-zinc-600 hover:text-red-600 hover:bg-red-50">
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-zinc-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 border-r border-zinc-200 bg-white">
        <NavContent />
      </aside>

      {/* Main Content */}
      <div className="flex-1 md:pl-64">
        <header className="sticky top-0 z-10 flex h-16 bg-white border-bottom border-zinc-200 px-4 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <NavContent />
            </SheetContent>
          </Sheet>
          <div className="flex items-center ml-4">
            <span className="font-bold">LegalConstructor</span>
          </div>
        </header>

        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
