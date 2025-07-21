import { prisma } from "../src/core/prisma";

async function main() {
  await prisma.user.create({
    data: {
      email: "admin@example.com",
      passwordHash: "HASHED",
      role: "ADMIN",
    },
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
