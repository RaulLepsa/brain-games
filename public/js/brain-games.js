/*! Brain Games */

/** Functions for authentication-related pages **/
var authentication = {

	/* On Signin/Signup page ready - displays an error (if any); 'element' is a jQuery element that contains the error */
	pageReady: function(element) {

        // Clear locally-stored user information
        utils.clearLocalInformation();

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

        // Get game categories for user
        stats.gameCategoriesForUser();

        // Get Trending Games
        stats.trendingGames();
	}
};

/** Functions for page that lists games **/
var games = {

    _storageKey_filter: 'bg-filter',

	/* When the page is ready, bind events for the page */
	pageReady: function() {

		// Clicking on a Category
		$('#category-list').find('a').click(games.categoryClicked);

		// Bind the data-toggle for the Secondary Navigation
		$('[data-toggle=offcanvas]').click(function () {
		  $('.row-offcanvas').toggleClass('active')
		});

        // Clicking on the search icon
        $('#search-button').click(games.searchPerformed);

        // Bind enter listener for the search box
        $('#search-term').keyup(function (e) {
            if (e.which == 13) {
                games.searchPerformed();
            }
        });

        // Clicking on the x icon resets the search term
        $('.input-group').find('.x').click(games.clearSearchTerm);

        // Clicking on the rating stars rates the game
        $('.rating-star').click(games.rateGame);

        $('#nav-games').addClass('active');
        localStorage.removeItem(games._storageKey_filter);
        games.gameListReady();
	},

    clearSearchTerm: function() {
        $('#search-term').val('');
        games.fetchGames(games.updateFilter(undefined, null));
    },

    /* Triggered when a game category is selected - filters */
    categoryClicked: function(e) {
        e.preventDefault();

        // Get category and set it on the window location href
        var selected = $(this);
        var category = selected.attr('href').split('#')[1];
        if (category !== undefined && category !== '') {
            selected.toggleClass('active');
            var updatedFilter = games.updateFilter(category);
            games.fetchGames(updatedFilter);
        }
    },

    /* Update the filter */
    updateFilter: function(category, searchTerm) {
        // Get the filter
        var filter = JSON.parse(localStorage.getItem(games._storageKey_filter));

        // Check if the filter object exists
        if (!filter) { filter = {}; }

        // Check if the array of categories exists on the filter
        if (!filter.categories) { filter.categories = []; }
        if (!filter.searchTerm) { filter.searchTerm = null; }

        if (category) {
            // Check if the current category exists
            var indexOfFilter = filter.categories.indexOf(category);
            if (indexOfFilter > -1) {
                // If it does, remove it and shift the rest of the items
                delete filter.categories[indexOfFilter];
                for (var i = indexOfFilter; i < filter.categories.length; i++) {
                    filter.categories[i] = filter.categories[i + 1];
                }
                filter.categories.length--;

            } else {
                // Set the filter
                filter.categories.push(category);
            }
        }

        if (searchTerm !== undefined) {
            filter.searchTerm = searchTerm;
        }

        // Set the filter
        localStorage.setItem(games._storageKey_filter, JSON.stringify(filter));

        return filter;
    },

    /* When the user wants to search, update the filter with the searchTerm and fetch the items */
    searchPerformed: function() {
        var searchTerm = $('#search-term').val();
        var updatedFilter;

        if (searchTerm) {
            updatedFilter = games.updateFilter(undefined, searchTerm);
        } else {
            updatedFilter = games.updateFilter(undefined, null);
        }

        games.fetchGames(updatedFilter);
    },

    /* Fetch the games based on a filter (optional) */
    fetchGames: function(filter) {

        var data = {};
        if (filter) { data.filter = filter; }

        // Get all the games by category
        $.ajax({
            type: 'GET',
            url: utils.getSecureContext() + '/gamesList',
            data: data,
            success: function(response) {
                $('#game-list').html(response);
                games.gameListReady();
            },
            error: handlers.errorHandler
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
        var gameCategory = $(this).parent().find('input[type="hidden"]').val();

        // Store game id
        localStorage.setItem('game-id', gameId);
        localStorage.setItem('game-name', gameName);

        // Save Game Access Entry
        $.ajax({
            type: 'POST',
            url: utils.getSecureContext() + '/gameAccess',
            data: {gameId: gameId, gameName: gameName, gameCategory: gameCategory}
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
    },

    /* Rate a game */
    rateGame: function() {
        $(this).html('★');
        $(this).addClass('active');
        $(this).find('~ .rating-star').addClass('active');
        $(this).find('~ .rating-star').html('★');
        $(this).prevAll().removeClass('active');
        $(this).prevAll().html('☆');

        var gameId = $($(this).parents('.row')[0]).find('.btn-primary').attr('id');
        var rating = $(this).attr('data-rating');

        $.ajax({
            type: 'POST',
            url: utils.getSecureContext() + '/rateGame',
            data: {gameId: gameId, rating: rating}
        });
    }
};

/** Stats related functions **/
var stats = {

    /* When the page is ready, render statistics for the current user */
    pageReady: function() {
        $('#nav-stats').addClass('active');

        stats.gameCategoriesForUser();
        stats.gameCategoriesCollective();
        stats.trendingGames();
        stats.initializeGamePerformance();

        // Bind the Click function for the Game Performance Select
        $('#games-for-user').change(stats.gamePerformance);
    },

    /* Get Ratio of Game Categories Played statistics for the current player */
    gameCategoriesForUser: function() {
        // Get game categories for user
        $.ajax({
            type: 'GET',
            url: utils.getSecureContext() + '/stats/self/game-categories',
            success: function (response) {
                if (response.data && response.data.elements) {
                    response.data.title = 'Your training categories ratio';
                    response.data.subtitle = 'Click a slice to view game ratio';
                    response.data.title_drilldown = 'Your training games ratio';

                    charts.plotPieChart('#chart-game-categories-self', response.data);
                } else {
                    $('#chart-game-categories-self').html('You haven\'t played any games yet. You might want to start with our top rated games:');
                }
            },
            error: handlers.errorHandler
        });
    },

    /* Get Ratio of Game Categories Played statistics for the entire system */
    gameCategoriesCollective: function() {
        // Get game categories for user
        $.ajax({
            type: 'GET',
            url: utils.getSecureContext() + '/stats/collective/game-categories',
            success: function (response) {
                response.data.title = 'Overall training categories ratio';
                response.data.subtitle = 'Click a slice to view game ratio';
                response.data.title_drilldown = 'Overall training games ratio';

                charts.plotPieChart('#chart-game-categories-collective', response.data);
            },
            error: handlers.errorHandler
        });
    },

    /* Get Trending Games information and plot the result */
    trendingGames: function () {
        // Get Trending Games
        $.ajax({
            type: 'GET',
            url: utils.getSecureContext() + '/stats/collective/trending-games',
            success: function (response) {
                if (response.data.elements.length > 0) {
                    charts.plotTrendingChart(('#chart-trending-games'), response.data);
                }
            },
            error: handlers.errorHandler
        })
    },

    /* Get Games finished by user in order to plot the Performance for each game */
    initializeGamePerformance: function () {
        // Get Games that user has finished
        $.ajax({
            type: 'GET',
            url: utils.getSecureContext() + '/gamesForUser',
            success: function (games) {
                var gamesHtml = '<option value="">Select a game</option>';
                for (var i = 0; i < games.length; i++) {
                    gamesHtml += '<option value="' + games[i].id + '">' + games[i].name + '</option>';
                }
                $('#games-for-user').html(gamesHtml);
            },
            error: handlers.errorHandler
        });
    },

    /* Get performance for a specific game (for a user) */
    gamePerformance: function () {
        var gameId = $('#games-for-user').val();
        if (gameId != null && gameId !== '') {
            $.ajax({
                type: 'GET',
                url: utils.getSecureContext() + '/stats/self/game-performance',
                data: {gameId: gameId},
                success: function (gamePerformance) {
                    if (gamePerformance.data && gamePerformance.data.length > 0) {
                        charts.plotPerformanceChart($('#chart-game-performance'), gamePerformance);
                    }
                },
                error: handlers.errorHandler
            });
        }
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

    /* Clear local information related to the application */
    clearLocalInformation: function() {
        localStorage.removeItem('bg-userid');
        localStorage.removeItem('bg-username');
        localStorage.removeItem(games._storageKey_filter);
        localStorage.removeItem('bg-room');
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

var profile = {

    /* Triggered when Profile page is ready */
    pageReady: function() {
        $('#nav-profile').addClass('active');
        profile.getProfileData();

        // Cancel default form behavior
        $('#user-form').submit(function() {
            profile.updateUserInformation();
            return false;
        });

        $('#old-password').val('');

        $('#new-password').keyup(function() {
            $('#old-password').attr('required', true);
        });
    },

    updateUserInformation: function() {
        var firstname = $('#firstname').val();
        var lastname = $('#lastname').val();
        var email = $('#email').val();
        var oldPassword = $('#old-password').val();
        var newPassword = $('#new-password').val();

        var userData = {};
        userData.firstname = firstname;
        userData.email = email;

        if (lastname) { userData.lastname = lastname; }
        if (newPassword) {
            userData.oldPassword = oldPassword;
            userData.newPassword = newPassword;
        }

        $.ajax({
            type: 'PUT',
            url: utils.getSecureContext() + '/user',
            data: userData,
            success: function(response) {
                if (response.error) {
                    utils.displayAlert($('#form-error'), response.error);
                } else {
                    utils.displayAlert($('#form-success'), 'User information updated');
                    profile.getProfileData();
                }
            },
            error: handlers.errorHandler
        });
    },

    /* Retrieve data to populate Profile page */
    getProfileData: function() {
        $.ajax({
            type: 'GET',
            url: utils.getSecureContext() + '/user',
            success: function(userInfo) {
                $('#firstname').val(userInfo.firstname);
                $('#lastname').val(userInfo.lastname);
                $('#email').val(userInfo.email);
                $('#old-password').val('');
                $('#new-password').val('');
                utils.setUserInformation(userInfo);
            },
            error: handlers.errorHandler
        });
    }
};

/** Functions related to plotting Charts **/
var charts = {

    /* Plot a generic pie chart by providing the DOM element in which it should go into and the data */
    plotPieChart: function (element, data) {
        $(element).highcharts({
            chart: {
                type: 'pie',
                events: {
                    drilldown: function() {
                        $(element).highcharts().setTitle({ text: data.title_drilldown }, { text: '' });
                    },
                    drillup: function() {
                        $(element).highcharts().setTitle({ text: data.title }, { text: data.subtitle });
                    }
                }
            },
            title: { text: data.title },
            subtitle: {text: data.subtitle },
            tooltip: { pointFormat: '<b>{point.percentage:.1f}%</b>' },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: { enabled: false },
                    showInLegend: true
                }
            },
            series: [{
                name: 'Categories',
                data: data.elements
            }],
            drilldown: {
                series: data.drilldownElements
            }
        });
    },

    /* Plot a bar chart by providing the DOM element in which it should go into and the data */
    plotTrendingChart: function (element, data) {
        $(element).highcharts({
            title: { text: data.title },
            xAxis: {
                min: 0,
                reversed: true,
                allowDecimals: false,
                labels: {
                    formatter: function() {
                        if (this.value == 0) {
                            return 'Now';
                        }
                        return this.value + 'h ago' ;
                    }
                }
            },
            yAxis: {
                min: 0,
                title: {
                    text: '# of times accessed'
                },
                labels: {
                    formatter: function() {
                        return this.value;
                    }
                }
            },
            tooltip: {
                headerFormat: '<b>{series.name}</b>: ',
                pointFormat: 'Accessed <b>{point.y:,.0f}</b> times'
            },
            plotOptions: {
                area: {
                    pointStart: 1,
                    marker: {
                        enabled: false,
                        symbol: 'circle',
                        radius: 2,
                        states: {
                            select: { enabled: true },
                            hover: { enabled: true }
                        }
                    }
                }
            },
            series: data.elements
        });
    },

    plotPerformanceChart: function (element, gamePerformance) {
        $(element).highcharts({
            title: {
                text: 'Progress for game ' + gamePerformance.name
            },

            legend: {
                enabled: false
            },

            xAxis: {
                type: 'datetime',
                tickInterval: 7 * 24 * 3600 * 1000,
                labels: {
                    formatter: function () {
                        return Highcharts.dateFormat('%b %e, %Y', this.value);
                    }
                }

            },

            yAxis: {
                title: {
                    text: 'Score'
                },
                labels: {
                    formatter: function() {
                        return this.value;
                    }
                },
                showFirstLabel: false
            },

            tooltip: {
                shared: true,
                crosshairs: true,
                xDateFormat: '%A, %b %e, %Y',
                headerFormat: '<strong>Score:</strong> {point.y}<br>{point.key}',
                pointFormat: ''
            },

            series: [{
                name: gamePerformance.name,
                lineWidth: 4,
                marker: {
                    radius: 4
                },
                data: gamePerformance.data
            }]
        });
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