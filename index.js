const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const http = require('http');
const fileUpload = require("express-fileupload");
const { Server } = require('socket.io');
const { errorHandler } = require("./middlewares/errorMiddleware");
const connectDB = require("./config/database");
const connectCloudinary = require("./config/cloudinary");
const path = require("path");



require("dotenv").config();

// database connection
connectDB();


const port = process.env.PORT;
const app = express();

// cors
app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
);


app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: '2mb' }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
// app.use(morgan("tiny"));
app.use(helmet());
app.use(
  fileUpload({
      useTempFiles: true,
      tempFileDir: "/tmp",
  })
);



app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https://mdbcdn.b-cdn.net"],
          // Add other CSP configurations as needed
        },
      },
    })
);



// Cloudinary connection
connectCloudinary();



// routes
const auth = require("./routes/Auth");
const stockist = require("./routes/Stockist");
const admin = require("./routes/Admin");


app.use("/api/v1" , auth);
app.use("/api/v1" , stockist);
app.use("/api/v1" , admin);








const NODE_ENV = "production";


// Serve frontend
if (NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "./dist")));
  
    app.get("*", (req, res) =>
        res.sendFile(
            path.resolve(__dirname, "./", "dist", "index.html")
        )
    );
} else {
    app.get("/", (req, res) => res.send("Please set to production"));
}

app.use("*", (req, res, next) => {
    app.use("*", (req, res, next) => {
    throw new Error("Not found");
});
    
});





// Creating server
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
    }
});

io.on('connect', (socket) => { // Change 'connection' to 'connect'
    console.log('New client connected');
    
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

app.set('io', io);



app.use(errorHandler);

app.listen(port, () => console.log(`Server started on port ${port}`));

module.exports = app;
