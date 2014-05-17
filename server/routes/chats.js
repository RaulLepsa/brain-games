/**
 * Chat-related Routes
 **/

var ChatController = require('../controllers/chat-controller');

// Chats page
app.get('/secure/chats', function (req, res) {
    res.render('chat.ejs');
});