const autocannon = require('autocannon');
const { fork } = require('child_process');
const path = require('path');

const args = process.argv.slice(2);
const async = args.includes('async');
const buffer = args.includes('buffer');
const url = `http://localhost:3000?${async ? 'async' : ''}${buffer ? `${async ? '&' : ''}buffer` : ''}`;

const child = fork(path.resolve(__dirname, './server.js'), { silent: false });

(async () => {
  await stress();
  child.kill();
  process.exit();
})();

function stress() {
  console.log(`Stress testing with async:${async} and buffer:${buffer}\n`);
  return new Promise((resolve, reject) => {
    const instance = autocannon(
      {
        url,
        connections: 100,
        pipelining: 10,
        duration: 10,
      },
      async (err, results) => {
        // console.log(results);
        if (err) {
          return reject(err);
        }
        resolve(results);
      },
    );
    autocannon.track(instance, { renderProgressBar: true });
  });
}
