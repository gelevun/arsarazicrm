import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Eye, Edit, Trash2 } from "lucide-react";
import { Client, insertClientSchema } from "@shared/schema";
import { StatCard } from "@/components/ui/stat-card";
import { Users, UserCheck, Handshake, Clock } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";

// Form schema for adding client
const addClientSchema = insertClientSchema.pick({
  ad: true,
  soyad: true,
  email: true,
  telefon: true,
  tc_kimlik_no: true,
  meslek: true,
  adres: true,
  notlar: true,
}).extend({
  email: z.string().email("Geçerli bir e-posta adresi giriniz").optional().or(z.literal("")),
  telefon: z.string().optional(),
  tc_kimlik_no: z.string().optional(),
  meslek: z.string().optional(),
  adres: z.string().optional(),
  notlar: z.string().optional(),
});

type AddClientFormData = z.infer<typeof addClientSchema>;

export default function ClientsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: clients = [], isLoading } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const addClientMutation = useMutation({
    mutationFn: async (data: AddClientFormData) => {
      return apiRequest("POST", "/api/clients", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      setIsAddModalOpen(false);
      addClientForm.reset();
      toast({
        title: "Başarılı",
        description: "Müşteri başarıyla eklendi.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "Müşteri eklenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const addClientForm = useForm<AddClientFormData>({
    resolver: zodResolver(addClientSchema),
    defaultValues: {
      ad: "",
      soyad: "",
      email: "",
      telefon: "",
      tc_kimlik_no: "",
      meslek: "",
      adres: "",
      notlar: "",
    },
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
    setIsAddModalOpen(true);
  };

  const onAddClientSubmit = (data: AddClientFormData) => {
    addClientMutation.mutate(data);
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

      {/* Add Client Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Yeni Müşteri Ekle</DialogTitle>
            <DialogDescription>
              Yeni müşteri bilgilerini girin. Gerekli alanları doldurun.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...addClientForm}>
            <form onSubmit={addClientForm.handleSubmit(onAddClientSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={addClientForm.control}
                  name="ad"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ad *</FormLabel>
                      <FormControl>
                        <Input placeholder="Müşteri adı" {...field} data-testid="client-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addClientForm.control}
                  name="soyad"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Soyad *</FormLabel>
                      <FormControl>
                        <Input placeholder="Müşteri soyadı" {...field} data-testid="client-surname" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={addClientForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-posta</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="ornek@email.com" {...field} data-testid="client-email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addClientForm.control}
                  name="telefon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefon</FormLabel>
                      <FormControl>
                        <Input placeholder="+90 555 123 45 67" {...field} data-testid="client-phone" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={addClientForm.control}
                  name="tc_kimlik_no"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>TC Kimlik No</FormLabel>
                      <FormControl>
                        <Input placeholder="12345678901" {...field} data-testid="client-tc" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addClientForm.control}
                  name="meslek"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meslek</FormLabel>
                      <FormControl>
                        <Input placeholder="Müşteri mesleği" {...field} data-testid="client-profession" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={addClientForm.control}
                name="adres"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adres</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Müşteri adresi" {...field} data-testid="client-address" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={addClientForm.control}
                name="notlar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notlar</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Ek notlar..." {...field} data-testid="client-notes" />
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
                  data-testid="cancel-button"
                >
                  İptal
                </Button>
                <Button
                  type="submit"
                  disabled={addClientMutation.isPending}
                  data-testid="save-client-button"
                >
                  {addClientMutation.isPending ? "Kaydediliyor..." : "Müşteri Ekle"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
