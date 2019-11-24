var app = require("express")();
var http = require("http").createServer(app);
var io = require("socket.io")(http);
var faker = require("faker");

var registeredUsers = [
  {
    name: "William",
    friends: ["Nathan"]
  },
  {
    name: "Nathan",
    friends: ["William"]
  }
];

var activeUsers = [];

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/src/index.html");
});

io.on("connection", function(socket) {
  // console.log(`${socket.id} has joined`);
  // console.log("Current Users: ");
  // console.log(activeUsers);

  activeUsers.push({ id: socket.id, account: {} });

  socket.on("disconnect", function() {
    activeUsers = activeUsers.filter(activeUser => activeUser.id != socket.id);
    socket.emit("usersUpdates", { online: activeUsers });
  });

  socket.on("login", function(msg) {
    var currentUser = registeredUsers.find(user => user.name == msg.name);
    if (currentUser) {
      activeUsers.find(user => user.id == socket.id).account = currentUser;

      socket.emit("usersUpdates", { online: activeUsers });
      console.log(`${socket.id} has become ${currentUser.name}`);
      console.log("Current Users:");
      console.log(activeUsers);
    }
  });

  socket.on("logout", function(msg) {
    var currentUser = registeredUsers.find(user => user.name == msg.name);
    if (currentUser) {
      activeUsers.find(user => user.id == socket.id).account = {};

      socket.emit("usersUpdates", { online: activeUsers });
      console.log(`${currentUser.name} has logged out`);
      console.log("Current Users:");
      console.log(activeUsers);
    }
  });

  // io.on("connection", function(socket) {
  //   socket.on("chat message", function(msg) {
  //     console.log("message: " + msg);
  //   });
  // });
});

http.listen(3000, function() {
  console.log("listening on *:3000");
});
