const fs = require("fs");
const path = require("path");

const names = ["PNS", "BK", "AST"];
const metadataPath = "./NFT/metadata";

function generateMetadata(baseURL, imagesPath) {
  const absolutePath = path.resolve(imagesPath);
  const files = fs.readdirSync(absolutePath);

  console.log("Generating metadata for the images...");
  for (const index in files) {
    const metadata = {
      name: names[index],
      description: `${this.name}, a fierce warrior from Warrior Club`,
      image: `${baseURL}/${index}.png`,
    };

    fs.writeFileSync(
      `${metadataPath}/${index}.json`,
      JSON.stringify(metadata, null, 2)
    );
  }
}

module.exports = { generateMetadata };
