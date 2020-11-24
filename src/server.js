const app = require("express")();
const server = require("http").createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});
const PORT = process.env.port || 4002;

/**
 *  Quick and easy storage
 */
const history = [];

/**
 *  Middlewares
 */
const bodyParser = require("body-parser");
const cors = require("cors");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

/**
 *  Helper functions
 */
const delay = (time) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
};
const addToHistory = (item) => {
  history.push(item);
  io.sockets.emit("history", {
    data: history.slice(-5),
    message: "Added to history",
  });
};

/**
 * REST Endpoints
 */
app.post("/tree", (req, res) => {
  const { length, mass } = req.body;

  if (Number.isNaN(length)) return res.sendStatus(403);
  if (Number.isNaN(mass)) return res.sendStatus(403);

  delay(2500).then(() => {
    const result = {
      treeData: length * mass,
    };

    addToHistory(result.treeData);
    res.send(result);
  });
});

/**
 *  Socket.io Event listeners
 */
io.on("connection", (socket) => {
  console.log(`User ${socket.id} Connected`);

  socket.emit("history", {
    data: history.slice(-5),
    message: "Latest history entries",
  });
  socket.on("disconnect", () => {
    console.log(`User ${socket.id} disconnected`);
  });
});

/**
 *  Initializing server listener
 */
const listener = server.listen(PORT, () => {
  console.log("Your server is running on port " + listener.address().port);
});
