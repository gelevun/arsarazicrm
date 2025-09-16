import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Eye, Edit, UserCog, Users, Shield } from "lucide-react";
import { User } from "@shared/schema";
import { StatCard } from "@/components/ui/stat-card";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  
  // Only admins can access this page
  if (currentUser?.rol !== "admin") {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Erişim Engellendi</h2>
              <p className="text-muted-foreground">
                Bu sayfaya erişim için admin yetkisi gerekiyor.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const getRoleBadgeVariant = (rol: string) => {
    switch (rol) {
      case "admin":
        return "destructive";
      case "consultant":
        return "default";
      default:
        return "outline";
    }
  };

  const getRoleText = (rol: string) => {
    switch (rol) {
      case "admin":
        return "Admin";
      case "consultant":
        return "Danışman";
      default:
        return rol;
    }
  };

  const getInitials = (ad: string, soyad: string) => {
    return `${ad.charAt(0)}${soyad.charAt(0)}`.toUpperCase();
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "Hiç giriş yapmamış";
    return new Date(date).toLocaleString('tr-TR');
  };

  // Calculate stats
  const totalUsers = users.length;
  const consultants = users.filter(u => u.rol === "consultant").length;
  const admins = users.filter(u => u.rol === "admin").length;

  const columns = [
    {
      key: "user",
      header: "Kullanıcı",
      render: (user: User) => (
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback>
              {getInitials(user.ad, user.soyad)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-foreground">
              {user.ad} {user.soyad}
            </p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "username",
      header: "Kullanıcı Adı",
      render: (user: User) => (
        <span className="text-sm font-mono">{user.username}</span>
      ),
    },
    {
      key: "telefon",
      header: "Telefon",
      render: (user: User) => (
        <span className="text-sm">{user.telefon || "-"}</span>
      ),
    },
    {
      key: "rol",
      header: "Rol",
      render: (user: User) => (
        <Badge variant={getRoleBadgeVariant(user.rol)}>
          {getRoleText(user.rol)}
        </Badge>
      ),
    },
    {
      key: "departman",
      header: "Departman",
      render: (user: User) => (
        <span className="text-sm">{user.departman || "Belirtilmemiş"}</span>
      ),
    },
    {
      key: "son_giris",
      header: "Son Giriş",
      render: (user: User) => (
        <span className="text-sm">{formatDate(user.son_giris)}</span>
      ),
    },
    {
      key: "durum",
      header: "Durum",
      render: (user: User) => (
        <Badge variant={user.durum ? "default" : "secondary"}>
          {user.durum ? "Aktif" : "Pasif"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "İşlemler",
      render: (user: User) => (
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            data-testid={`view-user-${user.id}`}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            data-testid={`edit-user-${user.id}`}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const handleAddUser = () => {
    // TODO: Implement add user modal
    console.log("Add user modal");
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Kullanıcı Yönetimi</h1>
        <p className="text-muted-foreground">
          Sistem kullanıcılarını yönetin ve yetkilerini düzenleyin
        </p>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Toplam Kullanıcı"
          value={totalUsers}
          icon={UserCog}
          iconBgColor="bg-primary/10"
        />
        
        <StatCard
          title="Danışmanlar"
          value={consultants}
          icon={Users}
          iconBgColor="bg-accent/10"
        />
        
        <StatCard
          title="Adminler"
          value={admins}
          icon={Shield}
          iconBgColor="bg-secondary/10"
        />
      </div>

      <DataTable
        data={users}
        columns={columns}
        searchPlaceholder="Kullanıcı ara..."
        onAdd={handleAddUser}
        addButtonText="Kullanıcı Ekle"
        isLoading={isLoading}
      />
    </div>
  );
}
