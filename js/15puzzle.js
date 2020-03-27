var board,      // board element
    matrix,	    // 2D array containing tile elements
    voidC,	    // void coordinates
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
                else if (value > 1) for (var i = index+1; i < 16; i++)
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
                if (document.documentElement.style.transform !== undefined) tileWrapper.style.transform = "translate(" + j*100 + "%, " + i*100 + "%)";
                else tileWrapper.setAttribute("style", "left: " + 25*j + "%; top: " + 25*i + "%;");
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

    function setMovingPercentCounterValues() {

        function setInitialValue() {

            board.counterInitial = board.isTransformSupported ? 0 : 1;
        }

        function setStepValue() {

            var isTransitionSupported = document.documentElement.style.transition !== undefined;

            if (board.isTransformSupported) board.counterStep = isTransitionSupported ? 100 : 20;
            else board.counterStep = 2;
        }

        function setMaxValue() {

            board.counterMax = (board.isTransformSupported) ? 100 : 25;
        }

        board.isTransformSupported = document.documentElement.style.transform !== undefined;
        setInitialValue();
        setStepValue();
        setMaxValue();
    }

    function activateButtons() {

        var about = document.body.querySelector(".about"),
            openAboutBtn = board.querySelector(".openAboutBtn");

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

            openAboutBtn.addEventListener("click", function() {
                board.className += " hidden";
                about.className = "textArea about";
            });
        }

        function makeCloseAboutBtnResponsive() {

            var closeAboutBtn = document.body.querySelector(".closeAboutBtn");

            closeAboutBtn.addEventListener("click", function() {
                about.className += " hidden";
                board.className = "board";
            });
            document.addEventListener("keydown", function(evt) {

                if (evt.keyCode === 27 && about.className === "textArea about") closeAboutBtn.click();
            });
        }

        shuffleBtn = board.querySelector(".shuffleBtn");
        makeOpenAboutBtnResponsive();
        displayOpenAboutBtn();
        makeCloseAboutBtnResponsive();
        makeShuffleBtnResponsive();
    }

    function activateKeyboardSupport() {

        function makeTabIndexCounter() {

            board.tabIndexCount = [];
            for (var i = 0; i < 16; i++) board.tabIndexCount.push(0);
        }

        makeTabIndexCounter();
        board.addEventListener("keydown", function(evt) {

            if ((evt.keyCode === 13 || evt.keyCode === 32) && evt.target.className === "tileWrapper clickable") {
                evt.target.firstChild.click();
            }
        });
    }

    board.processMovableTiles = function(classString) {

        for (var i = 0; i < 4; i++) {
            if (i !== voidC.n) {
                this.setClassName(matrix[voidC.m][i], classString);
                if (classString === "tileWrapper clickable") matrix[voidC.m][i].tabIndex = ((4*voidC.m + i + 1)*1000 + board.tabIndexCount[4*voidC.m + i]++);
                if (classString === "tileWrapper") matrix[voidC.m][i].removeAttribute('tabindex');
            }
            if (i !== voidC.m) {
                this.setClassName(matrix[i][voidC.n], classString);
                if (classString === "tileWrapper clickable") matrix[i][voidC.n].tabIndex = ((4*i + voidC.n + 1)*1000 + board.tabIndexCount[4*i + voidC.n]++);
                if (classString === "tileWrapper") matrix[i][voidC.n].removeAttribute('tabindex');
            }
        }
    };

    board.clickHandler = function(e) {

        if (e.target.parentNode.m === voidC.m || e.target.parentNode.n === voidC.n) {
            this.makeTilesStatic();
            this.targetElement = e.target.parentNode;
            this.moveTiles();
        }
    };

    board.setClassName = function(element, classString) {

        element.className = classString;
    };

    board.makeTilesResponsive = function() {

        this.processMovableTiles("tileWrapper clickable");
        this.addEventListener("click", this.clickHandler);
    };

    board.makeTilesStatic = function() {

        this.processMovableTiles("tileWrapper");
        this.removeEventListener("click", this.clickHandler);
    };

    board.moveTilesUp = function() {

        for (var i = voidC.m+1; i <= this.targetElement.m; i++) {
            if (this.isTransformSupported) matrix[i][voidC.n].style.transform = "translate(" + 100*voidC.n + "%, " + (100*i-this.percentCount) + "%)";
            else matrix[i][voidC.n].setAttribute("style", "left: " + 25*voidC.n + "%; top: " + (25*i-this.percentCount) + "%;");
            if (this.percentCount === this.counterMax) {
                matrix[i][voidC.n].m--;
                matrix[i-1][voidC.n] = matrix[i][voidC.n];
            }
        }
        if (this.percentCount === this.counterMax) voidC.m += this.amountOfTiles;
    };

    board.moveTilesDown = function() {

        for (var i = voidC.m-1; i >= this.targetElement.m; i--) {
            if (this.isTransformSupported) matrix[i][voidC.n].style.transform = "translate(" + 100*voidC.n + "%, " + (100*i+this.percentCount) + "%)";
            else matrix[i][voidC.n].setAttribute("style", "left: " + 25*voidC.n + "%; top: " + (25*i+this.percentCount) + "%;");
            if (this.percentCount === this.counterMax) {
                matrix[i][voidC.n].m++;
                matrix[i+1][voidC.n] = matrix[i][voidC.n];
            }
        }
        if (this.percentCount === this.counterMax) voidC.m -= this.amountOfTiles;
    };	

    board.moveTilesToTheRight = function() {

        for (var i = voidC.n-1; i >= this.targetElement.n; i--) {
            if (this.isTransformSupported) matrix[voidC.m][i].style.transform = "translate(" + (100*i+this.percentCount) + "%, " + 100*voidC.m + "%)";
            else matrix[voidC.m][i].setAttribute("style", "left: " + (25*i+this.percentCount) + "%; top: " + 25*voidC.m + "%;");
            if (this.percentCount === this.counterMax) {
                matrix[voidC.m][i].n++;
                matrix[voidC.m][i+1] = matrix[voidC.m][i];
            }
        }
        if (this.percentCount === this.counterMax) voidC.n -= this.amountOfTiles;
    };

    board.moveTilesToTheLeft = function() {

        for (var i = voidC.n+1; i <= this.targetElement.n; i++) {
            if (this.isTransformSupported) matrix[voidC.m][i].style.transform = "translate(" + (100*i-this.percentCount) + "%, " + 100*voidC.m + "%)";
            else matrix[voidC.m][i].setAttribute("style", "left: " + (25*i-this.percentCount) + "%; top: " + 25*voidC.m + "%;");
            if (this.percentCount === this.counterMax) {
                matrix[voidC.m][i].n--;
                matrix[voidC.m][i-1] = matrix[voidC.m][i];
            }
        }
        if (this.percentCount === this.counterMax) voidC.n += this.amountOfTiles;
    };

    board.setTilesMovingDirection = function() {

        if (this.targetElement.m !== voidC.m) {
            if (this.targetElement.m > voidC.m) this.moveTilesPartially = this.moveTilesUp;
            else this.moveTilesPartially = this.moveTilesDown;
        }
        else {
            if (this.targetElement.n < voidC.n) this.moveTilesPartially = this.moveTilesToTheRight;
            else this.moveTilesPartially = this.moveTilesToTheLeft;
        }
    };

    board.checkIsSorted = function() {

        this.temp = 0;
        for (var i = 3; i >= 0; i--) {
            for (var j = 3; j >= 0; j--) {
                if (matrix[i][j]) {
                    if (this.temp) {
                        if (i === 1 && j === 1) {
                            this.isSorted = true;
                            window.setTimeout(function() {
                                shuffleBtn.className = "shuffleBtn";
                            }, 0);
                            return;
                        }
                        if (Number(matrix[i][j].firstChild.textContent) !== this.temp-1) return;
                    }
                    this.temp = matrix[i][j].firstChild.textContent;
                }
            }
        }
    };

    board.moveTiles = function() {

        this.percentCount = this.counterInitial;
        this.amountOfTiles = Math.abs(this.targetElement.m-voidC.m || this.targetElement.n-voidC.n);
        this.setTilesMovingDirection();
        this.intervalID = setInterval(function() {
            this.percentCount += this.counterStep;
            this.moveTilesPartially();
            if (this.percentCount === this.counterMax) {
                clearInterval(this.intervalID);
                matrix[voidC.m][voidC.n] = 0;
                if (voidC.m === 3 && voidC.n === 3) this.checkIsSorted();
                if (!this.isSorted) this.makeTilesResponsive();
            }
        }.bind(this), 3);
    };

    setMovingPercentCounterValues();
    activateKeyboardSupport();
    board.makeTilesResponsive();
    activateButtons();
}

board = document.body.querySelector(".board");
renderTiles();
makeBoardResponsive();
