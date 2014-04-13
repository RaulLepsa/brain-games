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

	colorMatchPageReady: function() {
		$(document).on('game-finished', function() {
			var gameId = localStorage.getItem('game-id');
			var gameName = localStorage.getItem('game-name');

			$.ajax({
				type: 'POST',
				url: '/secure/game-score/color-match',
				data: { gameId: gameId, gameName: gameName, points: colorMatch.score, correct: colorMatch.correct, 
					wrong: colorMatch.wrong, combos: colorMatch.combo_count, consecutive: colorMatch.consecutive },
				success: function(response) {
					alert('success');
				},
				error: handlers.saveScoreErrorHandler
			});
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