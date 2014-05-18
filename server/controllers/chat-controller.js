/**
 * Chat-related operations
 **/

var io = require('socket.io').listen(app.server);

// usernames which are currently connected to the chat
var usernames = {};

io.sockets.on('connection', function (socket) {

    /* Client sends message to the chat */
    socket.on('sendchat', function (data) {

        // Update the chat with the data sent by the user
        io.sockets.emit('updatechat', socket.username, data);
    });

    /* After being connected, the client requests to be added to the chat */
    socket.on('adduser', function (userId, username) {

        // Store the user information in the socket session for this client
        socket.username = username;
        socket.userid = userId;

        // Add the client's username to the global list
        usernames[userId] = username;

        // Echo to client that he connected
        socket.emit('updatechat', 'SERVER', 'you have connected');

        // Broadcast that a person has connected
        socket.broadcast.emit('updatechat', 'SERVER', username + ' has connected');

        // Update the list of users in chat, client-side
        io.sockets.emit('updateusers', usernames);
    });

    /* Client disconnects */
    socket.on('disconnect', function () {

        // Remove the username from global usernames list
        delete usernames[socket.userid];

        // Update list of users in the chat
        io.sockets.emit('updateusers', usernames);

        // Broadcast that this client has left
        socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
    });
});