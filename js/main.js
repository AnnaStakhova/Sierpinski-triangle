window.onload = function() {
  var canvas = document.getElementById("siCanvas");
  canvas.width = 600;
  canvas.height = 600;
  var ctx = siCanvas.getContext("2d");
  //constants
  var VERTICE1 = [0, 550]; //bottom left corner of initial triangle
  var VERTICE2 = [600, 550]; //bottom right corner of initial triangle
  var VERTICE3 = [((VERTICE2[0] - VERTICE1[0]) / 2), (VERTICE1[1] - ((Math.sqrt(3) * (VERTICE2[0] - VERTICE1[0])) / 2))]; //top corner of initial triangle
  var PARTITIONS = 5; //quantity of triangle partitions
  var SCALE = [1, 1];

  var ver1 = VERTICE1;
  var ver2 = VERTICE2;
  var ver3 = VERTICE3;
  var countCycle = PARTITIONS;
  var scaleCounter = [SCALE[0], SCALE[1]];
  var isDown = false; // whether mouse is pressed
  var startCoords = []; // grab coordinates when pressing mouse
  var last = [0, 0]; // previous coordinates of mouse release

  function drawBlack (v1, v2, v3) {
    /*Draw one big Black triangle and call drawWhite function*/
    //console.log("v1: [%d, %d], v2: [%d, %d], v3: [%d, %d]", v1[0], v1[1], v2[0], v2[1], v3[0], v3[1]);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#000";
    if (ifCanvasInsideTriangle(v1, v2, v3)) {//if triangle more than canvas just fill the canvas
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else { //draw one black triangle
      ctx.beginPath();
      ctx.moveTo(v1[0], v1[1]);
      ctx.lineTo(v2[0], v2[1]);
      ctx.lineTo(v3[0], v3[1]);
      ctx.fill();
    }
    var count = countCycle;
    drawWhite(v1, v2, v3, count);
  }

  function drawWhite (v1, v2, v3, count) {
    /*Draw one White flipped over triangle and call itself thrice*/
    if ((count > 0) && (!(v1[0] > canvas.width || v2[0] < 0 || v3[1] > canvas.height || v1[1] < 0))) {
      //whether we need one more partition and black outer triangle is on canvas
      var mv1 = [((v3[0] + v1[0]) / 2), ((v1[1] + v3[1]) / 2)];//vertices of white triangle
      var mv2 = [((v2[0] + v3[0]) / 2), mv1[1] ];
      var mv3 = [((v2[0] + v1[0]) / 2), v1[1] ];
      ctx.fillStyle = "#fff";
      if (ifCanvasInsideTriangle(mv1, mv2, mv3)) { //if white triangle is more than canvas fill the canvas
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        ctx.beginPath();//draw one white triangle
        ctx.moveTo(mv1[0], mv1[1]);
        ctx.lineTo(mv2[0], mv2[1]);
        ctx.lineTo(mv3[0], mv3[1]);
        ctx.fill();
        count = count - 1;
        drawWhite (v1, mv3, mv1, count);
        drawWhite (mv1, mv2, v3, count);
        drawWhite (mv3, v2, mv2, count);
      }
    }
  }

  function scrollPoint(x1, x2, y1, y2, is_zoom){
    /*Formula for initial triangle vertices after scroll up*/
    return is_zoom ?
      [(2 * x1 - x2)/1, (2 * y1 - y2)/1] : // scale up towards point (x2, y2)
      [(x1 + 1 * x2) / 2, (y1 + 1 * y2) / 2]; // scale down from point (x2, y2)
  }

  function ifCanvasInsideTriangle(v1, v2, v3){
    /*Count whether canvas inside initial triangle*/
    var toReturn = true;
    var x = [[0, 0], [canvas.width, 0], [0, canvas.height]];
    for (i = 0; i < x.length; i += 1) {
      a = (v1[0] - x[i][0]) * (v2[1] - v1[1]) - (v2[0] - v1[0]) * (v1[1] - x[i][1]);
      b = (v2[0] - x[i][0]) * (v3[1] - v2[1]) - (v3[0] - v2[0]) * (v2[1] - x[i][1]);
      c = (v3[0] - x[i][0]) * (v1[1] - v3[1]) - (v1[0] - v3[0]) * (v3[1] - x[i][1]);
      toReturn = toReturn && ((a >= 0 && b >= 0 && c >= 0) || (a <= 0 && b <= 0 && c <= 0));
    }
    return toReturn;
  }

  document.getElementById("restart").addEventListener("click", function(){
    //back to initial triangle
    ver1 = VERTICE1;
    ver2 = VERTICE2;
    ver3 = VERTICE3;
    countCycle = PARTITIONS;
    scaleCounter = [SCALE[0], SCALE[1]];
    last = [0, 0];
    drawBlack (ver1, ver2, ver3);
    showScale(0);
  }, false);

  function showScale(elm) {
    if (elm > 0) { //scale up
      if (scaleCounter[0] < scaleCounter[1]) {
        scaleCounter[1] = scaleCounter[1] / 2;
      } else {
        scaleCounter[0] = scaleCounter[0] * 2;
      }

    } else if (elm < 0) { //scale down
      if (scaleCounter[0] > scaleCounter[1]) {
        scaleCounter[0] = scaleCounter[0] / 2;
      } else {
        scaleCounter[1] = scaleCounter[1] * 2;
      }
    }
    document.getElementById("scale").innerHTML = scaleCounter[0] + ":" + scaleCounter[1];
  }

  function convertRelativeCoords(evt, elt) {
    /*Normalise coordinates of the mouse to the relative position of the canvas*/
    var rect = elt.getBoundingClientRect();
    var posX = evt.clientX;
    var posY = evt.clientY;
    posX = Math.round((posX - rect.left) / (rect.right - rect.left) * elt.width);
    posY = Math.round((posY - rect.top) / (rect.bottom - rect.top) * elt.height);

    return [posX, posY];
  }

  canvas.addEventListener("mousedown",function(evt) { //start panning
    document.body.style.mozUserSelect = document.body.style.webkitUserSelect = document.body.style.userSelect = "none";
    var pos = convertRelativeCoords(evt, canvas);
    isDown = true;
    startCoords = [
       pos[0] - last[0], // set start coordinates
       pos[1] - last[1]
    ];
  }, false);

  canvas.addEventListener("mousemove",function(evt){ //panning
    if(!isDown) return; // don't pan if mouse is not pressed
    var pos = convertRelativeCoords(evt, canvas);
    var dx = pos[0] - startCoords[0];
    var dy = pos[1] - startCoords[1];
    drawBlack([ver1[0] + dx, ver1[1] + dy],
      [ver2[0] + dx, ver2[1] + dy],
      [ver3[0] + dx, ver3[1] + dy]);
  }, false);

  canvas.addEventListener("mouseup",function(evt){ //stop panning
    isDown = false;
    var pos = convertRelativeCoords(evt, canvas);
    last = [
      pos[0] - startCoords[0], // set last coordinates
      pos[1] - startCoords[1]
    ];
  }, false);

  // detect available wheel event
  var wheelSupport = "onwheel" in document.createElement("div") ? "wheel" : // Modern FF support "wheel" 
        document.onmousewheel !== undefined ? "mousewheel" : // Webkit and IE
        "DOMMouseScroll"; // older Firefox

  function addWheelListener(elem, eventName, callback, useCapture) {
    /*Wrap wheel events to be compatible with the most of browsers*/
    // Modern browsers have 'wheel' event support
    if (wheelSupport == "wheel") {
      elem.addEventListener(eventName, callback, useCapture || false);
    }
    else {
      // Convert legacy events to something that looks like 'wheel' event
      var modListener = function(originalEvent) {
        if (!originalEvent) {
          originalEvent = window.event;
        }
        // create a normalized event object
        var event = {
          // keep a ref to the original event object
          originalEvent: originalEvent,
          target: originalEvent.target || originalEvent.srcElement,
          type: "wheel",
          deltaMode: originalEvent.type == "MozMousePixelScroll" ? 0 : 1,
          deltaX: 0,
          deltaY: 0,
          deltaZ: 0,
          clientX: originalEvent.clientX,
          clientY: originalEvent.clientY,
          preventDefault: function() {
           originalEvent.preventDefault ?
             originalEvent.preventDefault() :
             originalEvent.returnValue = false;
          }
        };

        // calculate deltaY (and deltaX) according to the event
        if (wheelSupport == "mousewheel") {
          event.deltaY = -1/40 * originalEvent.wheelDelta;
          // Webkit also support wheelDeltaX
          if (originalEvent.wheelDeltaX) {
           event.deltaX = - 1/40 * originalEvent.wheelDeltaX;
          }
        }
        else {
          event.deltaY = originalEvent.detail;
        }
        // it's time to fire the callback
        return callback(event);
      };
      elem.addEventListener(eventName, modListener, useCapture || false);
    }
  }

  var handleScroll = function(evt) {
    evt.preventDefault();
    var delta = -evt.deltaY;
    var pos = convertRelativeCoords(evt, canvas);
    // shift towards the previous center
    pos[0] -= last[0];
    pos[1] -= last[1];

    if (delta > 0) { //scale up
      ver1 = scrollPoint(ver1[0], pos[0], ver1[1], pos[1], true);
      ver2 = scrollPoint(ver2[0], pos[0], ver2[1], pos[1], true);
      ver3 = scrollPoint(ver3[0], pos[0], ver3[1], pos[1], true);
      countCycle += 1;
      showScale(delta);
    } else { //scale down
      if (ver2[0]-ver1[0] > 2) { //scace only triangle with side more than 2
        ver1 = scrollPoint(ver1[0], pos[0], ver1[1], pos[1], false);
        ver2 = scrollPoint(ver2[0], pos[0], ver2[1], pos[1], false);
        ver3 = scrollPoint(ver3[0], pos[0], ver3[1], pos[1], false);
        countCycle -= 1;
        showScale(delta);
      }
    }
    // Reset shift center
    last[0] = 0;
    last[1] = 0;
    //console.log('x: %d, y: %d -> last: %d:%d', pos[0], pos[1], last[0], last[1]);
    drawBlack(ver1, ver2, ver3);
  }

  addWheelListener(canvas, wheelSupport, handleScroll, false); //for cross-browser support
  if (wheelSupport == "DOMMouseScroll" ) {
    // Old firefox
    addWheelListener(canvas, "MozMousePixelScroll", handleScroll, false);
  }

  document.getElementById("plus").addEventListener("click", function(){
    //scroll Up with plus btn
    var pos = [canvas.width / 2 - last[0], canvas.height / 2 - last[1] ];
    ver1 = scrollPoint(ver1[0], pos[0], ver1[1], pos[1], true);
    ver2 = scrollPoint(ver2[0], pos[0], ver2[1], pos[1], true);
    ver3 = scrollPoint(ver3[0], pos[0], ver3[1], pos[1], true);
    countCycle += 1;
    last[0] = 0;
    last[1] = 0;
    showScale(1);
    drawBlack(ver1, ver2, ver3);
  }, false);

  document.getElementById("minus").addEventListener("click", function(){
    //scroll Down with minus btn
    if (ver2[0]-ver1[0] > 2) { //scace only triangle with side more than 2
      var pos = [canvas.width / 2 - last[0], canvas.height / 2 - last[1] ];
      ver1 = scrollPoint(ver1[0], pos[0], ver1[1], pos[1], false);
      ver2 = scrollPoint(ver2[0], pos[0], ver2[1], pos[1], false);
      ver3 = scrollPoint(ver3[0], pos[0], ver3[1], pos[1], false);
      countCycle -= 1;
      last[0] = 0;
      last[1] = 0;
      showScale(-1);
    }
    drawBlack(ver1, ver2, ver3);
  }, false);

  // Draw the initial triangle
  drawBlack (ver1, ver2, ver3);
  showScale(0);
} //window.onload function end

// Show popup
function popUp() {
  document.getElementById("myPopup").classList.toggle("show");
}
