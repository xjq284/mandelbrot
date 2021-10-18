  // 在复平面上建立一个数值范围
  // 不同的范围将允许我们在分形上放大或缩小
  let xmin,ymin,xmax,ymax,w,h
  // 鼠标按下屏幕位置
  let mx,my
  // 生成图片到mb
  let mb
  //
  let reset,aspan
  // 放大倍数
  let scale=3

  function  preload() {
      
  }


  function setup() {
    createCanvas(600, 600); //width,height
    mb=createImage(600, 600);
    pixelDensity(1);
    resetRange();
    fill('rgba(0,220,0,0.5)')
    reset = createButton('重置')
    //reset.position(5,5+height)
    reset.mousePressed(resetRange)
    aspan = createSpan('0')
    //aspan.position(5+reset.width,5+height)
  }
  
  function draw(){
      background(mb);
      rect(mouseX-width/scale/2,mouseY-height/scale/2,width/scale,height/scale)
  }



  function doubleClicked(){
      mx = xmin+mouseX*w/width;
      my = ymin+mouseY*h/height;
      if (mouseButton === LEFT){
          w = w/scale
          h = h/scale  
      } else {
          w = w*scale
          h = h*scale
      }
      xmin = mx - w/2;
      xmax = mx + w/2;
      ymin = my - h/2;
      ymax = my + h/2;
      createMb();    
  }

  function mouseWheel(e) {
      scale = scale+e.delta/200;
    
  }

  function resetRange(){
    //范围
    xmin = -1.5;      //-1.5
    xmax = 1.5;       //1.5
    w = xmax-xmin     //宽度 
    h = (w * height) / width;  //高度调整
    ymin = -h/2
    ymax = h/2  
    createMb();
  }


  function hsvToRgb(arr) {
    var h = arr[0], s = arr[1], v = arr[2];
    s = s / 100;
    v = v / 100;
    var r = 0, g = 0, b = 0;
    var i = parseInt((h / 60) % 6);
    var f = h / 60 - i;
    var p = v * (1 - s);
    var q = v * (1 - f * s);
    var t = v * (1 - (1 - f) * s);
    switch (i) {
        case 0:
            r = v; g = t; b = p;
            break;
        case 1:
            r = q; g = v; b = p;
            break;
        case 2:
            r = p; g = v; b = t;
            break;
        case 3:
            r = p; g = q; b = v;
            break;
        case 4:
            r = t; g = p; b = v;
            break;
        case 5:
            r = v; g = p; b = q;
            break;
        default:
            break;
    }
    r = parseInt(r * 255.0)
    g = parseInt(g * 255.0)
    b = parseInt(b * 255.0)
    return [r, g, b];
}

function rgbToHsv(arr) {
    var h = 0, s = 0, v = 0;
    var r = arr[0], g = arr[1], b = arr[2];
    arr.sort(function (a, b) {
        return a - b;
    })
    var max = arr[2]
    var min = arr[0];
    v = max / 255;
    if (max === 0) {
        s = 0;
    } else {
        s = 1 - (min / max);
    }
    if (max === min) {
        h = 0;//事实上，max===min的时候，h无论为多少都无所谓
    } else if (max === r && g >= b) {
        h = 60 * ((g - b) / (max - min)) + 0;
    } else if (max === r && g < b) {
        h = 60 * ((g - b) / (max - min)) + 360
    } else if (max === g) {
        h = 60 * ((b - r) / (max - min)) + 120
    } else if (max === b) {
        h = 60 * ((r - g) / (max - min)) + 240
    }
    h = parseInt(h);
    s = parseInt(s * 100);
    v = parseInt(v * 100);
    return [h, s, v]
}


function createMb() {
  
    // Make sure we can write to the pixels[] array.
    // Only need to do this once since we don't do any other drawing.
    mb.loadPixels();
  
    // 复平面上每个点的最大迭代次数：缺省100
    const maxiterations = 200;
  

  
    // Calculate amount we increment x,y for each pixel
    const dx = w / width;
    const dy = h / height;
  
    
    //遍历像素
    let y = ymin;
    for (let j = 0; j < height; j++) {
      let x = xmin;
      for (let i = 0; i < width; i++) {
  
        // 测试：当迭代z = z^2 + cm时，z是否趋向于无穷大？
        let a = x;
        let b = y;
        let n = 0;
        while (n < maxiterations) {
          const aa = a * a;
          const bb = b * b;
          const twoab = 2.0 * a * b;
          a = aa - bb + x;
          b = twoab + y;
          // 在我们的有限世界中的无限性是很简单的，让我们只考虑它 16
          if (dist(aa, bb, 0, 0) > 16) {
            break; 
          }
          n++;
        }
  
     
        
        let r = sqrt(x*x+y*y);         
        let theta = Math.atan2(y,x);
          
        //（theta,r,n)=>[h,s,v]
        let h = map(theta,-PI,PI,0,360);        //色调调整，90，180，360，3600
        let s = map(r,3.8,0,20,100);            //饱和度映射
        //let v = map(n, 0, maxiterations, 100, 0); // 点集亮度调整：缺省0，100
        let v = map(n, 0, maxiterations, 30, 100); // 点集亮度调整：缺省0，100
        if (n == maxiterations) {v = 0; } //黑洞亮度调整：缺省，0

        let rgb = hsvToRgb([h,s,v]);
        
        const pix = (i+j*width)*4; //定位4元像素
        mb.pixels[pix + 0] = rgb[0];
        mb.pixels[pix + 1] = rgb[1];
        mb.pixels[pix + 2] = rgb[2];
        mb.pixels[pix + 3] = 255;
          
        
        x += dx;
      }
      y += dy;
    }
    mb.updatePixels();
  } 

