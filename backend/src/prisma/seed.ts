import bcrypt from "bcrypt";
import { db } from "./db.js";

async function main() {
  console.log("🌱 Starting database seeding...");

  const passwordHash = await bcrypt.hash("password123", 10);

  // 1. Seed Users (All 4 Roles)
  const users = [
    {
      name: "Ahmed Player",
      email: "player@koora.com",
      password: passwordHash,
      phone: "+201011112233",
      role: "PLAYER" as const,
    },
    {
      name: "Mohamed Field Owner",
      email: "owner@koora.com",
      password: passwordHash,
      phone: "+201022223344",
      role: "OWNER" as const,
    },
    {
      name: "Tarek Tournament Organizer",
      email: "organizer@koora.com",
      password: passwordHash,
      phone: "+201033334455",
      role: "ORGANIZER" as const,
    },
    {
      name: "System Administrator",
      email: "admin@koora.com",
      password: passwordHash,
      phone: "+201044445566",
      role: "ADMIN" as const,
    },
  ];

  const createdUsers: Record<string, any> = {};

  for (const u of users) {
    let existing = await db.orm.public.User.where({ email: u.email }).first();
    if (!existing) {
      existing = await db.orm.public.User.create(u);
      console.log(`  ✓ Created user: ${u.email} (${u.role})`);
    } else {
      console.log(`  ~ User already exists: ${u.email}`);
    }
    createdUsers[u.role] = existing;
  }

  // 2. Seed Fields (Pitches) for Owner
  const owner = createdUsers["OWNER"];
  if (owner) {
    const fields = [
      {
        name: "ملعب أرينا ويمبلي - Wembley Arena (5v5)",
        description: "نجيل صناعي تركي درجة أولى، إضاءة ليلية كاشفة، غرف ملابس متطورة وموقف سيارات مجاني.",
        address: "التجمع الخامس، القاهرة الجديدة",
        pricePerHour: 350,
        ownerId: owner.id,
      },
      {
        name: "ملعب كامب نو ريزيدنس - Camp Nou Stadium (7v7)",
        description: "ملعب سباعي بمواصفات دولية مع شاشات عرض النتائج وغرف تبديل مكيفة.",
        address: "مدينة الشيخ زايد، الجيزة",
        pricePerHour: 500,
        ownerId: owner.id,
      },
    ];

    for (const f of fields) {
      const existing = await db.orm.public.Field.where({ name: f.name }).first();
      if (!existing) {
        await db.orm.public.Field.create(f);
        console.log(`  ✓ Created field: ${f.name}`);
      }
    }
  }

  // 3. Seed Tournament for Organizer
  const organizer = createdUsers["ORGANIZER"];
  if (organizer) {
    const tournamentName = "بطولة أبطال كورة أرينا - Koora Champions Cup";
    const existingTourn = await db.orm.public.Tournament.where({ name: tournamentName }).first();

    if (!existingTourn) {
      const nextMonth = new Date();
      nextMonth.setDate(nextMonth.getDate() + 14);
      const endDate = new Date(nextMonth);
      endDate.setDate(endDate.getDate() + 7);

      await db.orm.public.Tournament.create({
        name: tournamentName,
        description: "بطولة خماسية بنظام خروج المغلوب مع جوائز نقدية وميداليات للمراكز الثلاثة الأولى.",
        startDate: nextMonth.toISOString(),
        endDate: endDate.toISOString(),
        organizerId: organizer.id,
      });
      console.log(`  ✓ Created tournament: ${tournamentName}`);
    }
  }

  console.log("\n🎉 Database seeded successfully!");
  console.log("-----------------------------------------");
  console.log("Test Accounts (Password for all: password123):");
  console.log("  • PLAYER:    player@koora.com");
  console.log("  • OWNER:     owner@koora.com");
  console.log("  • ORGANIZER: organizer@koora.com");
  console.log("  • ADMIN:     admin@koora.com");
  console.log("-----------------------------------------");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  });
