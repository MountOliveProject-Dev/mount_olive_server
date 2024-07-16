import Joi from "joi";


const notificationInputValidator = Joi.object({
  id: Joi.number().alter({
    create: (schema) => schema.forbidden(),
    update: (schema) => schema.required(),
  }),
  title: Joi.string().alter({
    create: (schema) => schema.required(),
    update: (schema) => schema.optional(),
  }),
  description: Joi.string().alter({
    create: (schema) => schema.required(),
    update: (schema) => schema.optional(),
  }),
  createdAt: Joi.date().alter({
    create: (schema) => schema.required(),
    update: (schema) => schema.optional(),
  }),
  read: Joi.boolean().alter({
    create: (schema) => schema.required(),
    update: (schema) => schema.optional(),
  }),
  userId: Joi.number().alter({
    create: (schema) => schema.required(),
    update: (schema) => schema.optional(),
  }),
  updatedAt: Joi.date().alter({
    create: (schema) => schema.required(),
    update: (schema) => schema.optional(),
  }),
});

export const createNotificationInputValidator = notificationInputValidator.tailor("create");
export const updateNotificationInputValidator = notificationInputValidator.tailor("update");