"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var outputPath = path.join(__dirname, "..", "out", "test.text");
var writeStream = fs.createWriteStream(outputPath);
writeStream.write("hello world");
writeStream.end();
