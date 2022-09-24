const fs = require("fs");

function generateMetadata(imagesBaseURI, imagesPath, metadataPath) {
  const files = fs.readdirSync(imagesPath);

  for (const index in files) {
    const metadata = {
      name: files[index].slice(3, -4),
      description: `${files[index].slice(
        3,
        -4
      )}, a fierce warrior in a post Apocalyptic World`,
      image: imagesBaseURI + files[index],
    };

    fs.writeFileSync(
      `${metadataPath}/${index}.json`,
      JSON.stringify(metadata, null, 2)
    );
  }
}

module.exports = { generateMetadata };
