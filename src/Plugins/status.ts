import Hapi from '@hapi/hapi'

export const statusPlugin: Hapi.Plugin<undefined> = {
  name: 'app/status',
  register: async function (server: Hapi.Server) {
    server.route({
      // default status endpoint
      method: 'GET',
      path: '/api/',
      handler: (_, h: Hapi.ResponseToolkit) =>
        h.response({ up: true }).code(200),
      options: {
        auth: false,
      },
    })
  },
}
