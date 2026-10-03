// devspend 落地页部署脚本(Netlify API 直连,免 CLI)
// 令牌来源:环境变量 NETLIFY_TOKEN,或默认读 D:/money/netlify_token.txt
// 用法: node scripts/deploy-landing.mjs
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import https from 'node:https';

const TOKEN =
  process.env.NETLIFY_TOKEN ||
  readFileSync('D:/money/netlify_token.txt', 'utf8').trim();

function req(method, path, body, contentType) {
  return new Promise((resolve, reject) => {
    const data = body ? Buffer.from(body) : null;
    const r = https.request(
      {
        hostname: 'api.netlify.com',
        path,
        method,
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          ...(data
            ? { 'Content-Type': contentType || 'application/json', 'Content-Length': data.length }
            : {}),
        },
      },
      (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () =>
          resolve({ status: res.statusCode, body: Buffer.concat(chunks).toString('utf8') })
        );
      }
    );
    r.on('error', reject);
    if (data) r.write(data);
    r.end();
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function createOrReuseSite(preferredNames) {
  const list = await req('GET', '/api/v1/sites');
  const sites = list.status < 300 ? JSON.parse(list.body) : [];
  for (const name of preferredNames) {
    const hit = sites.find((s) => s.name === name);
    if (hit) return hit;
  }
  for (const name of preferredNames) {
    const res = await req('POST', '/api/v1/sites', JSON.stringify({ name }));
    if (res.status < 300) return JSON.parse(res.body);
  }
  throw new Error('所有候选站名都不可用: ' + preferredNames.join(', '));
}

// 1. 站点
const site = await createOrReuseSite(['devspend', 'devspend-cli', 'devspend-app']);
console.log('站点:', site.name, '|', site.ssl_url || site.url);

// 2. 计算文件摘要并创建 deploy
const html = readFileSync(new URL('../landing/index.html', import.meta.url), 'utf8');
const sha1 = createHash('sha1').update(html).digest('hex');
const dep = await req(
  'POST',
  `/api/v1/sites/${site.id}/deploys`,
  JSON.stringify({ files: { '/index.html': sha1 } })
);
if (dep.status >= 300) throw new Error('创建 deploy 失败: ' + dep.body.slice(0, 300));
const deploy = JSON.parse(dep.body);
console.log('deploy:', deploy.id, '|', deploy.state);

// 3. 上传缺失文件
if (Array.isArray(deploy.required) && deploy.required.length > 0) {
  for (const path of ['/index.html', 'index.html']) {
    const up = await req(
      'PUT',
      `/api/v1/deploys/${deploy.id}/files/${encodeURIComponent(path)}`,
      html,
      'application/octet-stream'
    );
    console.log('上传', path, '→', up.status);
    if (up.status < 300) break;
  }
}

// 4. 轮询直到就绪
let state = deploy.state;
for (let i = 0; i < 30 && state !== 'ready'; i++) {
  await sleep(2000);
  const st = await req('GET', `/api/v1/deploys/${deploy.id}`);
  state = st.status < 300 ? JSON.parse(st.body).state : 'error';
}
console.log('最终状态:', state);
console.log('线上地址:', (site.ssl_url || site.url).replace(/\/$/, '') + '/');
if (state !== 'ready') process.exit(1);
