var isImageLoaded = false
var image;
var palette;
var color;
var currentSize = 1;

document.getElementById('input').onchange = function(e) {
  isImageLoaded = false
  
  var img = new Image()
  img.src = URL.createObjectURL(this.files[0])
  
  img.onload = () => {
    isImageLoaded = true
    image = img
    
    drawOriginal();
  }
  
  img.onerror = () => {
    alert("The provided file couldn't be loaded as an Image media")
  }
};

document.getElementById('palette').onchange = function(e) {
  var img = new Image()
  img.src = URL.createObjectURL(this.files[0])
  
  img.onload = () => {
    palette = img;
    drawPalette();
  }
  
  img.onerror = () => {
    alert("The provided file couldn't be loaded as an Image media")
  }
}

document.getElementById('convert').onclick = function(e) {
  if (!isImageLoaded) return alert("Provide image first!")
  this.disabled = true;
  draw()
  this.disabled = false;
}

document.getElementById('download').onclick = function(e) {
  var canvas = document.getElementById('canvas');
  var img    = canvas.toDataURL("image/png");
  document.write('<img src="'+img+'"/>');
}

document.getElementById('toggle').onclick = function() {
  var can = document.getElementById('canvas')
  if (can.style.opacity == 1) {
    document.getElementById('canvas').style.opacity = 0
    this.innerHTML = "Hide Original"
  } else if (can.style.opacity == 0) {
    document.getElementById('canvas').style.opacity = 1
    this.innerHTML = "Show Original"
  } else {
    document.getElementById('canvas').style.opacity = 0
    this.innerHTML = "Hide Original"
  }
}

function draw() {
  
  drawPalette()
  
  var dithserp = document.getElementById('dithserp').value;
  var dithserp_bool; 
  if (dithserp == "false") dithserp_bool = false;
  else dithserp_bool = true;
  
  var dithkern = document.getElementById('dithkern').value;
  var dithkern_out;
  if (dithkern == "null") dithkern_out = null;
  else dithkern_out = dithkern;
  
  var q = new RgbQuant({
    colors: document.getElementById('colors').value,
    minHueCols: document.getElementById('minHueCols').value,
    dithKern: dithkern_out,
    dithSerp: dithserp_bool,
    palette: color,
  });
  
  q.sample(image)
  var out = q.reduce(image)
  
  var canvas = document.getElementById('canvas')
  canvas.width = image.width
  canvas.height = image.height
  
  var iData = new ImageData(new Uint8ClampedArray(out.buffer), image.width, image.height)
  var ctx = canvas.getContext("2d");
  setpixelated(ctx);
  ctx.putImageData(iData, 0, 0);
  resizeTo(canvas, currentSize)
  
  drawOriginal();
}


function drawOriginal() {
  var original = document.getElementById('original')
  original.width = image.width
  original.height = image.height
  var ctx2 = original.getContext("2d");
  setpixelated(ctx2)
  ctx2.drawImage(image, 0, 0)
  resizeTo(original, currentSize)
}

function drawPalette() {
  if (!palette) return;
  const colorThief = new ColorThief();
  var num = +document.getElementById('numpalette').value
  color = colorThief.getPalette(palette, num, 1);
  
  var list = document.getElementById('palette-list')
  list.innerHTML = `<span>pallete size</span> (${color.length})<br>`;
  color.map(function(x) {
    list.innerHTML += `<div class="pal" style="background-color: rgb(${x[0]}, ${x[1]}, ${x[2]})"></div>`;
  })
  
}

function resetPalette() {
  document.getElementById('palette').value = '';
  color = null;
  palette = null;
  document.getElementById('palette-list').innerHTML = '';
}

function showAlert(msg) {
    alert(msg);
}

function setpixelated(context){
  context['imageSmoothingEnabled'] = false;       /* standard */
  context['mozImageSmoothingEnabled'] = false;    /* Firefox */
  context['oImageSmoothingEnabled'] = false;      /* Opera */
  context['webkitImageSmoothingEnabled'] = false; /* Safari */
  context['msImageSmoothingEnabled'] = false;     /* IE */
}

function setSize(pct){
  currentSize = pct;
}


var tempCanvas=document.createElement("canvas");
var tctx=tempCanvas.getContext("2d");

function resizeTo(canvas,pct){
  var cw=canvas.width;
  var ch=canvas.height;
  tempCanvas.width=cw;
  tempCanvas.height=ch;
  tctx.drawImage(canvas,0,0);
  canvas.width*=pct;
  canvas.height*=pct;
  var ctx=canvas.getContext('2d');
  setpixelated(ctx);
  ctx.drawImage(tempCanvas,0,0,cw,ch,0,0,cw*pct,ch*pct);
}