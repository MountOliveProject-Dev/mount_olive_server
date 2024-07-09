import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";


const prisma = new PrismaClient();

async function main() {
    const event1 = await prisma.event.create({
        data: {
            title: "Event 1",
            description: "Event 1 Description",
            thumbnail: "https://via.placeholder.com/150",
            date: new Date(),
            host: "Host 1",
            createdAt: new Date(),
            updatedAt: new Date()
        }
    });
    console.log(event1.title + " created");

    const event2 = await prisma.event.create({
        data: {
            title: "Event 2",
            description: "Event 2 Description",
            thumbnail: "https://via.placeholder.com/150",
            date: new Date(),
            host: "Host 2",
            createdAt: new Date(),
            updatedAt: new Date()
        }
    });
    console.log(event2.title + " created");


    
}
main().catch((e: Error) => {
    console.error(e);
    process.exit(1);
  }).finally(async () => {
    await prisma.$disconnect();
});
