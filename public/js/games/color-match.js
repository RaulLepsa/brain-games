/*! Color Match Game */

var colorMatch = {

    /* Array of possible colors */
    _colors: ['black', 'red', 'blue', 'green'],

    /* Keys for wrong and correct answer */
    _keyCodeCorrect: 39,
    _keyCodeWrong: 37,

    /* Variables that store answer-related data */
    _correct: 0,         // # of correct answers
    _wrong: 0,           // # of wrong answers
    _consecutive: 0,     // # of consecutive correct answers
    _comboCount: 0,     // how many times the user managed combos (consecutive of 3 or more)
    _score: 0,           // total score

    /* Game duration (in seconds) */
    _duration: 50,

    /* Variables that refer hold the text (first) and color (second) DOM elements */
    _textElement: null,
    _colorElement: null,

    /* Reference to the last setTimeout function on the notification element */
    _notificationTimeout: undefined,

    /* Initialize the game using the 2 DOM elements that will further hold the values */
    initialize: function(textElem, colorElem) {
        colorMatch._textElement = textElem;
        colorMatch._colorElement = colorElem;

        colorMatch.populateElements();
        colorMatch.hints();

        var startButton = $('#start');
        startButton.click(function() {
            startButton.hide();
            colorMatch.start();
        });
    },

    /* Populate the 2 elements with random text having a random color */
    populateElements: function() {

        // Get random text and color and put them in the text div (first)
        var indexText = Math.floor(Math.random() * 4);
        var indexColor = Math.floor(Math.random() * 4);
        colorMatch._textElement.html(colorMatch._colors[indexText]);
        colorMatch._textElement.attr('class', 'cm-' + colorMatch._colors[indexColor]);

        // Get random text and color and put them in the color div (second)
        indexText = Math.floor(Math.random() * 4);
        indexColor = Math.floor(Math.random() * 4);
        colorMatch._colorElement.html(colorMatch._colors[indexText]);
        colorMatch._colorElement.attr('class', 'cm-' + colorMatch._colors[indexColor]);
    },

    /** Display the hints before the game starts */
    hints: function() {
        var hints = $('#hints');
        var hintLeft = $('#hint-left');
        var hintRight = $('#hint-right');
        var nextHint = $('#next-hint');
        var prevHint = $('#prev-hint');
        var closeHints = $('#close-hints');
        var hintCondition = $('#hint-condition');

        // Display hints
        hints.modal('show');

        // Display an example
        hintLeft.html('blue');
        hintLeft.attr('class', 'cm-red');
        hintRight.html('black');
        hintRight.attr('class', 'cm-blue');
        hintCondition.html('<span class="glyphicon glyphicon-ok green"></span> The condition is fulfilled');
        nextHint.show();
        prevHint.hide();
        closeHints.hide();

        // Displays prev example
        prevHint.click(function() {
            colorMatch.hints();
        });

        // Displays next example
        nextHint.click(function() {
            hintLeft.html('red');
            hintLeft.attr('class', 'cm-red');
            hintRight.html('black');
            hintRight.attr('class', 'cm-black');
            hintCondition.html('<span class="glyphicon glyphicon-remove red"></span> The condition is NOT fulfilled');
            nextHint.hide();
            prevHint.show();
            closeHints.show();
        });

        // Close the Hints modal
        closeHints.click(function() {
            hints.modal('hide');
        });
    },

    /* Start the game. Add listeners and call the 'answer' function depending on the event triggered. */
    start: function() {

        // Countdown time starting from now, for a 'duration' period
        $('#game-timeleft').countdown(new Date(new Date().getTime() + colorMatch._duration * 1000),
            function(event) {
                $(this).html(event.strftime('%M:%S'));
            }
        ).on('finish.countdown', colorMatch.stop);

        // Add event listeners for swipe left/right and arrow key left/right
        $('body').on('swipeleft', function (e) {
            colorMatch.answer(true);
        });
        $('body').on('swiperight', function (e) {
            colorMatch.answer(false);
        });
        $(document).keydown(function (e) {
            if (e.keyCode === colorMatch._keyCodeWrong) {
                colorMatch.answer(true);
            } else if (e.keyCode === colorMatch._keyCodeCorrect) {
                colorMatch.answer(false);
            }
        });        
    },

    /* Stop the game */
    stop: function() {
        $('body').off('swipeleft');
        $('body').off('swiperight');
        $(document).off('keydown');

        // Trigger a game finished event, as dealing with data after the game has ended is no longer related to this particular game,
        // but should be dealt with by the application incorporating the game
        $(document).trigger('game-finished');
    },  

    /* 
     * Detects whether the answer is correct or incorrect, and prepares the elements for the next "round".
     * 'wrong' is a boolean that indicates whether the key/swipe event indicating the user selected 'wrong' has taken place. 
     * If false, it means that it was the event triggered signals the user chose 'correct'.
     */
    answer: function(wrong) {

        // Check matching condition: text from first div must match color in second
        var match = ('cm-' + colorMatch._textElement.html()) === colorMatch._colorElement.attr('class');
        var correct = !wrong;

        // Stop animation on notification element
        var notificationElement = $('.answer-notification');
        if (notificationElement.is(':animated')) {
            notificationElement.stop().animate({opacity: '100'});
        }

        // Check user's input. If wrong key was pressed and it was not a match - correct. If correct key and not a match - also correct
        if ((wrong && !match) || (correct && match)) {
            // Increase correct and consecutive answers count
            colorMatch._correct++;
            colorMatch._consecutive++;

            // Each correct answer increases the score by 10
            colorMatch._score += 10;

            // For combos of 3 or more, increase the score with the amount of the combo
            if (colorMatch._consecutive >= 3) {
                colorMatch._score += colorMatch._consecutive;
            }
            // Remember number of total combos
            if (colorMatch._consecutive === 3) {
                colorMatch._comboCount++;
            }

            // Set appropriate notification
            notificationElement.addClass('green glyphicon-ok');
            notificationElement.removeClass('red glyphicon-remove');

        } else {
            // Increase the incorrect count and set the consecutive answers one to 0
            colorMatch._wrong++;
            colorMatch._consecutive = 0;

            // Set appropriate notification
            notificationElement.addClass('red glyphicon-remove');
            notificationElement.removeClass('green glyphicon-ok');
        }

        // Show notification and set timeout for it
        notificationElement.show();
        clearTimeout(colorMatch._notificationTimeout);
        colorMatch._notificationTimeout = setTimeout(function() { notificationElement.fadeOut() }, 300);

        // Update score
        $('#game-score').html(colorMatch._score);
        
        // Populate with new values
        colorMatch.populateElements();
    }    
};

