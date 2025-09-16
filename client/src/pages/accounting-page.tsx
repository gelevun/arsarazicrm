import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Plus, Calculator, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { Accounting } from "@shared/schema";
import { StatCard } from "@/components/ui/stat-card";
import { useAuth } from "@/hooks/use-auth";
import { Shield } from "lucide-react";

export default function AccountingPage() {
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

  const { data: accounting = [], isLoading } = useQuery<Accounting[]>({
    queryKey: ["/api/accounting"],
  });

  const formatCurrency = (value: string | null) => {
    if (!value) return "₺0";
    const num = parseFloat(value);
    return `₺${num.toLocaleString('tr-TR')}`;
  };

  const getMonthName = (month: number) => {
    const months = [
      "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
      "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
    ];
    return months[month - 1] || `Ay ${month}`;
  };

  // Calculate summary stats
  const totalRevenue = accounting.reduce((sum, acc) => sum + parseFloat(acc.toplam_ciro || "0"), 0);
  const totalExpenses = accounting.reduce((sum, acc) => sum + parseFloat(acc.giderler || "0"), 0);
  const totalNet = accounting.reduce((sum, acc) => sum + parseFloat(acc.aylik_net || "0"), 0);
  const totalTaxes = accounting.reduce((sum, acc) => sum + parseFloat(acc.vergiler || "0"), 0);

  const columns = [
    {
      key: "period",
      header: "Dönem",
      render: (accounting: Accounting) => (
        <div>
          <p className="font-medium">{getMonthName(accounting.ay)} {accounting.yil}</p>
          <p className="text-xs text-muted-foreground">{accounting.ay}/{accounting.yil}</p>
        </div>
      ),
    },
    {
      key: "toplam_ciro",
      header: "Toplam Ciro",
      render: (accounting: Accounting) => (
        <span className="font-semibold text-accent">
          {formatCurrency(accounting.toplam_ciro)}
        </span>
      ),
    },
    {
      key: "giderler",
      header: "Giderler",
      render: (accounting: Accounting) => (
        <span className="font-semibold text-destructive">
          {formatCurrency(accounting.giderler)}
        </span>
      ),
    },
    {
      key: "vergiler",
      header: "Vergiler",
      render: (accounting: Accounting) => (
        <span className="font-semibold text-secondary">
          {formatCurrency(accounting.vergiler)}
        </span>
      ),
    },
    {
      key: "aylik_net",
      header: "Net Kar",
      render: (accounting: Accounting) => {
        const net = parseFloat(accounting.aylik_net || "0");
        return (
          <span className={`font-semibold ${net >= 0 ? 'text-accent' : 'text-destructive'}`}>
            {formatCurrency(accounting.aylik_net)}
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "İşlemler",
      render: (accounting: Accounting) => (
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            data-testid={`view-accounting-${accounting.id}`}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            data-testid={`edit-accounting-${accounting.id}`}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const handleAddRecord = () => {
    // TODO: Implement add accounting record modal
    console.log("Add accounting record modal");
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Muhasebe</h1>
        <p className="text-muted-foreground">
          Ofis muhasebe kayıtlarını yönetin ve finansal durumu takip edin
        </p>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Toplam Ciro"
          value={formatCurrency(totalRevenue.toString())}
          change="+8.2%"
          changeType="positive"
          icon={DollarSign}
          iconBgColor="bg-accent/10"
        />
        
        <StatCard
          title="Toplam Gider"
          value={formatCurrency(totalExpenses.toString())}
          change="+3.1%"
          changeType="negative"
          icon={TrendingDown}
          iconBgColor="bg-destructive/10"
        />
        
        <StatCard
          title="Net Kar"
          value={formatCurrency(totalNet.toString())}
          change="+12.5%"
          changeType="positive"
          icon={TrendingUp}
          iconBgColor="bg-primary/10"
        />
        
        <StatCard
          title="Vergi"
          value={formatCurrency(totalTaxes.toString())}
          icon={Calculator}
          iconBgColor="bg-secondary/10"
        />
      </div>

      {/* Monthly P&L Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Aylık Kar/Zarar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {accounting.slice(0, 6).map((record) => {
                const revenue = parseFloat(record.toplam_ciro || "0");
                const expenses = parseFloat(record.giderler || "0");
                const net = parseFloat(record.aylik_net || "0");
                
                return (
                  <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{getMonthName(record.ay)} {record.yil}</p>
                      <p className="text-sm text-muted-foreground">
                        Ciro: {formatCurrency(record.toplam_ciro)} | 
                        Gider: {formatCurrency(record.giderler)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${net >= 0 ? 'text-accent' : 'text-destructive'}`}>
                        {formatCurrency(record.aylik_net)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {((net / revenue) * 100).toFixed(1)}% kar marjı
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bu Ay Özeti</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Brüt Gelir</span>
                <span className="font-semibold text-accent">₺425.000</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Sabit Giderler</span>
                <span className="font-semibold text-destructive">₺85.000</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Değişken Giderler</span>
                <span className="font-semibold text-destructive">₺45.000</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Vergiler</span>
                <span className="font-semibold text-secondary">₺65.000</span>
              </div>
              <hr />
              <div className="flex justify-between items-center">
                <span className="font-medium">Net Kar</span>
                <span className="font-bold text-accent">₺230.000</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Accounting Records Table */}
      <DataTable
        data={accounting}
        columns={columns}
        searchPlaceholder="Muhasebe kaydı ara..."
        onAdd={handleAddRecord}
        addButtonText="Kayıt Ekle"
        isLoading={isLoading}
      />
    </div>
  );
}
