import Hapi from '@hapi/hapi'
import { executePrismaMethod } from '../Helpers';
import Joi from 'joi';
import { deleteGoogleDriveFolder } from '../Handlers';

export const statusPlugin: Hapi.Plugin<void> = {
  name: "app/status",
  register: async function (server: Hapi.Server) {
    server.route([
      {
        // default status endpoint
        method: "GET",
        path: "/api/",
        handler: (_, h: Hapi.ResponseToolkit) =>
          h.response({ up: true }).code(200),
        options: {
          auth: false,
        },
      },
      {
        method: "GET",
        path: "/api/logs",
        handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
          const { prisma } = request.server.app;
          //timestamp is a string
          const logs = await executePrismaMethod(prisma, "log", "findMany",{
           orderBy: {
            id: "desc",
           }
          });
          if (!logs) {
            return h.response({ message: "No logs found" }).code(404);
          }
          return h.response({ logs }).code(201);
        },
        options: {
          auth: false,
        },
      },
      {
        method: "GET",
        path: "/api/logs/{year}/{month}/{day}",
        handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
          const { prisma } = request.server.app;
          const { year, month, day } = request.params;
           const startDate = `${year}-${month}-${day} 00:00`;
           const endDate = `${year}-${month}-${day} 23:59`;
           const logs = await executePrismaMethod(prisma, "log", "findMany", {
             where: {
               timestamp: {
                 gte: startDate,
                 lt: endDate,
               },
             },
           });
          if (!logs) {
            return h.response({ message: "No logs found" }).code(404);
          }
          return h.response({ logs }).code(201);
        },
        options: {
          auth: false,
          validate: {
            params: Joi.object({
              year: Joi.number().required(),
              month: Joi.number().required(),
              day: Joi.number().required(),
            }),
            failAction: (request, h, err) => {
              throw err;
            },
          },
        },
      },
      {
        method: "GET",
        path: "/api/logs/{year}/{month}",
        handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
          const { prisma } = request.server.app;
          
          const { year, month } = request.params;
           const startDate = `${year}-${month}-01 00:00`;
           const endDate = `${year}-${month}-31 23:59`;
           const logs = await executePrismaMethod(prisma, "log", "findMany", {
             where: {
               timestamp: {
                 gte: startDate,
                 lt: endDate,
               },
             },
           });
          if (!logs) {
            return h.response({ message: "No logs found" }).code(404);
          }
          return h.response({ logs }).code(201);
        },
        options: {
          auth: false,
          validate: {
            params: Joi.object({
              year: Joi.number().required(),
              month: Joi.number().required(),
            }),
            failAction: (request, h, err) => {
              throw err;
            },
          },
        },
      },
      {
        method: "GET",
        path: "/api/logs/{year}",
        handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
          const { prisma } = request.server.app;
          const { year } = request.params;
          const startDate = `${year}-01-01 00:00`;
          const endDate = `${year}-12-31 23:59`;
          const logs = await executePrismaMethod(prisma, "log", "findMany", {
            where: {
              timestamp: {
                gte: startDate,
                lt: endDate,
              },
            },
          });
          if (!logs) {
            return h.response({ message: "No logs found" }).code(404);
          }
          return h.response({ logs }).code(201);
        },
        options: {
          auth: false,
          validate: {
            params: Joi.object({
              year: Joi.number().required(),
            }),
            failAction: (request, h, err) => {
              throw err;
            },
          },
        },
      },
      {
        method: "PUT",
        path: "/api/delete-google-drive-folder/{folderId}",
        handler: deleteGoogleDriveFolder,
        options: {
          auth: false,
          validate: {
            params: Joi.object({
              folderId: Joi.string().required(),
            }),
            failAction: (request, h, err) => {
              throw err;
            },
          },
        },
      },
    ]);
  },
};
  

