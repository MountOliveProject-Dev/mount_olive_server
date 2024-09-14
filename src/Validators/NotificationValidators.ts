import Joi from "joi";


const notificationInputValidator = Joi.object({
  id: Joi.number().alter({
    create: (schema) => schema.forbidden(),
    update: (schema) => schema.required(),
  }),
  title: Joi.string().alter({
    create: (schema) => schema.required(),
    update: (schema) => schema.optional().allow(""),
  }),
  description: Joi.string().alter({
    create: (schema) => schema.required(),
    update: (schema) => schema.optional().allow(""),
  }),
  createdAt: Joi.string().alter({
    create: (schema) => schema.required(),
    update: (schema) => schema.optional().allow(""),
  }),
  read: Joi.boolean().alter({
    create: (schema) => schema.required(),
    update: (schema) => schema.optional().allow(""),
  }),
  userId: Joi.number().alter({
    create: (schema) => schema.required(),
    update: (schema) => schema.optional().allow(""),
  }),
  updatedAt: Joi.string().alter({
    create: (schema) => schema.required(),
    update: (schema) => schema.optional().allow(""),
  }),
});

export const createNotificationInputValidator = notificationInputValidator.tailor("create");
export const updateNotificationInputValidator = notificationInputValidator.tailor("update");