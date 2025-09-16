import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Eye, Edit, Trash2 } from "lucide-react";
import { Client } from "@shared/schema";
import { StatCard } from "@/components/ui/stat-card";
import { Users, UserCheck, Handshake, Clock } from "lucide-react";

export default function ClientsPage() {
  const { data: clients = [], isLoading } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const getStatusBadgeVariant = (durum: string) => {
    switch (durum) {
      case "aktif":
        return "default";
      case "pasif":
        return "secondary";
      case "bekleyen":
        return "outline";
      default:
        return "outline";
    }
  };

  const getStatusText = (durum: string) => {
    switch (durum) {
      case "aktif":
        return "Aktif";
      case "pasif":
        return "Pasif";
      case "bekleyen":
        return "Bekleyen";
      default:
        return durum;
    }
  };

  const getInitials = (ad: string, soyad: string) => {
    return `${ad.charAt(0)}${soyad.charAt(0)}`.toUpperCase();
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString('tr-TR');
  };

  // Calculate stats
  const totalClients = clients.length;
  const activeClients = clients.filter(c => c.durum === "aktif").length;
  const pendingClients = clients.filter(c => c.durum === "bekleyen").length;
  const processedClients = clients.filter(c => c.durum === "aktif").length; // Simplified

  const columns = [
    {
      key: "name",
      header: "Müşteri",
      render: (client: Client) => (
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback>
              {getInitials(client.ad, client.soyad)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-foreground">
              {client.ad} {client.soyad}
            </p>
            <p className="text-xs text-muted-foreground">{client.meslek || "Meslek belirtilmemiş"}</p>
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      header: "İletişim",
      render: (client: Client) => (
        <div>
          <p className="text-sm">{client.telefon || "-"}</p>
          <p className="text-sm text-muted-foreground">{client.email || "-"}</p>
        </div>
      ),
    },
    {
      key: "tc_kimlik_no",
      header: "TC/Vergi No",
      render: (client: Client) => (
        <span className="text-sm">{client.tc_kimlik_no || client.vergi_no || "-"}</span>
      ),
    },
    {
      key: "olusturulma_tarihi",
      header: "Kayıt Tarihi",
      render: (client: Client) => (
        <span className="text-sm">{formatDate(client.olusturulma_tarihi)}</span>
      ),
    },
    {
      key: "durum",
      header: "Durum",
      render: (client: Client) => (
        <Badge variant={getStatusBadgeVariant(client.durum || "")}>
          {getStatusText(client.durum || "")}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "İşlemler",
      render: (client: Client) => (
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            data-testid={`view-client-${client.id}`}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            data-testid={`edit-client-${client.id}`}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            data-testid={`delete-client-${client.id}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const handleAddClient = () => {
    // TODO: Implement add client modal
    console.log("Add client modal");
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Müşteriler</h1>
        <p className="text-muted-foreground">
          Müşteri portföyünüzü yönetin ve takip edin
        </p>
      </div>

      {/* Client Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Toplam Müşteri"
          value={totalClients}
          icon={Users}
          iconBgColor="bg-primary/10"
        />
        
        <StatCard
          title="Aktif Müşteri"
          value={activeClients}
          icon={UserCheck}
          iconBgColor="bg-accent/10"
        />
        
        <StatCard
          title="İşlem Yapan"
          value={processedClients}
          icon={Handshake}
          iconBgColor="bg-secondary/10"
        />
        
        <StatCard
          title="Bekleyen"
          value={pendingClients}
          icon={Clock}
          iconBgColor="bg-yellow-100"
        />
      </div>

      <DataTable
        data={clients}
        columns={columns}
        searchPlaceholder="Müşteri ara..."
        onAdd={handleAddClient}
        addButtonText="Müşteri Ekle"
        isLoading={isLoading}
      />
    </div>
  );
}
