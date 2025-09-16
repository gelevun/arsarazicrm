import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, FileText } from "lucide-react";
import { Transaction } from "@shared/schema";
import { StatCard } from "@/components/ui/stat-card";
import { Calendar, TrendingUp, Percent } from "lucide-react";

export default function TransactionsPage() {
  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const getStatusBadgeVariant = (durum: string) => {
    switch (durum) {
      case "tamamlandi":
        return "default";
      case "beklemede":
        return "outline";
      case "iptal":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getStatusText = (durum: string) => {
    switch (durum) {
      case "tamamlandi":
        return "Tamamlandı";
      case "beklemede":
        return "Beklemede";
      case "iptal":
        return "İptal";
      default:
        return durum;
    }
  };

  const formatCurrency = (value: string | null) => {
    if (!value) return "-";
    const num = parseFloat(value);
    return `₺${num.toLocaleString('tr-TR')}`;
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString('tr-TR');
  };

  // Calculate stats
  const thisMonthTransactions = transactions.filter(t => {
    if (!t.islem_tarihi) return false;
    const transactionDate = new Date(t.islem_tarihi);
    const now = new Date();
    return transactionDate.getMonth() === now.getMonth() && 
           transactionDate.getFullYear() === now.getFullYear();
  });

  const thisMonthRevenue = thisMonthTransactions.reduce((sum, t) => {
    return sum + parseFloat(t.tutar || "0");
  }, 0);

  const averageTransaction = transactions.length > 0 
    ? transactions.reduce((sum, t) => sum + parseFloat(t.tutar || "0"), 0) / transactions.length
    : 0;

  const totalCommission = transactions.reduce((sum, t) => {
    return sum + parseFloat(t.komisyon_tutari || "0");
  }, 0);

  const columns = [
    {
      key: "islem_id",
      header: "İşlem No",
      render: (transaction: Transaction) => (
        <span className="font-medium">{transaction.islem_id || transaction.id.slice(0, 8)}</span>
      ),
    },
    {
      key: "tutar",
      header: "Tutar",
      render: (transaction: Transaction) => (
        <span className="font-semibold">{formatCurrency(transaction.tutar)}</span>
      ),
    },
    {
      key: "komisyon_tutari",
      header: "Komisyon",
      render: (transaction: Transaction) => (
        <span className="font-semibold text-accent">{formatCurrency(transaction.komisyon_tutari)}</span>
      ),
    },
    {
      key: "islem_tarihi",
      header: "Tarih",
      render: (transaction: Transaction) => (
        <span className="text-sm">{formatDate(transaction.islem_tarihi)}</span>
      ),
    },
    {
      key: "durum",
      header: "Durum",
      render: (transaction: Transaction) => (
        <Badge variant={getStatusBadgeVariant(transaction.durum || "")}>
          {getStatusText(transaction.durum || "")}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "İşlemler",
      render: (transaction: Transaction) => (
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            data-testid={`view-transaction-${transaction.id}`}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            data-testid={`download-transaction-${transaction.id}`}
          >
            <FileText className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const handleAddTransaction = () => {
    // TODO: Implement add transaction modal
    console.log("Add transaction modal");
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">İşlemler</h1>
        <p className="text-muted-foreground">
          Gayrimenkul işlemlerinizi yönetin ve takip edin
        </p>
      </div>

      {/* Transaction Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Bu Ay Ciro"
          value={`₺${thisMonthRevenue.toLocaleString('tr-TR')}`}
          change={`${thisMonthTransactions.length} işlem`}
          icon={Calendar}
          iconBgColor="bg-accent/10"
        />
        
        <StatCard
          title="Ortalama İşlem"
          value={`₺${averageTransaction.toLocaleString('tr-TR')}`}
          change="son 30 gün"
          icon={TrendingUp}
          iconBgColor="bg-primary/10"
        />
        
        <StatCard
          title="Toplam Komisyon"
          value={`₺${totalCommission.toLocaleString('tr-TR')}`}
          change="bu ay"
          icon={Percent}
          iconBgColor="bg-secondary/10"
        />
      </div>

      <DataTable
        data={transactions}
        columns={columns}
        searchPlaceholder="İşlem ara..."
        onAdd={handleAddTransaction}
        addButtonText="İşlem Ekle"
        isLoading={isLoading}
      />
    </div>
  );
}
