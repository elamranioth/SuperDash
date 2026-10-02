const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8088;
const APK_PATH = path.resolve(__dirname, '../SuperDash.apk');

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (fs.existsSync(APK_PATH)) {
    const stat = fs.statSync(APK_PATH);
    res.setHeader('Content-Type', 'application/vnd.android.package-archive');
    res.setHeader('Content-Disposition', 'attachment; filename="SuperDash.apk"');
    res.setHeader('Content-Length', stat.size);
    fs.createReadStream(APK_PATH).pipe(res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('SuperDash.apk not found on disk');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Direct APK server running on port ${PORT}`);
});
