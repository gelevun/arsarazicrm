import { 
  users, clients, properties, transactions, documents, reports, accounting,
  type User, type InsertUser, type UpdateUser, type Client, type InsertClient,
  type Property, type InsertProperty, type Transaction, type InsertTransaction,
  type Document, type InsertDocument, type Report, type InsertReport,
  type Accounting, type InsertAccounting
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

type SessionStore = any; // session.Store;

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<UpdateUser>): Promise<User>;
  getAllUsers(): Promise<User[]>;
  
  // Clients
  getClient(id: string): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: string, client: Partial<InsertClient>): Promise<Client>;
  deleteClient(id: string): Promise<void>;
  getClientsByConsultant(consultantId: string): Promise<Client[]>;
  getAllClients(): Promise<Client[]>;
  
  // Properties
  getProperty(id: string): Promise<Property | undefined>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: string, property: Partial<InsertProperty>): Promise<Property>;
  deleteProperty(id: string): Promise<void>;
  getPropertiesByConsultant(consultantId: string): Promise<Property[]>;
  getAllProperties(): Promise<Property[]>;
  
  // Transactions
  getTransaction(id: string): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: string, transaction: Partial<InsertTransaction>): Promise<Transaction>;
  deleteTransaction(id: string): Promise<void>;
  getTransactionsByConsultant(consultantId: string): Promise<Transaction[]>;
  getAllTransactions(): Promise<Transaction[]>;
  
  // Documents
  getDocument(id: string): Promise<Document | undefined>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: string, document: Partial<InsertDocument>): Promise<Document>;
  deleteDocument(id: string): Promise<void>;
  getDocumentsByProperty(propertyId: string): Promise<Document[]>;
  getAllDocuments(): Promise<Document[]>;
  
  // Reports
  getReport(id: string): Promise<Report | undefined>;
  createReport(report: InsertReport): Promise<Report>;
  getReportsByConsultant(consultantId: string): Promise<Report[]>;
  getAllReports(): Promise<Report[]>;
  
  // Accounting
  getAccounting(id: string): Promise<Accounting | undefined>;
  createAccounting(accounting: InsertAccounting): Promise<Accounting>;
  getAccountingByMonthYear(month: number, year: number): Promise<Accounting[]>;
  getAllAccounting(): Promise<Accounting[]>;
  
  // Dashboard stats
  getDashboardStats(consultantId?: string): Promise<{
    totalRevenue: string;
    totalTransactions: number;
    totalClients: number;
    totalProperties: number;
  }>;
  
  sessionStore: SessionStore;
}

export class DatabaseStorage implements IStorage {
  sessionStore: SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        guncellenme_tarihi: new Date(),
      })
      .returning();
    return user;
  }

  async updateUser(id: string, updateUser: Partial<UpdateUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...updateUser,
        guncellenme_tarihi: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.olusturulma_tarihi));
  }

  // Clients
  async getClient(id: string): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client || undefined;
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const [client] = await db
      .insert(clients)
      .values({
        ...insertClient,
        guncellenme_tarihi: new Date(),
      })
      .returning();
    return client;
  }

  async updateClient(id: string, updateClient: Partial<InsertClient>): Promise<Client> {
    const [client] = await db
      .update(clients)
      .set({
        ...updateClient,
        guncellenme_tarihi: new Date(),
      })
      .where(eq(clients.id, id))
      .returning();
    return client;
  }

  async deleteClient(id: string): Promise<void> {
    await db.delete(clients).where(eq(clients.id, id));
  }

  async getClientsByConsultant(consultantId: string): Promise<Client[]> {
    return await db
      .select()
      .from(clients)
      .where(eq(clients.danisman_id, consultantId))
      .orderBy(desc(clients.olusturulma_tarihi));
  }

  async getAllClients(): Promise<Client[]> {
    return await db.select().from(clients).orderBy(desc(clients.olusturulma_tarihi));
  }

  // Properties
  async getProperty(id: string): Promise<Property | undefined> {
    const [property] = await db.select().from(properties).where(eq(properties.id, id));
    return property || undefined;
  }

  async createProperty(insertProperty: InsertProperty): Promise<Property> {
    const [property] = await db
      .insert(properties)
      .values({
        ...insertProperty,
        son_guncelleme_tarihi: new Date(),
      })
      .returning();
    return property;
  }

  async updateProperty(id: string, updateProperty: Partial<InsertProperty>): Promise<Property> {
    const [property] = await db
      .update(properties)
      .set({
        ...updateProperty,
        son_guncelleme_tarihi: new Date(),
      })
      .where(eq(properties.id, id))
      .returning();
    return property;
  }

  async deleteProperty(id: string): Promise<void> {
    await db.delete(properties).where(eq(properties.id, id));
  }

  async getPropertiesByConsultant(consultantId: string): Promise<Property[]> {
    return await db
      .select()
      .from(properties)
      .where(eq(properties.danisman_id, consultantId))
      .orderBy(desc(properties.olusturulma_tarihi));
  }

  async getAllProperties(): Promise<Property[]> {
    return await db.select().from(properties).orderBy(desc(properties.olusturulma_tarihi));
  }

  // Transactions
  async getTransaction(id: string): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction || undefined;
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db
      .insert(transactions)
      .values({
        ...insertTransaction,
        guncellenme_tarihi: new Date(),
      })
      .returning();
    return transaction;
  }

  async updateTransaction(id: string, updateTransaction: Partial<InsertTransaction>): Promise<Transaction> {
    const [transaction] = await db
      .update(transactions)
      .set({
        ...updateTransaction,
        guncellenme_tarihi: new Date(),
      })
      .where(eq(transactions.id, id))
      .returning();
    return transaction;
  }

  async deleteTransaction(id: string): Promise<void> {
    await db.delete(transactions).where(eq(transactions.id, id));
  }

  async getTransactionsByConsultant(consultantId: string): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.danisman_id, consultantId))
      .orderBy(desc(transactions.olusturulma_tarihi));
  }

  async getAllTransactions(): Promise<Transaction[]> {
    return await db.select().from(transactions).orderBy(desc(transactions.olusturulma_tarihi));
  }

  // Documents
  async getDocument(id: string): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document || undefined;
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const [document] = await db
      .insert(documents)
      .values({
        ...insertDocument,
        guncellenme_tarihi: new Date(),
      })
      .returning();
    return document;
  }

  async updateDocument(id: string, updateDocument: Partial<InsertDocument>): Promise<Document> {
    const [document] = await db
      .update(documents)
      .set({
        ...updateDocument,
        guncellenme_tarihi: new Date(),
      })
      .where(eq(documents.id, id))
      .returning();
    return document;
  }

  async deleteDocument(id: string): Promise<void> {
    await db.delete(documents).where(eq(documents.id, id));
  }

  async getDocumentsByProperty(propertyId: string): Promise<Document[]> {
    return await db
      .select()
      .from(documents)
      .where(eq(documents.gayrimenkul_id, propertyId))
      .orderBy(desc(documents.olusturulma_tarihi));
  }

  async getAllDocuments(): Promise<Document[]> {
    return await db.select().from(documents).orderBy(desc(documents.olusturulma_tarihi));
  }

  // Reports
  async getReport(id: string): Promise<Report | undefined> {
    const [report] = await db.select().from(reports).where(eq(reports.id, id));
    return report || undefined;
  }

  async createReport(insertReport: InsertReport): Promise<Report> {
    const [report] = await db
      .insert(reports)
      .values(insertReport)
      .returning();
    return report;
  }

  async getReportsByConsultant(consultantId: string): Promise<Report[]> {
    return await db
      .select()
      .from(reports)
      .where(eq(reports.danisman_id, consultantId))
      .orderBy(desc(reports.olusturulma_tarihi));
  }

  async getAllReports(): Promise<Report[]> {
    return await db.select().from(reports).orderBy(desc(reports.olusturulma_tarihi));
  }

  // Accounting
  async getAccounting(id: string): Promise<Accounting | undefined> {
    const [accountingRecord] = await db.select().from(accounting).where(eq(accounting.id, id));
    return accountingRecord || undefined;
  }

  async createAccounting(insertAccounting: InsertAccounting): Promise<Accounting> {
    const [accountingRecord] = await db
      .insert(accounting)
      .values({
        ...insertAccounting,
        guncellenme_tarihi: new Date(),
      })
      .returning();
    return accountingRecord;
  }

  async getAccountingByMonthYear(month: number, year: number): Promise<Accounting[]> {
    return await db
      .select()
      .from(accounting)
      .where(and(eq(accounting.ay, month), eq(accounting.yil, year)))
      .orderBy(desc(accounting.olusturulma_tarihi));
  }

  async getAllAccounting(): Promise<Accounting[]> {
    return await db.select().from(accounting).orderBy(desc(accounting.olusturulma_tarihi));
  }

  // Dashboard stats
  async getDashboardStats(consultantId?: string): Promise<{
    totalRevenue: string;
    totalTransactions: number;
    totalClients: number;
    totalProperties: number;
  }> {
    const transactionFilter = consultantId ? eq(transactions.danisman_id, consultantId) : undefined;
    const clientFilter = consultantId ? eq(clients.danisman_id, consultantId) : undefined;
    const propertyFilter = consultantId ? eq(properties.danisman_id, consultantId) : undefined;

    // Calculate total revenue
    const revenueResult = await db
      .select({
        total: sql<string>`COALESCE(SUM(${transactions.tutar}), 0)::text`,
      })
      .from(transactions)
      .where(transactionFilter);

    // Count transactions
    const transactionResult = await db
      .select({
        count: sql<number>`COUNT(*)::int`,
      })
      .from(transactions)
      .where(transactionFilter);

    // Count clients
    const clientResult = await db
      .select({
        count: sql<number>`COUNT(*)::int`,
      })
      .from(clients)
      .where(clientFilter);

    // Count properties
    const propertyResult = await db
      .select({
        count: sql<number>`COUNT(*)::int`,
      })
      .from(properties)
      .where(propertyFilter);

    return {
      totalRevenue: revenueResult[0]?.total || "0",
      totalTransactions: transactionResult[0]?.count || 0,
      totalClients: clientResult[0]?.count || 0,
      totalProperties: propertyResult[0]?.count || 0,
    };
  }
}

export const storage = new DatabaseStorage();
