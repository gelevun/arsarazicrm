import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertClientSchema, 
  consultantUpdateClientSchema,
  insertPropertySchema, 
  insertTransactionSchema,
  insertDocumentSchema,
  insertReportSchema,
  insertAccountingSchema,
  insertUserSchema,
  type User
} from "@shared/schema";

// Extend Express Request type
declare module 'express-serve-static-core' {
  interface Request {
    user?: User;
  }
}

function requireAuth(req: Request, res: Response, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Giriş yapmanız gerekiyor" });
  }
  next();
}

function requireAdmin(req: Request, res: Response, next: any) {
  if (!req.isAuthenticated() || !req.user || req.user.rol !== "admin") {
    return res.status(403).json({ message: "Bu işlem için admin yetkisi gerekiyor" });
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Dashboard stats
  app.get("/api/dashboard/stats", requireAuth, async (req: Request, res: Response) => {
    try {
      const consultantId = req.user?.rol === "consultant" ? req.user.id : undefined;
      const stats = await storage.getDashboardStats(consultantId);
      res.json(stats);
    } catch (error) {
      console.error("Dashboard stats error:", error);
      res.status(500).json({ message: "Dashboard verileri alınırken hata oluştu" });
    }
  });

  // Clients routes
  app.get("/api/clients", requireAuth, async (req: Request, res: Response) => {
    try {
      const clients = req.user?.rol === "admin" 
        ? await storage.getAllClients()
        : await storage.getClientsByConsultant(req.user!.id);
      res.json(clients);
    } catch (error) {
      console.error("Get clients error:", error);
      res.status(500).json({ message: "Müşteriler alınırken hata oluştu" });
    }
  });

  app.post("/api/clients", requireAuth, async (req: Request, res: Response) => {
    try {
      // Secure RBAC: For consultants, always enforce their own ID as danisman_id
      const danisman_id = req.user!.rol === "admin" 
        ? req.body.danisman_id || req.user!.id 
        : req.user!.id; // Force consultant's own ID

      const validatedData = insertClientSchema.parse({
        ...req.body,
        danisman_id,
        olusturan_kullanici: req.user!.id,
      });

      const client = await storage.createClient(validatedData);
      res.status(201).json(client);
    } catch (error) {
      console.error("Create client error:", error);
      if (error && typeof error === 'object' && 'name' in error && error.name === "ZodError") {
        return res.status(400).json({ message: "Geçersiz müşteri verisi", errors: (error as any).errors });
      }
      res.status(500).json({ message: "Müşteri oluşturulurken hata oluştu" });
    }
  });

  app.put("/api/clients/:id", requireAuth, async (req, res) => {
    try {
      const client = await storage.getClient(req.params.id);
      if (!client) {
        return res.status(404).json({ message: "Müşteri bulunamadı" });
      }

      // Check permissions
      if (req.user?.rol !== "admin" && client.danisman_id !== req.user?.id) {
        return res.status(403).json({ message: "Bu müşteriyi düzenleme yetkiniz yok" });
      }

      // Secure RBAC: Use restricted schema for consultants to prevent protected field manipulation
      const validatedData = req.user?.rol === "admin" 
        ? insertClientSchema.partial().parse(req.body)
        : consultantUpdateClientSchema.parse(req.body);

      const updatedClient = await storage.updateClient(req.params.id, validatedData);
      res.json(updatedClient);
    } catch (error) {
      console.error("Update client error:", error);
      if (error && typeof error === 'object' && 'name' in error && error.name === "ZodError") {
        return res.status(400).json({ message: "Geçersiz güncelleme verisi", errors: (error as any).errors });
      }
      res.status(500).json({ message: "Müşteri güncellenirken hata oluştu" });
    }
  });

  app.delete("/api/clients/:id", requireAuth, async (req, res) => {
    try {
      const client = await storage.getClient(req.params.id);
      if (!client) {
        return res.status(404).json({ message: "Müşteri bulunamadı" });
      }

      // Check permissions
      if (req.user?.rol !== "admin" && client.danisman_id !== req.user?.id) {
        return res.status(403).json({ message: "Bu müşteriyi silme yetkiniz yok" });
      }

      await storage.deleteClient(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Delete client error:", error);
      res.status(500).json({ message: "Müşteri silinirken hata oluştu" });
    }
  });

  // Properties routes
  app.get("/api/properties", requireAuth, async (req, res) => {
    try {
      const properties = req.user?.rol === "admin" 
        ? await storage.getAllProperties()
        : await storage.getPropertiesByConsultant(req.user!.id);
      res.json(properties);
    } catch (error) {
      console.error("Get properties error:", error);
      res.status(500).json({ message: "Gayrimenkuller alınırken hata oluştu" });
    }
  });

  app.post("/api/properties", requireAuth, async (req: Request, res: Response) => {
    try {
      const validatedData = insertPropertySchema.parse({
        ...req.body,
        danisman_id: req.body.danisman_id || req.user!.id,
      });

      const property = await storage.createProperty(validatedData);
      res.status(201).json(property);
    } catch (error) {
      console.error("Create property error:", error);
      res.status(500).json({ message: "Gayrimenkul oluşturulurken hata oluştu" });
    }
  });

  app.put("/api/properties/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const property = await storage.getProperty(req.params.id);
      if (!property) {
        return res.status(404).json({ message: "Gayrimenkul bulunamadı" });
      }

      // Check permissions
      if (req.user?.rol !== "admin" && property.danisman_id !== req.user?.id) {
        return res.status(403).json({ message: "Bu gayrimenkulü düzenleme yetkiniz yok" });
      }

      const validatedData = insertPropertySchema.partial().parse(req.body);
      const updatedProperty = await storage.updateProperty(req.params.id, validatedData);
      res.json(updatedProperty);
    } catch (error) {
      console.error("Update property error:", error);
      res.status(500).json({ message: "Gayrimenkul güncellenirken hata oluştu" });
    }
  });

  app.delete("/api/properties/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const property = await storage.getProperty(req.params.id);
      if (!property) {
        return res.status(404).json({ message: "Gayrimenkul bulunamadı" });
      }

      // Check permissions
      if (req.user?.rol !== "admin" && property.danisman_id !== req.user?.id) {
        return res.status(403).json({ message: "Bu gayrimenkulü silme yetkiniz yok" });
      }

      await storage.deleteProperty(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Delete property error:", error);
      res.status(500).json({ message: "Gayrimenkul silinirken hata oluştu" });
    }
  });

  // Transactions routes
  app.get("/api/transactions", requireAuth, async (req: Request, res: Response) => {
    try {
      const transactions = req.user?.rol === "admin" 
        ? await storage.getAllTransactions()
        : await storage.getTransactionsByConsultant(req.user!.id);
      res.json(transactions);
    } catch (error) {
      console.error("Get transactions error:", error);
      res.status(500).json({ message: "İşlemler alınırken hata oluştu" });
    }
  });

  app.post("/api/transactions", requireAuth, async (req: Request, res: Response) => {
    try {
      const validatedData = insertTransactionSchema.parse({
        ...req.body,
        danisman_id: req.body.danisman_id || req.user!.id,
      });

      const transaction = await storage.createTransaction(validatedData);
      res.status(201).json(transaction);
    } catch (error) {
      console.error("Create transaction error:", error);
      res.status(500).json({ message: "İşlem oluşturulurken hata oluştu" });
    }
  });

  // Users routes (Admin only)
  app.get("/api/users", requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({ message: "Kullanıcılar alınırken hata oluştu" });
    }
  });

  app.post("/api/users", requireAdmin, async (req: Request, res: Response) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if username or email already exists
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Bu kullanıcı adı zaten kullanılıyor" });
      }
      
      const existingEmail = await storage.getUserByEmail(validatedData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Bu e-posta adresi zaten kullanılıyor" });
      }

      const user = await storage.createUser(validatedData);
      res.status(201).json(user);
    } catch (error) {
      console.error("Create user error:", error);
      if (error && typeof error === 'object' && 'name' in error && error.name === "ZodError") {
        return res.status(400).json({ message: "Geçersiz kullanıcı verisi", errors: (error as any).errors });
      }
      res.status(500).json({ message: "Kullanıcı oluşturulurken hata oluştu" });
    }
  });

  // Documents routes
  app.get("/api/documents", requireAuth, async (req, res) => {
    try {
      const documents = await storage.getAllDocuments();
      res.json(documents);
    } catch (error) {
      console.error("Get documents error:", error);
      res.status(500).json({ message: "Belgeler alınırken hata oluştu" });
    }
  });

  app.post("/api/documents", requireAuth, async (req: Request, res: Response) => {
    try {
      const validatedData = insertDocumentSchema.parse({
        ...req.body,
        olusturan: req.user!.id,
      });

      const document = await storage.createDocument(validatedData);
      res.status(201).json(document);
    } catch (error) {
      console.error("Create document error:", error);
      res.status(500).json({ message: "Belge oluşturulurken hata oluştu" });
    }
  });

  // Reports routes
  app.get("/api/reports", requireAuth, async (req: Request, res: Response) => {
    try {
      const reports = req.user?.rol === "admin"
        ? await storage.getAllReports()
        : await storage.getReportsByConsultant(req.user!.id);
      res.json(reports);
    } catch (error) {
      console.error("Get reports error:", error);
      res.status(500).json({ message: "Raporlar alınırken hata oluştu" });
    }
  });

  // Accounting routes (Admin only)
  app.get("/api/accounting", requireAdmin, async (req, res) => {
    try {
      const accounting = await storage.getAllAccounting();
      res.json(accounting);
    } catch (error) {
      console.error("Get accounting error:", error);
      res.status(500).json({ message: "Muhasebe verileri alınırken hata oluştu" });
    }
  });

  app.post("/api/accounting", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertAccountingSchema.parse(req.body);
      const accounting = await storage.createAccounting(validatedData);
      res.status(201).json(accounting);
    } catch (error) {
      console.error("Create accounting error:", error);
      res.status(500).json({ message: "Muhasebe kaydı oluşturulurken hata oluştu" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
