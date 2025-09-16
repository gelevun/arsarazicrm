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
import { Eye, Edit, UserCog, Users, Shield } from "lucide-react";
import { User, insertUserSchema } from "@shared/schema";
import { StatCard } from "@/components/ui/stat-card";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";

// Form schema for adding user
const addUserSchema = insertUserSchema.pick({
  ad: true,
  soyad: true,
  email: true,
  username: true,
  telefon: true,
  rol: true,
  departman: true,
  password: true,
  notlar: true,
}).extend({
  email: z.string().email("Geçerli bir e-posta adresi giriniz"),
  username: z.string().min(3, "Kullanıcı adı en az 3 karakter olmalıdır"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
  telefon: z.string().optional(),
  departman: z.string().optional(),
  notlar: z.string().optional(),
});

type AddUserFormData = z.infer<typeof addUserSchema>;

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
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

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const addUserMutation = useMutation({
    mutationFn: async (data: AddUserFormData) => {
      return apiRequest("POST", "/api/users", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setIsAddModalOpen(false);
      addUserForm.reset();
      toast({
        title: "Başarılı",
        description: "Kullanıcı başarıyla eklendi.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "Kullanıcı eklenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const addUserForm = useForm<AddUserFormData>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      ad: "",
      soyad: "",
      email: "",
      username: "",
      telefon: "",
      rol: "consultant",
      departman: "",
      password: "",
      notlar: "",
    },
  });

  const getRoleBadgeVariant = (rol: string) => {
    switch (rol) {
      case "admin":
        return "destructive";
      case "consultant":
        return "default";
      default:
        return "outline";
    }
  };

  const getRoleText = (rol: string) => {
    switch (rol) {
      case "admin":
        return "Admin";
      case "consultant":
        return "Danışman";
      default:
        return rol;
    }
  };

  const getInitials = (ad: string, soyad: string) => {
    return `${ad.charAt(0)}${soyad.charAt(0)}`.toUpperCase();
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "Hiç giriş yapmamış";
    return new Date(date).toLocaleString('tr-TR');
  };

  // Calculate stats
  const totalUsers = users.length;
  const consultants = users.filter(u => u.rol === "consultant").length;
  const admins = users.filter(u => u.rol === "admin").length;

  const columns = [
    {
      key: "user",
      header: "Kullanıcı",
      render: (user: User) => (
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback>
              {getInitials(user.ad, user.soyad)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-foreground">
              {user.ad} {user.soyad}
            </p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "username",
      header: "Kullanıcı Adı",
      render: (user: User) => (
        <span className="text-sm font-mono">{user.username}</span>
      ),
    },
    {
      key: "telefon",
      header: "Telefon",
      render: (user: User) => (
        <span className="text-sm">{user.telefon || "-"}</span>
      ),
    },
    {
      key: "rol",
      header: "Rol",
      render: (user: User) => (
        <Badge variant={getRoleBadgeVariant(user.rol)}>
          {getRoleText(user.rol)}
        </Badge>
      ),
    },
    {
      key: "departman",
      header: "Departman",
      render: (user: User) => (
        <span className="text-sm">{user.departman || "Belirtilmemiş"}</span>
      ),
    },
    {
      key: "son_giris",
      header: "Son Giriş",
      render: (user: User) => (
        <span className="text-sm">{formatDate(user.son_giris)}</span>
      ),
    },
    {
      key: "durum",
      header: "Durum",
      render: (user: User) => (
        <Badge variant={user.durum ? "default" : "secondary"}>
          {user.durum ? "Aktif" : "Pasif"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "İşlemler",
      render: (user: User) => (
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            data-testid={`view-user-${user.id}`}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            data-testid={`edit-user-${user.id}`}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const handleAddUser = () => {
    setIsAddModalOpen(true);
  };

  const onAddUserSubmit = (data: AddUserFormData) => {
    addUserMutation.mutate(data);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Kullanıcı Yönetimi</h1>
        <p className="text-muted-foreground">
          Sistem kullanıcılarını yönetin ve yetkilerini düzenleyin
        </p>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Toplam Kullanıcı"
          value={totalUsers}
          icon={UserCog}
          iconBgColor="bg-primary/10"
        />
        
        <StatCard
          title="Danışmanlar"
          value={consultants}
          icon={Users}
          iconBgColor="bg-accent/10"
        />
        
        <StatCard
          title="Adminler"
          value={admins}
          icon={Shield}
          iconBgColor="bg-secondary/10"
        />
      </div>

      <DataTable
        data={users}
        columns={columns}
        searchPlaceholder="Kullanıcı ara..."
        onAdd={handleAddUser}
        addButtonText="Kullanıcı Ekle"
        isLoading={isLoading}
      />

      {/* Add User Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Yeni Kullanıcı Ekle</DialogTitle>
            <DialogDescription>
              Yeni kullanıcı bilgilerini girin. Gerekli alanları doldurun.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...addUserForm}>
            <form onSubmit={addUserForm.handleSubmit(onAddUserSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={addUserForm.control}
                  name="ad"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ad *</FormLabel>
                      <FormControl>
                        <Input placeholder="Kullanıcı adı" {...field} data-testid="user-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addUserForm.control}
                  name="soyad"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Soyad *</FormLabel>
                      <FormControl>
                        <Input placeholder="Kullanıcı soyadı" {...field} data-testid="user-surname" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={addUserForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-posta *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="ornek@email.com" {...field} data-testid="user-email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addUserForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kullanıcı Adı *</FormLabel>
                      <FormControl>
                        <Input placeholder="kullanici_adi" {...field} data-testid="user-username" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={addUserForm.control}
                  name="telefon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefon</FormLabel>
                      <FormControl>
                        <Input placeholder="05XX XXX XX XX" {...field} data-testid="user-phone" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addUserForm.control}
                  name="rol"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rol *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} data-testid="user-role">
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Rol seçin" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="consultant">Danışman</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={addUserForm.control}
                  name="departman"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Departman</FormLabel>
                      <FormControl>
                        <Input placeholder="Satış, Pazarlama, vs." {...field} data-testid="user-department" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addUserForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Şifre *</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="En az 6 karakter" {...field} data-testid="user-password" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={addUserForm.control}
                name="notlar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notlar</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Kullanıcı hakkında notlar..."
                        className="resize-none"
                        {...field}
                        data-testid="user-notes"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddModalOpen(false)}
                  data-testid="cancel-user"
                >
                  İptal
                </Button>
                <Button
                  type="submit"
                  disabled={addUserMutation.isPending}
                  data-testid="submit-user"
                >
                  {addUserMutation.isPending ? "Ekleniyor..." : "Kullanıcı Ekle"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
