/**
 * Chat-related Routes
 **/

var renderChatPageFunction = require('../controllers/chat-controller');

// Chats page
app.get('/secure/chats', function (req, res) {
    renderChatPageFunction(req, res);
});