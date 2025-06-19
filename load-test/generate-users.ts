import { Configuration, OpenAIApi } from "openai";
import fs from "fs";

interface User {
  username: string;
  email: string;
}

const total = parseInt(process.env.USER_COUNT || "100000", 10);
const apiKey = process.env.OPENAI_API_KEY || "";

const openai = new OpenAIApi(new Configuration({ apiKey }));

function extractJson(content: string): string {
  const start = content.indexOf("[");
  const end = content.lastIndexOf("]");
  if (start === -1 || end === -1) {
    throw new Error("Invalid JSON response from OpenAI");
  }
  return content.slice(start, end + 1);
}

async function generateBatch(count: number): Promise<User[]> {
  const prompt =
    `Generate ${count} unique user objects in valid JSON array ` +
    `with fields “username” and “email”. ` +
    `Return only the JSON.`;

  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: "You generate test user data" },
      { role: "user", content: prompt },
    ],
  });

  const raw = response.data.choices[0].message?.content ?? "";
  const json = extractJson(raw);
  return JSON.parse(json) as User[];
}

async function main() {
  const users: User[] = [];
  while (users.length < total) {
    const remaining = total - users.length;
    const batchSize = remaining > 100 ? 100 : remaining;
    const batch = await generateBatch(batchSize);
    users.push(...batch);
  }
  fs.writeFileSync("users.json", JSON.stringify(users, null, 2));
}

main().catch((err) => {
  console.error("Failed to generate users", err);
  process.exit(1);
});
