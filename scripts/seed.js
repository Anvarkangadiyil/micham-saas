const fs = require("fs");
const path = require("path");
const { MongoClient, ObjectId } = require("mongodb");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

// Load Environment Variables manually from .env.local
const envPath = path.join(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, "utf8");
  envFile.split("\n").forEach((line) => {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith("#")) return;
    const [key, ...valueParts] = trimmedLine.split("=");
    if (key && valueParts.length > 0) {
      process.env[key.trim()] = valueParts.join("=").trim();
    }
  });
}

const dbUrl = process.env.DATA_BASE_URL;

if (!dbUrl) {
  console.error("❌ ERROR: DATA_BASE_URL environment variable is not defined in .env.local");
  process.exit(1);
}

async function seed() {
  console.log("🌱 Connecting to MongoDB database...");
  const client = new MongoClient(dbUrl);

  try {
    await client.connect();
    console.log("✅ Connected successfully!");

    const db = client.db();

    // 1. Clean collections
    console.log("🧹 Cleaning existing database collections...");
    await db.collection("users").deleteMany({});
    await db.collection("clients").deleteMany({});
    await db.collection("projects").deleteMany({});
    await db.collection("expenses").deleteMany({});
    await db.collection("incomes").deleteMany({});
    await db.collection("invoices").deleteMany({});

    // 2. Create Seed User
    console.log("👤 Creating demo user...");
    const demoUserEmail = "demo@freelancer.com";
    const hashedPassword = await bcrypt.hash("password123", 12);
    const userIdStr = new ObjectId().toString();

    const user = {
      _id: new ObjectId(userIdStr),
      name: "Alex Morgan",
      email: demoUserEmail,
      password: hashedPassword,
      currencySymbol: "$",
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.collection("users").insertOne(user);
    console.log(`✅ Demo User created: ${demoUserEmail} (Password: password123)`);

    // 3. Create Clients
    console.log("👥 Creating clients...");
    const clientAId = new ObjectId();
    const clientBId = new ObjectId();
    const clientCId = new ObjectId();

    const clients = [
      {
        _id: clientAId,
        name: "Acme Corp",
        email: "billing@acme.com",
        company: "Acme Corporation",
        notes: "Enterprise software services contract.",
        userId: userIdStr,
        isDeleted: false,
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      },
      {
        _id: clientBId,
        name: "Stark Industries",
        email: "pepper@stark.com",
        company: "Stark Industries Inc.",
        notes: "HUD interface consulting and hardware design.",
        userId: userIdStr,
        isDeleted: false,
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      },
      {
        _id: clientCId,
        name: "Wayne Enterprises",
        email: "alfred@wayne.com",
        company: "Wayne Enterprises",
        notes: "Cave safety system integration project.",
        userId: userIdStr,
        isDeleted: false,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    ];
    await db.collection("clients").insertMany(clients);
    console.log("✅ Clients seeded!");

    // 4. Create Projects
    console.log("📁 Creating projects...");
    const projA1Id = new ObjectId();
    const projA2Id = new ObjectId();
    const projB1Id = new ObjectId();
    const projC1Id = new ObjectId();

    const projects = [
      {
        _id: projA1Id,
        clientId: clientAId,
        userId: userIdStr,
        name: "E-Commerce Rebuild",
        status: "active",
        rateType: "fixed",
        isDeleted: false,
        createdAt: new Date(Date.now() - 85 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 85 * 24 * 60 * 60 * 1000),
      },
      {
        _id: projA2Id,
        clientId: clientAId,
        userId: userIdStr,
        name: "Mobile App Maintenance",
        status: "active",
        rateType: "hourly",
        isDeleted: false,
        createdAt: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000),
      },
      {
        _id: projB1Id,
        clientId: clientBId,
        userId: userIdStr,
        name: "Iron HUD Graphic Redesign",
        status: "active",
        rateType: "hourly",
        isDeleted: false,
        createdAt: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000),
      },
      {
        _id: projC1Id,
        clientId: clientCId,
        userId: userIdStr,
        name: "Batcave Security Upgrade",
        status: "active",
        rateType: "fixed",
        isDeleted: false,
        createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
      },
    ];
    await db.collection("projects").insertMany(projects);
    console.log("✅ Projects seeded!");

    // Helper functions to offset dates easily for monthly chart distribution
    const getPastDate = (daysAgo) => new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

    // 5. Create Income Records
    console.log("💰 Creating income records...");
    const incomes = [
      {
        userId: userIdStr,
        amount: 3500.0,
        date: getPastDate(120), // ~4 months ago
        clientId: clientAId,
        projectId: projA1Id,
        source: "Stripe",
        notes: "E-commerce Project milestone 1 deposit.",
        isDeleted: false,
        createdAt: getPastDate(120),
        updatedAt: getPastDate(120),
      },
      {
        userId: userIdStr,
        amount: 8000.0,
        date: getPastDate(90), // ~3 months ago
        clientId: clientCId,
        projectId: projC1Id,
        source: "Bank Transfer",
        notes: "Batcave project kick-off fee.",
        isDeleted: false,
        createdAt: getPastDate(90),
        updatedAt: getPastDate(90),
      },
      {
        userId: userIdStr,
        amount: 4500.0,
        date: getPastDate(60), // ~2 months ago
        clientId: clientBId,
        projectId: projB1Id,
        source: "Stripe",
        notes: "HUD design retainers - Stark Corp.",
        isDeleted: false,
        createdAt: getPastDate(60),
        updatedAt: getPastDate(60),
      },
      {
        userId: userIdStr,
        amount: 2200.0,
        date: getPastDate(30), // ~1 month ago
        clientId: clientAId,
        projectId: projA2Id,
        source: "Upwork Invoice",
        notes: "Hourly coding work for Acme mobile App.",
        isDeleted: false,
        createdAt: getPastDate(30),
        updatedAt: getPastDate(30),
      },
      {
        userId: userIdStr,
        amount: 5200.0,
        date: getPastDate(5), // This month
        clientId: clientBId,
        projectId: projB1Id,
        source: "Stripe",
        notes: "Consulting retainer Stark HUD Phase II.",
        isDeleted: false,
        createdAt: getPastDate(5),
        updatedAt: getPastDate(5),
      },
    ];
    await db.collection("incomes").insertMany(incomes);
    console.log("✅ Income records seeded!");

    // 6. Create Expense Records
    console.log("💸 Creating expense records...");
    const expenses = [
      {
        id: uuidv4(),
        userId: userIdStr,
        amount: 1599.0,
        category: "equipment",
        description: "Apple Studio Display & Keyboard",
        date: getPastDate(115), // ~4 months ago
        clientId: null,
        projectId: null,
        notes: "Home office gear upgrade.",
        isDeleted: false,
        createdAt: getPastDate(115),
        updatedAt: getPastDate(115),
      },
      {
        id: uuidv4(),
        userId: userIdStr,
        amount: 250.0,
        category: "marketing",
        description: "Google Search Ads Campaign",
        date: getPastDate(85), // ~3 months ago
        clientId: null,
        projectId: null,
        notes: "Portfolio marketing promo.",
        isDeleted: false,
        createdAt: getPastDate(85),
        updatedAt: getPastDate(85),
      },
      {
        id: uuidv4(),
        userId: userIdStr,
        amount: 20.0,
        category: "software",
        description: "Vercel Professional Pro Team Hosting",
        date: getPastDate(60), // ~2 months ago
        clientId: clientAId,
        projectId: projA1Id,
        notes: "Client hosting allocation (Acme).",
        isDeleted: false,
        createdAt: getPastDate(60),
        updatedAt: getPastDate(60),
      },
      {
        id: uuidv4(),
        userId: userIdStr,
        amount: 45.5,
        category: "travel",
        description: "Uber rides to Stark HQ",
        date: getPastDate(28), // ~1 month ago
        clientId: clientBId,
        projectId: projB1Id,
        notes: "Travel to onsite consulting.",
        isDeleted: false,
        createdAt: getPastDate(28),
        updatedAt: getPastDate(28),
      },
      {
        id: uuidv4(),
        userId: userIdStr,
        amount: 19.0,
        category: "software",
        description: "GitHub Copilot Business Subscription",
        date: getPastDate(15), // ~1 month ago
        clientId: null,
        projectId: null,
        notes: "AI assistant tools.",
        isDeleted: false,
        createdAt: getPastDate(15),
        updatedAt: getPastDate(15),
      },
      {
        id: uuidv4(),
        userId: userIdStr,
        amount: 124.6,
        category: "software",
        description: "OpenAI GPT-4 API Usage",
        date: getPastDate(2), // This month
        clientId: null,
        projectId: null,
        notes: "AI summarizer API expenses.",
        isDeleted: false,
        createdAt: getPastDate(2),
        updatedAt: getPastDate(2),
      },
    ];
    await db.collection("expenses").insertMany(expenses);
    console.log("✅ Expense records seeded!");

    // 7. Create Invoices
    console.log("📄 Creating invoices...");
    const invoices = [
      {
        userId: userIdStr,
        clientId: clientAId,
        projectId: projA1Id,
        invoiceNumber: "INV-2026-001",
        issueDate: getPastDate(60),
        dueDate: getPastDate(30),
        lineItems: [
          { description: "UI/UX Design Wireframes", quantity: 1, rate: 1500.0 },
          { description: "Frontend NextJS Development", quantity: 1, rate: 2000.0 },
        ],
        status: "paid",
        notes: "Paid in full via Stripe integration.",
        isDeleted: false,
        createdAt: getPastDate(60),
        updatedAt: getPastDate(60),
      },
      {
        userId: userIdStr,
        clientId: clientBId,
        projectId: projB1Id,
        invoiceNumber: "INV-2026-002",
        issueDate: getPastDate(15),
        dueDate: getPastDate(-15), // Due in 15 days
        lineItems: [
          { description: "HUD Holographic Vector Design", quantity: 40, rate: 120.0 },
        ],
        status: "sent",
        notes: "Sent link to client via email.",
        isDeleted: false,
        createdAt: getPastDate(15),
        updatedAt: getPastDate(15),
      },
      {
        userId: userIdStr,
        clientId: clientCId,
        projectId: projC1Id,
        invoiceNumber: "INV-2026-003",
        issueDate: getPastDate(45),
        dueDate: getPastDate(15), // Overdue by 15 days
        lineItems: [
          { description: "Security System Firmware Design", quantity: 1, rate: 8000.0 },
        ],
        status: "overdue",
        notes: "Needs follow-up with Alfred.",
        isDeleted: false,
        createdAt: getPastDate(45),
        updatedAt: getPastDate(45),
      },
      {
        userId: userIdStr,
        clientId: clientAId,
        invoiceNumber: "INV-2026-004",
        issueDate: new Date(),
        dueDate: getPastDate(-30), // Due in 30 days
        lineItems: [
          { description: "Ad-hoc developer consulting", quantity: 10, rate: 150.0 },
        ],
        status: "draft",
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    await db.collection("invoices").insertMany(invoices);
    console.log("✅ Invoices seeded!");

    console.log("\n🚀 SEEDING COMPLETED SUCCESSFULY!");
    console.log("-----------------------------------------");
    console.log("Use these credentials to log in:");
    console.log(`📧 Email:    ${demoUserEmail}`);
    console.log("🔑 Password: password123");
    console.log("-----------------------------------------");
  } catch (error) {
    console.error("❌ ERROR RUNNING SEED:", error);
  } finally {
    await client.close();
  }
}

seed();
