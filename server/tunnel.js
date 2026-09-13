import { exec } from 'child_process';

const STATIC_DOMAIN = 'theorize-energize-matted.ngrok-free.dev';
const AUTH_TOKEN = '3HfpgadPN1t2XCR1afbLB0FhWG1_6Xs5Hn5RsFfEZUchosydf';

function startTunnel() {
  console.log(`[TUNNEL] Starting ngrok on permanent domain: ${STATIC_DOMAIN}...`);
  const ls = exec(`npx ngrok http --url=${STATIC_DOMAIN} --authtoken=${AUTH_TOKEN} 5000`);
  let hasFailed = false;

  ls.stdout.on('data', (data) => {
    console.log(`[TUNNEL] ${data.trim()}`);
  });

  ls.stderr.on('data', (data) => {
    const msg = data.trim();
    if (msg) console.log(`[TUNNEL] ${msg}`);
  });

  ls.on('close', (code) => {
    if (code !== 0 && code !== null) {
      hasFailed = true;
      console.log(`[TUNNEL] ngrok exited with code ${code}. Retrying in 5s...`);
      setTimeout(startTunnel, 5000);
    }
  });

  setTimeout(() => {
    if (!hasFailed) {
      console.log(`[TUNNEL] ✅ Permanent URL active: https://${STATIC_DOMAIN}`);
      console.log(`[TUNNEL] 🚀 API tunnel available at: https://${STATIC_DOMAIN}/api`);
      console.log(`[TUNNEL] 🌐 Web App is open at: http://localhost:5173`);
    }
  }, 4000);
}

startTunnel();
