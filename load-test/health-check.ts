import http from "node:http";

function check(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      if (res.statusCode && res.statusCode >= 200 && res.statusCode < 400) {
        res.resume();
        resolve();
      } else {
        reject(new Error(`Service at ${url} returned ${res.statusCode}`));
      }
    });
    req.on("error", reject);
  });
}

async function main() {
  const targets = [
    process.env.EXPRESS_HEALTH_URL || "http://localhost:8000/api/v1/admin/health",
    process.env.ELASTICSEARCH_HEALTH_URL || "http://localhost:9200/_cluster/health",
    process.env.KIBANA_HEALTH_URL || "http://localhost:5601/api/status",
  ];
  for (const url of targets) {
    await check(url);
  }
}

main().catch((err) => {
  console.error("Health check failed", err);
  process.exit(1);
});
