/**
 * Chat-related operations
 **/

var io = require('socket.io').listen(app.server);

// Array of different rooms
var _rooms = ['General Room', 'Agility Room', 'Flexibility Room', 'Memory Room', 'Puzzle Room'];

// Users which are currently connected to the chat
var _users = {};

// Create a separate object for each room
_rooms.forEach(function (room) {
    _users[room] = {};
});

/* Export the function that renders the Chat page */
module.exports = function(req, res) {
    res.render('chat.ejs', {username: req.user.username, rooms: _rooms});
};

io.sockets.on('connection', function (socket) {

    /* Client sends message to the chat */
    socket.on('sendchat', function (data) {

        // Update the chat with the data sent by the user
        io.sockets.emit('updatechat', socket.room, socket.username, data);
    });

    /* After being connected, the client requests to be added to a specific room */
    socket.on('adduser', function (userId, username, room) {

        // Store the user information in the socket session for this client
        socket.username = username;
        socket.userid = userId;
        socket.room = room;

        // Add the client to the respective room
        _users[room][userId] = username;

        // Echo to client that he connected
        socket.emit('updatechat', room, 'SERVER', 'you have connected');

        // Broadcast in the room that a person has connected
        socket.broadcast.emit('updatechat', room, 'SERVER', username + ' has connected to the room');

        // Update the list of users in that room
        io.sockets.emit('updateusers', room, _users[room]);
    });

    /* Client changes room */
    socket.on('changeroom', function (currentRoom, nextRoom) {

        var userId = socket.userid;
        var username = socket.username;

        // Update user information with new room
        socket.room = nextRoom;

        // Remove the user from the room and add him to the other room
        delete _users[currentRoom][socket.userid];
        _users[nextRoom][userId] = username;

        // Notify the 2 rooms of the change and notify the client
        socket.broadcast.emit('updatechat', currentRoom, 'SERVER', username + ' has left the room');
        socket.broadcast.emit('updatechat', nextRoom, 'SERVER', username + ' has connected to the room');
        socket.emit('updatechat', nextRoom, 'SERVER', 'You have switched to the ' + nextRoom);

        // Update the list of users from the rooms
        socket.broadcast.emit('updateusers', currentRoom, _users[currentRoom]);
        io.sockets.emit('updateusers', nextRoom, _users[nextRoom]);
    });

    /* Client disconnects */
    socket.on('disconnect', function () {

        // Remove the username from the room they belong to (delete from all the rooms just in case)
        _rooms.forEach(function (room) {
            delete _users[room][socket.userid];
        });

        // Update list of users in the chat
        io.sockets.emit('update_users', _users);

        // Broadcast that this client has left
        socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
    });
});
