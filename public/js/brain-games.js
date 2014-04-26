/*! Brain Games */

/** Functions for authentication-related pages **/
var authentication = {

	/* On Signin/Signup page ready - displays an error (if any); 'element' is a jQuery element that contains the error */
	pageReady: function(element) {
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
				url: '/secure/games/category/' + category,
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

		$('#game-list').find('input[type="button"]').click(function() {
			var button = $(this);

			// Store game id
			localStorage.setItem('game-id', button.attr('id'));
			localStorage.setItem('game-name', $(this).parent().find('h2').html());

			// Go to game
			window.location = button.attr('href');
		});
	},

	/* When the Color Match page is ready, listen for the game-finished event. When triggered, handle it accordingly */
	colorMatchPageReady: function() {
		var gameId = localStorage.getItem('game-id');
		var gameName = localStorage.getItem('game-name');
		if (!gameId) {
			window.location = '/secure/games';
			return;
		}

		// Game finished event listener
		$(document).on('game-finished', function() {
			$('#game-content').hide();

			// Detect invalid score
			if (colorMatch._score != $('#game-score').html()) {
				alert('Invalid score');
				window.location = '/secure/games';
				return;
			}

			// Save game score
			$.ajax({
				type: 'POST',
				url: '/secure/game-score',
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
					localStorage.removeItem('game-id');
					localStorage.removeItem('game-name');
				},
				error: handlers.saveScoreErrorHandler
			});
		});
	
		// Get previous best score for current user
		$.ajax({
			type: 'GET',
			url: '/secure/game-score/top',
			data: {gameId: gameId},
			success: function(response) {
				localStorage.setItem('previous-best', response.score);
			},
			error: handlers.errorHandler
		});
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

	/* Removes all alers from a page */
	removeAlertsFromPage: function() {
		$('.alert').hide().html('');
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