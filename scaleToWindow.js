function scaleToWindow(canvas, backgroundColor) {
	canvas.style.width = "100%";
    $(canvas).outerHeight($(window).height());
	var height = canvas.style.height;
	document.getElementById("leaderboard").style.height = height;
}