import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { 
  Eye, 
  Download, 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  FileBarChart,
  Calendar,
  Filter
} from "lucide-react";
import { Report } from "@shared/schema";
import { StatCard } from "@/components/ui/stat-card";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { TransactionsChart } from "@/components/charts/transactions-chart";

export default function ReportsPage() {
  const { data: reports = [], isLoading } = useQuery<Report[]>({
    queryKey: ["/api/reports"],
  });

  const getReportTypeIcon = (rapor_turu: string) => {
    const iconMap: Record<string, any> = {
      "ciro": TrendingUp,
      "islem": BarChart3,
      "fatura": FileBarChart,
      "musteri_sayisi": PieChart,
      "portfoy_sayisi": BarChart3,
      "yatirimci_raporu": TrendingUp,
      "default": FileBarChart,
    };
    return iconMap[rapor_turu] || iconMap.default;
  };

  const getReportTypeName = (rapor_turu: string) => {
    const nameMap: Record<string, string> = {
      "ciro": "Ciro Raporu",
      "islem": "İşlem Raporu", 
      "fatura": "Fatura Raporu",
      "musteri_sayisi": "Müşteri Sayısı",
      "portfoy_sayisi": "Portföy Raporu",
      "yatirimci_raporu": "Yatırımcı Raporu",
    };
    return nameMap[rapor_turu] || rapor_turu;
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString('tr-TR');
  };

  // Calculate stats
  const totalReports = reports.length;
  const monthlyReports = reports.filter(r => {
    if (!r.olusturulma_tarihi) return false;
    const reportDate = new Date(r.olusturulma_tarihi);
    const now = new Date();
    return reportDate.getMonth() === now.getMonth() && 
           reportDate.getFullYear() === now.getFullYear();
  }).length;

  const revenueReports = reports.filter(r => r.rapor_turu === "ciro").length;

  const columns = [
    {
      key: "report_info",
      header: "Rapor Bilgisi",
      render: (report: Report) => {
        const IconComponent = getReportTypeIcon(report.rapor_turu);
        return (
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <IconComponent className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {report.baslik}
              </p>
              <p className="text-xs text-muted-foreground">
                {getReportTypeName(report.rapor_turu)}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      key: "tarih_araligi",
      header: "Tarih Aralığı",
      render: (report: Report) => (
        <div className="text-sm">
          <p>{formatDate(report.tarih_baslangic)}</p>
          <p className="text-muted-foreground">
            {formatDate(report.tarih_bitis)}
          </p>
        </div>
      ),
    },
    {
      key: "olusturulma_tarihi",
      header: "Oluşturulma",
      render: (report: Report) => (
        <span className="text-sm">{formatDate(report.olusturulma_tarihi)}</span>
      ),
    },
    {
      key: "durum",
      header: "Durum",
      render: (report: Report) => (
        <Badge variant={report.durum === "aktif" ? "default" : "secondary"}>
          {report.durum === "aktif" ? "Aktif" : "Pasif"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "İşlemler",
      render: (report: Report) => (
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            data-testid={`view-report-${report.id}`}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            data-testid={`download-report-${report.id}`}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const handleGenerateReport = () => {
    // TODO: Implement generate report modal
    console.log("Generate report modal");
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Raporlar</h1>
        <p className="text-muted-foreground">
          İş performansınızı analiz edin ve detaylı raporlar oluşturun
        </p>
      </div>

      {/* Report Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Toplam Rapor"
          value={totalReports}
          icon={FileBarChart}
          iconBgColor="bg-primary/10"
        />
        
        <StatCard
          title="Bu Ay Rapor"
          value={monthlyReports}
          icon={Calendar}
          iconBgColor="bg-accent/10"
        />
        
        <StatCard
          title="Ciro Raporları"
          value={revenueReports}
          icon={TrendingUp}
          iconBgColor="bg-secondary/10"
        />
      </div>

      {/* Quick Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border">
          <CardHeader>
            <CardTitle>Aylık Performans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <RevenueChart />
            </div>
          </CardContent>
        </Card>

        <Card className="border">
          <CardHeader>
            <CardTitle>İşlem Analizi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <TransactionsChart />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports List */}
      <DataTable
        data={reports}
        columns={columns}
        searchPlaceholder="Rapor ara..."
        onAdd={handleGenerateReport}
        addButtonText="Rapor Oluştur"
        isLoading={isLoading}
      />

      {/* Quick Report Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold">Ciro Raporu</h3>
                <p className="text-sm text-muted-foreground">Aylık ciro analizi</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">İşlem Raporu</h3>
                <p className="text-sm text-muted-foreground">İşlem detay analizi</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                <PieChart className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <h3 className="font-semibold">Müşteri Raporu</h3>
                <p className="text-sm text-muted-foreground">Müşteri analizi</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
