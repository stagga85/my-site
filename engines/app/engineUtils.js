define(function (require) {

	var drawGrid = function (alpha, cellSize, canvasWidth, canvasHeight, ctx) {
	    ctx.strokeStyle = 'blue';
	    ctx.lineWidth = 0.5;
	    ctx.beginPath();

	    for (var x = cellSize; x < canvasWidth; x += cellSize) {
	        ctx.moveTo(x, 0);
	        ctx.lineTo(x, canvasHeight);
	    }

	    for (var y = canvasHeight; y > 0; y -= cellSize) {
	        ctx.moveTo(0, y);
	        ctx.lineTo(canvasWidth, y);
	    }

	    ctx.stroke();

	    ctx.beginPath();

	    ctx.moveTo(0, 0);
	    ctx.lineTo(0, canvasHeight);

	    ctx.moveTo(canvasWidth, 0);
	    ctx.lineTo(canvasWidth, canvasHeight);

	    ctx.stroke();
	}

	return {
		drawGrid: drawGrid
	}
});