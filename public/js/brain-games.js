/*! Brain Games */

/** Functions for authentication-related pages **/
var authentication = {

	/* On Signin/Signup page ready - displays an error (if any); 'element' is a jQuery element that contains the error */
	pageReady: function(element) {

        // Clear locally-stored user information
        utils.clearUserInformation();

		var error = element.html();
		if (error && error !== '') {
			utils.displayAlert(element, error);
		}
	}
};

/** Functions for the Home page **/
var home = {

	/* Home page ready function */
	pageReady: function() {
		$('#nav-home').addClass('active');
	}
};

/** Functions for page that lists games **/
var games = {

	/* When the page is ready, bind a click event to the Game categories list in order to retrieve Games by category */
	pageReady: function() {

		$('#nav-games').addClass('active');

		// Clicking on a Category
		$('#category-list a').click(function() {
			// Get category and set it on the window location href
			var selected = $(this);
			var category = selected.attr('href').split('#')[1];
			if (category === '') {
				category = null;
			}

			// Get all the games by category
			$.ajax({
				type: 'GET',
				url: utils.getSecureContext() + '/games/category/' + category,
				success: function(response) {
					$('#category-list a').removeClass('active');
					$('#game-list').html(response);
					selected.addClass('active');
					games.gameListReady();
				},
				error: handlers.errorHandler
			});
		});

		// Bind the data-toggle for the Secondary Navigation
		$('[data-toggle=offcanvas]').click(function () {
		  $('.row-offcanvas').toggleClass('active')
		});
	},

	/* When the List of Games on the Game page is (re)populated, (re)bind the click function on the elements */
	gameListReady: function() {
		$('#game-list').find('input[type="button"]').click(games.gameSelected);
	},

    /* Triggered when a game is selected to be played */
    gameSelected: function() {
        var button = $(this);
        var gameId = button.attr('id');
        var gameName = $(this).parent().find('h2').html();

        // Store game id
        localStorage.setItem('game-id', gameId);
        localStorage.setItem('game-name', gameName);

        // Save Game Access Entry
        $.ajax({
            type: 'POST',
            url: utils.getSecureContext() + '/gameAccess',
            data: {gameId: gameId, gameName: gameName}
        });

        // Go to game
        window.location = button.attr('href');
    },

	/* When the Color Match page is ready, listen for the game-finished event. When triggered, handle it accordingly */
	pageReadyColorMatch: function() {
		var gameId = localStorage.getItem('game-id');
		var gameName = localStorage.getItem('game-name');
		if (!gameId) {
			window.location = utils.getSecureContext() + '/games';
			return;
		} else {
            // Get previous best score for current user
            $.ajax({
                type: 'GET',
                url: utils.getSecureContext() + '/game-score/top',
                data: {gameId: gameId},
                success: function(response) {
                    localStorage.setItem('previous-best', response.score);
                },
                error: handlers.errorHandler
            });
        }

		// Game finished event listener
		$(document).on('game-finished', function() {
			$('#game-content').hide();

			// Detect invalid score
			if (colorMatch._score != $('#game-score').html()) {
				alert('Invalid score');
				window.location = utils.getSecureContext() + '/games';
				return;
			}

			// Save game score
			$.ajax({
				type: 'POST',
				url: utils.getSecureContext() + '/game-score',
				data: { gameId: gameId, gameName: gameName, points: colorMatch._score, correct: colorMatch._correct,
					wrong: colorMatch._wrong, combos: colorMatch._comboCount, consecutive: colorMatch._consecutive },
				success: function() {

					// At this moment the game is over
					var previousBest = parseInt(localStorage.getItem('previous-best'));
					if (isNaN(previousBest)) { previousBest = null; }
					
					var score = colorMatch._score;

					var calloutClass;
					var calloutHeader;
					var calloutText;

					// Set the notification text depending on the score and previous best
					if (previousBest == null) {
						calloutClass = 'bs-callout-success';
						calloutHeader = 'First one!';
						calloutText = 'This is your first game and you set a score of <strong>' + score + '</strong>!';
					} else if (score > previousBest) {
						calloutClass = 'bs-callout-success';
						calloutHeader = 'Congrats!';
						calloutText = 'You\'ve set a new high score of <strong>' + score + '</strong>! Your previous best was <strong>' + previousBest  + '</strong>.';
					} else if (previousBest - score < 150) {
						calloutClass = 'bs-callout-info';
						calloutHeader = 'So close!';

						if (score === previousBest) {
							calloutText = 'You\'ve just equalized your previous best score of <strong>' + score + '</strong>';
						} else {
							calloutText = 'You needed just <strong>' + (previousBest - score) + '</strong> more points to equalize your ' +
											'previous best of <strong>' + previousBest + '</strong>';
						}
					} else {
						calloutClass = 'bs-callout-danger';
						calloutHeader = 'Not enough!';
						calloutText = 'Your score of <strong>' + score + '</strong> is pretty far away from your personal best of ' + 
										'<strong>' + previousBest + '</strong>. You can do better!';
					}

					// Display it
					var gameoverDiv = $('#gameover');
					gameoverDiv.addClass(calloutClass);
					gameoverDiv.find('h4').html(calloutHeader);
					gameoverDiv.find('p').html(calloutText);
					gameoverDiv.fadeIn();

					$('#game-finished-btn').show();

					// Remove localStorage items
					localStorage.removeItem('previous-best');
				},
				error: handlers.saveScoreErrorHandler
			});
		});

        localStorage.removeItem('game-id');
        localStorage.removeItem('game-name');
	},

    pageReady2048: function() {
        var gameManager = new GameManager(4, KeyboardInputManager, HTMLActuator, LocalStorageManager);

        var gameId = localStorage.getItem('game-id');
        var gameName = localStorage.getItem('game-name');
        if (!gameId) {
            window.location = utils.getSecureContext() + '/games';
            return;
        }

        // Get previous best score for current user
        $.ajax({
            type: 'GET',
            url: utils.getSecureContext() + '/game-score/top',
            data: {gameId: gameId},
            success: function(response) {
                localStorage.setItem(new LocalStorageManager().bestScoreKey, response.score);
            },
            error: handlers.errorHandler
        });

        // Game finished event listener
        $(document).on('game-finished', function() {

            // Save game score
            $.ajax({
                type: 'POST',
                url: utils.getSecureContext() + '/game-score',
                data: { gameId: gameId, gameName: gameName, points: gameManager.score},
                success: function () {
                    //TODO: Display high score for game
                }
            });
        });
    }
};

/** Chat-related functions **/
var chat = {

    /* When the chat page is loaded, connect to socket-io and initialize chatting w/ the server */
    chatPageReady: function() {

        $('#nav-chat').addClass('active');

        // Connect socket-io
        var socket = io.connect();

        // Store some elements
        var dataElement = $('#data');
        var sendDataBtn = $('#datasend');
        var usersElement = $('#users');
        var conversationElement = $('#conversation');
        var roomList = $('#room-list').find('a');

        // Bind the data-toggle for the Secondary Navigation
        $('[data-toggle=offcanvas]').click(function () {
            $('.row-offcanvas').toggleClass('active')
        });

        // Clear room information
        localStorage.removeItem('bg-room');

        /* On connection to server, add the current user to the list of users in the chat room */
        socket.on('connect', function () {
            // Call the server-side function 'adduser' and send the user information
            utils.getUserInformation(function(userInfo) {
                var currentRoom = chat.getCurrentRoom();
                socket.emit('adduser', userInfo.id, userInfo.username, currentRoom);
            });
        });

        /* Listener that updates the chat when the server emits 'updatechat' */
        socket.on('updatechat', function (room, username, data) {
            if (room === chat.getCurrentRoom()) {
                var messageClass = '';

                if (username === 'SERVER') {
                    messageClass = 'blue';
                } else {
                    utils.getUserInformation(function (userInfo) {
                        if (username === userInfo.username) {
                            messageClass = 'red';
                        }
                    });
                }

                // Append text
                conversationElement.append('<p class="' + messageClass + '"><strong>' + username + ':</strong> ' + data + '</p>');

                // Scroll to bottom
                conversationElement.animate({ scrollTop: conversationElement[0].scrollHeight}, 10);
            }
        });

        /* Listener that updates the list of users when the server emits 'updateusers' */
        socket.on('updateusers', function (room, data) {
            if (room === chat.getCurrentRoom()) {
                var usersHtml = '';
                $.each(data, function (id, username) {
                    usersHtml += '<div id="' + id + '">' + username + '</div>';
                    console.log(id + username);
                });
                usersElement.html(usersHtml);
            }
        });

        /* Send a message */
        sendDataBtn.click(function () {
            var message = dataElement.val();
            if (message.trim() !== '') {
                dataElement.val('');

                // Trigger server's 'sendchat' function
                socket.emit('sendchat', message);
            }
            dataElement.focus();
        });

        /* Listen to the ENTER key in order to send the message */
        dataElement.keypress(function (e) {
            if (e.which == 13) {
                $(this).blur();
                sendDataBtn.focus().click();
            }
        });

        /* Change a room */
        roomList.click(function () {
            roomList.removeClass('active');

            // Get selected room
            var nextRoom = $(this).html();
            $(this).addClass('active');

            // Change room if necessary
            var currentRoom = chat.getCurrentRoom();
            if (nextRoom !== currentRoom) {

                // Change room locally and erase chat
                localStorage.setItem('bg-room', nextRoom);
                conversationElement.html('');
                $('#chat-title').html(nextRoom);

                // Emit to the server that the room was changed
                socket.emit('changeroom', currentRoom, nextRoom);
            }
        });
    },

    getCurrentRoom: function() {
        var currentRoom = localStorage.getItem('bg-room');
        if (!currentRoom || currentRoom === '') {
            currentRoom = 'General Room';
        }
        return currentRoom;
    }
};

/** Name says it all: util functions **/
var utils = {

	/* Displays an alert in the DOM element 'elem', having the text 'message' */
	displayAlert: function(elem, message) {
		elem.show().html(message);
		setTimeout(function() { utils.removeAlert(elem) }, 5000);
	},

	/* Removes an alert from a certain DOM element */
	removeAlert: function(elem) {
		elem.hide().html('');
	},

    /* Get secure application context */
    getSecureContext: function() {
        return '/secure';    
    },

    /* Clear user information */
    clearUserInformation: function() {
        localStorage.removeItem('bg-userid');
        localStorage.removeItem('bg-username');
    },

    /* Retrieve current user information in a callback function with 1 parameter */
    getUserInformation: function(callback) {
        var userInformation = {};
        var userId = localStorage.getItem('bg-userid');
        var username = localStorage.getItem('bg-username');

        if (userId && userId !== 'undefined' && username && username !== 'undefined') {
            userInformation.id = userId;
            userInformation.username = username;
            callback(userInformation);
        } else {
            $.ajax({
                type: 'GET',
                url: utils.getSecureContext() + '/user',
                async: false,
                success: function(userInformation) {
                    utils.setUserInformation(userInformation);
                    callback(userInformation);
                },
                error: handlers.errorHandler
            });
        }
    },

    /* Set current user information */
    setUserInformation: function(userInformation) {
        localStorage.setItem('bg-userid', userInformation.id);
        localStorage.setItem('bg-username', userInformation.username);
    }
};

/** Different handlers **/
var handlers = {

	/* Generic error handler */
	errorHandler: function() {
		alert('An error occurred while processing your request');
	},

	/* Save score error handler */
	saveScoreErrorHandler: function() {
		alert('An error occurred while saving your score');
	}
};