import Joi from "joi";

const eventInputValidator = Joi.object({
  title: Joi.string().alter({
    create: (schema) => schema.required(),
    update: (schema) => schema.optional(),
  }),
  uniqueId: Joi.string().alter({
    create: (schema) => schema.forbidden(),
    update: (schema) => schema.required(),
  }),
  date: Joi.string().alter({
    create: (schema) => schema.required(),
    update: (schema) => schema.optional(),
  }),

  time: Joi.string().alter({
    create: (schema) => schema.required(),
    update: (schema) => schema.optional(),
  }),

  venue: Joi.string().alter({
    create: (schema) => schema.required(),
    update: (schema) => schema.optional(),
  }),

  location: Joi.string().alter({
    create: (schema) => schema.required(),
    update: (schema) => schema.optional(),
  }),

  host: Joi.string().alter({
    create: (schema) => schema.required(),
    update: (schema) => schema.optional(),
  }),
  description: Joi.string().alter({
    create: (schema) => schema.required(),
    update: (schema) => schema.optional(),
  }),
  thumbnail: Joi.string().alter({
    create: (schema) => schema.optional(),
    update: (schema) => schema.optional(),
  }),
  uploadThumbnail: Joi.boolean().alter({
    create: (schema) => schema.optional(),
    update: (schema) => schema.optional(),
  }),
  name: Joi.string().alter({
    create: (schema) => schema.optional(),
    update: (schema) => schema.optional(),
  }),
  mimeType: Joi.string().alter({
    create: (schema) => schema.optional(),
    update: (schema) => schema.optional(),
  }),
  filePath: Joi.string().alter({
    create: (schema) => schema.optional(),
    update: (schema) => schema.optional(),
  }),
  createdAt: Joi.string().alter({
    create: (schema) => schema.optional(),
    update: (schema) => schema.optional(),
  }),
  updatedAt: Joi.string().alter({
    create: (schema) => schema.optional(),
    update: (schema) => schema.optional(),
  }),
});

export const createEventInputValidator = eventInputValidator.tailor("create");
export const updateEventInputValidator = eventInputValidator.tailor("update");

//create validation for createmanyevents 
export const createManyEventsInputValidator = Joi.object({
  events: Joi.array().items(eventInputValidator.tailor("create")),
});
/**
 * got this error
 * {
    "statusCode": 400,
    "error": "Bad Request",
    "message": "\"value\" must be of type object",
    "validation": {
        "source": "payload",
        "keys": [
            ""
        ]
    }
}
 */
// export const createManyEventsInputValidator = Joi.object({
//   events: Joi.array().items(eventInputValidator.tailor("create")),
// });