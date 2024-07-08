import Hapi from "@hapi/hapi";
import Joi from "joi";
import { listEventsHandler } from "../Handlers"

export const eventsPlugin = {
    name: 'app/events',
    dependencies: ['prisma'],

    register: async function (server: Hapi.Server) {
        server.route({
            method: 'GET',
            path: '/api/events',
            handler: listEventsHandler,
            
        })
    }

    

} 