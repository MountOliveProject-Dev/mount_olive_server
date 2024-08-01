"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GOOGLE_DRIVE_PRIVATE_KEY = void 0;
const client_1 = require("@prisma/client");
const Helpers_1 = require("../src/Helpers/");
//import { listAudioFiles} from "../src/Handlers/googleHandlers";
const firebaseHandler_1 = require("../src/Handlers/firebaseHandler");
exports.GOOGLE_DRIVE_PRIVATE_KEY = "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQCqBclF/xfl/ttV\noWmiCDf7wltvHg2BreumPmxK+ixTvhHJk0J2uUAYna03KPfeDrs1YVwC7r8FE1+C\nRva3Nh9seQIvNAicH/5s6M38WAiF6LnZNKRbbwEGXfu+Ze1iyUe1QWHrzkbKazUa\nXamCb96HI6CvMCxsd568Z1pHNZsykdSq08bJUwRY1qlvnsCObsrtzxpbrbY7Z8vH\nDJDtk3jf0NVHBspQZlPum489k1Qi3xRSFUtrcTcicCilqru+5G1X0Mtej1+u5Nc1\n7RpdbmVPVEwjd8oJ2tFdZi8d+RQ3x0jIovOp0ZOkHxMuONP/bWUjq8RVF9gvHOWY\nVJSpreVjAgMBAAECggEABzqwNYPwKT6YZvpgymdbgx6wniBRUeJ7q4skNhgbV/HW\n8GovqQ16mhRBKLd96MG2xuQ6jzDRIrrLpg7AqfWGCYcE8BOC/3r8mDzOahmyhCsZ\nrD8LuRe5hHoERWF2kI5q20T+eO9BozfOYlzWtOJAjcNz0h2rTeNgAkH4Yn28+UmM\nxb7E76Rrec049FKxFXSyOl/YpJ4FyqYt+EwVHSgQIrX8JWAxPN0Q9WfvhLwMJO4R\nH4nT564QWlUsuxIALQ5AMaHF85ybOnMqarUYQgo/8HrhFrNdQnIGovdIll83u0D9\n48ZGkeTkjrI8EHdBaZImT2OSlh6VSRB4VmLGxhjG9QKBgQDexMigxoDCGm+3/ciN\nljiC8TPsoL47WQHNw9uLDqjP+IcetUQsjnZvRTGsM0w0exyiG5KPLQvNeIo6DFAQ\nWzGM0yPV0I4aV9BfrMCP31sVrMQ/pCgq2o6fGvSLE1vEEvmWKeXWaGnAoP5O6IJc\nUKwhgJa70ue52kvZN6kCeebblQKBgQDDYrSO6pKqotvdNFE7bcYa+RiHB59DGafi\nap0rMG8HLEluCQddf64oIANZABqFJJOzeL+Lgs2wWWs3A83qs9tI27hLCVITWJJ1\nzU9lT5j8YHi6kXwDwasH0Bd1ZUK9+JTrC23WcmRBEzc6yySu78aEDM79a7Xlad9u\nPTtdMKy/FwKBgQDV+2BcT1DPImW97uD+YBXYcajW23DfwReid0gjwukVHD1umd/q\njM3nBCg6qOvCXZ+bd7DIJxT3QZpFOB6QF4j5JLd/Yt2dIEzgGii+CmaL43B/UUfk\nIhxtaI8OKII1TaTBQW2tDo7God6mHWFbG4K8i7A+qtA8DhxdgsGtxzqiIQKBgQCC\ngai3GWnz/io7u9lSh8VeeOnwL6AqkrV339yxX32Z3fQCQpef1Uv/0zpJNW+BZWge\n5dWTm0BGvcOGkMz3K0GajeCwhj5DW9MgSo3wztUSJmIdxFWAsNjLtCwnJwcIm0Tl\nJtIr/maGrQ4kAFK1YsVHqMKNtWdfIHO0T8QaQAvy6wKBgQDNX21Iic2upEV/ZiSe\nFxeyiaU44ptFRsMg0mcu/+6ekv7aD6SDnUHpsJjJ5/a0cr5VCbhnixbLzG+4V9Yn\n95JQAEz5dMBmsdiJwJNh7D1y0pso/FFckPZNUgsW7sc+Q2Jlt/z7KqnD5KKhFRgW\n5CEn1bpDgCrebZFjUzmQPzr/Cg==\n-----END PRIVATE KEY-----\n";
const prisma = new client_1.PrismaClient();
async function main() {
    const event1 = await prisma.event.create({
        data: {
            title: "Event 1",
            description: "Event 1 Description",
            thumbnail: "https://via.placeholder.com/151",
            date: "2021-09-01",
            time: "12:00",
            venue: "Venue 1",
            location: "Location 1",
            host: "Host 1",
            createdAt: (0, Helpers_1.getCurrentDate)(),
            updatedAt: (0, Helpers_1.getCurrentDate)()
        }
    });
    //hjh
    console.log(event1.title + " created");
    const event2 = await prisma.event.create({
        data: {
            title: "Event 2",
            description: "Event 2 Description",
            thumbnail: "https://via.placeholder.com/152",
            date: "2021-09-02",
            time: "12:00",
            venue: "Venue 2",
            location: "Location 2",
            host: "Host 1",
            createdAt: (0, Helpers_1.getCurrentDate)(),
            updatedAt: (0, Helpers_1.getCurrentDate)()
        }
    });
    console.log(event2.title + " created");
    const event3 = await prisma.event.create({
        data: {
            title: "Event 3",
            description: "Event 3 Description",
            thumbnail: "https://via.placeholder.com/153",
            date: "2021-09-03",
            time: "12:00",
            venue: "Venue 3",
            location: "Location 3",
            host: "Host 1",
            createdAt: (0, Helpers_1.getCurrentDate)(),
            updatedAt: (0, Helpers_1.getCurrentDate)(),
        },
    });
    console.log(event1.title + " created");
    const event4 = await prisma.event.create({
        data: {
            title: "Event 4",
            description: "Event 4 Description",
            thumbnail: "https://via.placeholder.com/154",
            date: "2021-09-04",
            time: "12:00",
            venue: "Venue 4",
            location: "Location 4",
            host: "Host 1",
            createdAt: (0, Helpers_1.getCurrentDate)(),
            updatedAt: (0, Helpers_1.getCurrentDate)(),
        },
    });
    console.log(event2.title + " created");
    const notification1 = await prisma.notification.create({
        data: {
            title: "A New Event titled" + event1.title + "has just been posted!",
            description: event1.description,
            createdAt: (0, Helpers_1.getCurrentDate)(),
            updatedAt: (0, Helpers_1.getCurrentDate)(),
            read: false
        }
    });
    console.log(notification1.title + " created");
    const notificationEngagementsforNotification1 = await prisma.notificationEngagements.create({
        data: {
            notificationId: notification1.id,
            eventId: event1.id,
            specialKey: "specialKey",
            type: Helpers_1.NotificationType.EVENT,
        },
    });
    const notification2 = await prisma.notification.create({
        data: {
            title: "A New Event titled" + event2.title + "has just been posted!",
            description: event2.description,
            createdAt: (0, Helpers_1.getCurrentDate)(),
            updatedAt: (0, Helpers_1.getCurrentDate)(),
            read: false
        }
    });
    console.log(notification2.title + " created");
    const notificationEngagementsforNotification2 = await prisma.notificationEngagements.create({
        data: {
            notificationId: notification2.id,
            specialKey: "specialKey2",
            eventId: event2.id,
            type: Helpers_1.NotificationType.EVENT,
        },
    });
    const notification3 = await prisma.notification.create({
        data: {
            title: "A New Event titled" + event3.title + "has just been posted!",
            description: event3.description,
            createdAt: (0, Helpers_1.getCurrentDate)(),
            updatedAt: (0, Helpers_1.getCurrentDate)(),
            read: false
        }
    });
    console.log(notification3.title + " created");
    const notificationEngagementsforNotification3 = await prisma.notificationEngagements.create({
        data: {
            notificationId: notification3.id,
            specialKey: "specialKey3",
            eventId: event3.id,
            type: Helpers_1.NotificationType.EVENT,
        },
    });
    const notification4 = await prisma.notification.create({
        data: {
            title: "A New Event titled" + event4.title + "has just been posted!",
            description: event4.description,
            createdAt: (0, Helpers_1.getCurrentDate)(),
            updatedAt: (0, Helpers_1.getCurrentDate)(),
            read: false
        }
    });
    console.log(notification4.title + " created");
    const notificationEngagementsforNotification4 = await prisma.notificationEngagements.create({
        data: {
            notificationId: notification4.id,
            specialKey: "specialKey4",
            eventId: event4.id,
            type: Helpers_1.NotificationType.EVENT,
        },
    });
    //listAndShareAudioFiles();
    //listAndShareAudioFiles();
    (0, firebaseHandler_1.getAllFirebaseUsers)();
}
main().catch((e) => {
    console.error(e);
    process.exit(1);
}).finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=initSeed.js.map