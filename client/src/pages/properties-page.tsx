import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2 } from "lucide-react";
import { Property } from "@shared/schema";

export default function PropertiesPage() {
  const { data: properties = [], isLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  const getStatusBadgeVariant = (durum: string) => {
    switch (durum) {
      case "aktif":
        return "default";
      case "satildi":
        return "secondary";
      case "beklemede":
        return "outline";
      default:
        return "outline";
    }
  };

  const getStatusText = (durum: string) => {
    switch (durum) {
      case "aktif":
        return "Aktif";
      case "satildi":
        return "Satıldı";
      case "beklemede":
        return "Beklemede";
      default:
        return durum;
    }
  };

  const formatCurrency = (value: string | null) => {
    if (!value) return "-";
    const num = parseFloat(value);
    return `₺${num.toLocaleString('tr-TR')}`;
  };

  const formatArea = (value: string | null) => {
    if (!value) return "-";
    return `${value} m²`;
  };

  const columns = [
    {
      key: "gayrimenkul_id",
      header: "ID",
      render: (property: Property) => (
        <span className="font-medium">{property.gayrimenkul_id || property.id.slice(0, 8)}</span>
      ),
    },
    {
      key: "location",
      header: "Konum",
      render: (property: Property) => (
        <div>
          <p className="font-medium">{property.mahalle || "Belirtilmemiş"}</p>
          <p className="text-muted-foreground text-sm">{property.il}/{property.ilce}</p>
        </div>
      ),
    },
    {
      key: "ada_parsel",
      header: "Ada/Parsel",
      render: (property: Property) => (
        <span>{property.ada_no && property.parsel_no ? `${property.ada_no}/${property.parsel_no}` : "-"}</span>
      ),
    },
    {
      key: "alan_m2",
      header: "Alan",
      render: (property: Property) => formatArea(property.alan_m2),
    },
    {
      key: "ilan_fiyati",
      header: "İlan Fiyatı",
      render: (property: Property) => (
        <span className="font-semibold">{formatCurrency(property.ilan_fiyati)}</span>
      ),
    },
    {
      key: "tur",
      header: "Tür",
      render: (property: Property) => (
        <span className="capitalize">{property.tur || "Belirtilmemiş"}</span>
      ),
    },
    {
      key: "durum",
      header: "Durum",
      render: (property: Property) => (
        <Badge variant={getStatusBadgeVariant(property.durum || "")}>
          {getStatusText(property.durum || "")}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "İşlemler",
      render: (property: Property) => (
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            data-testid={`view-property-${property.id}`}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            data-testid={`edit-property-${property.id}`}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            data-testid={`delete-property-${property.id}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const handleAddProperty = () => {
    // TODO: Implement add property modal
    console.log("Add property modal");
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Gayrimenkuller</h1>
        <p className="text-muted-foreground">
          Portföyünüzdeki gayrimenkulleri yönetin
        </p>
      </div>

      <DataTable
        data={properties}
        columns={columns}
        searchPlaceholder="Gayrimenkul ara..."
        onAdd={handleAddProperty}
        addButtonText="Gayrimenkul Ekle"
        isLoading={isLoading}
      />
    </div>
  );
}
