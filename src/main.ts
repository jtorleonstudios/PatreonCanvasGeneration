import * as fs from "fs"
import path = require("path");

const outputPath: string = path.join(__dirname, "..", "out", "test.text")

var writeStream = fs.createWriteStream(outputPath);
writeStream.write("hello world");
writeStream.end();