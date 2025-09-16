import { useQuery } from "@tanstack/react-query";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { TransactionsChart } from "@/components/charts/transactions-chart";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { TrendingUp, Users, MapPin, Handshake, Building } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface DashboardStats {
  totalRevenue: string;
  totalTransactions: number;
  totalClients: number;
  totalProperties: number;
}

export default function DashboardPage() {
  const { user } = useAuth();

  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const formatCurrency = (value: string) => {
    const num = parseFloat(value);
    return `₺${num.toLocaleString('tr-TR')}`;
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-8 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Welcome Message */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Hoş geldiniz, {user?.ad} {user?.soyad}
        </h1>
        <p className="text-muted-foreground mt-1">
          İşte gayrimenkul portföyünüzün güncel durumu
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Toplam Ciro"
          value={stats ? formatCurrency(stats.totalRevenue) : "₺0"}
          change="+12.5%"
          changeType="positive"
          icon={TrendingUp}
          iconBgColor="bg-accent/10"
        />
        
        <StatCard
          title="İşlem Sayısı"
          value={stats?.totalTransactions || 0}
          change="+8.2%"
          changeType="positive"
          icon={Handshake}
          iconBgColor="bg-primary/10"
        />
        
        <StatCard
          title="Müşteri Sayısı"
          value={stats?.totalClients || 0}
          change="+15.3%"
          changeType="positive"
          icon={Users}
          iconBgColor="bg-secondary/10"
        />
        
        <StatCard
          title="Portföy Sayısı"
          value={stats?.totalProperties || 0}
          change="-2.1%"
          changeType="negative"
          icon={MapPin}
          iconBgColor="bg-yellow-100"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border">
          <CardHeader>
            <CardTitle>Aylık Ciro Trendi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <RevenueChart />
            </div>
          </CardContent>
        </Card>

        <Card className="border">
          <CardHeader>
            <CardTitle>İşlem Dağılımı</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <TransactionsChart />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card className="border">
          <CardHeader>
            <CardTitle>Son Aktiviteler</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4 p-3 hover:bg-muted rounded-lg">
              <div className="h-10 w-10 bg-accent/10 rounded-lg flex items-center justify-center">
                <Handshake className="h-5 w-5 text-accent" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Yeni işlem eklendi</p>
                <p className="text-xs text-muted-foreground">Bahçelievler Arsa Satışı - ₺450.000</p>
              </div>
              <span className="text-xs text-muted-foreground">2 dk önce</span>
            </div>

            <div className="flex items-center space-x-4 p-3 hover:bg-muted rounded-lg">
              <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Yeni müşteri kaydı</p>
                <p className="text-xs text-muted-foreground">Mehmet Öztürk - Yatırımcı</p>
              </div>
              <span className="text-xs text-muted-foreground">15 dk önce</span>
            </div>

            <div className="flex items-center space-x-4 p-3 hover:bg-muted rounded-lg">
              <div className="h-10 w-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                <Building className="h-5 w-5 text-secondary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Emlak güncellendi</p>
                <p className="text-xs text-muted-foreground">Kadıköy Arsa - Fiyat güncellendi</p>
              </div>
              <span className="text-xs text-muted-foreground">1 saat önce</span>
            </div>

            <Button variant="ghost" className="w-full mt-4" data-testid="view-all-activities">
              Tüm aktiviteleri görüntüle
            </Button>
          </CardContent>
        </Card>

        {/* Top Performers (Admin only) */}
        {user?.rol === "admin" && (
          <Card className="border">
            <CardHeader>
              <CardTitle>En Performanslı Danışmanlar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 hover:bg-muted rounded-lg">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-accent text-accent-foreground">AS</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-foreground">Ahmet Sönmez</p>
                    <p className="text-xs text-muted-foreground">12 işlem</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">₺850.000</p>
                  <p className="text-xs text-accent">+₺45.000</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 hover:bg-muted rounded-lg">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-primary-foreground">FY</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-foreground">Fatma Yılmaz</p>
                    <p className="text-xs text-muted-foreground">8 işlem</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">₺620.000</p>
                  <p className="text-xs text-accent">+₺28.000</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 hover:bg-muted rounded-lg">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-secondary text-secondary-foreground">MK</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-foreground">Murat Kaya</p>
                    <p className="text-xs text-muted-foreground">6 işlem</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">₺480.000</p>
                  <p className="text-xs text-accent">+₺22.000</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
