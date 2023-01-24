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
exports.CanvasProcess = void 0;
const canvas_1 = require("canvas");
class CanvasProcess {
    static start(active, other) {
        return __awaiter(this, void 0, void 0, function* () {
            (0, canvas_1.registerFont)('seguiemj.ttf', { family: 'Segoe' });
            const outCanvas = (0, canvas_1.createCanvas)(CanvasProcess.CONFIG.width, CanvasProcess.CONFIG.height);
            const context = outCanvas.getContext('2d');
            context.clearRect(0, 0, CanvasProcess.CONFIG.width, CanvasProcess.CONFIG.height);
            let y = 50, x = 0;
            let imageWidth = 250;
            let marginImageLeftRight = 10;
            let maxImageAvatarHeith = imageWidth / 3.5;
            let maxImageByLine = outCanvas.width / (maxImageAvatarHeith + marginImageLeftRight);
            maxImageByLine = maxImageByLine > 3 ? maxImageByLine - 3 : maxImageByLine;
            maxImageByLine = active.size < maxImageByLine ? active.size : maxImageByLine;
            let totalCenterLineImage = maxImageByLine * (maxImageAvatarHeith + marginImageLeftRight);
            let startXLineImage = (outCanvas.width - totalCenterLineImage) / 2;
            let maxWidthLineImage = startXLineImage + totalCenterLineImage;
            const drawAvatarGroup = (group) => {
                // centered lots image
                x = startXLineImage;
                let tmpSwitch = true;
                group.forEach(v => {
                    x += (marginImageLeftRight / 2);
                    context.save();
                    context.beginPath();
                    let radiusCircle = maxImageAvatarHeith / 2;
                    context.arc(x + radiusCircle, y + radiusCircle, radiusCircle, 0, Math.PI * 2, false);
                    context.stroke();
                    context.clip();
                    context.drawImage(v.image, 0, 0, v.image.width, v.image.height, x, y, maxImageAvatarHeith, maxImageAvatarHeith);
                    context.restore();
                    x += maxImageAvatarHeith + (marginImageLeftRight / 2);
                    if (x > maxWidthLineImage) {
                        tmpSwitch = !tmpSwitch;
                        x = tmpSwitch ? startXLineImage : startXLineImage - radiusCircle - (marginImageLeftRight / 2);
                        y += maxImageAvatarHeith + (marginImageLeftRight / 2);
                    }
                });
            };
            // TEXT ACTIVE
            y += (marginImageLeftRight * 5);
            context.font = "bold 29px SF Roboto,sans-serif";
            context.fillStyle = "rgb(255 62 75)";
            context.fillText("Active supporters 🔥 Join us [CLICK]", 50, y - (maxImageAvatarHeith / 2));
            // DRAW AVATAR
            let activeAllPromises = [];
            active.forEach(v => activeAllPromises.push((0, canvas_1.loadImage)(v.image_url)));
            yield Promise.all(activeAllPromises).then(images => {
                let groupImgs = [];
                images.forEach(img => groupImgs.push({ image: img }));
                drawAvatarGroup(groupImgs);
            });
            y += maxImageAvatarHeith;
            // TEXT OTHER
            y += (marginImageLeftRight * 2);
            context.font = "bold 26px SF Roboto,sans-serif";
            context.fillStyle = "rgb(255 62 75)";
            context.fillText("Old supporters, in the history forever, Thanks 💌", 50, y - (maxImageAvatarHeith / 2));
            // DRAW AVATAR
            let otherAllPromises = [];
            other.forEach(v => otherAllPromises.push((0, canvas_1.loadImage)(v.image_url)));
            yield Promise.all(otherAllPromises).then(images => {
                let groupImgs = [];
                images.forEach(img => groupImgs.push({ image: img }));
                drawAvatarGroup(groupImgs);
            });
            let allNames = [], lineNames = "";
            active.forEach(v => allNames.push(v.full_name));
            other.forEach(v => allNames.push(v.full_name));
            context.font = "16px SF Roboto,sans-serif";
            allNames.forEach(v => {
                lineNames += v + ", ";
                let metricCurrentLineNames = context.measureText(lineNames);
                if (startXLineImage + metricCurrentLineNames.width > maxWidthLineImage) {
                    context.fillText(lineNames, (outCanvas.width - metricCurrentLineNames.width) / 2, y + (maxImageAvatarHeith / 2));
                    y += metricCurrentLineNames.actualBoundingBoxAscent + metricCurrentLineNames.actualBoundingBoxDescent;
                    lineNames = "";
                }
            });
            y += (maxImageAvatarHeith / 2);
            context.strokeStyle = "rgb(33,33,33)";
            context.stroke();
            return outCanvas;
        });
    }
}
exports.CanvasProcess = CanvasProcess;
CanvasProcess.CONFIG = {
    width: 800,
    height: 1000
};
//# sourceMappingURL=CanvasProcess.js.map