// @ts-nocheck
import chalk from 'chalk';
import fs from 'fs';
import http from 'http';
import path from 'path';
import puppeteer from 'puppeteer';
import send from 'send';

const PORT = 8080;
const TIMEOUT = 1 * 60 * 1000;

let exitCode = 0;
let browser, server;

process.on('SIGINT', exit);

(async function run() {
  try {
    console.log(`Running browser tests:`);
    server = await startServer();
    browser = await puppeteer.launch();

    const page = await browser.newPage();

    await page.goto('http://localhost:8080');

    setTimeout(() => {
      console.error(Error(`timeout after ${TIMEOUT / 60000}min`));
      exit(true);
    }, TIMEOUT);
  } catch (err) {
    console.error(err);
    exit(true);
  }
})();

async function exit(abort = false) {
  server && server.close();
  browser && (await browser.close());
  process.exit(abort ? 1 : exitCode);
}

async function startServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      let pathname = new URL(req.url, 'http://localhost').pathname;
      if (pathname === '/') {
        pathname = '/index.html';
      } else if (pathname.startsWith('/node_modules') || pathname === '/browser.js' || pathname === '/shared.js') {
        pathname = `../..${pathname}`;
      } else if (pathname === '/results' && req.method === 'POST') {
        return parseResults(req);
      }

      const filePath = path.join('test/browser', pathname);

      if (!filePath || !fs.existsSync(filePath)) {
        res.writeHead('404');
        return res.end();
      }

      return send(req, filePath, {
        cacheControl: false,
      }).pipe(res);
    });

    server.on('error', reject);
    server.on('listening', resolve);
    server.listen(PORT);
    return server;
  });
}

async function parseResults(req) {
  let body = '';

  for await (const chunk of req) {
    body += chunk.toString();
  }

  const results = JSON.parse(body);
  const failed = results.failures > 0;
  const length = String(results.passes + results.failures).length;

  console.log(chalk.bold(`\n${req.headers['user-agent']}`));
  console.log(` ${chalk.green(String(results.passes).padStart(length, ' '))} passes`);
  console.log(` ${chalk.red(String(results.failures).padStart(length, ' '))} failures\n`);

  if (failed) {
    exitCode = 1;
    reportFailure(results);
  }

  console.log('\n');

  exit(false);
}

function reportFailure(results) {
  const headings = [];

  for (const report of results.reports) {
    let i = 0;
    for (; i < report.titles.length; i++) {
      const heading = report.titles[i];

      if (heading !== headings[i]) {
        console.log(`${indent(i + 2)}${heading}`);
        headings[i] = heading;
      }
    }
    console.log(`${indent(i + 2)}${chalk.red(`✖ ${report.name}`)}`);
    console.log(`${indent(i + 3)}${report.message}`);
  }
}

function indent(level) {
  return Array(level).join('  ');
}
