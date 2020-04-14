/* global window, fetch, location */
// @ts-nocheck
window.onload = function () {
  const runner = mocha.run();
  const failedTests = [];

  runner.on('end', function () {
    const url = new URL(location.href);
    const worker = Number(url.searchParams.get('worker'));
    const retry = Number(url.searchParams.get('retry'));

    window.mochaResults = runner.stats;
    window.mochaResults.reports = failedTests;
    window.mochaResults.retries = retry;
    window.mochaResults.worker = worker;

    fetch('/results', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(window.mochaResults),
    });
  });

  runner.on('fail', (test, err) => {
    failedTests.push({
      name: test.title,
      result: false,
      message: err.message,
      stack: err.stack,
      titles: flattenTitles(test),
    });
  });
};

function flattenTitles(test) {
  const titles = [];

  while (test.parent.title) {
    titles.push(test.parent.title);
    test = test.parent;
  }

  return titles.reverse();
}
