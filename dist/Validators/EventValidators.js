"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateEventInputValidator = exports.createEventInputValidator = void 0;
const joi_1 = __importDefault(require("joi"));
const eventInputValidator = joi_1.default.object({
    id: joi_1.default.number().alter({
        create: (schema) => schema.forbidden(),
        update: (schema) => schema.required(),
    }),
    title: joi_1.default.string().alter({
        create: (schema) => schema.required(),
        update: (schema) => schema.optional(),
    }),
    uniqueId: joi_1.default.string().alter({
        create: (schema) => schema.forbidden(),
        update: (schema) => schema.required(),
    }),
    description: joi_1.default.string().alter({
        create: (schema) => schema.required(),
        update: (schema) => schema.optional(),
    }),
    thumbnail: joi_1.default.string().alter({
        create: (schema) => schema.optional(),
        update: (schema) => schema.optional(),
    }),
    createdAt: joi_1.default.date().alter({
        create: (schema) => schema.required(),
        update: (schema) => schema.optional(),
    }),
    updatedAt: joi_1.default.date().alter({
        create: (schema) => schema.required(),
        update: (schema) => schema.optional(),
    }),
});
exports.createEventInputValidator = eventInputValidator.tailor("create");
exports.updateEventInputValidator = eventInputValidator.tailor("update");
//# sourceMappingURL=EventValidators.js.map