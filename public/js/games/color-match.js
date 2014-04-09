var colorMatch = {

    /* Variables that refer hold the text (first) and color (second) DOM elements */
    textElement: null,
    colorElement: null,

    /* Array of possible colors */
    colors: ['black', 'red', 'blue', 'green'],

    /* Initialize the game using the 2 DOM elements that will further hold the values */
    initialize: function(textElem, colorElem) {
        colorMatch.textElement = textElem;
        colorMatch.colorElement = colorElem;

        colorMatch.populateElements();
        colorMatch.start();
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

    start: function() {
        var score = 0;
        var fails = 0;

        $(document).keydown(function (e) {

            // Check matching condition: text from first div must match color in second
            var match = colorMatch.textElement.html() === colorMatch.colorElement.attr('class');

            // Remove existing classes
            colorMatch.textElement.removeAttr('class');
            colorMatch.colorElement.removeAttr('class');

            // Check user's input. If left key was pressed and it was not a match - correct. If right key and not a match - also correct
            if ((e.keyCode === 37 && !match) || (e.keyCode === 39 && match)) {
                score++;
            } else if (e.keyCode === 37 || e.keyCode === 39) {
                fails++;
            }
            
            if (score + fails === 10) {
                alert('Correct: ' + score + '; Incorrect: ' + fails)
            }
            // Populate with new values
            colorMatch.populateElements();
        });        
    }
}

