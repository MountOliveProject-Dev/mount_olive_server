import Hapi from "@hapi/hapi";
import Joi from "joi";
import {
  listEventsHandler,
  createEventHandler,
  getEventHandler,
  deleteEventHandler,
  updateEventHandler,
} from "../Handlers";
import { createEventInputValidator,updateEventInputValidator } from "../Validators";
import {API_AUTH_STRATEGY} from "../server";


export const eventsPlugin = {
    name: 'app/events',
    dependencies: ['prisma'],

    register: async function (server: Hapi.Server) {
        server.route([
          {
            method: "GET",
            path: "/api/events",
            handler: listEventsHandler,
            options: {
              auth: false,
            },
          },
          {
            method: "GET",
            path: "/api/events/{uniqueId}",
            handler: getEventHandler,
            options: {
              auth: false,
              validate: {
                params: Joi.object({
                  uniqueId: Joi.string().required(),

                }),
                failAction: (request, h, err) => {
                  throw err;
                }
              },

            },
          },
          {
            method: "POST",
            path: "/api/create-event",
            handler: createEventHandler,
            options: {
              auth: false,
              validate: {
                payload: createEventInputValidator,
                failAction: (request, h, err) => {
                  throw err;
                },
              },
            },
          },
          {
            method: "POST",
            path: "/api/update-event",
            handler: updateEventHandler,
            options: {
              auth: false,
              validate: {
                payload: updateEventInputValidator,
                failAction: (request, h, err) => {
                  throw err;
                },
              },
            }
        },
        {
          method: "DELETE",
          path: "/api/events/delete-event",
          handler: deleteEventHandler,
          options: {
            auth: false,
            validate: {
              payload: Joi.object({
                uniqueId: Joi.string().required(),
              }),
              failAction: (request, h, err) => {
                throw err;
              },
            },
          },
        }
        ]);
    }

    

} 