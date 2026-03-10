"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Seeding database...');
    const admin = await prisma.user.upsert({
        where: { email: 'admin@newoteg.com' },
        update: {},
        create: {
            email: 'admin@newoteg.com',
            password: '$2b$10$M5.QVX8RwC3QqBRf3rVF/.qZr8d5R9y7pQb6Yz5L4t9H3K2J1M9nC',
            fullName: 'Admin User',
            role: 'ADMIN',
        },
    });
    const customer = await prisma.customer.upsert({
        where: { email: 'customer@example.com' },
        update: {},
        create: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'customer@example.com',
            phone: '+1234567890',
        },
    });
    console.log({ admin, customer });
    console.log('Seeding completed!');
}
main()
    .then(async () => {
    await prisma.$disconnect();
})
    .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
});
//# sourceMappingURL=seed.js.map