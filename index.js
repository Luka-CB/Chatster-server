const express = require("express");
const http = require("http");
const connectDB = require("./config/db");
const cookieSession = require("cookie-session");
const cors = require("cors");
const passport = require("passport");
const { Server } = require("socket.io");
const { notFound, errorHandler } = require("./middlewares/errors");

require("dotenv").config();
require("colors");
require("./config/passport");

connectDB();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["https://chatster-orcin.vercel.app", "http://localhost:3000"],
  },
});

require("./socket/index")(io);

app.use(express.json({ limit: "25mb" }));
app.use(
  cors({
    origin: ["https://chatster-orcin.vercel.app", "http://localhost:3000"],
    credentials: true,
  })
);
app.use(
  cookieSession({
    name: "simpleChatOauthSession",
    keys: ["someKey"],
    maxAge: 24 * 60 * 60 * 100 * 30,
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/requests", require("./routes/requests"));
app.use("/api/friends", require("./routes/friends"));
app.use("/api/chats", require("./routes/chats"));
app.use("/api/messages", require("./routes/messages"));
app.use("/api/groups", require("./routes/groups"));
app.use("/api/unread-msgs", require("./routes/unreadMsgs"));
app.use("/api/unread-group-msgs", require("./routes/unreadGroupMsgs"));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () =>
  console.log(`Server is Up and Running On Port ${PORT}`.cyan.bold)
);
