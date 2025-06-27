"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
function Log(stack, level, package, message) {
    return __awaiter(this, void 0, void 0, function* () {
        const payload = { stack, level, package, message };
        try {
            const response = yield fetch('http://20.244.56.144/evaluation-service/logs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!response.ok)
                throw new Error('Failed to log');
            const data = yield response.json();
            console.log('Log created:', data);
        }
        catch (err) {
            console.error('Logging error:', err.message);
            Log('backend', 'error', 'handler', `received ${typeof message}, expected string`);
        }
    });
}
exports.default = Log;
