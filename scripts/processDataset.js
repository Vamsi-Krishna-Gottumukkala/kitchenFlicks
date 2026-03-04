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

// ─── Food Image Mapping ──────────────────────────────────────────────────────
// Curated Unsplash photo IDs per food category.
// Format: https://images.unsplash.com/photo-{ID}?w=600&q=80
// These are stable permanent CDN links — no API key required.
const FOOD_IMAGES = {
  chicken: [
    "1598103442097-8b74394b95c8",
    "1501200291289-c5a76c232e5f",
    "1604908176997-125f25cc6f3d",
    "1568901346375-23c9450c58cd",
    "1546548970-71785318a17b",
    "1567620905732-2d1ec7ab7445",
    "1588166524941-3bf61a9c41db",
    "1532636875304-0c89467ce2c3",
  ],
  beef: [
    "1546964124-0cce460a59e4",
    "1558030006-c0cc72dce343",
    "1529692236671-f1f6cf9683ba",
    "1544025162-d76694265947",
    "1633945274405-b6c8069047b0",
    "1606728035253-49e8a23146de",
    "1615937657715-bc7b4b7962c1",
    "1600781765038-cb74c5e2d9e4",
  ],
  pasta: [
    "1551183053-bf91798d0ld",
    "1549190045-87b63c6e5a8a",
    "1579952363873-27f3bade9f55",
    "1621996346565-ead6ed87eb8f",
    "1473093295043-cdd812d0e601",
    "1556761175-5973dc0f32e7",
    "1574894709920-11b69c7a1b70",
    "1572374234225-4f621945e7fa",
  ],
  salad: [
    "1512621776951-a57141f2eefd",
    "1540420773420-3366772f4999",
    "1543339308-43e59d6b73a6",
    "1593620659997-31555ab1a4a3",
    "1528712306091-ed0763094c98",
    "1546069901-5ec6a79120b0",
    "1505576399279-565b52d4ac71",
    "1518779578993-ec3579fee39f",
  ],
  soup: [
    "1547592180-85f173990554",
    "1604152135912-04a022e23696",
    "1607532941433-304659e8198a",
    "1534939561116-5e7d0a5e7289",
    "1603105037880-880cd4edfb0d",
    "1547592166-23ac45744a35",
    "1583394293253-b4d0a951f2c3",
    "1512003867696-6d5ce6835040",
  ],
  seafood: [
    "1519708227418-a8d2ac58e176",
    "1546069901-5ec6a79120b0",
    "1565299585323-38d6b0865b47",
    "1519984388953-d2406bc725e1",
    "1559847844-5315695dadae",
    "1615141982883-c7ad0e69fd62",
    "1612929633738-8fe44f7ec841",
    "1530469912745-a215c6b256ea",
  ],
  breakfast: [
    "1533089860892-a7c6f3a1d9e3",
    "1525351484163-7529414344d8",
    "1504754524776-8f4f37790ca0",
    "1551782779-8b30e4956b46",
    "1484723091739-30a097e8f929",
    "1513442542250-854d436a73f2",
    "1567620905732-2d1ec7ab7445",
    "1528735602780-2552fd46c7af",
  ],
  dessert: [
    "1563729784474-d77dde928136",
    "1551024506-0bccd828d307",
    "1488477181700-a814f4aba1fe",
    "1517093157656-e68ac09af5a2",
    "1586985289688-ca3cf47d3e6f",
    "1464305795204-6f5bbfc7fb81",
    "1571877227200-a0d98ea607e9",
    "1565958011703-44f9829ba187",
  ],
  baking: [
    "1509440159596-0249088772ff",
    "1532499016263-f2c3909f701a",
    "1558961363-fa8fdf82db35",
    "1549931319-a545dcf3bc73",
    "1486887396153-e88c43941b38",
    "1556471013-96106d236412",
    "1565958011703-44f9829ba187",
    "1576618148400-f54bed99fcfd",
  ],
  vegetarian: [
    "1512621776951-a57141f2eefd",
    "1540420773420-3366772f4999",
    "1565599106820-28a0fddef10f",
    "1557800636-894a64c1696f",
    "1574626839482-3b7b6bbdc929",
    "1543362906-acfc16c67564",
    "1546548970-71785318a17b",
    "1506784983877-45594efa4cbe",
  ],
  rice: [
    "1603133872878-684f208fb84b",
    "1536304929831-ef1763a87e28",
    "1455619452474-d2be8182ae5d",
    "1512058564366-18510be2db19",
    "1574071318508-1cdbab80d002",
    "1547516555-0de59e05e1b5",
  ],
  pork: [
    "1544025162-d76694265947",
    "1637165932-9bdb4bfb9be5",
    "1514516816566-de580c621376",
    "1555939594-58d7cb561ad1",
  ],
  pizza: [
    "1513104890138-7c749659a591",
    "1604382354936-07c5d9983bd3",
    "1565299624946-b28f40a0ae38",
    "1571407280973-78cf03f37a60",
    "1593560708920-61dd98c46a4e",
    "1548369937-47519962c11a",
  ],
  cake: [
    "1563729784474-d77dde928136",
    "1551024506-0bccd828d307",
    "1464305795204-6f5bbfc7fb81",
    "1571877227200-a0d98ea607e9",
  ],
  default: [
    "1546069901-5ec6a79120b0",
    "1504674900247-0877df9cc836",
    "1512621776951-a57141f2eefd",
    "1498837167922-ddd27525d352",
    "1467003909585-2f8a72700288",
    "1529042410759-befb1204b468",
    "1476224203421-74ec76854f64",
    "1563379091339-03b21ab4a4f8",
  ],
};

function getImageForRecipe(title, ingredients) {
  const text = (title + " " + (ingredients || []).join(" ")).toLowerCase();

  const checks = [
    ["chicken", "poultry", "hen"],
    ["beef", "steak", "burger", "brisket", "ground beef"],
    [
      "pasta",
      "spaghetti",
      "fettuccine",
      "penne",
      "linguine",
      "lasagna",
      "noodle",
    ],
    ["salad"],
    ["soup", "stew", "broth", "chowder", "bisque"],
    [
      "seafood",
      "fish",
      "salmon",
      "tuna",
      "shrimp",
      "prawn",
      "crab",
      "lobster",
      "cod",
      "tilapia",
    ],
    ["breakfast", "egg", "pancake", "waffle", "omelette", "oatmeal", "bacon"],
    [
      "dessert",
      "cake",
      "cookie",
      "brownie",
      "chocolate",
      "ice cream",
      "pudding",
      "tart",
    ],
    ["baking", "bread", "muffin", "scone", "biscuit", "dough", "flour"],
    ["vegetarian", "vegan", "tofu", "tempeh"],
    ["rice", "risotto", "pilaf", "fried rice"],
    ["pork", "ham", "bacon", "sausage", "ribs"],
    ["pizza"],
    ["cake", "cupcake"],
  ];

  const keys = [
    "chicken",
    "beef",
    "pasta",
    "salad",
    "soup",
    "seafood",
    "breakfast",
    "dessert",
    "baking",
    "vegetarian",
    "rice",
    "pork",
    "pizza",
    "cake",
  ];

  let matchedKey = "default";
  for (let i = 0; i < checks.length; i++) {
    if (checks[i].some((kw) => text.includes(kw))) {
      matchedKey = keys[i];
      break;
    }
  }

  const pool = FOOD_IMAGES[matchedKey] || FOOD_IMAGES.default;
  // Pick a deterministic image from the pool using title hash
  const hash = title
    .split("")
    .reduce((a, c) => c.charCodeAt(0) + ((a << 5) - a), 0);
  const idx = Math.abs(hash) % pool.length;
  return `https://images.unsplash.com/photo-${pool[idx]}?w=600&q=80`;
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
      imageUrl: getImageForRecipe(title, ingredients), // ← stable food photo CDN URL
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
