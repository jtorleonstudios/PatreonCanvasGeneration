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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const PatreonProcess_1 = require("./PatreonProcess");
const CanvasProcess_1 = require("./CanvasProcess");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
PatreonProcess_1.PatreonProcess.TOKEN = process.env.PATREON_TOKEN;
(() => __awaiter(void 0, void 0, void 0, function* () {
    // Get all campaigns for current users
    let campaignsIdentifier = yield PatreonProcess_1.PatreonProcess.getAllCompaigns();
    // Get all members for all campaigns (active, former and declined)
    let members = yield PatreonProcess_1.PatreonProcess.getAllMembers(campaignsIdentifier);
    let attributeActivePatreon = yield PatreonProcess_1.PatreonProcess.getAllAttributesMembers(members.active);
    let attributeOtherPatreon = yield PatreonProcess_1.PatreonProcess.getAllAttributesMembers(members.other);
    console.log(attributeActivePatreon.size, attributeOtherPatreon.size);
    // Start image generation
    CanvasProcess_1.CanvasProcess.start(attributeActivePatreon, attributeOtherPatreon)
        .then(canvas => {
        const OUTPUT_PATH = path.join(__dirname, "..", "out", "image.png");
        var writeStream = fs.createWriteStream(OUTPUT_PATH);
        var stream = canvas.createPNGStream();
        stream.on('data', function (chunk) {
            writeStream.write(chunk);
        });
        stream.on('end', function () {
            console.log('saved png');
            writeStream.end();
        });
    });
}))();
//# sourceMappingURL=main.js.map