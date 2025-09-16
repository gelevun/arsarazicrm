import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Eye, Download, Edit, Trash2, FileText, Upload, FolderOpen } from "lucide-react";
import { Document, Client, Property, insertDocumentSchema } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { StatCard } from "@/components/ui/stat-card";

// Form schema for adding document
const addDocumentSchema = z.object({
  belge_id: z.string().optional(),
  gayrimenkul_id: z.string().optional(),
  belge_turu: z.string().min(1, "Belge türü zorunludur"),
  noter: z.string().optional(),
  vekil: z.string().optional(),
  vekalet_tarihi: z.string().optional(),
  vekalet_bitis: z.string().optional(),
  yetkili_makam: z.string().optional(),
  malik: z.string().optional(),
  tapu_tarihi: z.string().optional(),
  onceki_malik_id: z.string().optional(),
  dosya_url: z.string().optional(),
  dosya_turu: z.string().optional(),
  dosya_boyutu: z.string().optional(),
  duzenlenme_tarihi: z.string().optional(),
  duzenleyen_kurum: z.string().optional(),
  imzalayan: z.string().optional(),
  imza_tarihi: z.string().optional(),
  onaylayan: z.string().optional(),
  onay_tarihi: z.string().optional(),
  dogrulama_kodu: z.string().optional(),
  sozlesme_id: z.string().optional(),
  gizlilik: z.string().optional(),
  notlar: z.string().optional(),
  durum: z.string().optional(),
});

type AddDocumentFormData = z.infer<typeof addDocumentSchema>;

export default function DocumentsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: documents = [], isLoading } = useQuery<Document[]>({
    queryKey: ["/api/documents"],
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const { data: properties = [] } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  const addDocumentMutation = useMutation({
    mutationFn: async (data: AddDocumentFormData) => {
      return apiRequest("POST", "/api/documents", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      setIsAddModalOpen(false);
      addDocumentForm.reset();
      toast({
        title: "Başarılı",
        description: "Belge başarıyla eklendi.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "Belge eklenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const addDocumentForm = useForm<AddDocumentFormData>({
    resolver: zodResolver(addDocumentSchema),
    defaultValues: {
      belge_id: "",
      gayrimenkul_id: "",
      belge_turu: "",
      noter: "",
      vekil: "",
      yetkili_makam: "",
      malik: "",
      onceki_malik_id: "",
      dosya_url: "",
      dosya_turu: "",
      dosya_boyutu: "",
      duzenleyen_kurum: "",
      imzalayan: "",
      onaylayan: "",
      dogrulama_kodu: "",
      sozlesme_id: "",
      gizlilik: "public",
      notlar: "",
      durum: "aktif",
      vekalet_tarihi: "",
      vekalet_bitis: "",
      tapu_tarihi: "",
      duzenlenme_tarihi: "",
      imza_tarihi: "",
      onay_tarihi: "",
    },
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
    setIsAddModalOpen(true);
  };

  const onAddDocumentSubmit = (data: AddDocumentFormData) => {
    addDocumentMutation.mutate(data);
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

      {/* Add Document Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Yeni Belge Ekle</DialogTitle>
            <DialogDescription>
              Gayrimenkul belgesi bilgilerini girin.
            </DialogDescription>
          </DialogHeader>

          <Form {...addDocumentForm}>
            <form onSubmit={addDocumentForm.handleSubmit(onAddDocumentSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Belge ID */}
                <FormField
                  control={addDocumentForm.control}
                  name="belge_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Belge ID</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Belge numarası girin"
                          data-testid="input-belge-id"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Belge Türü */}
                <FormField
                  control={addDocumentForm.control}
                  name="belge_turu"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Belge Türü *</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        data-testid="select-belge-turu"
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Belge türü seçin" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="tapu">Tapu</SelectItem>
                          <SelectItem value="sozlesme">Sözleşme</SelectItem>
                          <SelectItem value="vekalet">Vekalet</SelectItem>
                          <SelectItem value="kimlik">Kimlik</SelectItem>
                          <SelectItem value="noter">Noterlik Belgesi</SelectItem>
                          <SelectItem value="diger">Diğer</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Gayrimenkul */}
                <FormField
                  control={addDocumentForm.control}
                  name="gayrimenkul_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gayrimenkul</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        data-testid="select-gayrimenkul"
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Gayrimenkul seçin" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {properties.map((property) => (
                            <SelectItem key={property.id} value={property.id}>
                              {property.gayrimenkul_id || `${property.il} - ${property.ilce}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Önceki Malik */}
                <FormField
                  control={addDocumentForm.control}
                  name="onceki_malik_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Önceki Malik</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        data-testid="select-onceki-malik"
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Önceki malik seçin" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.ad} {client.soyad}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Malik */}
                <FormField
                  control={addDocumentForm.control}
                  name="malik"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Malik</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Malik adı girin"
                          data-testid="input-malik"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Noter */}
                <FormField
                  control={addDocumentForm.control}
                  name="noter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Noter</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Noter adı girin"
                          data-testid="input-noter"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Vekil */}
                <FormField
                  control={addDocumentForm.control}
                  name="vekil"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vekil</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Vekil adı girin"
                          data-testid="input-vekil"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Yetkili Makam */}
                <FormField
                  control={addDocumentForm.control}
                  name="yetkili_makam"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Yetkili Makam</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Yetkili makam girin"
                          data-testid="input-yetkili-makam"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Dosya URL */}
                <FormField
                  control={addDocumentForm.control}
                  name="dosya_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dosya URL</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Dosya URL'i girin"
                          data-testid="input-dosya-url"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Dosya Türü */}
                <FormField
                  control={addDocumentForm.control}
                  name="dosya_turu"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dosya Türü</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        data-testid="select-dosya-turu"
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Dosya türü seçin" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pdf">PDF</SelectItem>
                          <SelectItem value="docx">Word Belgesi</SelectItem>
                          <SelectItem value="jpg">JPEG Resim</SelectItem>
                          <SelectItem value="png">PNG Resim</SelectItem>
                          <SelectItem value="diger">Diğer</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Dosya Boyutu */}
                <FormField
                  control={addDocumentForm.control}
                  name="dosya_boyutu"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dosya Boyutu (KB)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          placeholder="Dosya boyutu"
                          data-testid="input-dosya-boyutu"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Vekalet Tarihi */}
                <FormField
                  control={addDocumentForm.control}
                  name="vekalet_tarihi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vekalet Tarihi</FormLabel>
                      <FormControl>
                        <Input 
                          type="date"
                          data-testid="input-vekalet-tarihi"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Vekalet Bitiş */}
                <FormField
                  control={addDocumentForm.control}
                  name="vekalet_bitis"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vekalet Bitiş</FormLabel>
                      <FormControl>
                        <Input 
                          type="date"
                          data-testid="input-vekalet-bitis"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Tapu Tarihi */}
                <FormField
                  control={addDocumentForm.control}
                  name="tapu_tarihi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tapu Tarihi</FormLabel>
                      <FormControl>
                        <Input 
                          type="date"
                          data-testid="input-tapu-tarihi"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Düzenleme Tarihi */}
                <FormField
                  control={addDocumentForm.control}
                  name="duzenlenme_tarihi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Düzenleme Tarihi</FormLabel>
                      <FormControl>
                        <Input 
                          type="date"
                          data-testid="input-duzenlenme-tarihi"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Düzenleyen Kurum */}
                <FormField
                  control={addDocumentForm.control}
                  name="duzenleyen_kurum"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Düzenleyen Kurum</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Düzenleyen kurum girin"
                          data-testid="input-duzenleyen-kurum"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* İmzalayan */}
                <FormField
                  control={addDocumentForm.control}
                  name="imzalayan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>İmzalayan</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="İmzalayan kişi girin"
                          data-testid="input-imzalayan"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* İmza Tarihi */}
                <FormField
                  control={addDocumentForm.control}
                  name="imza_tarihi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>İmza Tarihi</FormLabel>
                      <FormControl>
                        <Input 
                          type="date"
                          data-testid="input-imza-tarihi"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Onaylayan */}
                <FormField
                  control={addDocumentForm.control}
                  name="onaylayan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Onaylayan</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Onaylayan kişi girin"
                          data-testid="input-onaylayan"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Onay Tarihi */}
                <FormField
                  control={addDocumentForm.control}
                  name="onay_tarihi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Onay Tarihi</FormLabel>
                      <FormControl>
                        <Input 
                          type="date"
                          data-testid="input-onay-tarihi"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Doğrulama Kodu */}
                <FormField
                  control={addDocumentForm.control}
                  name="dogrulama_kodu"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Doğrulama Kodu</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Doğrulama kodu girin"
                          data-testid="input-dogrulama-kodu"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Sözleşme ID */}
                <FormField
                  control={addDocumentForm.control}
                  name="sozlesme_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sözleşme ID</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Sözleşme ID girin"
                          data-testid="input-sozlesme-id"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Gizlilik */}
                <FormField
                  control={addDocumentForm.control}
                  name="gizlilik"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gizlilik</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        data-testid="select-gizlilik"
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Gizlilik seviyesi seçin" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="public">Açık</SelectItem>
                          <SelectItem value="private">Gizli</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Durum */}
                <FormField
                  control={addDocumentForm.control}
                  name="durum"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Durum</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        data-testid="select-durum"
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Durum seçin" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="aktif">Aktif</SelectItem>
                          <SelectItem value="pasif">Pasif</SelectItem>
                          <SelectItem value="arsivlendi">Arşivlendi</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Notlar */}
              <FormField
                control={addDocumentForm.control}
                name="notlar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notlar</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Belge ile ilgili notlar girin"
                        className="resize-none"
                        data-testid="textarea-notlar"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddModalOpen(false)}
                  data-testid="button-cancel-document"
                >
                  İptal
                </Button>
                <Button 
                  type="submit" 
                  disabled={addDocumentMutation.isPending}
                  data-testid="button-submit-document"
                >
                  {addDocumentMutation.isPending ? "Ekleniyor..." : "Belge Ekle"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
