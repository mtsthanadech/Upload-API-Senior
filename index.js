const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const https = require("https");
const path = require("path");

const app = express();
const directoryToServe = ".";
const port = 3344;

const fileFilter = function(req, file, cb) {
    const allowedTypes = ["text/csv"];

    if (!allowedTypes.includes(file.mimetype)) {
        const error = new Error("Wrong file type");
        error.code = "LIMIT_FILE_TYPES";
        return cb(error, false);
    }

    cb(null, true);
};

const MAX_SIZE= 102400000;

const storage = multer.diskStorage(
    {
        destination: './SENIOR/',
        filename: function(req,file,cb){
            cb(null,file.originalname);
        }
    }
);

const upload = multer ({
    dest: "./../SENIOR/",
    fileFilter,
    limits: {
        fileSize: MAX_SIZE
    },
    storage
});

app.use(cors());

app.post("/upload", upload.single("file"), (req, res) => {
    res.json({ file: req.file, completed: "True" });
});

app.get('/testapi', (req, res) => {
  res.json({ name: "Withusiri", surname: "Rodsomboon" });
});

app.use("/", express.static(path.join(__dirname, "..", directoryToServe)));

const httpsOptions = {
    cert: fs.readFileSync(path.join(__dirname, "ssl", "server.crt")),
    key: fs.readFileSync(path.join(__dirname, "ssl", "server.key"))
};

https.createServer(httpsOptions, app)
    .listen(port, function() {
        console.log(`Serving the ${directoryToServe}/ directory at https://localhost:${port}`)
    });

app.use(function(err, req, res, next) {
    if (err.code === "LIMIT_FILE_TYPES") {
        res.status(422).json({ error: "Only CSV file are allowed" });
        return;
    }

    if (err.code === "LIMIT_FILE_TYPES") {
        res.status(422).json({ error: `Too large, Max size is ${MAX_SIZE/1024}kb` });
        return;
    }
});

//app.listen(3344, () => console.log("Running on localhost:3344"));
