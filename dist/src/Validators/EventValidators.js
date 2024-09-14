"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createManyEventsInputValidator = exports.updateEventInputValidator = exports.createEventInputValidator = void 0;
const joi_1 = __importDefault(require("joi"));
const eventInputValidator = joi_1.default.object({
    title: joi_1.default.string().alter({
        create: (schema) => schema.required(),
        update: (schema) => schema.optional(),
    }),
    uniqueId: joi_1.default.string().alter({
        create: (schema) => schema.forbidden(),
        update: (schema) => schema.required(),
    }),
    date: joi_1.default.string().alter({
        create: (schema) => schema.required(),
        update: (schema) => schema.optional(),
    }),
    time: joi_1.default.string().alter({
        create: (schema) => schema.required(),
        update: (schema) => schema.optional().allow(""),
    }),
    venue: joi_1.default.string().alter({
        create: (schema) => schema.required(),
        update: (schema) => schema.optional().allow(""),
    }),
    location: joi_1.default.string().alter({
        create: (schema) => schema.required(),
        update: (schema) => schema.optional().allow(""),
    }),
    host: joi_1.default.string().alter({
        create: (schema) => schema.required(),
        update: (schema) => schema.optional().allow(""),
    }),
    description: joi_1.default.string().alter({
        create: (schema) => schema.required(),
        update: (schema) => schema.optional().allow(""),
    }),
    thumbnail: joi_1.default.string().alter({
        create: (schema) => schema.optional().allow(""),
        update: (schema) => schema.optional().allow(""),
    }),
    uploadThumbnail: joi_1.default.boolean().alter({
        create: (schema) => schema.optional(),
        update: (schema) => schema.optional(),
    }),
    name: joi_1.default.string().alter({
        create: (schema) => schema.optional().allow(""),
        update: (schema) => schema.optional().allow(""),
    }),
    mimeType: joi_1.default.string().alter({
        create: (schema) => schema.optional().allow(""),
        update: (schema) => schema.optional().allow(""),
    }),
    filePath: joi_1.default.string().alter({
        create: (schema) => schema.optional().allow(""),
        update: (schema) => schema.optional().allow(""),
    }),
    createdAt: joi_1.default.string().alter({
        create: (schema) => schema.optional().allow(""),
        update: (schema) => schema.optional().allow(""),
    }),
    updatedAt: joi_1.default.string().alter({
        create: (schema) => schema.optional().allow(""),
        update: (schema) => schema.optional().allow(""),
    }),
});
exports.createEventInputValidator = eventInputValidator.tailor("create");
exports.updateEventInputValidator = eventInputValidator.tailor("update");
//create validation for createmanyevents 
exports.createManyEventsInputValidator = joi_1.default.object({
    events: joi_1.default.array().items(eventInputValidator.tailor("create")),
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
//# sourceMappingURL=EventValidators.js.map