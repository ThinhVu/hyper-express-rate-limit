"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryStore = exports.rateLimit = exports.default = void 0;
// Export all the types as named exports
__exportStar(require("./types"), exports);
// Export the rateLimit function as a default export and as a named export, if
// the default export does not work (see https://github.com/nfriedly/express-rate-limit/issues/280)
var lib_1 = require("./lib");
Object.defineProperty(exports, "default", { enumerable: true, get: function () { return __importDefault(lib_1).default; } });
Object.defineProperty(exports, "rateLimit", { enumerable: true, get: function () { return __importDefault(lib_1).default; } });
// Export the memory store in case someone wants to use or extend it
// (see https://github.com/nfriedly/express-rate-limit/issues/289)
var memory_store_1 = require("./memory-store");
Object.defineProperty(exports, "MemoryStore", { enumerable: true, get: function () { return __importDefault(memory_store_1).default; } });
