"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executePrismaMethod = executePrismaMethod;
async function executePrismaMethod(prisma, entityName, methodName, options = {}) {
    return prisma[entityName][methodName](options);
}
//# sourceMappingURL=prismaController.js.map