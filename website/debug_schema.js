const db = require("./config/db");
const fs = require("fs");

async function checkSchema() {
  try {
    let output = "";

    output += "--- LEADS TABLE ---\n";
    const [leads] = await db.query("DESCRIBE leads");
    output +=
      leads
        .map(
          (c) =>
            `${c.Field} | ${c.Type} | Null:${c.Null} | Default:${c.Default}`,
        )
        .join("\n") + "\n\n";

    output += "--- MESSAGES TABLE ---\n";
    const [messages] = await db.query("DESCRIBE messages");
    output +=
      messages
        .map(
          (c) =>
            `${c.Field} | ${c.Type} | Null:${c.Null} | Default:${c.Default}`,
        )
        .join("\n") + "\n\n";

    output += "--- TRADESPERSON_PROFILES TABLE ---\n";
    const [profiles] = await db.query("DESCRIBE tradesperson_profiles");
    output +=
      profiles
        .map(
          (c) =>
            `${c.Field} | ${c.Type} | Null:${c.Null} | Default:${c.Default}`,
        )
        .join("\n") + "\n\n";

    output += "--- JOBS TABLE ---\n";
    const [jobs] = await db.query("DESCRIBE jobs");
    output +=
      jobs
        .map(
          (c) =>
            `${c.Field} | ${c.Type} | Null:${c.Null} | Default:${c.Default}`,
        )
        .join("\n") + "\n\n";

    output += "--- USERS TABLE ---\n";
    const [users] = await db.query("DESCRIBE users");
    output +=
      users
        .map(
          (c) =>
            `${c.Field} | ${c.Type} | Null:${c.Null} | Default:${c.Default}`,
        )
        .join("\n") + "\n\n";

    // fs.writeFileSync("schema_output.txt", output);
    console.log("Schema written to schema_output.txt",output);
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkSchema();
