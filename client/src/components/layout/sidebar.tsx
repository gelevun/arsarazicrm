import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  BarChart3, 
  Users, 
  MapPin, 
  Handshake, 
  FileText, 
  PieChart, 
  UserCog, 
  Calculator,
  LogOut,
  Building
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

const navigationItems = [
  { href: "/", label: "Dashboard", icon: BarChart3, roles: ["admin", "consultant"] },
  { href: "/clients", label: "Müşteriler", icon: Users, roles: ["admin", "consultant"] },
  { href: "/properties", label: "Gayrimenkuller", icon: MapPin, roles: ["admin", "consultant"] },
  { href: "/transactions", label: "İşlemler", icon: Handshake, roles: ["admin", "consultant"] },
  { href: "/documents", label: "Belgeler", icon: FileText, roles: ["admin", "consultant"] },
  { href: "/reports", label: "Raporlar", icon: PieChart, roles: ["admin", "consultant"] },
  { href: "/users", label: "Kullanıcılar", icon: UserCog, roles: ["admin"] },
  { href: "/accounting", label: "Muhasebe", icon: Calculator, roles: ["admin"] },
];

interface SidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ isMobileOpen = false, onMobileClose }: SidebarProps) {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  if (!user) return null;

  const getInitials = (ad: string, soyad: string) => {
    return `${ad.charAt(0)}${soyad.charAt(0)}`.toUpperCase();
  };

  const handleLogout = () => {
    logoutMutation.mutate();
    onMobileClose?.();
  };

  const filteredNav = navigationItems.filter(item => 
    item.roles.includes(user.rol)
  );

  return (
    <div className={cn(
      "bg-card border-r border-border w-64 flex-shrink-0 flex flex-col h-full",
      "md:relative md:translate-x-0 transition-transform duration-300",
      isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
    )}>
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center">
            <Building className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">GayriCRM</h2>
            <p className="text-xs text-muted-foreground">
              {user.rol === "admin" ? "Admin" : "Danışman"}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {filteredNav.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start space-x-3 h-11",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                onClick={onMobileClose}
                data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-3 mb-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-accent text-accent-foreground">
              {getInitials(user.ad, user.soyad)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {user.ad} {user.soyad}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user.email}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          data-testid="logout-button"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Çıkış Yap
        </Button>
      </div>
    </div>
  );
}
