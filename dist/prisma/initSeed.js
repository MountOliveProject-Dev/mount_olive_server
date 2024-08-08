"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GOOGLE_DRIVE_PRIVATE_KEY = void 0;
const client_1 = require("@prisma/client");
const Handlers_1 = require("../src/Handlers");
exports.GOOGLE_DRIVE_PRIVATE_KEY = "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQCqBclF/xfl/ttV\noWmiCDf7wltvHg2BreumPmxK+ixTvhHJk0J2uUAYna03KPfeDrs1YVwC7r8FE1+C\nRva3Nh9seQIvNAicH/5s6M38WAiF6LnZNKRbbwEGXfu+Ze1iyUe1QWHrzkbKazUa\nXamCb96HI6CvMCxsd568Z1pHNZsykdSq08bJUwRY1qlvnsCObsrtzxpbrbY7Z8vH\nDJDtk3jf0NVHBspQZlPum489k1Qi3xRSFUtrcTcicCilqru+5G1X0Mtej1+u5Nc1\n7RpdbmVPVEwjd8oJ2tFdZi8d+RQ3x0jIovOp0ZOkHxMuONP/bWUjq8RVF9gvHOWY\nVJSpreVjAgMBAAECggEABzqwNYPwKT6YZvpgymdbgx6wniBRUeJ7q4skNhgbV/HW\n8GovqQ16mhRBKLd96MG2xuQ6jzDRIrrLpg7AqfWGCYcE8BOC/3r8mDzOahmyhCsZ\nrD8LuRe5hHoERWF2kI5q20T+eO9BozfOYlzWtOJAjcNz0h2rTeNgAkH4Yn28+UmM\nxb7E76Rrec049FKxFXSyOl/YpJ4FyqYt+EwVHSgQIrX8JWAxPN0Q9WfvhLwMJO4R\nH4nT564QWlUsuxIALQ5AMaHF85ybOnMqarUYQgo/8HrhFrNdQnIGovdIll83u0D9\n48ZGkeTkjrI8EHdBaZImT2OSlh6VSRB4VmLGxhjG9QKBgQDexMigxoDCGm+3/ciN\nljiC8TPsoL47WQHNw9uLDqjP+IcetUQsjnZvRTGsM0w0exyiG5KPLQvNeIo6DFAQ\nWzGM0yPV0I4aV9BfrMCP31sVrMQ/pCgq2o6fGvSLE1vEEvmWKeXWaGnAoP5O6IJc\nUKwhgJa70ue52kvZN6kCeebblQKBgQDDYrSO6pKqotvdNFE7bcYa+RiHB59DGafi\nap0rMG8HLEluCQddf64oIANZABqFJJOzeL+Lgs2wWWs3A83qs9tI27hLCVITWJJ1\nzU9lT5j8YHi6kXwDwasH0Bd1ZUK9+JTrC23WcmRBEzc6yySu78aEDM79a7Xlad9u\nPTtdMKy/FwKBgQDV+2BcT1DPImW97uD+YBXYcajW23DfwReid0gjwukVHD1umd/q\njM3nBCg6qOvCXZ+bd7DIJxT3QZpFOB6QF4j5JLd/Yt2dIEzgGii+CmaL43B/UUfk\nIhxtaI8OKII1TaTBQW2tDo7God6mHWFbG4K8i7A+qtA8DhxdgsGtxzqiIQKBgQCC\ngai3GWnz/io7u9lSh8VeeOnwL6AqkrV339yxX32Z3fQCQpef1Uv/0zpJNW+BZWge\n5dWTm0BGvcOGkMz3K0GajeCwhj5DW9MgSo3wztUSJmIdxFWAsNjLtCwnJwcIm0Tl\nJtIr/maGrQ4kAFK1YsVHqMKNtWdfIHO0T8QaQAvy6wKBgQDNX21Iic2upEV/ZiSe\nFxeyiaU44ptFRsMg0mcu/+6ekv7aD6SDnUHpsJjJ5/a0cr5VCbhnixbLzG+4V9Yn\n95JQAEz5dMBmsdiJwJNh7D1y0pso/FFckPZNUgsW7sc+Q2Jlt/z7KqnD5KKhFRgW\n5CEn1bpDgCrebZFjUzmQPzr/Cg==\n-----END PRIVATE KEY-----\n";
const prisma = new client_1.PrismaClient();
async function main() {
    // const event1 = await prisma.event.create({
    //   data: {
    //     title: "Event 1",
    //     description: "Event 1 Description",
    //     thumbnail: "https://via.placeholder.com/151",
    //     date: "2021-09-01",
    //     time: "12:00",
    //     venue: "Venue 1",
    //     uniqueId: "clzazn8630000i0hvld60qsnq",
    //     location: "Location 1",
    //     host: "Host 1",
    //     createdAt: getCurrentDate(),
    //     updatedAt: getCurrentDate(),
    //   },
    // });
    // //hjh
    // console.log(event1.title + " created");
    //   const event2 = await prisma.event.create({
    //     data: {
    //       title: "Event 2",
    //       description: "Event 2 Description",
    //       thumbnail: "https://via.placeholder.com/152",
    //       date: "2021-09-02",
    //       time: "12:00",
    //       uniqueId: "clzazn87l0001i0hvpj8g61nf",
    //       venue: "Venue 2",
    //       location: "Location 2",
    //       host: "Host 1",
    //       createdAt: getCurrentDate(),
    //       updatedAt: getCurrentDate(),
    //     },
    //   });
    //   console.log(event2.title + " created");
    //     const event3 = await prisma.event.create({
    //       data: {
    //         title: "Event 3",
    //         description: "Event 3 Description",
    //         thumbnail: "https://via.placeholder.com/153",
    //         date: "2021-09-03",
    //         time: "12:00",
    //         venue: "Venue 3",
    //         location: "Location 3",
    //         uniqueId: "clzazn89v0003i0hvdw0wje8u",
    //         host: "Host 1",
    //         createdAt: getCurrentDate(),
    //         updatedAt: getCurrentDate(),
    //       },
    //     });
    //     console.log(event3.title + " created");
    //     const event4 = await prisma.event.create({
    //       data: {
    //         title: "Event 4",
    //         description: "Event 4 Description",
    //         thumbnail: "https://via.placeholder.com/154",
    //         date: "2021-09-04",
    //         time: "12:00",
    //         venue: "Venue 4",
    //         location: "Location 4",
    //         uniqueId: "clzazn88q0002i0hv7l64kd6y",
    //         host: "Host 1",
    //         createdAt: getCurrentDate(),
    //         updatedAt: getCurrentDate(),
    //       },
    //     });
    //     console.log(event4.title + " created");
    //  // const title1 =  "A New Event titled " + event1.title + " has just been posted!";
    //   const title2 = "A New Event titled " + event2.title + " has just been posted!";
    //   const title3 = "A New Event titled " + event3.title + " has just been posted!";
    //   const title4 = "A New Event titled " + event4.title + " has just been posted!";
    //  // const specialKey1 = event1.uniqueId + NotificationType.EVENT;
    //   const specialKey2 = event2.uniqueId + NotificationType.EVENT;
    //   const specialKey3 = event3.uniqueId + NotificationType.EVENT;
    //   const specialKey4 = event4.uniqueId + NotificationType.EVENT;
    //   // const notification1 = await createEventNotificationHandler(
    //   //    event1.uniqueId,
    //   //    specialKey1,
    //   //    title1,
    //   //    event1.description,
    //   //    false
    //   // );
    //   // console.log(notification1);
    //   const notification2 = await createEventNotificationHandler(
    //      event2.uniqueId,
    //      specialKey2,
    //      title2,
    //     event2.description,
    //      false
    //   );
    //   console.log(notification2);
    //   const notification3 = await createEventNotificationHandler(
    //      event3.uniqueId,
    //      specialKey3,
    //      title3,
    //      event3.description,
    //      false
    //   );
    //   console.log(notification3);
    //   const notification4 = await createEventNotificationHandler(
    //      event4.uniqueId,
    //      specialKey4,
    //      title4,
    //      event4.description,
    //      false
    //   );
    //   console.log(notification4);
    //listAndShareAudioFiles();
    //listAndShareAudioFiles();
    //getAllFirebaseUsers();
    //const mountOlive = createFolder("Mount Olive Church");
    //console.log(mountOlive);
    const audioFile = {
        name: "jama.mp3",
        mimeType: "audio/mpeg",
        body: "C:\\Users\\aatog\\Downloads\\Music\\ytmp3free.cc_trending-jama-gospel-songs-to-energize-your-day-from-ghana-best-morale-group-youtubemp3free.org.mp3",
    };
    // create a pop to select audio file from my drive
    // createAudioFile(audioFile);
    (0, Handlers_1.listAndShareAudioFiles)();
    (0, Handlers_1.getAllFilesInGoogleDriveFolder)();
}
main().catch((e) => {
    console.error(e);
    process.exit(1);
}).finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=initSeed.js.map