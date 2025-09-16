import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building } from "lucide-react";
import { Redirect } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi giriniz"),
  password: z.string().min(1, "Parola gereklidir"),
});

const registerSchema = z.object({
  ad: z.string().min(2, "Ad en az 2 karakter olmalıdır"),
  soyad: z.string().min(2, "Soyad en az 2 karakter olmalıdır"),
  email: z.string().email("Geçerli bir e-posta adresi giriniz"),
  username: z.string().min(3, "Kullanıcı adı en az 3 karakter olmalıdır"),
  password: z.string().min(6, "Parola en az 6 karakter olmalıdır"),
  telefon: z.string().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState("login");

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { ad: "", soyad: "", email: "", username: "", password: "", telefon: "" },
  });

  // Redirect if already logged in
  if (user) {
    return <Redirect to="/" />;
  }

  const onLogin = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  const onRegister = (data: RegisterFormData) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Auth forms */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="mx-auto h-16 w-16 bg-primary rounded-xl flex items-center justify-center mb-4">
              <Building className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">GayriCRM</h1>
            <p className="text-muted-foreground mt-1">Gayrimenkul Yönetim Sistemi</p>
          </div>

          <Card className="border shadow-xl">
            <CardHeader>
              <CardTitle className="text-center">Hesabınıza Giriş Yapın</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login" data-testid="login-tab">Giriş Yap</TabsTrigger>
                  <TabsTrigger value="register" data-testid="register-tab">Kayıt Ol</TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="space-y-4">
                  <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                    <div>
                      <Label htmlFor="email">E-posta</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="ornek@gayricrm.com"
                        {...loginForm.register("email")}
                        data-testid="input-email"
                      />
                      {loginForm.formState.errors.email && (
                        <p className="text-sm text-destructive mt-1">
                          {loginForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="password">Parola</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        {...loginForm.register("password")}
                        data-testid="input-password"
                      />
                      {loginForm.formState.errors.password && (
                        <p className="text-sm text-destructive mt-1">
                          {loginForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={loginMutation.isPending}
                      data-testid="button-login"
                    >
                      {loginMutation.isPending ? "Giriş yapılıyor..." : "Giriş Yap"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="register" className="space-y-4">
                  <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="ad">Ad</Label>
                        <Input
                          id="ad"
                          placeholder="Adınız"
                          {...registerForm.register("ad")}
                          data-testid="input-firstname"
                        />
                        {registerForm.formState.errors.ad && (
                          <p className="text-sm text-destructive mt-1">
                            {registerForm.formState.errors.ad.message}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="soyad">Soyad</Label>
                        <Input
                          id="soyad"
                          placeholder="Soyadınız"
                          {...registerForm.register("soyad")}
                          data-testid="input-lastname"
                        />
                        {registerForm.formState.errors.soyad && (
                          <p className="text-sm text-destructive mt-1">
                            {registerForm.formState.errors.soyad.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="register-email">E-posta</Label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="ornek@gayricrm.com"
                        {...registerForm.register("email")}
                        data-testid="input-register-email"
                      />
                      {registerForm.formState.errors.email && (
                        <p className="text-sm text-destructive mt-1">
                          {registerForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="username">Kullanıcı Adı</Label>
                      <Input
                        id="username"
                        placeholder="kullaniciadi"
                        {...registerForm.register("username")}
                        data-testid="input-username"
                      />
                      {registerForm.formState.errors.username && (
                        <p className="text-sm text-destructive mt-1">
                          {registerForm.formState.errors.username.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="telefon">Telefon (Opsiyonel)</Label>
                      <Input
                        id="telefon"
                        placeholder="05XX XXX XX XX"
                        {...registerForm.register("telefon")}
                        data-testid="input-phone"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="register-password">Parola</Label>
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="••••••••"
                        {...registerForm.register("password")}
                        data-testid="input-register-password"
                      />
                      {registerForm.formState.errors.password && (
                        <p className="text-sm text-destructive mt-1">
                          {registerForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={registerMutation.isPending}
                      data-testid="button-register"
                    >
                      {registerMutation.isPending ? "Kayıt oluşturuluyor..." : "Kayıt Ol"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right side - Hero section */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-950 items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="h-24 w-24 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Building className="h-12 w-12 text-primary-foreground" />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Modern Gayrimenkul Yönetimi
          </h2>
          <p className="text-lg text-muted-foreground mb-6">
            Arsa ve arazi üzerine özelleşmiş, kapsamlı CRM sistemi ile 
            gayrimenkul işlemlerinizi profesyonelce yönetin.
          </p>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>✓ Müşteri ve portföy yönetimi</p>
            <p>✓ İşlem takibi ve raporlama</p>
            <p>✓ Belge ve muhasebe sistemi</p>
            <p>✓ Mobil uyumlu PWA desteği</p>
          </div>
        </div>
      </div>
    </div>
  );
}
