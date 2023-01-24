import * as fs from "fs"
import * as url from "url"
import * as path from "path"
import { PatreonProcess } from "./PatreonProcess"
import { CanvasProcess } from "./CanvasProcess"
import * as dotenv from 'dotenv'
dotenv.config()

console.log(process.env.PATREON_TOKEN)
PatreonProcess.TOKEN = process.env.PATREON_TOKEN;

(async () => {
    // Get all campaigns for current users
    let campaignsIdentifier = await PatreonProcess.getAllCompaigns();
    // Get all members for all campaigns (active, former and declined)
    let members = await PatreonProcess.getAllMembers(campaignsIdentifier);
    let attributeActivePatreon = await PatreonProcess.getAllAttributesMembers(members.active)
    let attributeOtherPatreon = await PatreonProcess.getAllAttributesMembers(members.other)

    console.log(attributeActivePatreon.size, attributeOtherPatreon.size)

    // Start image generation
    CanvasProcess.start(attributeActivePatreon, attributeOtherPatreon)
        .then(canvas => {

            const OUTPUT_PATH: string = path.join(__dirname, "..", "out", "image.png")
            var writeStream = fs.createWriteStream(OUTPUT_PATH);


            var stream = (canvas as any).createPNGStream();

            stream.on('data', function (chunk) {
                writeStream.write(chunk);
            });

            stream.on('end', function () {
                console.log('saved png');

                writeStream.end();
            });

        });
})();

