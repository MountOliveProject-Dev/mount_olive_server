import Hapi from "@hapi/hapi";
import Joi from "joi";
import {
  listEventsHandler,
  createEventHandler,
  getEventHandler,
} from "../Handlers";
import { createEventInputValidator } from "../Validators";
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
        ]);
    }

    

} 