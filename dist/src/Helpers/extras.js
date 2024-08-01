"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentDate = void 0;
const getCurrentDate = () => {
    //let getCurrentDate() use this format 2024-09-03
    return new Date().toISOString().split("T")[0];
};
exports.getCurrentDate = getCurrentDate;
//
//# sourceMappingURL=extras.js.map