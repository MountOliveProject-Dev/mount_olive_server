import Hapi from "@hapi/hapi";
import server from "../server";
import { executePrismaMethod, NotificationType, getCurrentDate } from "../Helpers";
import { METHODS } from "http";



export const listNotificationsHandler = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {

    const { prisma } = request.server.app;
    let data: any [] = [];
    try{
        const notifications = await executePrismaMethod(prisma, "notification", "findMany", {
            orderBy: {
                createdAt: "desc"
            },
            select:{
              id:true,
              title:true,
              description:true,
              read:true,
              createdAt:true,
              updatedAt:true

            }
        });
        if(!notifications){
            console.log("No notifications found");
            return h.response({message: "No notifications found"}).code(404);
        }
        const getMedia = await executePrismaMethod(prisma, "engagementsManager", "findMany", {
            orderBy: {
              id : "asc"
            }, select: {
              id: true,
              notificationId: true,
              mediaId: true,
              eventId: true,
              videoStatus: true,
              audioStatus: true,
              eventStatus: true,
              media: {
                select: {
                  id: true,
                  uniqueId: true,
                  title: true,
                  description: true,
                  url: true,
                  duration: true,
                  type: true,
                  postedAt: true,
                  updatedAt: true
                }
              },
              event: {
                select: {
                  id: true,
                  uniqueId: true,
                  title: true,
                  description: true,
                  url: true,
                  location: true,
                  date: true,
                  time: true,
                  venue: true,
                  host: true,
                  thumbnail: true,
                  postedAt: true,
                  updatedAt: true
                }
              }
            }
        });
        if(!getMedia){
            
            console.log("No associated media found");
        }

        for (let i = 0; i < notifications.length; i++) {
          let type = ""
          let media: any = {};
          const notificationId = notifications[i].id;
          console.log(notificationId);
          let notificationMedia: any = {};
          for (let j = 0; j < getMedia.length; j++) {
            if (getMedia[j].notificationId === notificationId && (getMedia[j].mediaId !== null || getMedia[j].mediaId !== undefined)) {
              notificationMedia = getMedia[j].media;
            }else if(getMedia[j].notificationId === notificationId && (getMedia[j].eventId !== null || getMedia[j].eventId !== undefined)){
              notificationMedia = getMedia[j].event;
            } 
          }
          console.log(notificationMedia.id);
            if(getMedia[i].videoStatus === true){
                type = NotificationType.VIDEO;

                media = {
                  id: notificationMedia.id,
                  uniqueId: notificationMedia.uniqueId,
                  title:  notificationMedia.title,
                  description: notificationMedia.description,
                  url: notificationMedia.url,
                  postedAt: notificationMedia.postedAt,
                  updatedAt: notificationMedia.updatedAt,
                }
            }else if(getMedia[i].audioStatus === true){
                type = NotificationType.AUDIO;
                media = {
                  id: notificationMedia.id,
                  uniqueId: notificationMedia.uniqueId,
                  title:  notificationMedia.title,
                  description: notificationMedia.description,
                  url: notificationMedia.url,
                  duration: notificationMedia.duration,
                  postedAt: notificationMedia.postedAt,
                  updatedAt: notificationMedia.updatedAt,
                }
            }else if(getMedia[i].eventStatus === true){
                type = NotificationType.EVENT;
                media = {
                    id: notificationMedia.id,
                    uniqueId: notificationMedia.uniqueId,
                    title:  notificationMedia.title,
                    createdAt: notificationMedia.createdAt,
                    updatedAt: notificationMedia.updatedAt,
                    date: notificationMedia.date,
                    time: notificationMedia.time,
                    location: notificationMedia.location,
                    venue: notificationMedia.venue,
                    host: notificationMedia.host,
                    description: notificationMedia.description,
                    thumbnail: notificationMedia.thumbnail
                }
            }
          const notificationData = {
            id: notifications[i].id,
            title: notifications[i].title,
            description: notifications[i].description,
            read: notifications[i].read,
            createdAt: notifications[i].createdAt,
            updatedAt: notifications[i].updatedAt,
            type: type,
            media: media
          }
          console.log(notificationData);
          data.push(notificationData);
        }
        return h.response(data).code(200);
    }catch(err){
        console.log(err);
        return h.response({message: "Internal Server Error" + ":failed to get the notifications"}).code(500);
    }
}

///
//create event notification
export const createEventNotificationHandler = async (eventId: string, specialKey: string,title: string, description: string, read: boolean) => {
    const { prisma } = server.app;
    try{

        const notification = await executePrismaMethod(
          prisma,
          "notification",
          "create",
          {
            data: {
              title: title,
              description: description,
              read: read,
              createdAt: getCurrentDate(),
              updatedAt: getCurrentDate(),
              notificationEngagements: {
                create: {
                  type: NotificationType.EVENT,
                  eventStatus: true,
                  videoStatus: false,
                  audiostatus: false,
                  specialKey: specialKey,
                  event: {
                    connect: {
                      uniqueId: eventId,
                    },
                  },
                },
              },
            },
          }
        );
        if(notification === null || notification === undefined){
            const message = "Failed to create the notification";
            console.log(message);
        }
       
        const message = "notification with ID "+ notification.id + "  was created successfully";
        console.log(message);
        return message;
    }catch(err){
        const message = err + " :Failed to create the notification!";
        console.log( message);
        return message;
    }
}

//update event notification
export const updateEventNotificationHandler = async (notificationId : number, eventId: string,specialKey: string,title: string,description: string,read: boolean) => {
  const { prisma } = server.app;
  try {
    const notificationTitle = title;
    const notification = await executePrismaMethod(
      prisma,
      "notification",
      "update",
      {
        where: {
          id: notificationId,
          notificationEngagements: {
            specialKey: specialKey,
            type: NotificationType.EVENT,
            event: {
              uniqueId: eventId,
            },
          },
        },
        data: {
          title: notificationTitle,
          description: description,
          read: read,
          updatedAt: getCurrentDate(),
        },
      }
    );
    console.log(notification);
    if (!notification) {
      const message = " Failed to update the notification :";
      console.log(notification + message);
      const code = 500;
      return { code, message };
    }else{
      const message = "notification with ID " + notification.id + " has been updated successfully";
      const code = 200;
      return { code, message };
    }

    
  } catch (err) {
    const message = err + " :Failed to update the notification";
    const code = 500;
    return {code,message};
  }
};

//delete event notification

export const deleteEventNotificationHandler = async (notificationId : number, eventId: string,specialKey: string) => {
  const { prisma } = server.app;
  try {
    const notification = await executePrismaMethod(
      prisma,
      "notification",
      "findUnique",
      {
        where: {
          id: notificationId,
          notificationEngagements: {
            specialKey: specialKey,
            type: NotificationType.EVENT,
            event: {
                uniqueId: eventId
            }
        }
      }
    }
    );
    if (!notification) {
      const message = "notification not found";
      console.log(message);
    }

    const deleteNotificationEngagement = await executePrismaMethod(prisma, "engagementsManager", "delete", {
        where: {
            specialKey: specialKey,
            type: NotificationType.EVENT,
            notificationId: notification.id,
            event: {
                uniqueId: eventId
            }
        }
    });

    if(!deleteNotificationEngagement){
        const message = "Failed to delete the notification engagement";
        console.log(message);
    }else {
        const deleteNotification = await executePrismaMethod(prisma, "notification", "delete", {
            where: {
                id: notification.id
            }
        });

        if(!deleteNotification){
            const message = "Failed to delete the notification";
            console.log(message);
        }

        const message = "Notification was deleted successfully";
        return message;
    }
  } catch (err) {
    const message = err + " :Failed to delete the notification";
    return message;
  }
};
//create media notification

export const createMediaNotificationHandler = async (mediaId: string, specialKey: string,title: string, description: string, read: boolean, type: NotificationType) => {
    const { prisma } = server.app;
    try{
        let videoStatus = false;
        let eventStatus = false;
        let audioStatus = false;
        if(type === NotificationType.VIDEO){
          videoStatus = true;
        }else if(type === NotificationType.AUDIO){
          audioStatus = true;
        }
        const notification = await executePrismaMethod(
          prisma,
          "notification",
          "create",
          {
            data: {
              title: title,
              description: description,
              read: read,
              createdAt: getCurrentDate(),
              updatedAt: getCurrentDate(),
              notificationEngagements: {
                create: {
                  type: type,
                  eventStatus: eventStatus,
                  videoStatus: videoStatus,
                  audioStatus: audioStatus,
                  specialKey: specialKey,
                  media: {
                    connect: {
                      uniqueId: mediaId,
                    },
                  },
                },
              },
            },
          }
        );
        if(notification === null || notification === undefined){
            const message = "Failed to create the notification";
            console.log(message);
        }
       
        const message = "notification with ID "+ notification.id + "  was created successfully";
        console.log(message);
        return message;
    }catch(err){
        const message = err + " :Failed to create the notification!";
        console.log( message);
        return message;
    }
}


//update media notification

export const updateMediaNotificationHandler = async (notificationId : number, mediaId: string,specialKey: string,title: string,description: string,read: boolean, type: NotificationType) => {
  const { prisma } = server.app;
  try {
    const notificationTitle = title;
    const notification = await executePrismaMethod(
      prisma,
      "notification",
      "update",
      {
        where: {
          id: notificationId,
          notificationEngagements: {
            specialKey: specialKey,
            type: type,
            media: {
              uniqueId: mediaId,
            },
          },
        },
        data: {
          title: notificationTitle,
          description: description,
          read: read,
          updatedAt: getCurrentDate(),
        },
      }
    );
    console.log(notification);
    if (!notification) {
      const message = " Failed to update the notification :";
      console.log(notification + message);
      const code = 500;
      return { code, message };
    }else{
      const message = "notification with ID " + notification.id + " has been updated successfully";
      const code = 200;
      return { code, message };
    }

    
  } catch (err) {
    const message = err + " :Failed to update the notification";
    const code = 500;
    return {code,message};
  }
}

//delete media notification

export const deleteMediaNotificationHandler = async (notificationId : number, mediaId: string,specialKey: string, type: NotificationType) => {
  const { prisma } = server.app;
  try {
    const notification = await executePrismaMethod(
      prisma,
      "notification",
      "findUnique",
      {
        where: {
          id: notificationId,
          notificationEngagements: {
            specialKey: specialKey,
            type: type,
            media: {
                uniqueId: mediaId
            }
        }
      }
    }
    );
    if (!notification) {
      const message = "notification not found";
      console.log(message);
    }

    const deleteNotificationEngagement = await executePrismaMethod(prisma, "engagementsManager", "delete", {
        where: {
            specialKey: specialKey,
            type: type,
            notificationId: notification.id,
            media: {
                uniqueId: mediaId
            }
        }
    });

    if(!deleteNotificationEngagement){
        const message = "Failed to delete the notification engagement";
        console.log(message);
    }else {
        const deleteNotification = await executePrismaMethod(prisma, "notification", "delete", {
            where: {
                id: notification.id
            }
        });

        if(!deleteNotification){
            const message = "Failed to delete the notification";
            console.log(message);
        }

        const message = "Notification was deleted successfully";
        return message;
    }
  } catch (err) {
    const message = err + " :Failed to delete the notification";
    return message;
  }
};


