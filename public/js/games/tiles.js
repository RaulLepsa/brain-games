/*! Tiles Game */

var tiles = {

    _currentBoard: null,
    _level: 1,
    _width: 4,
    _maxWidth: 10,
    _preselectedTiles: 5,
    _guessesLeft: null,
    _score: 0,
    _duration: 50,
    _running: false,

    /* Initialize the game */
    initialize: function() {
        this._running = true;
        this.startCountdown();
        this.initializeLevel();
    },

    /* Initialize a level */
    initializeLevel: function() {

        // Pause game timer until the hints are gone
        this.stopCountdown();

        // Initialize board and render html
        this._currentBoard = tiles.makeBoard(this._width, this._preselectedTiles);
        this.renderBoard(tiles.generateHtml(this._currentBoard));
        this._guessesLeft = this._preselectedTiles;

        // Bind click for tiles
        $('.tile').click(function() {
            tiles.tileSelected(this);
        });

        // Display level #
        $('.answer-notification-container').html('Level ' + this._level);
        setTimeout(function() {
            tiles.startCountdown();
            $('#game-timeleft').countdown('resume');
            $('.answer-notification-container').html('');
        }, 2000);
    },

    /* Make a board. 'width' indicates the length and width of the board. 'number' indicates the number of tiles selected in the board */
    makeBoard: function(width, number) {
        var board = new Array(width);
        var i,j;

        Array.prototype.repeat = function (value, length){
            while (length) {
                this[--length] = value;
            }
            return this;
        };

        // Create an empty width * width board
        for (i = 0; i < width; i++) {
            board[i] = [].repeat(false, width);
        }

        // Mark 'number' of random tiles as selected
        while (number > 0) {
            i = Math.floor(Math.random() * width);
            j = Math.floor(Math.random() * width);

            if (!board[i][j]) {
                board[i][j] = true;
                number--;
            }
        }

        return board;
    },

    /* Generate HTML for the board */
    generateHtml: function(board) {
        var html = '';
        for (var i = 0; i < board.length; i++) {
            if (i > 0) {
                html += '</tr>';
            }
            html += '<tr>';
            for (var j = 0; j < board.length; j++) {
                if (board[i][j]) {
                    html += '<td id="' + i + '_' + j + '" class="tile selected"></td>';
                } else {
                    html += '<td id="' + i + '_' + j + '" class="tile"></td>';
                }
            }            
        }

        return html;
    },

    /* Render board */
    renderBoard: function(html) {
        $('#tiles-table').html(html);
        $('.cover').show();

        setTimeout(function() {
            $('#tiles-table').find('.tile').removeClass('selected');
            $('.cover').hide();
        }, 2000);
    },

    /* Make a guess on a pair of i,j tiles on a board */
    guess: function(board, i, j) {
        if (board[i][j].correct == undefined) {
            var correct = board[i][j];
            board[i][j] = {correct: correct};
            tiles._guessesLeft--;

            return correct;
        }

        return null;
    },

    /* Triggered when a tile is selected. Marks it as correct or incorrect */
    tileSelected: function(elem) {
        var id = $(elem).attr('id').split('_');
        var i = id[0];
        var j = id[1];

        var guess = tiles.guess(tiles._currentBoard, i, j);
        if (guess === true) {
            $(elem).addClass('correct');
            tiles._score += tiles._level + 5;
        } else if (guess === false) {
            $(elem).addClass('incorrect');
            tiles._score -= tiles._level + 6;
            if (tiles._score < 0) { tiles._score = 0; }
        }

        $('#game-score').html(tiles._score);

        // Check for level end
        if (tiles._guessesLeft === 0) {
            tiles.levelOver();
        }
    },

    /* End a level and start a new one */
    levelOver: function() {
        if (this.levelPassed(this._currentBoard)) {
            if (this._preselectedTiles - this._width === 2 || this._level === 1) {
                this._width = (this._width + 1) < this._maxWidth ? this._width + 1 : this._maxWidth;
            }
            this._preselectedTiles++;
            this._level++;
        }

        tiles.initializeLevel();
    },

    /* Check if the level was passed */
    levelPassed: function(board) {
        for (var i = 0; i < board.length; i++) {
            for (var j = 0; j < board.length; j++) {
                if (board[i][j].correct !== undefined && board[i][j].correct === false) {
                    return false;
                }
            }
        }

        return true;
    },

    /* Start the countdown */
    startCountdown: function() {
        // Countdown time starting from now, for a 'duration' period
        $('#game-timeleft').countdown(new Date(new Date().getTime() + this._duration * 1000),
            function (event) {
                $(this).html(event.strftime('%M:%S'));
            }
        ).on({
                'finish.countdown': tiles.gameOver,
                'stop.countdown': tiles.stopCountdown
            });
    },

    /* Stop the countdown */
    stopCountdown: function() {
        var timeleftContainer = $('#game-timeleft');
        tiles._duration = parseInt(timeleftContainer.html().split(':')[1]);
        timeleftContainer.countdown('pause');
    },

    /* Triggered on Game Over */
    gameOver: function() {
        if (tiles._running) {
            // Trigger a game finished event, as dealing with data after the game has ended is no longer related to this particular game,
            // but should be dealt with by the application incorporating the game
            $(document).trigger('game-finished');
        }

        tiles._running = false;
    }
};