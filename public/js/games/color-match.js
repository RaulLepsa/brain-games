var colorMatch = {

    /* Array of possible colors */
    colors: ['black', 'red', 'blue', 'green'],

    /* Keep correct and wrong answers count */
    correct: 0,
    wrong: 0,

    /* Game duration (in seconds) */
    duration: 40,

    /* Variables that refer hold the text (first) and color (second) DOM elements */
    textElement: null,
    colorElement: null,

    /* Initialize the game using the 2 DOM elements that will further hold the values */
    initialize: function(textElem, colorElem) {
        colorMatch.textElement = textElem;
        colorMatch.colorElement = colorElem;

        colorMatch.populateElements();
        //colorMatch.hints();

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
        colorMatch.textElement.html(colorMatch.colors[indexText]);
        colorMatch.textElement.addClass(colorMatch.colors[indexColor]);

        // Get random text and color and put them in the color div (second)
        indexText = Math.floor(Math.random() * 4);
        indexColor = Math.floor(Math.random() * 4);
        colorMatch.colorElement.html(colorMatch.colors[indexText]);
        colorMatch.colorElement.addClass(colorMatch.colors[indexColor]);
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
        hintLeft.attr('class', 'red');
        hintRight.html('black');
        hintRight.attr('class', 'blue');
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
            hintLeft.attr('class', 'red');
            hintRight.html('black');
            hintRight.attr('class', 'black');
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
        $('#game-timeleft').countdown(new Date(new Date().getTime() + colorMatch.duration * 1000), function(event) {
            $(this).html(event.strftime('%M:%S'));
        });

        // Add event listeners for swipe left/right and arrow key left/right
        $(document).on("swipeleft", function (e) {
            colorMatch.answer(true);
        });
        $(document).on("swiperight", function (e) {
            colorMatch.answer(false);
        });
        $(document).keydown(function (e) {
            if (e.keyCode === 37) {
                colorMatch.answer(true);
            } else if (e.keyCode === 39) {
                colorMatch.answer(false);
            }
        });        
    },

    /* 
     * Detects whether the answer is correct or incorrect, and prepares the elements for the next "round".
     * 'left' is a boolean that indicates whether the left key/swipe event has taken place. If false, it means that it was the right one.
     */
    answer: function(left) {

        // Check matching condition: text from first div must match color in second
        var match = colorMatch.textElement.html() === colorMatch.colorElement.attr('class');
        var right = !left;

        // Remove existing classes
        colorMatch.textElement.removeAttr('class');
        colorMatch.colorElement.removeAttr('class');

        // Check user's input. If left key was pressed and it was not a match - correct. If right key and not a match - also correct
        if ((left && !match) || (right && match)) {
            ++colorMatch.correct;
        } else {
            ++colorMatch.wrong;
        }
        
        // Populate with new values
        colorMatch.populateElements();
    }    
}

