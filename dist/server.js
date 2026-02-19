"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Keep this for production/non-Vite environments
const PORT = process.env.PORT || 3000;
app_1.default.listen(PORT, () => {
    //console.log(`HOME:${process.env.HOME}`);
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Swagger Docs available at http://localhost:${PORT}/api-docs`);
});
