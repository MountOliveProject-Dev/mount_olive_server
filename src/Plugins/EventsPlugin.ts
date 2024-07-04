import Hapi from "@hapi/hapi";
import Joi from "joi";


export const eventsPlugin = {
    name: 'app/events',
    dependencies: ['prisma'],

    register: async function (server: Hapi.Server) {
        server.route({
            method: 'GET',
            path: '/events',
            handler: async () => {
                return {
                    ok: true
                }
            }
        })
    }

    

} 