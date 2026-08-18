require("dotenv").config({ path: ".env.local" });
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const bcrypt = require("bcryptjs");

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  const email = "demo@kardex.pe";
  const password = "Demo1234!";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log("La cuenta demo ya existe:", email);
    await prisma.$disconnect();
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const clinic = await prisma.clinic.create({
    data: { name: "Clínica Demo", slug: "clinica-demo" },
  });

  await prisma.user.create({
    data: {
      clinicId: clinic.id,
      role: "admin",
      firstName: "Ana",
      lastName: "Demo",
      email,
      passwordHash,
    },
  });

  await prisma.patient.createMany({
    data: [
      {
        clinicId: clinic.id,
        firstName: "María",
        lastName: "Quispe",
        documentId: "44718820",
        phone: "987654321",
        email: "maria.quispe@example.com",
      },
      {
        clinicId: clinic.id,
        firstName: "Carlos",
        lastName: "Rojas",
        documentId: "41234567",
        phone: "912345678",
        email: "carlos.rojas@example.com",
      },
    ],
  });

  console.log("Cuenta demo creada:");
  console.log("  Clínica:", clinic.name);
  console.log("  Email:", email);
  console.log("  Password:", password);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
