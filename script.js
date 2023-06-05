let FPS = 60;
let _width = 400;
let _height = 400;
let particleNum = 5000;

let CLOCK_VIEW = 0, TEXT_VIEW = 1;
let nowDisp = CLOCK_VIEW;
let particles = [];
let ct = document.createElement('canvas');
let ctx = ct.getContext('2d');
ctx.fillStyle = '#fff';

let canvas = document.getElementById("canvas");
let info = document.getElementById("info");

ct.width  = canvas.width  = _width;
ct.height = canvas.height = _height;
canvas.onclick = mouseClick;

let cc = canvas.getContext("2d");
cc.fillStyle = 'rgba(255,255,255,0.01)';
cc.fillRect(0, 0, _width, _height);
bit = cc.getImageData(0, 0, _width, _height);
data = bit.data;
cc.clearRect(0, 0, _width, _height);
cc.fillStyle = "rgb(255, 255, 255)";

let updateState = false;
let textData;
let prev_time;
let textWidth;
let textHeight;
let setX, setY;

function setPixel(x, y){
  let idx = ((x|0) + (y|0) * _width)*4;
  data[idx+3] = 255;
}
function delPixel(x, y){
  let idx = ((x|0) + (y|0) * _width)*4;
  data[idx+3] = 0;
}
function faidout(){
  for (let i = 3, l = data.length;i < l;i+=4){
    let a = data[i];
    if (a !== 0){
      if (a < 36) {
        data[i] = 0;
      } else if (a < 66) {
        data[i] *= 0.96;
      } else {
        data[i] *= 0.7;
      }
    }
  }
}

let num = particleNum;
while(num){
  num--;
  particles[num] = new particle();
}
let last = Date.now(), count = 0;
setInterval(process, 1000/FPS);

function process() {
  let dispType = ['時計', 'テキスト'];
  ctx.clearRect(0, 0, _width, _height);
  let time = timeDraw();
  if (prev_time !== time){
    updateState = true;
  }
  prev_time = time;
  if(updateState){
  if (nowDisp === CLOCK_VIEW) {
      let textSize = 60;
      let text = time;
      textWidth = textSize*4.5;
      textHeight = textSize;
      setX = _width/2 - textSize*2.25;
      setY = _height/2 - textSize/2;

      ctx.font = textSize+"px sans-serif";
      ctx.textBaseline = "top";
      ctx.fillStyle = '#fff';
      ctx.fillText(text, setX, setY);
    } else if(nowDisp === TEXT_VIEW) {
    // テキスト
      textSize = 60;
      text = 'テキスト';
      textWidth = textSize * text.length;
      textHeight = textSize;
      setX = _width/2 - textSize * text.length/2 + 15;
      setY = _height/2 - textSize/2;

      ctx.font = textSize+"px sans-serif";
      ctx.textBaseline = "top";
      ctx.fillStyle = '#fff';
      ctx.fillText(text, setX, setY);
  }
  updateState = false;

    textData = ctx.getImageData(setX, setY, textWidth, textHeight).data;
  }
  let m, _i = 0;
  for (let x = 0; x < textWidth;x++) {
    for(let y = 0; y < textHeight; y++) {
      let idx  = (x+y*textWidth)*4;
      if(textData[idx] > 100) {
        _i++;
        m = particles[_i];
        
        let X = x + setX - m.px;
        let Y = y + setY - m.py;
        let T = Math.sqrt(X*X + Y*Y);
        
        let A = Math.atan2(Y, X);
        let C = Math.cos(A);
        let S = Math.sin(A);

       
        m.x = m.px + C*T*0.15;
        m.y = m.py + S*T*0.15;
        setPixel(m.x+Math.random()*3-1.5, m.y+Math.random()*3-1.5);
        drawDotLine(m.x, m.y, m.px, m.py);
        m.ran += 0.0007;
        m.timeFlg = true;
        
        m.px = m.x;
        m.py = m.y;
      }
    }
  }
  
  for(let i = _i+1, L = particles.length;i < L;i++) {
    m = particles[i];
    m.ran += 0.0007;

    if(m.timeFlg) {
      
      X = (_width/2 + Math.cos(m.ran*180/Math.PI) * m.range) - m.px;
      Y = (_height/2 + Math.sin(m.ran*180/Math.PI) * m.range) - m.py;

      T = Math.sqrt(X*X + Y*Y);
      
      A = Math.atan2(Y, X);
      C = Math.cos(A);
      S = Math.sin(A);

      
      m.x = m.px + C*T*0.15;
      m.y = m.py + S*T*0.15;
      if(m.x < 1 && m.y < 1) m.timeFlg = false;

    } else {
      
      m.x = _width /2 + Math.cos(m.ran*180/Math.PI) * m.range;
      m.y = _height/2 + Math.sin(m.ran*180/Math.PI) * m.range;
    }

  
    drawDotLine(m.x, m.y, m.px, m.py);

    m.px = m.x;
    m.py = m.y;
  }
  cc.putImageData(bit, 0, 0);
  faidout();
  count++;
  if (count === FPS){
    let now = Date.now();
    let _f = 1000 / ((now - last) / count);
    count = 0;
    info.innerHTML = 'FPS '+_f.toFixed(2) +'<br>表示タイプ : ' + dispType[nowDisp];
    last = Date.now();
  }
}


function particle() {
  let ran = Math.random()*360*180/Math.PI;
  let range = _width/2.2 - Math.random()*16;

  this.x = 0;
  this.y = 0;
  this.px = _width/2 + (Math.cos(ran) * range);
  this.py = _height/2 + (Math.sin(ran) * range);
  this.range = range;
  this.ran = ran;
}


function timeDraw() {
  let date = new Date();
  let H = (date.getHours() > 9)? date.getHours() : '0'+date.getHours();
  let M = (date.getMinutes() > 9)? date.getMinutes() : '0'+date.getMinutes();
  let S = (date.getSeconds() > 9)? date.getSeconds() : '0'+date.getSeconds();
  let timeTxt = H+':'+M+':'+S;

  return timeTxt;
}


function mouseClick() {
  if (nowDisp === CLOCK_VIEW){
    nowDisp = TEXT_VIEW;
  } else {
    nowDisp = CLOCK_VIEW;
  }
  updateState = true;
  return false;
}


function drawDotLine(x, y, px, py) {
  let _x = (x > px ? 1 : -1) * (x - px);
  let _y = (y > py ? 1 : -1) * (y - py);
  let sx = (x > px) ? -1 : 1;
  let sy = (y > py) ? -1 : 1;
  let r, i;
  if (_x < 3 && _y < 3) return;
  let l,s;
  if(_x < _y){
    l = _y;
    s = _x;
    r = s/l;
    for (i = 0;i < l;i++){
      setPixel(x + sx*i*r, y+sy*i);
    }
  } else {
    l = _x;
    s = _y;
    r = s/l;
    for (i = 0;i < l;i++){
      setPixel(x + sx*i, y+sy*i*r);
    }
  }
}