var board,      // board element
    matrix,	    // 2D array containing tile elements
    voidC,	    // void coordinates
    about,      // section element with information about game
    shuffleBtn; // button to shuffle tiles

function renderTiles() {

    var arr, tileWrapper, tile,
        arrIndex = 0;

    function makeArray() {

        var isSolvable;

        function shuffleArray() {

            var randomIndex, temp;

            arr.map(function(value, index) {
                randomIndex = Math.floor(Math.random()*16);
                if (arr[randomIndex] !== value) {
                    temp = arr[randomIndex];
                    arr[randomIndex] = value;
                    arr[index] = temp;
                }
            });
        }

        function checkIsSolvable() {

            var nullIndex,
                inversionCount = 0;

            arr.map(function(value, index) {
                if (value === 0) nullIndex = index;
                if (value > 1) for (i = index+1; i < 16; i++)
                    if (value > arr[i] && arr[i] !== 0) inversionCount++;
            });
            if (
                (!(inversionCount%2) && ((nullIndex > 3 && nullIndex < 8) || (nullIndex > 11 && nullIndex < 16)))
                ||
                ((inversionCount%2) && (nullIndex < 4 || (nullIndex > 7 && nullIndex < 12)))
            ) isSolvable = true;
        }

        arr = [];
        for (var i = 0; i < 16; i++) arr.push(i);
        while (!isSolvable) {
            shuffleArray();
            checkIsSolvable();
        }
    }

    makeArray();
    matrix = [];
    for (var i = 0; i < 4; i++) {
        matrix[i] = [];
        for (var j = 0; j < 4; j++) {
            if (arr[arrIndex]) {
                tileWrapper = document.createElement("div");
                tileWrapper.className = "tileWrapper";
                tileWrapper.setAttribute("style", "left: " + 25*j + "%; top: " + 25*i + "%;");
                tileWrapper.m=i;
                tileWrapper.n=j;
                tile = document.createElement("div");
                tile.className = "tile";
                tile.textContent = arr[arrIndex];
                tileWrapper.appendChild(tile);
                board.appendChild(tileWrapper);
                matrix[i][j] = tileWrapper;
            }
            else voidC = {m: i, n: j};
            arrIndex++;
        }
    }
}

function makeBoardResponsive() {

    function activateButtons() {

        var openAboutBtn, closeAboutBtn;

        function displayOpenAboutBtn() {

            openAboutBtn.className = "openAboutBtn";
        }

        function makeShuffleBtnResponsive() {

            shuffleBtn.addEventListener("click", function() {
                shuffleBtn.className += " hidden";
                for (var i = 0; i < 4; i++)
                    for (var j = 0; j < 4; j++)
                        if(matrix[i][j]) board.removeChild(matrix[i][j]);
                renderTiles();
                board.isSorted = false;
                board.makeTilesResponsive();
            });
        }

        function makeOpenAboutBtnResponsive() {

            about = document.body.querySelector(".about");
            openAboutBtn.addEventListener("click", function() {
                board.className += " hidden";
                about.className = "textArea about";
            });
        }

        function makeCloseAboutBtnResponsive() {

            closeAboutBtn.addEventListener("click", function() {
                about.className += " hidden";
                board.className = "board";
            });
        }

        shuffleBtn = document.body.querySelector(".shuffleBtn");
        openAboutBtn = document.body.querySelector(".openAboutBtn");
        closeAboutBtn = document.body.querySelector(".closeAboutBtn");

        makeOpenAboutBtnResponsive();
        displayOpenAboutBtn();
        makeCloseAboutBtnResponsive();
        makeShuffleBtnResponsive();
    }

    board.processMovableTiles = function(classString) {

        for (var i = 0; i < 4; i++) {
            if (i !== voidC.n) board.setClassName(matrix[voidC.m][i], classString);
            if (i !== voidC.m) board.setClassName(matrix[i][voidC.n], classString);
        }
    };

    board.clickHandler = function(e) {

        if (e.target.parentNode.m === voidC.m || e.target.parentNode.n === voidC.n) {
            board.makeTilesStatic();
            board.targetElement = e.target.parentNode;
            board.moveTiles();
        }
    };

    board.setClassName = function(element, classString) {

        element.className = classString;
    };

    board.makeTilesResponsive = function() {

        board.processMovableTiles("tileWrapper clickable");
        board.addEventListener("click", board.clickHandler);
    };

    board.makeTilesStatic = function() {

        board.processMovableTiles("tileWrapper");
        board.removeEventListener("click", board.clickHandler);
    };

    board.moveTilesUp = function() {

        for (var i = voidC.m+1; i <= board.targetElement.m; i++) {
            matrix[i][voidC.n].setAttribute("style", "left: " + 25*voidC.n + "%; top: " + (25*i-board.percentCount) + "%;");
            if (board.percentCount === 25) {
                matrix[i][voidC.n].m--;
                matrix[i-1][voidC.n] = matrix[i][voidC.n];
            }
        }
        if (board.percentCount === 25) voidC.m += board.amountOfTiles;
    };

    board.moveTilesDown = function() {

        for (var i = voidC.m-1; i >= board.targetElement.m; i--) {
            matrix[i][voidC.n].setAttribute("style", "left: " + 25*voidC.n + "%; top: " + (25*i+board.percentCount) + "%;");
            if (board.percentCount === 25) {
                matrix[i][voidC.n].m++;
                matrix[i+1][voidC.n] = matrix[i][voidC.n];
            }
        }
        if (board.percentCount === 25) voidC.m -= board.amountOfTiles;
    };

    /*
    board.verticalMove = function() {

        board.vd = (voidC.m-board.targetElement.m)/board.amountOfTiles; //vector direction

        for (var i = voidC.m-board.vd; i*board.vd >= board.targetElement.m*board.vd; i -= board.vd) {
            matrix[i][voidC.n].setAttribute("style", "left: " + 100*voidC.n + "px; top: " + (100*i+board.percentCount*board.vd) + "px;");
            if (board.percentCount === 100) {
                matrix[i][voidC.n].m += board.vd;
                matrix[i+board.vd][voidC.n] = matrix[i][voidC.n];
            }
        }
        if (board.percentCount === 100) voidC.m -= board.amountOfTiles*board.vd;
    };
    */				
    
    board.moveTilesToTheRight = function() {

        for (var i = voidC.n-1; i >= board.targetElement.n; i--) {
            matrix[voidC.m][i].setAttribute("style", "left: " + (25*i+board.percentCount) + "%; top: " + 25*voidC.m + "%;");
            if (board.percentCount === 25) {
                matrix[voidC.m][i].n++;
                matrix[voidC.m][i+1] = matrix[voidC.m][i];
            }
        }
        if (board.percentCount === 25) voidC.n -= board.amountOfTiles;
    };

    board.moveTilesToTheLeft = function() {

        for (var i = voidC.n+1; i <= board.targetElement.n; i++) {
            matrix[voidC.m][i].setAttribute("style", "left: " + (25*i-board.percentCount) + "%; top: " + 25*voidC.m + "%;");
            if (board.percentCount === 25) {
                matrix[voidC.m][i].n--;
                matrix[voidC.m][i-1] = matrix[voidC.m][i];
            }
        }
        if (board.percentCount === 25) voidC.n += board.amountOfTiles;
    };

    /*
    board.horizontalMove = function() {

        board.vd = (voidC.n-board.targetElement.n)/board.amountOfTiles; //vector direction

        for (var i = voidC.n-board.vd; i*board.vd >= board.targetElement.n*board.vd; i -= board.vd) {
            matrix[voidC.m][i].setAttribute("style", "left: " + (100*i+board.percentCount*board.vd) + "px; top: " + 100*voidC.m + "px;");
            if (board.percentCount === 100) {
                matrix[voidC.m][i].n += board.vd;
                matrix[voidC.m][i+board.vd] = matrix[voidC.m][i];
            }
        }
        if (board.percentCount === 100) voidC.n -= board.amountOfTiles*board.vd;
    };
    */

    board.setTilesMovingDirection = function() {

        if (board.targetElement.m !== voidC.m) {
            if (board.targetElement.m > voidC.m) board.moveTilesPartially = board.moveTilesUp;
            else board.moveTilesPartially = board.moveTilesDown;
        }
        else {
            if (board.targetElement.n < voidC.n) board.moveTilesPartially = board.moveTilesToTheRight;
            else board.moveTilesPartially = board.moveTilesToTheLeft;
        }
    };

    /*
    board.checkMovingAxis = function() {

        if (board.targetElement.m !== voidC.m) board.moveTilesPartially = board.verticalMove;
        else board.moveTilesPartially = board.horizontalMove;
    };
    */

    board.checkIsSorted = function() {

        board.temp = 0;
        for (var i = 3; i >= 0; i--) {
            for (var j = 3; j >= 0; j--) {
                if (matrix[i][j]) {
                    if (board.temp) {
                        if (i === 1 && j === 1) {
                            board.isSorted = true;
                            window.setTimeout(function() {
                                shuffleBtn.className = "shuffleBtn";
                            }, 0);
                            return;
                        }
                        if (Number(matrix[i][j].firstChild.textContent) !== board.temp-1) return;
                    }
                    board.temp = matrix[i][j].firstChild.textContent;
                }
            }
        }
    };

    board.moveTiles = function() {

        board.percentCount = 1;
        board.amountOfTiles = Math.abs(board.targetElement.m-voidC.m || board.targetElement.n-voidC.n);
        board.setTilesMovingDirection();
        board.intervalID = setInterval(function() {
            board.percentCount += 2;
            board.moveTilesPartially();
            if (board.percentCount === 25) {
                clearInterval(board.intervalID);
                matrix[voidC.m][voidC.n] = 0;
                if (voidC.m === 3 && voidC.n === 3) board.checkIsSorted();
                if (!board.isSorted) board.makeTilesResponsive();
            }
        }, 3);
    };

    board.makeTilesResponsive();
    activateButtons();
}

board = document.body.querySelector(".board");
renderTiles();
makeBoardResponsive();