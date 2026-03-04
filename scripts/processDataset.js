const fs = require("fs");
const path = require("path");

const CSV_FILE = path.join(
  __dirname,
  "../../Food Ingredients and Recipe Dataset with Image Name Mapping.csv",
);
const OUTPUT_FILE = path.join(__dirname, "../assets/recipes.json");
const LIMIT = 5000;

// ─── Full-file CSV parser that handles multi-line quoted fields ───────────────
function parseCSV(content) {
  const rows = [];
  let col = "";
  let row = [];
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const ch = content[i];
    const next = content[i + 1];

    if (ch === '"') {
      if (inQuotes && next === '"') {
        // Escaped quote inside field
        col += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      row.push(col);
      col = "";
    } else if ((ch === "\n" || (ch === "\r" && next === "\n")) && !inQuotes) {
      if (ch === "\r") i++; // skip \n after \r
      row.push(col);
      col = "";
      if (row.length > 1 || row[0] !== "") {
        rows.push(row);
      }
      row = [];
    } else {
      col += ch;
    }
  }

  // Last row
  if (col || row.length > 0) {
    row.push(col);
    rows.push(row);
  }

  return rows;
}

// ─── Convert Python-style list string → JS array ─────────────────────────────
function parsePythonList(str) {
  try {
    if (!str || str.trim() === "[]") return [];

    // Strip outer brackets
    const inner = str.trim().replace(/^\[|\]$/g, "");

    // Split on "', '" boundaries (handles both single and double quotes)
    const items = [];
    let current = "";
    let inStr = false;
    let quoteChar = "";

    for (let i = 0; i < inner.length; i++) {
      const ch = inner[i];

      if (!inStr && (ch === "'" || ch === '"')) {
        inStr = true;
        quoteChar = ch;
      } else if (inStr && ch === quoteChar && inner[i - 1] !== "\\") {
        inStr = false;
        const cleaned = current
          .replace(/\\'/g, "'")
          .replace(/\\"/g, '"')
          .trim();
        if (cleaned) items.push(cleaned);
        current = "";
      } else if (inStr) {
        current += ch;
      }
      // If not inStr, skip commas/spaces between elements
    }

    return items;
  } catch (e) {
    return [];
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────
function processDataset() {
  console.log(`Reading CSV from:\n  ${CSV_FILE}`);

  if (!fs.existsSync(CSV_FILE)) {
    console.error("CSV file not found!");
    process.exit(1);
  }

  const content = fs.readFileSync(CSV_FILE, "utf8");
  console.log(
    `File loaded. Size: ${(content.length / 1024 / 1024).toFixed(2)} MB`,
  );

  const rows = parseCSV(content);
  console.log(`Total rows (including header): ${rows.length}`);

  // Skip header row
  const dataRows = rows.slice(1);

  const parsedRecipes = [];
  let skipped = 0;

  for (const cols of dataRows) {
    if (parsedRecipes.length >= LIMIT) break;

    // Expected columns: index(0), Title(1), Ingredients(2), Instructions(3), Image_Name(4), Cleaned_Ingredients(5)
    if (cols.length < 5) {
      skipped++;
      continue;
    }

    const title = cols[1]?.trim();
    if (!title || title.length < 3 || title.startsWith("'")) {
      skipped++;
      continue;
    }

    const ingredientsRaw = cols[2]?.trim();
    const cleanedRaw = cols[5]?.trim() || cols[4]?.trim();
    const instructions = cols[3]
      ?.trim()
      .replace(/^"|"$/g, "")
      .replace(/\\n/g, "\n");
    const imageName = cols[4]?.trim() || "";

    const ingredients = parsePythonList(ingredientsRaw);
    const cleanedIngredients = parsePythonList(cleanedRaw);

    // Skip rows where parsing clearly went wrong
    if (ingredients.length === 0 || !instructions || instructions.length < 20) {
      skipped++;
      continue;
    }

    parsedRecipes.push({
      id: `local_${parsedRecipes.length}`,
      title,
      ingredients,
      cleanedIngredients:
        cleanedIngredients.length > 0
          ? cleanedIngredients
          : ingredients.map((i) => i.toLowerCase()),
      instructions,
      imageName,
      imageUrl: "",
      source: "local_dataset",
      category: "Dinner",
      views: Math.floor(Math.random() * 1000),
    });
  }

  console.log(`\nParsed:  ${parsedRecipes.length} valid recipes`);
  console.log(`Skipped: ${skipped} invalid rows`);

  // Verify a sample
  if (parsedRecipes.length > 0) {
    const sample = parsedRecipes[0];
    console.log("\n--- Sample Recipe ---");
    console.log("Title:", sample.title);
    console.log("Ingredient count:", sample.ingredients.length);
    console.log("First ingredient:", sample.ingredients[0]);
    console.log(
      "Instructions (first 100 chars):",
      sample.instructions.substring(0, 100),
    );
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(parsedRecipes, null, 2));
  const sizeMB = (fs.statSync(OUTPUT_FILE).size / 1024 / 1024).toFixed(2);
  console.log(`\nSaved to: ${OUTPUT_FILE}`);
  console.log(`File size: ${sizeMB} MB`);
}

processDataset();
