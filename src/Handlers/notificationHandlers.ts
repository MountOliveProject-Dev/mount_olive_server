import Hapi from "@hapi/hapi";
import server from "../server";
import { executePrismaMethod, NotificationType, getCurrentDate } from "../Helpers";



export const listNotificationsHandler = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {

    const { prisma } = request.server.app;

    try{
        const notifications = await executePrismaMethod(prisma, "notification", "findMany", {
            orderBy: {
                createdAt: "desc"
            }
        });
        return h.response(notifications).code(200);
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

export const createMediaNotificationHandler = async (mediaId: string, specialKey: string,title: string, description: string, read: boolean) => {
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
                  type: NotificationType.MEDIA,
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

export const updateMediaNotificationHandler = async (notificationId : number, mediaId: string,specialKey: string,title: string,description: string,read: boolean) => {
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
            type: NotificationType.MEDIA,
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

export const deleteMediaNotificationHandler = async (notificationId : number, mediaId: string,specialKey: string) => {
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
            type: NotificationType.MEDIA,
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
            type: NotificationType.MEDIA,
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


