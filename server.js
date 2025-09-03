import http from "http";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import url from "url";

const server = http.createServer((req, res) => {
  if (req.method === "POST") {
    const parsedUrl = url.parse(req.url, true);
    const count = parseInt(parsedUrl.query.count) || 1;
    const size = parseInt(parsedUrl.query.size) || 100;

    const directoryPath = parsedUrl.pathname;
    fs.mkdirSync(directoryPath, { recursive: true });

    let filesCreated = 0;
    const filePaths = [];

    for (let i = 0; i < count; i++) {
      const filePath = path.join(directoryPath, randomUUID());
      filePaths.push(filePath);
      const fileSize = size * 1024 * 1024; // size in MiB
      const chunkSize = 1024 * 1024; // 1 MiB
      const chunks = fileSize / chunkSize;

      const writeStream = fs.createWriteStream(filePath);

      let chunkIndex = 0;
      function write() {
        let ok = true;
        do {
          chunkIndex++;
          if (chunkIndex === chunks) {
            writeStream.end(Buffer.alloc(chunkSize));
          } else {
            ok = writeStream.write(Buffer.alloc(chunkSize));
          }
        } while (chunkIndex < chunks && ok);
        if (chunkIndex < chunks) {
          writeStream.once("drain", write);
        }
      }
      write();

      writeStream.on("finish", () => {
        console.log(`File written: ${filePath}`);
        filesCreated++;
        if (filesCreated === count) {
          res.writeHead(201, { "Content-Type": "text/plain" });
          res.end(`File created at:\n${filePaths.join("\n")}\n`);
        }
      });

      writeStream.on("error", (err) => {
        console.error(err);
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Internal Server Error\n");
      });
    }
  } else if (req.method === "GET") {
    const parsedUrl = url.parse(req.url, true);

    if (parsedUrl.pathname === "/") {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end(
        "Send a POST request to /<directory_path> to create files.\nQuery parameters:\n- count: number of files to create (default: 1)\n- size: size of each file in MiB (default: 100)\n",
      );
      return;
    }

    const directoryPath = parsedUrl.pathname;

    fs.readdir(directoryPath, (err, files) => {
      if (err) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Directory not found\n");
        return;
      }

      const fileDetails = [];
      let filesProcessed = 0;

      if (files.length === 0) {
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("Directory is empty\n");
        return;
      }

      files.forEach((file) => {
        const filePath = path.join(directoryPath, file);
        fs.stat(filePath, (err, stats) => {
          filesProcessed++;
          if (!err) {
            fileDetails.push(`${file}: ${stats.size} bytes`);
          }
          if (filesProcessed === files.length) {
            res.writeHead(200, { "Content-Type": "text/plain" });
            res.end(fileDetails.join("\n") + "\n");
          }
        });
      });
    });
  }
});

const PORT = 8080;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
