const fs = require("fs");
const readline = require("readline");

async function extractSample() {
  const fileStream = fs.createReadStream(
    "d:/vs codes/kitchenFlicks/Food Ingredients and Recipe Dataset with Image Name Mapping.csv",
  );
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let lineCount = 0;
  let headers = "";
  for await (const line of rl) {
    if (lineCount === 0) {
      headers = line;
    } else if (lineCount === 1) {
      const row = line;
      fs.writeFileSync(
        "./sample.json",
        JSON.stringify({ headers, row }, null, 2),
      );
      break;
    }
    lineCount++;
  }
}

extractSample();
