Helper.js 分析

Helper Method 好像多數是後端運算會用到的 functions，不需要寫成獨立的 routers
會動到 DOM 的只有 _makeMove 和 debugPanel 兩個

Game Methods

	- 不會動到 DOM，但是會用到 $ 其他 function:
		- makeAllPossibleMoves 
		- makeSingleMove
		- evaluateSingleBoard
		- boardEvaluation
		- manhattanDistance

	- 會動到 DOM
		- toggleTurn 會在 main 中呼叫，是用來切換為電腦下的處理函數，這裡有 setTimeout，會動到 DOM
		- makeRandomMove
		- addToBench
		- clearCells
		- removeFromBench

	- 不會動到 DOM 也沒有用到 $
		- getValidMoves
		- getControlledSquares
		- incrementTurn
		- isGameOver
		- isOccupied
		- clearCell
		- validMove
		- validSelection
		- checkChicks
		- isBenchOccupied


AI Methods 只有兩個，都不會涉及到 DOM 的操作