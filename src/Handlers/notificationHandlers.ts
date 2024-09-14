import Hapi from "@hapi/hapi";
import server from "../server";
import { executePrismaMethod, NotificationType, getCurrentDate } from "../Helpers";




export const listNotificationsHandler = async (
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) => {
  const { prisma } = request.server.app;
  let data: any[] = [];

  try {
    const notifications = await executePrismaMethod(
      prisma,
      "notification",
      "findMany",
      {
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          title: true,
          description: true,
          read: true,
          createdAt: true,
          updatedAt: true,
        },
      }
    );

    if (!notifications || notifications.length === 0) {
      console.log("No notifications found");
      return h.response({ message: "No notifications found" }).code(404);
    }

    const mediaItems = await executePrismaMethod(
      prisma,
      "engagementsManager",
      "findMany",
      {
        orderBy: {
          id: "asc",
        },
        select: {
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
              updatedAt: true,
            },
          },
          event: {
            select: {
              id: true,
              uniqueId: true,
              title: true,
              description: true,
              location: true,
              date: true,
              time: true,
              venue: true,
              host: true,
              thumbnail: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      }
    );

    if (!mediaItems) {
      console.log("No associated media found");
    }

    for (const notification of notifications) {
      const notificationData = {
        notificationId: notification.id,
        notificationTitle: notification.title,
        notificationDescription: notification.description,
        read: notification.read,
        notificationCreatedAt: notification.createdAt,
        notificationUpdatedAt: notification.updatedAt,
        type: "",
      };

      const associatedMedia = mediaItems.find(
        (media) => media.notificationId === notification.id
      );
      let media: any = {};

      if (associatedMedia) {
        if (associatedMedia.videoStatus) {
          notificationData.type = NotificationType.VIDEO;
          media = {
            id: associatedMedia.media.id,
            uniqueId: associatedMedia.media.uniqueId,
            title: associatedMedia.media.title,
            description: associatedMedia.media.description,
            url: associatedMedia.media.url,
            postedAt: associatedMedia.media.postedAt,
            updatedAt: associatedMedia.media.updatedAt,
          };
        } else if (associatedMedia.audioStatus) {
          notificationData.type = NotificationType.AUDIO;
          media = {
            id: associatedMedia.media.id,
            uniqueId: associatedMedia.media.uniqueId,
            title: associatedMedia.media.title,
            description: associatedMedia.media.description,
            url: associatedMedia.media.url,
            duration: associatedMedia.media.duration,
            postedAt: associatedMedia.media.postedAt,
            updatedAt: associatedMedia.media.updatedAt,
          };
        } else if (associatedMedia.eventStatus) {
          notificationData.type = NotificationType.EVENT;
          media = {
            id: associatedMedia.event.id,
            uniqueId: associatedMedia.event.uniqueId,
            title: associatedMedia.event.title,
            createdAt: associatedMedia.event.createdAt,
            updatedAt: associatedMedia.event.updatedAt,
            date: associatedMedia.event.date,
            time: associatedMedia.event.time,
            location: associatedMedia.event.location,
            venue: associatedMedia.event.venue,
            host: associatedMedia.event.host,
            description: associatedMedia.event.description,
            thumbnail: associatedMedia.event.thumbnail,
          };
        }
      }

      data.push({
        ...notificationData,
        ...media,
      });
    }

    return h.response(data).code(200);
  } catch (err) {
    console.log(err);
    return h
      .response({
        message: "Internal Server Error: failed to get the notifications",
      })
      .code(500);
  }
};


///
//create event notification
export const createEventNotificationHandler = async (eventId: string, specialKey: string,title: string, description: string, read: boolean,thumbnailStatus:boolean) => {
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
                  audioStatus: false,
                  thumbnailStatus:thumbnailStatus,
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
        let thumbnailStatus = false;
        if(type === NotificationType.VIDEO){
          videoStatus = true;
        }else if(type === NotificationType.AUDIO){
          audioStatus = true;
        } else if(type === NotificationType.IMAGE){
          thumbnailStatus = true;
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
                  thumbnailStatus: thumbnailStatus,
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
        console.log(notification);
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


