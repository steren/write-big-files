# Big File Writing Server

A simple Node.js server to generate and write large files.

## Running the Server

To start the server, run the following command:

```bash
node server.js
```

The server will start on port 8080.

## API

### `GET /`

Returns a "Hello, World!" message.

### `POST /<directory_path>?count=<number_of_files>&size=<size_in_mib>`

Creates one or more large files in the specified directory.

-   `<directory_path>`: The path of the directory where the files will be created. This path is relative to the project root. The directory will be created if it doesn't exist.
-   `count` (optional, query parameter): The number of files to create. Defaults to `1`.
-   `size` (optional, query parameter): The size of each file in MiB. Defaults to `100`.

**Example:**

To create 2 files of 5 MiB each in a directory named `tmp/my-files`, you can use `curl`:

```bash
curl -X POST http://localhost:8080/tmp/my-files?count=2&size=5
```

The server will respond with the paths of the created files.
