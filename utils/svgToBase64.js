const fs = require("fs");

// This function convert svg images to base64
// from the provided svgImagePath and also
// generate metadata and converts it to base64.
function svgToBase64(svgImagePath) {
  const svgImageURIs = [];
  const svgTokenURIs = [];
  const files = fs.readdirSync(svgImagePath);
  for (const svg of files) {
    const bufferFromSvg = fs.readFileSync(svgImagePath + svg);
    const base64fromSvg = bufferFromSvg.toString("base64");
    const svgImageURI = `data:image/svg+xml;base64,${base64fromSvg}`;

    const metadata = {
      name: svg.slice(3, -4),
      description: `You are in a ${svg.slice(3, -4)} market`,
      image: svgImageURI,
    };
    const bufferFromMetadata = Buffer.from(JSON.stringify(metadata));
    const base64fromMetadata = bufferFromMetadata.toString("base64");
    const svgTokenURI = `data:application/json;base64,${base64fromMetadata}`;
    svgImageURIs.push(svgImageURI);
    svgTokenURIs.push(svgTokenURI);
  }
  return { svgImageURIs, svgTokenURIs };
}

module.exports = { svgToBase64 };
