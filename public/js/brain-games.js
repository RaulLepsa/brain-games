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
				},
				error: handlers.errorHandler
			});
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
		$(document).on('game-finished', function() {
			var gameId = localStorage.getItem('game-id');
			var gameName = localStorage.getItem('game-name');

			$('#game-content').hide();

			//TODO: check colorMatch.score to match score from DIV

			$.ajax({
				type: 'POST',
				url: '/secure/game-score/color-match',
				data: { gameId: gameId, gameName: gameName, points: colorMatch.score, correct: colorMatch.correct, 
					wrong: colorMatch.wrong, combos: colorMatch.combo_count, consecutive: colorMatch.consecutive },
				success: function(response) {

					// At this moment the game is over
					var previousBest = 200;
					var score = colorMatch.score;

					var calloutClass;
					var calloutHeader;
					var calloutText;

					// Set the notification text depending on the score and previous best
					if (score > previousBest) {
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
				},
				error: handlers.saveScoreErrorHandler
			});
		});
	},
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