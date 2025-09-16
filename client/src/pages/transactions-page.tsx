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
import { Eye, FileText } from "lucide-react";
import { Transaction, Client, Property, insertTransactionSchema } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { StatCard } from "@/components/ui/stat-card";
import { Calendar, TrendingUp, Percent } from "lucide-react";

// Form schema for adding transaction
const addTransactionSchema = insertTransactionSchema.pick({
  islem_id: true,
  gayrimenkul_id: true,
  alici_id: true,
  satici_id: true,
  islem_tarihi: true,
  tutar: true,
  para_birimi: true,
  durum: true,
  odeme_yontemi: true,
  odeme_durumu: true,
  komisyon_orani: true,
  komisyon_tutari: true,
  vergi_tutari: true,
  net_tutar: true,
  sozlesme_id: true,
  notlar: true,
}).extend({
  tutar: z.string().min(1, "İşlem tutarı zorunludur"),
  gayrimenkul_id: z.string().optional(),
  alici_id: z.string().optional(),
  satici_id: z.string().optional(),
  komisyon_orani: z.string().optional(),
  komisyon_tutari: z.string().optional(),
  vergi_tutari: z.string().optional(),
  net_tutar: z.string().optional(),
  islem_tarihi: z.string().optional(),
  para_birimi: z.string().optional(),
  durum: z.string().optional(),
  odeme_yontemi: z.string().optional(),
  odeme_durumu: z.string().optional(),
  sozlesme_id: z.string().optional(),
  notlar: z.string().optional(),
});

type AddTransactionFormData = z.infer<typeof addTransactionSchema>;

export default function TransactionsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const { data: properties = [] } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  const addTransactionMutation = useMutation({
    mutationFn: async (data: AddTransactionFormData) => {
      return apiRequest("POST", "/api/transactions", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      setIsAddModalOpen(false);
      addTransactionForm.reset();
      toast({
        title: "Başarılı",
        description: "İşlem başarıyla eklendi.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "İşlem eklenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const addTransactionForm = useForm<AddTransactionFormData>({
    resolver: zodResolver(addTransactionSchema),
    defaultValues: {
      islem_id: "",
      gayrimenkul_id: "",
      alici_id: "",
      satici_id: "",
      tutar: "",
      para_birimi: "TRY",
      durum: "beklemede",
      odeme_yontemi: "",
      odeme_durumu: "bekleyen",
      komisyon_orani: "3",
      komisyon_tutari: "",
      vergi_tutari: "",
      net_tutar: "",
      sozlesme_id: "",
      notlar: "",
      islem_tarihi: new Date().toISOString().split('T')[0],
    },
  });

  // Watch for changes in tutar and komisyon_orani to calculate komisyon_tutari
  const tutar = addTransactionForm.watch("tutar");
  const komisyonOrani = addTransactionForm.watch("komisyon_orani");

  // Calculate commission amount automatically
  React.useEffect(() => {
    if (tutar && komisyonOrani) {
      const amount = parseFloat(tutar) || 0;
      const rate = parseFloat(komisyonOrani) || 0;
      const commission = (amount * rate) / 100;
      const tax = commission * 0.18; // 18% KDV
      const netAmount = amount - commission - tax;
      
      addTransactionForm.setValue("komisyon_tutari", commission.toFixed(2));
      addTransactionForm.setValue("vergi_tutari", tax.toFixed(2));
      addTransactionForm.setValue("net_tutar", netAmount.toFixed(2));
    }
  }, [tutar, komisyonOrani, addTransactionForm]);

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
    setIsAddModalOpen(true);
  };

  const onAddTransactionSubmit = (data: AddTransactionFormData) => {
    addTransactionMutation.mutate(data);
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

      {/* Add Transaction Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Yeni İşlem Ekle</DialogTitle>
            <DialogDescription>
              Yeni gayrimenkul işlemi bilgilerini girin. Gerekli alanları doldurun.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...addTransactionForm}>
            <form onSubmit={addTransactionForm.handleSubmit(onAddTransactionSubmit)} className="space-y-6">
              {/* Basic Transaction Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">İşlem Bilgileri</h3>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={addTransactionForm.control}
                    name="islem_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>İşlem Numarası</FormLabel>
                        <FormControl>
                          <Input placeholder="İşlem numarası" {...field} value={field.value || ""} data-testid="transaction-islem-id" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={addTransactionForm.control}
                    name="islem_tarihi"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>İşlem Tarihi</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} data-testid="transaction-date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Property and Clients */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Gayrimenkul ve Taraflar</h3>
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={addTransactionForm.control}
                    name="gayrimenkul_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gayrimenkul</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} data-testid="transaction-property">
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Gayrimenkul seçin" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {properties.map((property) => (
                              <SelectItem key={property.id} value={property.id}>
                                {property.mahalle || "Belirsiz"} - {property.il}/{property.ilce}
                                {property.ilan_fiyati && ` (₺${parseFloat(property.ilan_fiyati).toLocaleString('tr-TR')})`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={addTransactionForm.control}
                      name="alici_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Alıcı</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} data-testid="transaction-buyer">
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Alıcı seçin" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {clients.map((client) => (
                                <SelectItem key={client.id} value={client.id}>
                                  {client.ad} {client.soyad}
                                  {client.telefon && ` (${client.telefon})`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={addTransactionForm.control}
                      name="satici_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Satıcı</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} data-testid="transaction-seller">
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Satıcı seçin" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {clients.map((client) => (
                                <SelectItem key={client.id} value={client.id}>
                                  {client.ad} {client.soyad}
                                  {client.telefon && ` (${client.telefon})`}
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
              </div>

              {/* Financial Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Mali Bilgiler</h3>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={addTransactionForm.control}
                    name="tutar"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>İşlem Tutarı (₺) *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            placeholder="0.00" 
                            {...field} 
                            data-testid="transaction-amount" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={addTransactionForm.control}
                    name="komisyon_orani"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Komisyon Oranı (%)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            placeholder="3.00" 
                            {...field} 
                            data-testid="transaction-commission-rate" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={addTransactionForm.control}
                    name="komisyon_tutari"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Komisyon Tutarı (₺)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            {...field} 
                            readOnly 
                            className="bg-muted" 
                            data-testid="transaction-commission-amount" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={addTransactionForm.control}
                    name="vergi_tutari"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vergi Tutarı (₺)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            {...field} 
                            readOnly 
                            className="bg-muted" 
                            data-testid="transaction-tax-amount" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={addTransactionForm.control}
                  name="net_tutar"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Net Tutar (₺)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          {...field} 
                          readOnly 
                          className="bg-muted font-semibold" 
                          data-testid="transaction-net-amount" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Status and Payment Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Durum ve Ödeme Bilgileri</h3>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={addTransactionForm.control}
                    name="durum"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>İşlem Durumu</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} data-testid="transaction-status">
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Durum seçin" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="beklemede">Beklemede</SelectItem>
                            <SelectItem value="tamamlandi">Tamamlandı</SelectItem>
                            <SelectItem value="iptal">İptal</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={addTransactionForm.control}
                    name="odeme_durumu"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ödeme Durumu</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} data-testid="transaction-payment-status">
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Ödeme durumu seçin" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="bekleyen">Bekleyen</SelectItem>
                            <SelectItem value="kismen_odendi">Kısmen Ödendi</SelectItem>
                            <SelectItem value="tamamen_odendi">Tamamen Ödendi</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={addTransactionForm.control}
                    name="odeme_yontemi"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ödeme Yöntemi</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} data-testid="transaction-payment-method">
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Ödeme yöntemi seçin" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="nakit">Nakit</SelectItem>
                            <SelectItem value="havale">Havale/EFT</SelectItem>
                            <SelectItem value="cek">Çek</SelectItem>
                            <SelectItem value="kredi">Kredi</SelectItem>
                            <SelectItem value="diger">Diğer</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={addTransactionForm.control}
                    name="sozlesme_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sözleşme Numarası</FormLabel>
                        <FormControl>
                          <Input placeholder="Sözleşme numarası" {...field} data-testid="transaction-contract-id" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Notes */}
              <FormField
                control={addTransactionForm.control}
                name="notlar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notlar</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="İşlemle ilgili ek notlar..." 
                        className="resize-none" 
                        {...field} 
                        data-testid="transaction-notes" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddModalOpen(false)}
                  data-testid="transaction-cancel"
                >
                  İptal
                </Button>
                <Button 
                  type="submit" 
                  disabled={addTransactionMutation.isPending}
                  data-testid="transaction-submit"
                >
                  {addTransactionMutation.isPending ? "Ekleniyor..." : "İşlem Ekle"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
