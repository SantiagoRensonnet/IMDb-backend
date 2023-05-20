"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function catchAsync(fn) {
    return function (req, res, next) {
        fn(req, res, next).catch(next); //se llama a next cuando la promesa es rechazada
    };
}
exports.default = catchAsync;
//# sourceMappingURL=catchAsync.js.map