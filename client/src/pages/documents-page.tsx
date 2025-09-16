import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Download, Edit, Trash2, FileText, Upload, FolderOpen } from "lucide-react";
import { Document } from "@shared/schema";
import { StatCard } from "@/components/ui/stat-card";

export default function DocumentsPage() {
  const { data: documents = [], isLoading } = useQuery<Document[]>({
    queryKey: ["/api/documents"],
  });

  const getStatusBadgeVariant = (durum: string) => {
    switch (durum) {
      case "aktif":
        return "default";
      case "pasif":
        return "secondary";
      case "arsivlendi":
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
      case "arsivlendi":
        return "Arşivlendi";
      default:
        return durum || "Bilinmiyor";
    }
  };

  const getDocumentTypeIcon = (belge_turu: string) => {
    const iconMap: Record<string, any> = {
      "tapu": FileText,
      "sozlesme": FileText,
      "vekalet": FileText,
      "kimlik": FileText,
      "default": FileText,
    };
    return iconMap[belge_turu] || iconMap.default;
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString('tr-TR');
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "-";
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  // Calculate stats
  const totalDocuments = documents.length;
  const activeDocuments = documents.filter(d => d.durum === "aktif").length;
  const publicDocuments = documents.filter(d => d.gizlilik === "public").length;

  const columns = [
    {
      key: "belge_info",
      header: "Belge Bilgisi",
      render: (document: Document) => {
        const IconComponent = getDocumentTypeIcon(document.belge_turu);
        return (
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <IconComponent className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {document.belge_turu || "Belirtilmemiş"}
              </p>
              <p className="text-xs text-muted-foreground">
                {document.belge_id || document.id.slice(0, 8)}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      key: "dosya_info",
      header: "Dosya",
      render: (document: Document) => (
        <div>
          <p className="text-sm font-medium">{document.dosya_turu || "Bilinmiyor"}</p>
          <p className="text-xs text-muted-foreground">
            {formatFileSize(document.dosya_boyutu)}
          </p>
        </div>
      ),
    },
    {
      key: "yuklenme_tarihi",
      header: "Yüklenme Tarihi",
      render: (document: Document) => (
        <span className="text-sm">{formatDate(document.yuklenme_tarihi)}</span>
      ),
    },
    {
      key: "gizlilik",
      header: "Gizlilik",
      render: (document: Document) => (
        <Badge variant={document.gizlilik === "public" ? "default" : "secondary"}>
          {document.gizlilik === "public" ? "Açık" : "Gizli"}
        </Badge>
      ),
    },
    {
      key: "durum",
      header: "Durum",
      render: (document: Document) => (
        <Badge variant={getStatusBadgeVariant(document.durum || "")}>
          {getStatusText(document.durum || "")}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "İşlemler",
      render: (document: Document) => (
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            data-testid={`view-document-${document.id}`}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            data-testid={`download-document-${document.id}`}
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            data-testid={`edit-document-${document.id}`}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            data-testid={`delete-document-${document.id}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const handleAddDocument = () => {
    // TODO: Implement add document modal
    console.log("Add document modal");
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Belgeler</h1>
        <p className="text-muted-foreground">
          Gayrimenkul belgelerinizi yönetin ve organize edin
        </p>
      </div>

      {/* Document Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Toplam Belge"
          value={totalDocuments}
          icon={FileText}
          iconBgColor="bg-primary/10"
        />
        
        <StatCard
          title="Aktif Belgeler"
          value={activeDocuments}
          icon={FolderOpen}
          iconBgColor="bg-accent/10"
        />
        
        <StatCard
          title="Açık Belgeler"
          value={publicDocuments}
          icon={Upload}
          iconBgColor="bg-secondary/10"
        />
      </div>

      <DataTable
        data={documents}
        columns={columns}
        searchPlaceholder="Belge ara..."
        onAdd={handleAddDocument}
        addButtonText="Belge Yükle"
        isLoading={isLoading}
      />
    </div>
  );
}
