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
    update: (schema) => schema.optional().allow(""),
  }),

  venue: Joi.string().alter({
    create: (schema) => schema.required(),
    update: (schema) => schema.optional().allow(""),
  }),

  location: Joi.string().alter({
    create: (schema) => schema.required(),
    update: (schema) => schema.optional().allow(""),
  }),

  host: Joi.string().alter({
    create: (schema) => schema.required(),
    update: (schema) => schema.optional().allow(""),
  }),
  description: Joi.string().alter({
    create: (schema) => schema.required(),
    update: (schema) => schema.optional().allow(""),
  }),
  thumbnail: Joi.string().alter({
    create: (schema) => schema.optional().allow(""),
    update: (schema) => schema.optional().allow(""),
  }),
  uploadThumbnail: Joi.boolean().alter({
    create: (schema) => schema.optional(),
    update: (schema) => schema.optional(),
  }),
  name: Joi.string().alter({
    create: (schema) => schema.optional().allow(""),
    update: (schema) => schema.optional().allow(""),
  }),
  mimeType: Joi.string().alter({
    create: (schema) => schema.optional().allow(""),
    update: (schema) => schema.optional().allow(""),
  }),
  filePath: Joi.string().alter({
    create: (schema) => schema.optional().allow(""),
    update: (schema) => schema.optional().allow(""),
  }),
  createdAt: Joi.string().alter({
    create: (schema) => schema.optional().allow(""),
    update: (schema) => schema.optional().allow(""),
  }),
  updatedAt: Joi.string().alter({
    create: (schema) => schema.optional().allow(""),
    update: (schema) => schema.optional().allow(""),
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