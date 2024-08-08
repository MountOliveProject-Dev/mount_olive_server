import Hapi from "@hapi/hapi";
import server from "../server";
import { executePrismaMethod, NotificationType, getCurrentDate } from "../Helpers";
import { not } from "joi";


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

//list notifications by type
// export const listNotificationsByTypeHandler = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
//     const { prisma } = request.server.app;
//     const type = request.params.type;
//     try{
//         const notifications = await executePrismaMethod(prisma, "engagementsManager", "findMany", {
//             where: {
//                 type: type
//             }
//         });
//         return h.response(notifications).code(200);
//     }catch(err){
//         console.log(err);
//         return h.response({message: "Internal Server Error" + ":failed to get the notifications"}).code(500);
//     }
// }

// export const getNotificationHandler = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
//     const { prisma } = request.server.app;
//     const notificationId = parseInt(request.params.id);
//     try{
//         const notification = await executePrismaMethod(prisma, "notification", "findFirst", {
//             where: {
//                 id: notificationId
//             }
//         });
//         if(notification){
//             return h.response(notification).code(200);
//         }else{
//             return h.response({message: "Notification not found"}).code(404);
//         }
//     }catch(err){
//         console.log(err);
//         return h.response({message: "Internal Server Error" + ":failed to get the notification"}).code(500);
//     }
// }


// export const createMediaNotificationHandler = async (mediaId: number, title: string, description: string, read: boolean) => {
//     const { prisma } = server.app;
//     try{
//         const notification = await executePrismaMethod(prisma, "notification", "create", {
//             data: {
//                 title: title,
//                 description: description,
//                 read: read,
//                 createdAt: getCurrentDate(),
//                 updatedAt: getCurrentDate()
//             },
//             select: {
//                 id: true,
//                 title: true,
//                 description: true,
//                 read: true,
//                 createdAt: true,
//                 updatedAt: true
//             }
//         });
//         if(!notification){
//             const message = "Failed to create the notification";
//             return message;
//         }

//         const mediaNotificationEngagement = await executePrismaMethod(prisma, "engagementsManager", "create", {
//             data: {
//                 notificationId: notification.id,
//                 type: NotificationType.MEDIA,
//                 media:{
//                     connect:{
//                         id: mediaId
                    
//                 }
//             }
        
//         }
//     });
//         if(!mediaNotificationEngagement){
//             const message = "Failed to create the notification engagement";
//             return message;
//         }
//         const message = title + "  was created successfully";
//         return message;
//     }catch(err){
//         const message = err + " :Failed to create the notification";
//         return message;
//     }
// }

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
          data: {
            title: title,
            description: description,
            read: read,
            updatedAt: getCurrentDate(),
          },
        },
      }
    );
    if (!notification) {
      const message = "Failed to update the notification";
      console.log(message);
    }

    const message = "notification with ID " + notification.id + " has been updated successfully";
    const code = 200;
    return {code,message};
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
///


// export const updateMediaNotificationHandler = async (mediaId: number, title: string, description: string, read: boolean) => {
//     const { prisma } = server.app;
//     try{
//         const notification = await executePrismaMethod(prisma, "notification", "update", {
//             where: {
//                 id: mediaId
//             },
//             data: {
//                 title: title,
//                 description: description,
//                 read: read
//             },
//             select: {
//                 id: true,
//                 title: true,
//                 description: true,
//                 read: true
//             }
//         });
//         if(!notification){
//             const message = "Failed to update the notification";
//             return message;
//         }

//         const mediaNotificationEngagement = await executePrismaMethod(prisma, "engagementsManager", "update", {
//             where: {
//                 notificationId: notification.id
//             },
//             data: {
//                 type: NotificationType.MEDIA,
//                 media:{
//                     connect:{
//                         id: mediaId
                    
//                 }
//             }
        
//         }
//     });
//         if(!mediaNotificationEngagement){
//             const message = "Failed to update the notification engagement";
//             return message;
//         }
//         const message = title + "  was updated successfully";
//         return message;
//     }catch(err){
//         const message = err + " :Failed to update the notification";
//         return message;
//     }
// }

