const { spawn } = require('child_process');
const path = require('path');

const script = path.join(__dirname, 'browser_qa_clean_urls.cjs');
const child = spawn(process.execPath, [script], {
  stdio: ['ignore', 'pipe', 'pipe'],
  detached: process.platform !== 'win32',
  env: process.env,
});

let verified = false;
let finished = false;
let outputBuffer = '';

function terminateGroup(signal = 'SIGTERM') {
  if (!child.pid) return;
  try {
    if (process.platform !== 'win32') process.kill(-child.pid, signal);
    else child.kill(signal);
  } catch (_) {
    try { child.kill(signal); } catch (_) {}
  }
}

function finish(code) {
  if (finished) return;
  finished = true;
  terminateGroup('SIGTERM');
  const hardStop = setTimeout(() => terminateGroup('SIGKILL'), 500);
  hardStop.unref();
  setTimeout(() => process.exit(code), 120).unref();
}

function inspectOutput(chunk) {
  const text = String(chunk);
  process.stdout.write(text);
  outputBuffer = (outputBuffer + text).slice(-4096);

  if (
    outputBuffer.includes('Clean URL Browser QA passed:')
    && outputBuffer.includes('unique visible internal routes')
  ) {
    verified = true;
    finish(0);
  }
}

child.stdout.on('data', inspectOutput);
child.stderr.on('data', (chunk) => process.stderr.write(chunk));

child.on('error', (error) => {
  console.error(`Browser QA runner failed to start: ${error.message}`);
  finish(1);
});

child.on('exit', (code, signal) => {
  if (finished) return;
  if (verified) return finish(0);
  if (signal) console.error(`Browser QA exited by signal ${signal}`);
  finish(code ?? 1);
});

process.on('SIGTERM', () => finish(124));
process.on('SIGINT', () => finish(130));
