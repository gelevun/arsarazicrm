import { useState } from "react";
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
import { Eye, Edit, Trash2 } from "lucide-react";
import { Property, Client, insertPropertySchema } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";

// Form schema for adding property
const addPropertySchema = insertPropertySchema.pick({
  il: true,
  ilce: true,
  mahalle: true,
  ada_no: true,
  parsel_no: true,
  alan_m2: true,
  tur: true,
  imar_plani_turu: true,
  taks: true,
  kaks: true,
  maksimum_yukseklik: true,
  malik_id: true,
  alis_fiyati: true,
  ilan_fiyati: true,
  degerleme_fiyati: true,
  koordinatlar: true,
  notlar: true,
  durum: true,
  tapu_durumu: true,
}).extend({
  il: z.string().min(1, "İl zorunludur"),
  ilce: z.string().min(1, "İlçe zorunludur"),
  mahalle: z.string().optional(),
  ada_no: z.string().optional(),
  parsel_no: z.string().optional(),
  alan_m2: z.string().optional(),
  tur: z.string().optional(),
  imar_plani_turu: z.string().optional(),
  taks: z.string().optional(),
  kaks: z.string().optional(),
  maksimum_yukseklik: z.string().optional(),
  malik_id: z.string().optional(),
  alis_fiyati: z.string().optional(),
  ilan_fiyati: z.string().optional(),
  degerleme_fiyati: z.string().optional(),
  notlar: z.string().optional(),
  durum: z.string().optional(),
  tapu_durumu: z.string().optional(),
});

type AddPropertyFormData = z.infer<typeof addPropertySchema>;

export default function PropertiesPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: properties = [], isLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const addPropertyMutation = useMutation({
    mutationFn: async (data: AddPropertyFormData) => {
      return apiRequest("POST", "/api/properties", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      setIsAddModalOpen(false);
      addPropertyForm.reset();
      toast({
        title: "Başarılı",
        description: "Gayrimenkul başarıyla eklendi.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "Gayrimenkul eklenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const addPropertyForm = useForm<AddPropertyFormData>({
    resolver: zodResolver(addPropertySchema),
    defaultValues: {
      il: "",
      ilce: "",
      mahalle: "",
      ada_no: "",
      parsel_no: "",
      alan_m2: "",
      tur: "arsa",
      imar_plani_turu: "",
      taks: "",
      kaks: "",
      maksimum_yukseklik: "",
      malik_id: "",
      alis_fiyati: "",
      ilan_fiyati: "",
      degerleme_fiyati: "",
      notlar: "",
      durum: "aktif",
      tapu_durumu: "",
    },
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
    setIsAddModalOpen(true);
  };

  const onAddPropertySubmit = (data: AddPropertyFormData) => {
    addPropertyMutation.mutate(data);
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

      {/* Add Property Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Yeni Gayrimenkul Ekle</DialogTitle>
            <DialogDescription>
              Yeni gayrimenkul bilgilerini girin. Gerekli alanları doldurun.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...addPropertyForm}>
            <form onSubmit={addPropertyForm.handleSubmit(onAddPropertySubmit)} className="space-y-6">
              {/* Location Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Konum Bilgileri</h3>
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={addPropertyForm.control}
                    name="il"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>İl *</FormLabel>
                        <FormControl>
                          <Input placeholder="İl" {...field} data-testid="property-il" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={addPropertyForm.control}
                    name="ilce"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>İlçe *</FormLabel>
                        <FormControl>
                          <Input placeholder="İlçe" {...field} data-testid="property-ilce" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={addPropertyForm.control}
                    name="mahalle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mahalle</FormLabel>
                        <FormControl>
                          <Input placeholder="Mahalle" {...field} data-testid="property-mahalle" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={addPropertyForm.control}
                    name="ada_no"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ada No</FormLabel>
                        <FormControl>
                          <Input placeholder="Ada numarası" {...field} data-testid="property-ada-no" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={addPropertyForm.control}
                    name="parsel_no"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parsel No</FormLabel>
                        <FormControl>
                          <Input placeholder="Parsel numarası" {...field} data-testid="property-parsel-no" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Property Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Gayrimenkul Detayları</h3>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={addPropertyForm.control}
                    name="tur"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tür</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="property-type">
                              <SelectValue placeholder="Gayrimenkul türünü seçin" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="arsa">Arsa</SelectItem>
                            <SelectItem value="arazi">Arazi</SelectItem>
                            <SelectItem value="bina">Bina</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={addPropertyForm.control}
                    name="alan_m2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alan (m²)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="0.00" {...field} data-testid="property-area" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={addPropertyForm.control}
                    name="durum"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Durum</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="property-status">
                              <SelectValue placeholder="Durumu seçin" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="aktif">Aktif</SelectItem>
                            <SelectItem value="beklemede">Beklemede</SelectItem>
                            <SelectItem value="satildi">Satıldı</SelectItem>
                            <SelectItem value="iptal">İptal</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={addPropertyForm.control}
                    name="malik_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Malik (Sahibi)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="property-owner">
                              <SelectValue placeholder="Malik seçin" />
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
                </div>
              </div>

              {/* Technical Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Teknik Bilgiler</h3>
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={addPropertyForm.control}
                    name="taks"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>TAKS</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="0.00" {...field} data-testid="property-taks" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={addPropertyForm.control}
                    name="kaks"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>KAKS</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="0.00" {...field} data-testid="property-kaks" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={addPropertyForm.control}
                    name="maksimum_yukseklik"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maksimum Yükseklik (m)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="0.00" {...field} data-testid="property-max-height" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={addPropertyForm.control}
                    name="imar_plani_turu"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>İmar Planı Türü</FormLabel>
                        <FormControl>
                          <Input placeholder="İmar planı türü" {...field} data-testid="property-zoning" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={addPropertyForm.control}
                    name="tapu_durumu"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tapu Durumu</FormLabel>
                        <FormControl>
                          <Input placeholder="Tapu durumu" {...field} data-testid="property-deed-status" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Pricing Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Fiyat Bilgileri</h3>
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={addPropertyForm.control}
                    name="alis_fiyati"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alış Fiyatı (₺)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="0.00" {...field} data-testid="property-purchase-price" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={addPropertyForm.control}
                    name="ilan_fiyati"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>İlan Fiyatı (₺)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="0.00" {...field} data-testid="property-listing-price" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={addPropertyForm.control}
                    name="degerleme_fiyati"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Değerleme Fiyatı (₺)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="0.00" {...field} data-testid="property-valuation-price" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Notes */}
              <FormField
                control={addPropertyForm.control}
                name="notlar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notlar</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Gayrimenkul hakkında notlar..."
                        {...field} 
                        data-testid="property-notes"
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
                  data-testid="property-cancel"
                >
                  İptal
                </Button>
                <Button 
                  type="submit" 
                  disabled={addPropertyMutation.isPending}
                  data-testid="property-submit"
                >
                  {addPropertyMutation.isPending ? "Ekleniyor..." : "Gayrimenkul Ekle"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
