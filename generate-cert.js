#!/usr/bin/env node

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const certDir = path.join(__dirname, ".cert");

if (!fs.existsSync(certDir)) {
  fs.mkdirSync(certDir, { recursive: true });
}

const keyPath = path.join(certDir, "key.pem");
const certPath = path.join(certDir, "cert.pem");

if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
  console.log("✓ Certificates already exist");
  process.exit(0);
}

console.log("Generating SSL certificates...");

try {
  execSync(
    `openssl req -x509 -newkey rsa:2048 -nodes -sha256 -subj '/CN=localhost' ` +
      `-keyout "${keyPath}" -out "${certPath}" -days 365`,
    { stdio: "inherit" }
  );

  console.log("\n✓ Certificates generated!");
  console.log("\n📱 Next: npm run dev:https");
  console.log("   Then access: https://<YOUR_IP>:4173");

  const gitignorePath = path.join(__dirname, ".gitignore");
  if (fs.existsSync(gitignorePath)) {
    const content = fs.readFileSync(gitignorePath, "utf-8");
    if (!content.includes(".cert")) {
      fs.appendFileSync(gitignorePath, "\n# SSL certificates\n.cert/\n");
    }
  }
} catch (error) {
  console.error("\n✗ Failed. Install OpenSSL:");
  console.error("  Windows: https://slproweb.com/products/Win32OpenSSL.html");
  console.error("  Mac/Linux: should be pre-installed");
  process.exit(1);
}
