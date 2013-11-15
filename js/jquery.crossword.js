/*======================================
jQuery Crossword Puzzle Plugin
http://www.david-sherman.com/projects/jqcw/intro.html
version 1.0
========================================*/

var crossword = {};

(function( $ ){
/*=====================================
jQuery UI Bootstrap stuff
=======================================*/
	$('#radioset > .chooseCrossword').click(function(event){
		var num = event.target.getAttribute("no");
		$.getJSON("puzzles/puzzle."+num*100+".json", function(data){
			$(this).crossword(
			{
				'puzzle' 			: data.puzzle, //JSON puzzle structure
				'clues' 			: data.clues, //JSON clue structure
				'puzzleContainer'	: "#puzzleContainer", // id of puzzle display DIV 
				'acrossContainer'	: "#acrossContainer", // id of across clues display DIV
				'downContainer'		: "#downContainer", // id of down clues display DIV
				'revealButton'		: "#revealButton", // id of reveal button
				'hideButton'		: "#hideButton", // id of hide button
				'checkButton'		: "#checkButton", // id of hide button
			});
		});
	});

	$.fn.crossword = function( options )
	{
/*=====================================
use global _cwo CrossWord Object to store the puzzle, the clues a few commonly used items, and some parameters that can be easily changed
=======================================*/
		$.extend(crossword, options);

		// don't change these
		crossword.rows = crossword.puzzle.length;
		crossword.cols = crossword.puzzle[0].length;
		crossword.BLACKCELL = "_";

		// adjust these as desired to control starting position and direction, and current cell color

		crossword.currCell = "";
		crossword.currRow = "0";
		crossword.currCol = "0";
		crossword.direction = "across";

/*======================================
Build the puzzle inside a standard HTML table.  Each <td> in the table is assigned a unique id attribute.  After the table is constructed, replace the HTML of the target container with the table, then adjust the height and width of each cell in the table so that the puzzle fits in its container. 
========================================*/

		var table = document.createElement('table');
		table.className = "cwTable";
		table.id = "puzzleTable";
		var tbody = document.createElement('tbody');

		var number = 1;
		for(var i=0; i<crossword.rows; i++)
		{
			var tr = document.createElement('tr');
			tr.className = "cwRow";
			for(var j=0; j<crossword.cols; j++)
			{
				var td = document.createElement('td');
				var id = cellID(i, j);

				var numDiv = document.createElement('div');
				numDiv.className = "cwNumber";
				numDiv.id = "N"+id;
				td.appendChild(numDiv);

				var character = crossword.puzzle[i][j];
				var div = document.createElement('div');
				if(character == crossword.BLACKCELL)
				{
					div.className = "cwBlackCell";
				}
				else
				{
					div.className = "cwCell";
				}
				div.id = id;
				td.appendChild(div);

				tr.appendChild(td);
			}
			tbody.appendChild(tr);
		}
		table.appendChild(tbody);
		$(crossword.puzzleContainer).html(table);

/*======================================
Use the JQuery Data feature to associate the following pieces of information with each table cell:  the correct answer, the current value entered by the user, the cell clue number ( or zero ), and row /column data
========================================*/
		for(var i=0; i<crossword.rows; i++)
		{
			for(var j=0; j<crossword.cols; j++)
			{
				var c = crossword.puzzle[i][j];
				var id = "#" + cellID(i, j);
				var numberCell = false;
				if(c != crossword.BLACKCELL)
				{
					if(
					  ((i == 0) ||
					   (crossword.BLACKCELL == crossword.puzzle[i-1][j])) &&
					  ((i == crossword.rows-1) ||
					   (crossword.BLACKCELL != crossword.puzzle[i+1][j]))
					)
					{
						numberCell = true;
					}
					if(
					  ((j == 0) ||
					   (crossword.BLACKCELL == crossword.puzzle[i][j-1])) &&
					  ((j == crossword.cols-1) ||
					   (crossword.BLACKCELL != crossword.puzzle[i][j+1]))
					)
					{
						numberCell = true;
					}
				}
				$(id).data("answer", c);
				$(id).data("player", " ");
				$(id).data("number", (numberCell?number++:0));
				$(id).data("row", i);
				$(id).data("col", j);
				paintCell(id, 'player');
			}
		}

		//Set up clue displays and bind a few events
		setUpClues(crossword.acrossContainer, crossword.clues.across, "A");
		setUpClues(crossword.downContainer, crossword.clues.down, "D");

		$('.cwCell').unbind('click');
		$('.liClue').unbind('click');
		$('*').unbind('keydown');
		$('*').unbind('keypress');
		$('.cwCell').bind('click',function(event){cellClick(event)});
		$('.liClue').bind('click',function(event){clueClick(event)});
		$('*').bind('keydown',function(event){keyDown(event)});
		$('*').bind('keypress',function(event){keyPress(event)});

		// Attach functionality to buttons..
		$(crossword.revealButton).bind('click');
		$(crossword.hideButton).bind('click');
		$(crossword.checkButton).bind('click');
		$(crossword.revealButton).bind('click', function(event, ui){paintPuzzle('answer')});
		$(crossword.hideButton).bind('click', function(event, ui){paintPuzzle('player')});
		$(crossword.checkButton).bind('click', function(event, ui){paintPuzzle('check')});
		moveToCell("C0");
		$("#" + cellID(crossword.currRow, crossword.currCol)).click();
	};
})(jQuery);

/*======================================
  Support functions
========================================*/

function cellID(row, col)
{
	return "C" + (row*1000 + col)
}

function answer(row, col)
{
	return $("#" + cellID(row, col)).data("answer")
}

function keyDown(event)
{
	if(event.currentTarget.tagName != "HTML")
	{
		return;
	}
	if(event.which == 37)
	{
		goAcross(true);
		$("#" + cellID(crossword.currRow, crossword.currCol)).click();
	}
	if(event.which == 38)
	{
		goDown(true);
		$("#" + cellID(crossword.currRow, crossword.currCol)).click();
	}
	if(event.which == 39)
	{
		goAcross(false);
		$("#" + cellID(crossword.currRow, crossword.currCol)).click();
	}
	if(event.which == 40)
	{
		goDown(false);
		$("#" + cellID(crossword.currRow, crossword.currCol)).click();
	}
}

function keyPress(event)
{
	if(event.currentTarget.tagName != "HTML")
	{
		return;
	}
	var character = String.fromCharCode(event.keyCode);
	if(!/\S/.test(character))
	{
		return;
	}
	$(crossword.currCell).data('player', character);
	paintCell(crossword.currCell, 'player');
	if(crossword.direction == 'across')
	{
		goAcross(false);
	}
	else
	{
		goDown(false);
	}
	$("#" + cellID(crossword.currRow, crossword.currCol)).click();
}

function cellClick(event)
{
	moveToCell("#" + event.currentTarget.id);
	alignClue("A", crossword.clues["across"]);
	alignClue("D", crossword.clues["down"]);
}

function clueClick(event)
{
	$("#Aselector").blur();
	$("#Dselector").blur();

	clueIndex = event.target.getAttribute("no");
	var clueNumber;
	if(event.target.parentNode.parentNode.parentNode.id == "Dselector")
	{
		clueNumber = crossword.clues["down"][clueIndex].no;
		goDown(false);
	}
	else if(event.target.parentNode.parentNode.parentNode.id == "Aselector")
	{
		clueNumber = crossword.clues["across"][clueIndex].no;
		goAcross(false);
	}
	for(var i=0; i<crossword.rows; i++)
	{
		for(var j=0; j<crossword.cols; j++)
		{
			var id = "#" + cellID(i, j);
			if($(id).data('number') == clueNumber)
			{
				$(id).click();
				return;
			}
		}
	}
}

function moveToCell(id)  // put the cursor in the given cell 
{
	$(crossword.currCell).removeClass('cwCurrentCell');
	$(id).addClass('cwCurrentCell');
	crossword.currRow = $(id).data('row');
	crossword.currCol = $(id).data('col');
	crossword.currCell = "#" + cellID(crossword.currRow, crossword.currCol);
	$(crossword.currCell).focus();
}

function alignClue(direction, clues)
{
	var selectorID =  "#" + direction + "selector";
	var clueNo = 1;
	if(direction == "A")
	{
		for(var i=crossword.currCol; i>-1; i--)
		{
			if((i == 0) || (i > 0 && (answer(crossword.currRow, i-1) == crossword.BLACKCELL)))
			{
				clueNo = $("#"  + cellID(crossword.currRow, i)).data("number")
				break;
			}
		}
	}
	else
	{
		for(var j = crossword.currRow; j>-1; j--)
		{
			if ((j == 0) || (j > 0 && (answer(j-1, crossword.currCol) == crossword.BLACKCELL)))
			{
				clueNo = $("#" + cellID(j, crossword.currCol)).data("number")
				break;
			}
		}
	}
	//dirty hack to get index:
	var clueList = $(selectorID+' > div');
	var index = -1;
	for(var i=0; i<clueList.length; ++i)
	{
		if(clueList[i].id == direction+clueNo)
		{
			index = i;
			break;
		}
	}
	if(index != -1)
	{
		$(selectorID).accordion('option', 'active', index);
	}
}

function goAcross(bLeft)
{
	var currVal = crossword.currCol;
	crossword.direction = 'across';
	if(bLeft)
	{
		crossword.currCol--;
	}
	else
	{
		crossword.currCol++;
	}
	if(crossword.currCol<0 || crossword.currCol==crossword.rows)
	{
		crossword.currCol = currVal;
		return;
	}
	if(answer(crossword.currRow, crossword.currCol)==crossword.BLACKCELL)
	{
		crossword.currCol = currVal;
		return;
	}
}

function goDown(bUp)
{
	var currVal = crossword.currRow;
	crossword.direction = 'down';
	if(bUp)
	{
		crossword.currRow--;
	}
	else
	{
		crossword.currRow++;
	}
	if(crossword.currRow<0 || crossword.currRow==crossword.cols)
	{
		crossword.currRow = currVal;
		return;
	}
	if(answer(crossword.currRow, crossword.currCol)==crossword.BLACKCELL)
	{
		crossword.currRow = currVal;
		return;
	}
}

function setUpClues(outerDiv, clueArray, idTic)
{
	var clueList = "";
	var selectID = idTic + "selector";
	var div = document.createElement('div');
	div.className = "clueDiv";
	div.id = selectID;
	for(var index = 0; index<clueArray.length; index++)
	{
		var item = document.createElement('div');
		var itemID = idTic + clueArray[index].no;
		var itemText = clueArray[index].text;
		item.className = "liClue";
		item.id = itemID;
		var header = document.createElement('h3');
		var link = document.createElement('a');
		link.href = "#";
		link.innerHTML = clueArray[index].no + ": " + clueArray[index].key;
		$(link).attr("no", index);
		link.id = itemID;
		header.appendChild(link);
		item.appendChild(header);
		var clue = document.createElement('div');
		clue.innerHTML = itemText;
		item.appendChild(clue);
		div.appendChild(item);
	}
	$(outerDiv).html(div);
	$(".clueDiv").accordion({header: "h3", heightStyle: "content"});
}

function paintPuzzle(key)
{
	for(var i=0; i<crossword.rows; i++)
	{
		for(var j=0; j<crossword.cols; j++)
		{
			var id = "#" + cellID(i, j);
			if(key == 'check')
			{
				checkCell(id);
			}
			else
			{
				paintCell(id, key);
			}
		}
	}
}

function paintCell(id, selector) // display either the answer or the player's current value in the cell
{
	var numID = "#N" + id.substring(1);
	var value = $(id).data(selector);
	if(crossword.BLACKCELL == $(id).data('answer'))
	{
		return;
	}
	if((selector == 'player') && (value == ' ') && (0 < $(id).data("number")))
	{
		$(numID).text($(id).data("number"))
	}
	$(id).removeClass('cwWrong');
	$(id).text(value);
}

function checkCell(id) // Check the players input and the answer match
{
	if(crossword.BLACKCELL == $(id).data('answer'))
	{
		return;
	}
	if(($(id).data('player') != ' ') && $(id).data('player') != $(id).data('answer'))
	{
		$(id).addClass('cwWrong');
	}
}
