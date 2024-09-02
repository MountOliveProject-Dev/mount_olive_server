import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient();

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

    // const event2 = await prisma.event.create({
    //   data: {
    //     title: "Event 2",
    //     description: "Event 2 Description",
    //     thumbnail: "https://via.placeholder.com/152",
    //     date: "2021-09-02",
    //     time: "12:00",
    //     uniqueId: "clzazn87l0001i0hvpj8g61nf",
    //     venue: "Venue 2",
    //     location: "Location 2",
    //     host: "Host 1",
    //     createdAt: getCurrentDate(),
    //     updatedAt: getCurrentDate(),
    //   },
    // });
    // console.log(event2.title + " created");
    // const event3 = await prisma.event.create({
    //     data: {
    //       title: "Event 3",
    //       description: "Event 3 Description",
    //       thumbnail: "https://via.placeholder.com/153",
    //       date: "2021-09-03",
    //       time: "12:00",
    //       venue: "Venue 3",
    //       location: "Location 3",
    //       uniqueId: "clzazn89v0003i0hvdw0wje8u",
    //       host: "Host 1",
    //       createdAt: getCurrentDate(),
    //       updatedAt: getCurrentDate(),
    //     },
    // });
    // console.log(event3.title + " created");

    // const event4 = await prisma.event.create({
    //     data: {
    //       title: "Event 4",
    //       description: "Event 4 Description",
    //       thumbnail: "https://via.placeholder.com/154",
    //       date: "2021-09-04",
    //       time: "12:00",
    //       venue: "Venue 4",
    //       location: "Location 4",
    //       uniqueId: "clzazn88q0002i0hv7l64kd6y",
    //       host: "Host 1",
    //       createdAt: getCurrentDate(),
    //       updatedAt: getCurrentDate(),
    //     },
    // });
    // console.log(event4.title + " created");

    // const title1 =  "A New Event titled " + event1.title + " has just been posted!";
    // const title2 = "A New Event titled " + event2.title + " has just been posted!";
    // const title3 = "A New Event titled " + event3.title + " has just been posted!";
    // const title4 = "A New Event titled " + event4.title + " has just been posted!";
    // const specialKey1 = event1.uniqueId + NotificationType.EVENT;
    // const specialKey2 = event2.uniqueId + NotificationType.EVENT;
    // const specialKey3 = event3.uniqueId + NotificationType.EVENT;
    // const specialKey4 = event4.uniqueId + NotificationType.EVENT;
    // const notification1 = await createEventNotificationHandler(
    //    event1.uniqueId,
    //    specialKey1,
    //    title1,
    //    event1.description,
    //    false
    // );
    // console.log(notification1);

    // const notification2 = await createEventNotificationHandler(
    //    event2.uniqueId,
    //    specialKey2,
    //    title2,
    //   event2.description,
    //    false
    // );
    // console.log(notification2);

    // const notification3 = await createEventNotificationHandler(
    //    event3.uniqueId,
    //    specialKey3,
    //    title3,
    //    event3.description,
    //    false
    // );
    // console.log(notification3);

    // const notification4 = await createEventNotificationHandler(
    //    event4.uniqueId,
    //    specialKey4,
    //    title4,
    //    event4.description,
    //    false
    // );
    // console.log(notification4);

//listAndShareAudioFiles();
//listAndShareAudioFiles();
//getAllFirebaseUsers();
//const mountOlive = createFolder("Mount Olive Church");
//console.log(mountOlive);

// const audioFile = {
//   name: "jama.mp3",
//   mimeType: "audio/mpeg",
//   body: "C:\\Users\\aatog\\Downloads\\Music\\ytmp3free.cc_trending-jama-gospel-songs-to-energize-your-day-from-ghana-best-morale-group-youtubemp3free.org.mp3",
// };

// // create a pop to select audio file from my drive

// // createAudioFile(audioFile);
// listAndShareAudioFiles();
// getAllFilesInGoogleDriveFolder();




    
}
main().catch((e: Error) => {
    console.error(e);
    process.exit(1);
  }).finally(async () => {
    await prisma.$disconnect();
});
