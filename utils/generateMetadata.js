const fs = require("fs");
const path = require("path");

const names = ["PNS", "BK", "AST"];

function generateMetadata(baseURI, imagesPath, metadataPath) {
  const absolutePath = path.resolve(imagesPath);
  const files = fs.readdirSync(absolutePath);

  for (const index in files) {
    const metadata = {
      name: names[index],
      description: `${names[index]}, a fierce warrior from Warrior Club`,
      image: `${baseURI}/${index}.png`,
    };

    fs.writeFileSync(
      `${metadataPath}/${index}.json`,
      JSON.stringify(metadata, null, 2)
    );
  }
}

module.exports = { generateMetadata };
