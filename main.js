$(document).ready(function() {

  "use strict";

  /**************************
  *    INTERNAL VARIABLES   *
  **************************/

  // Internal state of board
  var _board = [];
  // Internal state of player bench
  var _playerBench = [];
  // Internal state of enemy bench
  var _enemyBench = [];

  var bestMove;

  /**************************
  *    POSITION VARIABLES   *
  **************************/
  
  // The position of the selected piece
  var selectedPosition = { row: 0, col: 0 };

  // The position of the attacked cell
  var attackPosition = { row: 0, col: 0 };

  // Difference between selected and attack cells
  var differencePosition = { row: 0, col: 0 };

  /**************************
  *    PIECE VALIDATION     *
  **************************/

  // Did we select a cell that is occupied?
  var selectedCell = false;

  // Did we select a cell to attack?
  var attackedCell = false;

  // Did we select a bench piece? 
  var selectedEnemyBenchPiece = false;
  var selectedPlayerBenchPiece = false;
  var selectedPlayerBenchPiecePosition = { col: 0 };
  var selectedEnemyBenchPiecePosition = { col: 0 }; 

  /********************************
  *    GAME EVALUATION VARIABLES  *
  *********************************/

  var playerLionCaptured = false;
  var enemyLionCaptured = false;
  var seenPlayerLion = false;
  var seenEnemyLion = false;
  var gameOver = false;

  /**************************
  *      TURN VARIABLES     *
  **************************/

  var playerTurn = true;
  var enemyTurn = false;
  var turnCount = 1;

  // Has either player moved?
  var playerMoved = false;
  var enemyMoved = false;

  var currentTurn = null; 

  /**************************
  *  PROMOTION VARIABLES  *
  **************************/
  
  var playerChickPromotion = false;
  var playerChickPosition = { row: 0, col: 0 };
  var enemyChickPromotion = false;
  var enemyChickPosition = { row: 0, col: 0 };

  // If Player moved a chick (not placed)
  // it is a legitimate candidate for promotion to Hen
  var movedPlayerChick = false;

  // If Enemy moved a chick (not placed)
  // it is legitimate candidate for promotion to Hen
  var movedEnemyChick = false;

  /**************************
  *     LEGITIMATE MOVES    *
  **************************/
  
  var _pieces = {
    'enemyChick' : [
      { row: 1, col: 0 }  // South
    ],
    'enemyLion' : [
      { row: 1,  col: 0  }, // South
      { row: -1, col: 0  }, // North
      { row: 0,  col: -1 }, // East
      { row: 0,  col: 1  }, // West
      { row: 1,  col: -1 }, // Southwest
      { row: -1, col: -1 }, // Northwest
      { row: 1,  col: 1  }, // Southeast
      { row: -1, col: 1  }, // Northeast
    ],
    'enemyElephant' : [
      { row: 1,  col: -1 }, // Southwest
      { row: -1, col: -1 }, // Northwest
      { row: 1,  col: 1  }, // Southeast
      { row: -1, col: 1  }, // Northeast
    ],
    'enemyGiraffe' : [
      { row: 1,  col: 0  }, // South
      { row: -1, col: 0  }, // North
      { row: 0,  col: -1 }, // West
      { row: 0,  col: 1  }, // East
    ],
    'enemyHen' : [
      { row: 1,  col: 0  }, // South
      { row: -1, col: 0  }, // North
      { row: 0,  col: -1 }, // West
      { row: 0,  col: 1  }, // East
      { row: 1,  col: -1 }, // Southwest
      { row: 1,  col: 1  }, // Southeast
    ],
    'playerChick' : [
      { row: -1, col: 0 }   // North
    ],
    'playerLion' : [
      { row: -1, col: 0  }, // North
      { row: 1,  col: 0  }, // South
      { row: 0,  col: -1 }, // West
      { row: 0,  col: 1  }, // East
      { row: -1, col: -1 }, // Northwest
      { row: 1,  col: -1 }, // Southwest
      { row: -1, col: 1  }, // Northeast
      { row: 1,  col: 1  }, // Southeast
    ],
    'playerElephant' : [
      { row: -1, col: -1 }, // Northwest
      { row: 1,  col: -1 }, // Southwest
      { row: 1,  col: 1  }, // Southeast
      { row: -1, col: 1  }, // Northeast
    ],
    'playerGiraffe' : [
      { row: -1, col: 0  }, // North
      { row: 1,  col: 0  }, // South
      { row: 0,  col: -1 }, // West
      { row: 0,  col: 1  }, // East
    ],
    'playerHen' : [
      { row: -1, col: 0 }, // North
      { row: 1,  col: 0 }, // South
      { row: 0,  col: -1}, // West
      { row: 0,  col: 1 }, // East
      { row: -1, col: -1}, // Northwest
      { row: -1, col: 1 }, // Northeast 
    ],
  }

  /*************************************
  *    INTERNAL BOARD INITIALIZATION   *
  *************************************/
  
  $('.row').each(function(rowIndex, row){
    _board.push([]);
    $(this).find('.square').each(function(cellIndex, square) {
      var cell = $(square).children()[0];
      
      if($(cell).hasClass('enemyGiraffe')) {
        _board[rowIndex][cellIndex] = 'enemyGiraffe';
      } else if ($(cell).hasClass('enemyLion')) {
        _board[rowIndex][cellIndex] = 'enemyLion';
      } else if ($(cell).hasClass('enemyElephant')) {
        _board[rowIndex][cellIndex] = 'enemyElephant'; 
      } else if ($(cell).hasClass('enemyChick')) {
        _board[rowIndex][cellIndex] = 'enemyChick';
      } else if ($(cell).hasClass('playerChick')) {
        _board[rowIndex][cellIndex] = 'playerChick';
      } else if ($(cell).hasClass('playerElephant')) {
        _board[rowIndex][cellIndex] = 'playerElephant';
      } else if ($(cell).hasClass('playerLion')) {
        _board[rowIndex][cellIndex] = 'playerLion';
      } else if ($(cell).hasClass('playerGiraffe')) {
        _board[rowIndex][cellIndex] = 'playerGiraffe';
      } else {
        _board[rowIndex][cellIndex] = -1;
      }
  
      $(square).attr({'data-x': rowIndex, 'data-y': cellIndex});
    });
  });

  // Initialize Enemy Bench Internal Board
  $('.enemyRow').each(function(rowIndex, row) {
    $(this).find('.square').each(function(cellIndex, square) {
      _enemyBench[rowIndex] = -1;
      $(square).attr({'data-x': rowIndex});
    });
  });

  // Initialize Player Bench Internal Board
  $('.playerRow').each(function(rowIndex, row) {
    $(this).find('.square').each(function(cellIndex, square) {
      _playerBench[rowIndex] = -1;
      $(square).attr({'data-x': rowIndex});
    });
  });

  // Set the first debug message
  // debugPanel('=================TURN ' + turnCount + '=================');
  // debugPanel('\n\n')
  // debugPanel('  Enemy move for turn: ' + turnCount);

  // Let the enemy move first
  toggleTurn();

  /*********************
  *   EVENT HANDLERS   *
  *********************/
  
  // Detect clicks on enemy bench
  $('.enemyRow > .square').click(function() {
    // If we had a piece selected and then clicked the bench,
    // We cancel the previous selection
    selectedEnemyBenchPiece = false;
    selectedCell = false;
    // We select a piece from our bench
    if(!selectedEnemyBenchPiece && enemyTurn) {
      // Grab position of bench
      var x = $(this).data('x');
      $(this).css('border-color', 'red');
      $(this).css('border-style', 'solid');
      selectedEnemyBenchPiecePosition.col = x;
      // debugPanel("\n");
      // debugPanel("  Enemy is trying to place the bench piece: " + _enemyBench[selectedEnemyBenchPiecePosition.col]);
      // If the bench has a piece
      if(isBenchOccupied(_enemyBench, x)) {
        selectedEnemyBenchPiece = true; 
      }
    } 
  });

  // Detect clicks on player bench
  $('.playerRow > .square').click(function() {
    $(this).css('border-color', 'red');
    $(this).css('border-style', 'solid');
    selectedPlayerBenchPiece = false;
    var selectedCell = false;
    if(!selectedPlayerBenchPiece && playerTurn) {
      var x = $(this).data('x');
      selectedPlayerBenchPiecePosition.col = x;
      // debugPanel("\n");
      // debugPanel("  Player is trying to place the bench piece: " + _playerBench[selectedPlayerBenchPiecePosition.col] + ' in col: ' + x);
      if(isBenchOccupied(_playerBench, x)) {
        selectedPlayerBenchPiece = true;
      }
    }
  });

  $('.row > .square').click(function() {
    $(this).css('border-color', 'red');
    $(this).css('border-style', 'solid');
    // We selected an enemy bench piece, so we check and place it
    if(selectedEnemyBenchPiece && !gameOver) {
      var x = $(this).data('x');
      var y = $(this).data('y');
      if(!isOccupied(x, y)) {

        // Cell is not occupied, we can place the piece!
        // Get square to place tile down
        var $a = ($('.square[data-x=' + x + '][data-y=' + y + ']')).children();

        // Add CSS class to selected tile
        $a.addClass(_enemyBench[selectedEnemyBenchPiecePosition.col]);

        // We are placing a chick from our bench, so it cannot promote unless moved
        if(selectedEnemyBenchPiecePosition.col == 'enemyChick') {
          movedEnemyChick = false;
        }

        // debugPanel("\n");
        // debugPanel("  Enemy has placed the bench piece: " + _enemyBench[selectedEnemyBenchPiecePosition.col] + " successfully!");

        // Update internal game board state with name of placed piece
        _board[x][y] = _enemyBench[selectedEnemyBenchPiecePosition.col];

        // Remove the CSS class for the corresponding cell
        removeFromBench(selectedEnemyBenchPiecePosition.col, _enemyBench[selectedEnemyBenchPiecePosition.col], 'enemy');

        // Clear bench position
        _enemyBench[selectedEnemyBenchPiecePosition.col] = -1;

        // Reset variables storing bench piece
        selectedEnemyBenchPiecePosition.col = 0;
        selectedEnemyBenchPiece = false;

        // After placing a piece, we end this player's turn
        toggleTurn();

        // Reset grid styles
        clearCells();

        // Increment the turn
        incrementTurn();
      } 

      // We tried to place the piece on an occupied cell, reset
      else {
        // debugPanel("\n");
        // debugPanel("  Enemy tried to place the piece: " + _enemyBench[selectedEnemyBenchPiecePosition.col] + " in an occupied cell");
        selectedEnemyBenchPiece = false;
        // Reset grid styles
        clearCells();
      }
    } 

    // We selected a player bench piece, check and place it
    else if(selectedPlayerBenchPiece && !gameOver) {
      var x = $(this).data('x');
      var y = $(this).data('y');
      $(this).css('border-color', 'red');
      $(this).css('border-style', 'solid');
      if(!isOccupied(x, y)) {

        // Cell is not occupied, we can place the piece!
        // Get square to place tile down
        var $a = ($('.square[data-x=' + x + '][data-y=' + y + ']')).children();

        // Add CSS class to selected tile
        $a.addClass(_playerBench[selectedPlayerBenchPiecePosition.col]);

        // We are placing a chick from our bench, so it cannot promote unless moved
        if(_playerBench[selectedPlayerBenchPiecePosition.col] == 'playerChick') {
          movedPlayerChick = false;
        } 

        // debugPanel("\n");
        // debugPanel("  Player has placed the bench piece: " + _playerBench[selectedPlayerBenchPiecePosition.col] + " successfully!");

        // Update internal game board state with name of placed piece
        _board[x][y] = _playerBench[selectedPlayerBenchPiecePosition.col];

        // Remove CSS class for position
        removeFromBench(selectedPlayerBenchPiecePosition.col, _playerBench[selectedPlayerBenchPiecePosition.col], 'player');

        // Clear bench position
        _playerBench[selectedPlayerBenchPiecePosition.col] = -1;

        // Clear holder variables
        selectedPlayerBenchPiecePosition.col = 0;
        selectedPlayerBenchPiece = false;

        // After placing a piece, we end this player's turn
        toggleTurn();

        // Reset grid styles
        clearCells();
        // Increment the turn
        incrementTurn();
      }

      // We tried to put our bench piece on an occupied cell
      else {
        debugPanel("\n");
        debugPanel("  Player tried to place the piece: " + _playerBench[selectedPlayerBenchPiecePosition.col] + " in an occupied space");
        selectedPlayerBenchPiece = false;
      }
    }

    // We are selecting a game piece
    else if(!selectedCell && !gameOver) {
      var x = $(this).data('x');
      var y = $(this).data('y');
      $(this).css('border-color', 'red');
      $(this).css('border-style', 'solid');
      if(isOccupied(x, y) && validSelection(x, y)) {
        // We've selected a piece to move
        selectedCell = true;
        // Update the position of our selected piece
        selectedPosition.row = x;
        selectedPosition.col = y;
      }
    }

    // Now to attack
    else if(selectedCell) {
      // Grab the x, y coordinates of the attacked square
      var x = $(this).data('x');
      var y = $(this).data('y');
      $(this).css('border-color', 'red');
      $(this).css('border-style', 'solid');
      // If the square is occupied, we attack!
      if(isOccupied(x, y)) {
        var attackedName = _board[x][y];
        var attackerName = _board[selectedPosition.row][selectedPosition.col];
        attackPosition.row = x, attackPosition.col = y;
        differencePosition.row = attackPosition.row - selectedPosition.row;
        differencePosition.col = attackPosition.col - selectedPosition.col;
        if(validMove(attackerName)) {
          // Add attacked piece to respective bench
          addToBench(attackedName);

          // If we moved a chick, it is valid for promotion
          if(attackerName == 'playerChick') {
            movedPlayerChick = true;
            playerChickPosition.row = x;
            playerChickPosition.col = y;
          } else {
            movedPlayerChick = false;
          }

          if (attackerName == 'enemyChick') {
            movedEnemyChick = true;
            enemyChickPosition.row = x;
            enemyChickPosition.col = y;
          } else {
            movedEnemyChick = false;
          }

          var $a = ($('.square[data-x=' + x + '][data-y=' + y + ']')).children();
          var $p = ($('.square[data-x=' + selectedPosition.row + '][data-y=' + selectedPosition.col + ']')).children();
          $p.removeClass(attackerName);
          $a.removeClass(attackedName);
          $a.addClass(attackerName);
          if(playerTurn) {
            debugPanel('\n');
            debugPanel('  The player attacked the piece: ' + _board[attackPosition.row][attackPosition.col] + ' at position: ' + attackPosition.row + ', ' + attackPosition.col);
          }

          if(enemyTurn) {
            debugPanel('\n');
            debugPanel('  The enemy attacked the piece: ' + _board[attackPosition.row][attackPosition.col] + ' at position: ' + attackPosition.row + ', ' + attackPosition.col);
          }
          // Update respective bench
          // _benchPiece(attackedName);
          // Update new internal board positions
          _board[x][y] = _board[selectedPosition.row][selectedPosition.col];
          _board[selectedPosition.row][selectedPosition.col] = -1;
          // Reset selected cells
          selectedCell = false;
          attackedCell = false;
          // Reset grid styles
          clearCells();
          // Check if the game is over 
          isGameOver(_board);
          if(!gameOver) {
            // Check if a chick should be promoted
            checkChicks();
            if(enemyChickPromotion) {
              var $enemyChick = ($('.square[data-x=' + enemyChickPosition.row + '][data-y=' + enemyChickPosition.col + ']')).children();
              $enemyChick.removeClass('enemyChick');
              $enemyChick.addClass('enemyHen');
              // Reset position of enemy chick
              enemyChickPosition.row = 0;
              enemyChickPosition.col = 0;
              // Reset promotion flag
              enemyChickPromotion = false;
              _board[x][y] = 'enemyHen';
            } else if (playerChickPromotion) {
              var $playerChick = ($('.square[data-x=' + playerChickPosition.row + '][data-y=' + playerChickPosition.col + ']')).children();
              $playerChick.removeClass('playerChick');
              $playerChick.addClass('playerHen');
              // Reset position of enemy chick
              playerChickPosition.row = 0;
              playerChickPosition.col = 0;
              // Reset promotion flag
              playerChickPromotion = false;
              _board[x][y] = 'playerHen';
            }
            // Toggle the turn
            toggleTurn();

            // Increment turn
            incrementTurn();
          }
        } 
      } else {
        // Square selected is not occupied, we simply move our piece
        attackPosition.row = x;
        attackPosition.col = y;
        differencePosition.row = attackPosition.row - selectedPosition.row;
        differencePosition.col = attackPosition.col - selectedPosition.col;
        var attackerName = _board[selectedPosition.row][selectedPosition.col];
        if(validMove(attackerName)) {

          // If we moved a chick, it is valid for promotion
          if(attackerName == 'playerChick') {
            movedPlayerChick = true;
            playerChickPosition.row = x;
            playerChickPosition.col = y;
          } else {
            movedPlayerChick = false;
          }

          if (attackerName == 'enemyChick') {
            movedEnemyChick = true;
            enemyChickPosition.row = x;
            enemyChickPosition.col = y;
          } else {
            movedEnemyChick = false;
          }
          var $a = ($('.square[data-x=' + x + '][data-y=' + y + ']')).children();
          var $p = ($('.square[data-x=' + selectedPosition.row + '][data-y=' + selectedPosition.col + ']')).children();
          $p.removeClass(attackerName);
          $a.addClass(attackerName);
          if(playerTurn) {
            debugPanel('\n');
            debugPanel('  The player moved the piece: ' + _board[selectedPosition.row][selectedPosition.col] + ' to position: ' + attackPosition.row + ', ' + attackPosition.col);
          }

          if(enemyTurn) {
            debugPanel('\n');
            debugPanel('  The enemy moved the piece: ' + _board[selectedPosition.row][selectedPosition.col] + ' to position: ' + attackPosition.row + ', ' + attackPosition.col);
          }
          // Update new internal board positions
          _board[x][y] = _board[selectedPosition.row][selectedPosition.col];
          _board[selectedPosition.row][selectedPosition.col] = -1;
          selectedCell = false;
          attackedCell = false;
          // Reset grid styles
          clearCells();
          // Check if the game is over 
          isGameOver(_board);
          if(!gameOver) {
            // Check if a chick should be promoted
            checkChicks();
            // Enemy Chick needs to be promoted
            if(enemyChickPromotion) {
              var $enemyChick = ($('.square[data-x=' + enemyChickPosition.row + '][data-y=' + enemyChickPosition.col + ']')).children();
              $enemyChick.removeClass('enemyChick');
              $enemyChick.addClass('enemyHen');
              // Reset position of enemy chick
              enemyChickPosition.row = 0;
              enemyChickPosition.col = 0;
              // Reset promotion flag
              enemyChickPromotion = false;
              _board[x][y] = 'enemyHen';
            } else if (playerChickPromotion) {
              var $playerChick = ($('.square[data-x=' + playerChickPosition.row + '][data-y=' + playerChickPosition.col + ']')).children();
              $playerChick.removeClass('playerChick');
              $playerChick.addClass('playerHen');
              // Reset position of enemy chick
              playerChickPosition.row = 0;
              playerChickPosition.col = 0;
              // Reset promotion flag
              playerChickPromotion = false;
              _board[x][y] = 'playerHen';
            }
            // Toggle the turn
            toggleTurn();

            // Increment turn
            incrementTurn();
          }
        }
      }
    }
  });

  // Programmatic click!
  // $('.row > .square[data-x=' + 2 + '][data-y=' + 1 + ']').click();
});