import Hapi from "@hapi/hapi";
import server from "../server";
import {
  executePrismaMethod,
  getCurrentDate,
  LogType,
  NotificationType,
  log,
  RequestType,
} from "../Helpers";
import { EventInput, ManyEventInput } from "../Interfaces";
import {
  createEventNotificationHandler,
  updateEventNotificationHandler,
  deleteEventNotificationHandler,
  
} from "./notificationHandlers";

import { createThumbnailFile, deleteThumbnailFromDrive, updateThumbnailFile, updateThumbnailHelper } from "./mediaHandlers";
import fs from "fs";




export async function listEventsHandler(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const { prisma } = server.app;

    try{
        const events = await executePrismaMethod(prisma, "event", "findMany",
            {
                orderBy: [
                    {
                    updatedAt: "desc",
                    },
                ],
            }
        );
        if(!events|| events.length === 0){
            let details = "There are no events in the system";
            let logtype = LogType.WARNING;
            if(!events){
                details = "failed to retrieve events from the database" + details.toString();
                logtype = LogType.ERROR
            }
            log(RequestType.READ,"No events found", logtype,details);
            return h.response({message: "No events found"}).code(404);
        }
        log(RequestType.READ,"Events found", LogType.INFO);
        return h.response(events).code(200);
    }catch(err:any){
        log(RequestType.READ,"Internal Server Error", LogType.ERROR,err.toString());
        return h.response({message: "Internal Server Error"}).code(500);
    }
}

export async function pushThumbnailToDriveHandler(name: string, filePath: string, mimeType: string) {
    const prisma = server.app.prisma;

  try {
    // Ensure the filePath is provided and is a string
    if (!filePath || typeof filePath !== "string") {
      log(RequestType.CREATE, "Invalid file path provided", LogType.ERROR);
      return "Invalid file path provided";
    }

    const shareableLink = await createThumbnailFile(name, mimeType, filePath);

    // Remove the file from the 'uploads' directory after processing
    fs.unlink(filePath, (err:any) => {
      if (err) {
        log(RequestType.CREATE, "Failed to delete file", LogType.ERROR, err.toString());
      }
    });

    return shareableLink;
  } catch (error:any) {
    log(RequestType.CREATE, "Error uploading thumbnail to Google Drive", LogType.ERROR, error.toString()|| "Error uploading thumbnail to Google Drive");
    return "Error uploading thumbnail to Google Drive";
  }
}
export async function pushThumbnailReplacementToDriveHandler(name: string, filePath: string, mimeType: string, uniqueId: string) {
    const prisma = server.app.prisma;

  try {
    // Ensure the filePath is provided and is a string
    if (!filePath || typeof filePath !== "string") {
      log(RequestType.UPDATE, "Invalid file path provided", LogType.ERROR);
      return "Invalid file path provided";
    }

    const shareableLink = await updateThumbnailFile(name, mimeType, filePath, uniqueId);

    // Remove the file from the 'uploads' directory after processing
    fs.unlink(filePath, (err:any) => {
      if (err) {
        log(RequestType.UPDATE, "Failed to delete file", LogType.ERROR, err.toString());
      }
    });

    return shareableLink;
  } catch (error:any) {
    log(RequestType.UPDATE, "Error uploading thumbnail to Google Drive", LogType.ERROR, error.toString()|| "Error uploading thumbnail to Google Drive");
    return "Error uploading thumbnail to Google Drive";
  }
}

export async function createEventHandler(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const { prisma } = request.server.app;
    const {
      title,
      description,
      date,
      host,
      time,
      location,
      venue,
      uploadThumbnail,
      name,
      mimeType,
      filePath,
    } = request.payload as EventInput;

    try{
        if(uploadThumbnail === true){
            const thumbnailLink = await pushThumbnailToDriveHandler(name,filePath,mimeType)
                  const event = await executePrismaMethod(
                    prisma,
                    "event",
                    "create",
                    {
                      data: {
                        title: title,
                        description: description,
                        location: location,
                        thumbnail: thumbnailLink,
                        venue: venue,
                        time: time,
                        date: date,
                        host: host,
                        createdAt: getCurrentDate(),
                        updatedAt: getCurrentDate(),
                      },
                    }
                  );
                  if (!event) {
                    log(RequestType.CREATE, "Failed to create the event", LogType.ERROR, event.toString());
                    return h
                      .response({ message: "Failed to create the event" })
                      .code(400);
                  }
                  const notificationTitle =
                    "A New Event titled " +
                    event.title +
                    " has just been posted!";
                  const specialKey = event.uniqueId + NotificationType.EVENT;
                  const createNotification =
                    await createEventNotificationHandler(
                      event.uniqueId,
                      specialKey,
                      notificationTitle,
                      description,
                      false,
                      uploadThumbnail
                    );
                  if (!createNotification) {
                    log(RequestType.CREATE, "Failed to create the notification", LogType.ERROR, createNotification.toString());
                    return h
                      .response({
                        message: "Failed to create the notification",
                      })
                      .code(400);
                  }
                  log(RequestType.CREATE, "Event created successfully", LogType.INFO);
                  return h.response(event).code(201);
        }else if(uploadThumbnail === false){
            const event = await executePrismaMethod(prisma, "event", "create", {
            data: {
                title: title,
                description: description,
                location: location,
                venue: venue,
                time: time,
                date: date,
                host: host,
                createdAt: getCurrentDate(),
                updatedAt: getCurrentDate(),
            },
            });
            if(!event){
                log(RequestType.CREATE, "Failed to create the event", LogType.ERROR, event.toString());
                return h.response({message: "Failed to create the event"}).code(400);
            }
            const notificationTitle = "A New Event titled " + event.title + " has just been posted!";
            const specialKey = event.uniqueId + NotificationType.EVENT;
            const createNotification = await createEventNotificationHandler(
            event.uniqueId,
            specialKey,
            notificationTitle,
            description,
            false,
            uploadThumbnail
            );
            if(!createNotification){
                log(RequestType.CREATE, "Failed to create the notification", LogType.ERROR, createNotification.toString());
                return h.response({message: "Failed to create the notification"}).code(400);
            }
            log(RequestType.CREATE, "Event created successfully", LogType.INFO);
            return h.response(event).code(201);
        }else{
            log(RequestType.CREATE, "Bad request, thumbnail status is undefined", LogType.ERROR);
            return h.response({message: "Bad request, thumbnail status is undefined"}).code(400);
        }
    }catch(err:any){
        log(RequestType.CREATE, "Internal Server Error", LogType.ERROR, err.toString());
        return h.response({message: "Internal Server Error" + ":failed to create the event:" + title}).code(500);
    }
}

//create an update events handler

export async function updateEventHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const { prisma } = request.server.app;
  const {
    uniqueId,
    title,
    description,
    date,
    host,
    time,
    location,
    venue,
    uploadThumbnail,
    name,
    mimeType,
    filePath,
  } = request.payload as EventInput;
  let thumbnailLink: any = null;
  try {
    const findEvent = await executePrismaMethod(prisma, "event", "findUnique", {
      where: {
        uniqueId: uniqueId,
      },
      select: {
        id: true,
        thumbnail: true,
        eventNotifications: {
          select: {
            notificationId: true,
          },
        },
      },
    });

    if (!findEvent) {
      log(RequestType.UPDATE, "Event not found", LogType.WARNING);
      return h.response({ message: "Event not found" }).code(404);
    }

    if (uploadThumbnail === true) {
      let fileId: any = "";
      if (
        findEvent.thumbnail !== null &&
        findEvent.thumbnail !== undefined &&
        findEvent.thumbnail !== "Invalid file path provided" &&
        findEvent.thumbnail !== "Error uploading thumbnail to Google Drive"
      ) {
        fileId = await extractFileIdFromDriveLink(findEvent.thumbnail);
      } else if (
        findEvent.thumbnail === "Invalid file path provided" ||
        findEvent.thumbnail === "Error uploading thumbnail to Google Drive"
      ) {
        fileId = findEvent.thumbnail;
      }
      thumbnailLink = await updateThumbnailHelper(
        fileId,
        name,
        mimeType,
        filePath,
        uploadThumbnail
      );
      

      if (thumbnailLink === "Thumbnail not found") {
        log(RequestType.UPDATE, "Thumbnail not found", LogType.WARNING);
        return h.response({ message: "Thumbnail not found" }).code(404);
      } else if (thumbnailLink === "Error updating thumbnail") {
        log(RequestType.UPDATE, "Error updating thumbnail", LogType.ERROR);
        return h
          .response({ message: "Couldn't update thumbnail, please try again" })
          .code(400);
      } else {
        log(RequestType.UPDATE, thumbnailLink.toString(), LogType.INFO);
      }

      const event = await executePrismaMethod(prisma, "event", "update", {
        where: {
          id: findEvent.id,
          uniqueId: uniqueId,
        },
        data: {
          title: title || findEvent.title,
          description: description || findEvent.description,
          thumbnail: thumbnailLink || findEvent.thumbnail,
          location: location || findEvent.location,
          venue: venue || findEvent.venue,
          time: time || findEvent.time,
          date: date || findEvent.date,
          host: host || findEvent.host,
          updatedAt: getCurrentDate(),
        },
      });
      if (!event) {
        log(
          RequestType.UPDATE,
          "Failed to update the event",
          LogType.ERROR,
          event.toString()
        );
        return h.response({ message: "Failed to update the event" }).code(400);
      }
      const notificationTitle =
        "The Event titled " + findEvent.title + " has just been updated!";
      const specialKey = event.uniqueId + NotificationType.EVENT;
      const updateNotification = await updateEventNotificationHandler(
        findEvent.eventNotifications.notificationId,
        event.uniqueId,
        specialKey,
        notificationTitle,
        description,
        false
      );
      if (updateNotification.code == 500) {
        log(
          RequestType.UPDATE,
          "Failed to update the event",
          LogType.ERROR,
          updateNotification.message
        );
        return h.response({ message: "Failed to update the event" }).code(400);
      } else if (updateNotification.code == 200) {
        log(RequestType.UPDATE, "Event updated successfully", LogType.INFO);
        return h.response({ message: "Event updated successfully!" }).code(201);
      }
    } else if (uploadThumbnail === false) {
      const event = await executePrismaMethod(prisma, "event", "update", {
        where: {
          id: findEvent.id,
          uniqueId: uniqueId,
        },
        data: {
          title: title || findEvent.title,
          description: description || findEvent.description,
          location: location || findEvent.location,
          venue: venue || findEvent.venue,
          time: time || findEvent.time,
          date: date || findEvent.date,
          host: host || findEvent.host,
          updatedAt: getCurrentDate(),
        },
      });
      if (!event) {
        log(
          RequestType.UPDATE,
          "Failed to update the event",
          LogType.ERROR,
          event.toString()
        );
        return h.response({ message: "Failed to update the event" }).code(400);
      }
      const notificationTitle =
        "The Event titled " + findEvent.title + " has just been updated!";
      const specialKey = event.uniqueId + NotificationType.EVENT;
      const updateNotification = await updateEventNotificationHandler(
        findEvent.eventNotifications.notificationId,
        event.uniqueId,
        specialKey,
        notificationTitle,
        description,
        false
      );
      if (updateNotification.code == 500) {
        log(
          RequestType.UPDATE,
          "Failed to update the event",
          LogType.ERROR,
          updateNotification.message
        );
        return h.response({ message: "Failed to update the event" }).code(400);
      } else if (updateNotification.code == 200) {
        log(RequestType.UPDATE, "Event updated successfully", LogType.INFO);
        return h.response({ message: "Event updated successfully!" }).code(201);
      }
    } else {
      log(
        RequestType.UPDATE,
        "Bad request, thumbnail status is undefined",
        LogType.ERROR
      );
      return h
        .response({ message: "Bad request, thumbnail status is undefined" })
        .code(400);
    }
  } catch (err: any) {
    log(
      RequestType.UPDATE,
      "Internal Server Error",
      LogType.ERROR,
      err.toString()
    );
    return h
      .response({
        message:
          "Internal Server Error: failed to update the event: " + uniqueId,
      })
      .code(500);
  }
}
// create many events
export async function createManyEventsHandler(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const { prisma } = request.server.app;
    const { events } = request.payload as ManyEventInput;
    // add the createdAt and updatedAt to events
    events.forEach((event) => {
        event.createdAt = getCurrentDate();
        event.updatedAt = getCurrentDate();
    });

    try{
        const createdEventIds: number[] = []; // Assuming IDs are strings, change to number[] if they are numbers

        for (const event of events) {
            const createdEvent = await executePrismaMethod(prisma, "event", "create", {
                data: event,
            });
            createdEventIds.push(parseInt(createdEvent.id));
        }
       

        if (createdEventIds.length === 0) {
            log(RequestType.CREATE, "Failed to create the events", LogType.ERROR);
            return h.response({ message: "Failed to create the events" }).code(400);
        }
        //create notification for each event
        for (let i = 0; i < createdEventIds.length; i++) {
          //use the id from the createdEvents to get the uniqueId
          const event = await executePrismaMethod(
            prisma,
            "event",
            "findUnique",
            {
              where: {
                id: createdEventIds[i],
              },
              select: {
                uniqueId: true,
                title: true,
                description: true,
              },
            }
          );
          const notificationTitle = "A New Event titled " + event.title + " has just been posted!";
          const specialKey = event.uniqueId + NotificationType.EVENT;
          const createNotification = await createEventNotificationHandler(
            event.uniqueId,
            specialKey,
            notificationTitle,
            event.description,
            false,
            false
          );
          if (!createNotification) {
            log(RequestType.CREATE, "Failed to create the notification", LogType.ERROR, createNotification);
            return h
              .response({ message: "Failed to create the notification" })
              .code(400);
          }
        }
         log(RequestType.CREATE, "Events created successfully", LogType.INFO);
        return h.response().code(201);
    }catch(err:any){
        log(RequestType.CREATE, "Internal Server Error", LogType.ERROR, err.toString());
        return h.response({message: "Internal Server Error" + ":failed to create the events"}).code(500);
    }
}


//create a function to extract the id from this link: https://drive.google.com/file/d/${response.data.id}/view?usp=sharing
export async function extractFileIdFromDriveLink(link: string) {
    const splitLink = link.split("/");
    const fileId = splitLink[5];
    return fileId;
}
export async function deleteEventHandler(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const { prisma } = request.server.app;
    const { uniqueId } = request.payload as EventInput;

    try{
       const findEvent = await executePrismaMethod(prisma, "event", "findUnique", {
            where: {
                uniqueId: uniqueId,
            },
             select:{
                id:true,
                uniqueId:true,
                thumbnail:true,
                eventNotifications: {
                    select:{
                        notificationId: true
                    }
                }
            }
        });
         
        if(!findEvent){
            log(RequestType.READ, "Event not found ", LogType.WARNING,findEvent.toString());
            return h.response({message: "Event not found"}).code(404);
        }

        if(findEvent.thumbnail !== null){
           const fileId = await extractFileIdFromDriveLink(findEvent.thumbnail);

            const deleteThumbnail = await deleteThumbnailFromDrive(fileId);
            if (deleteThumbnail === true) {
                const deleteThumbnailMedia = await executePrismaMethod(
                  prisma,
                  "media",
                  "delete",
                  {
                    where: {
                      fileId: fileId,
                    },
                  }
                );
                if (!deleteThumbnailMedia) {
                  log(RequestType.DELETE, "Failed to delete the thumbnail", LogType.ERROR, deleteThumbnailMedia.toString());
                 
                }
                const specialKey = findEvent.uniqueId + NotificationType.EVENT;

                const deleteNotification = await deleteEventNotificationHandler(
                  findEvent.eventNotifications.notificationId,
                  findEvent.uniqueId,
                  specialKey
                );

                if (!deleteNotification) {
                  log(RequestType.DELETE, "Failed to delete the notification", LogType.ERROR, deleteNotification?.toString());
                  return h
                    .response({ message: "Failed to delete the notification" })
                    .code(400);
                } else {
                  log(RequestType.DELETE, "Notification deleted", LogType.WARNING);
                }

                const eventDeletion = await executePrismaMethod(
                  prisma,
                  "event",
                  "delete",
                  {
                    where: {
                      id: findEvent.id,
                    },
                  }
                );

                if (!eventDeletion) {
                  log(RequestType.DELETE, "Failed to delete the event", LogType.ERROR, eventDeletion.toString());
                  return h
                    .response({ message: "Failed to delete the event" })
                    .code(400);
                } else {
                  log(RequestType.DELETE, "Event deleted", LogType.INFO);
                }
                const message =
                  "Event with uniqueId: " +
                  uniqueId +
                  " was deleted successfully";
                return h.response(message).code(201).message(message);
              } else {
                log(RequestType.DELETE, "Failed to delete the thumbnail", LogType.ERROR, deleteThumbnail.toString());
                
                return h
                  .response({ message: "Failed to delete event" })
                  .code(400);
              }
        }
          const specialKey = findEvent.uniqueId + NotificationType.EVENT;

          const deleteNotification = await deleteEventNotificationHandler(
            findEvent.eventNotifications.notificationId,
            findEvent.uniqueId,
            specialKey
          );

          if (!deleteNotification) {
            log(RequestType.DELETE, "Failed to delete the notification", LogType.ERROR, deleteNotification?.toString());
            return h
              .response({ message: "Failed to delete the notification" })
              .code(400);
          } else {
            log(RequestType.DELETE, "Notification deleted", LogType.INFO);
          }

          const eventDeletion = await executePrismaMethod(
            prisma,
            "event",
            "delete",
            {
              where: {
                id: findEvent.id,
              },
            }
          );

          if (!eventDeletion) {
            log(RequestType.DELETE, "Failed to delete the event", LogType.ERROR, eventDeletion.toString());
            return h
              .response({ message: "Failed to delete the event" })
              .code(400);
          } else {
            log(RequestType.DELETE, "Event deleted", LogType.INFO);
          }
          const message =
            "Event with uniqueId: " + uniqueId + " was deleted successfully";
          return h.response(message).code(201).message(message); 
      
    }catch(err:any){
        log(RequestType.DELETE, "Internal Server Error", LogType.ERROR, err.toString());
        return h.response({message: "Internal Server Error" + ":failed to delete the event:" + uniqueId}).code(500);
    }
}

export async function getEventHandler(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const { prisma } = server.app;
    const { uniqueId } = request.params as EventInput;

    try{
        const event = await executePrismaMethod(prisma, "event", "findUnique", {
            where: {
                uniqueId: uniqueId,
            },
        });
        if(!event|| event.length === 0){
            let details = "Event not found";
            let logtype = LogType.WARNING;
            if(!event){
                details = "failed to retrieve the event with id:" + uniqueId + " from the database" + event.toString();
                logtype = LogType.ERROR
            }
            log(RequestType.READ, "Event not found", logtype, details);
            return h.response({message: "Event not found"}).code(404);
        }
        log(RequestType.READ, "Event found", LogType.INFO);
        return h.response(event).code(200);
    }catch(err:any){
        log(RequestType.READ, "Internal Server Error", LogType.ERROR, err.toString());
        return h.response({message: "Internal Server Error" + ":failed to get the event:" + uniqueId}).code(500);
    }
}

export async function searchEventByTitleOrUniqueIDHandler(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const { prisma } = server.app;
    const { search } = request.payload as any;

    try{
        const event = await executePrismaMethod(prisma, "event", "findMany", {
            where: {
                OR: [
                    {
                        title: {
                            contains: search,
                        },
                    },
                    {
                        uniqueId: {
                            contains: search,
                        },
                    },
                ],
            },
        });
        if(!event){
            log(RequestType.READ, "Event not found", LogType.WARNING);
            return h.response({message: "Event not found"}).code(404);
        }
        log(RequestType.READ, "Event found", LogType.INFO);
        return h.response(event).code(200);
    }catch(err:any){
        log(RequestType.READ, "Internal Server Error", LogType.ERROR, err);
        return h.response({message: "Internal Server Error" + ":failed to search the event:" + search}).code(500);
    }
}

export async function listEventsByDateHandler(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const { prisma } = server.app;
    const { date } = request.payload as any;

    try{
        const events = await executePrismaMethod(prisma, "event", "findMany", {
            where: {
                createdAt: date,
            },
        });
        if(!events){

            return h.response({message: "No events found"}).code(404);
        }
        return h.response(events).code(200);
    }catch(err){
        console.log(err);
        return h.response({message: "Internal Server Error" + ":failed to list events by date:" + date}).code(500);
    }
}

export async function listEventsByDateRangeHandler(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const { prisma } = server.app;
    const { startDate, endDate } = request.payload as any;

    try{
        const events = await executePrismaMethod(prisma, "event", "findMany", {
            where: {
                AND: [
                    {
                        createdAt: {
                            gte: startDate,
                        },
                    },
                    {
                        createdAt: {
                            lte: endDate,
                        },
                    },
                ],
            },
        });
        if(!events){
            return h.response({message: "No events found"}).code(404);
        }
        return h.response(events).code(200);
    }catch(err){
        console.log(err);
        return h.response({message: "Internal Server Error" + ":failed to list events by date range:" + startDate + " - " + endDate}).code(500);
    }
}