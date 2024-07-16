"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateNotificationInputValidator = exports.createNotificationInputValidator = void 0;
const joi_1 = __importDefault(require("joi"));
const notificationInputValidator = joi_1.default.object({
    id: joi_1.default.number().alter({
        create: (schema) => schema.forbidden(),
        update: (schema) => schema.required(),
    }),
    title: joi_1.default.string().alter({
        create: (schema) => schema.required(),
        update: (schema) => schema.optional(),
    }),
    description: joi_1.default.string().alter({
        create: (schema) => schema.required(),
        update: (schema) => schema.optional(),
    }),
    createdAt: joi_1.default.date().alter({
        create: (schema) => schema.required(),
        update: (schema) => schema.optional(),
    }),
    read: joi_1.default.boolean().alter({
        create: (schema) => schema.required(),
        update: (schema) => schema.optional(),
    }),
    userId: joi_1.default.number().alter({
        create: (schema) => schema.required(),
        update: (schema) => schema.optional(),
    }),
    updatedAt: joi_1.default.date().alter({
        create: (schema) => schema.required(),
        update: (schema) => schema.optional(),
    }),
});
exports.createNotificationInputValidator = notificationInputValidator.tailor("create");
exports.updateNotificationInputValidator = notificationInputValidator.tailor("update");
//# sourceMappingURL=NotificationValidators.js.map