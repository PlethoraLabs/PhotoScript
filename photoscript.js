(function(root){

  'use strict';

  var VERSION = '0.1.0';

  if ( root.PhotoScript ) return;

  var css    = '.photoscript { visibility: hidden; }';
  var head   = document.head || document.getElementsByTagName('head')[0];
  var style  = document.createElement('style');
  style.type = 'text/css';

  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }

  head.appendChild(style);

  var PhotoScript = function(image){
    if (!image) {
      this.image = null;
      return this;
    }
    this.image         = image;
    this.image.insertAdjacentHTML('afterend', '<canvas></canvas>');
    this.canvas        = this.image.nextElementSibling;
    this.ctx           = this.canvas.getContext('2d');
    this.canvas.width  = this.image.width;
    this.canvas.height = this.image.height;
    this.ctx.drawImage(this.image, 0, 0, this.canvas.width, this.canvas.height);
    this.imageDataObject = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    this.imageData = this.imageDataObject.data;
  }

  PhotoScript.prototype.show = function(options){

    console.log('PhotoScript::show()');
    if ( !this.image ) return this;
    this.ctx.putImageData( this.imageDataObject, 0, 0 );
    this.image.parentNode.removeChild(this.image);
    return this;

  }

  PhotoScript.prototype.autoLevels = function(options){

    console.log('PhotoScript::autoLevels');
    if ( !this.image ) return this;
    var pixelNum = this.imageData.length;

    // INITIALIZE BRIGHTNESS FOR LEVELS
    var redMax   = 0; 
    var redMin   = 255;
    var greenMax = 0; 
    var greenMin = 255;
    var blueMax  = 0; 
    var blueMin  = 255;

    for ( var i = 0; i < pixelNum; i += 4 ){
      //SET MIN AND MAX VALUES FOR EACH COLOR
      if (this.imageData[i] > redMax) { redMax = this.imageData[i] };
      if (this.imageData[i] < redMin) { redMin = this.imageData[i] };
      if (this.imageData[i+1] > greenMax) { greenMax = this.imageData[i+1] };
      if (this.imageData[i+1] < greenMin) { greenMin = this.imageData[i+1] };
      if (this.imageData[i+2] > blueMax) { blueMax = this.imageData[i+2] };
      if (this.imageData[i+2] < blueMin) { blueMin = this.imageData[i+2] };
    }

    for( var i = 0; i < pixelNum; i += 4 ){
      // MAP COLORS TO 0 - 255 RANGE
      this.imageData[i]   = (this.imageData[i] - redMin) * (255 / (redMax - redMin));
      this.imageData[i+1] = (this.imageData[i+1] - greenMin) * (255 / (greenMax - greenMin));
      this.imageData[i+2] = (this.imageData[i+2] - blueMin) * (255 / (blueMax - blueMin));
    }

    return this;
  }

  PhotoScript.prototype.sharpen = function(options){

    console.log('PhotoScript::sharpen()');
    if ( !this.image ) return this;
    options = options || {};
    var ctx = document.createElement('canvas').getContext('2d');
    var dstData = ctx.createImageData(this.imageDataObject.width, this.imageDataObject.height); // create blank ImageData
    var dstBuff = dstData.data;

      var mix     = options.factor || 0.25;
      var weights = [0, -1, 0, -1, 5, -1, 0, -1, 0];
      var katet   = Math.round(Math.sqrt(weights.length));
      var half    = (katet * 0.5) | 0;
      var x, y    = this.imageDataObject.height;

      while (y--) {
        x = this.imageDataObject.width;
        while (x--) {
          var sy = y, sx = x, dstOff = (y * this.imageDataObject.width + x) * 4;
          var r, g, b, a;
          r = g = b = a = 0;
          for (var cy = 0; cy < katet; cy++) {
              for (var cx = 0; cx < katet; cx++) {
                  var scy = sy + cy - half;
                  var scx = sx + cx - half;
                  if (scy >= 0 && scy < this.imageDataObject.height && scx >= 0 && scx < this.imageDataObject.width) {
                      var srcOff = (scy * this.imageDataObject.width + scx) * 4;
                      var wt = weights[cy * katet + cx];
                      r += this.imageData[srcOff] * wt;
                      g += this.imageData[srcOff + 1] * wt;
                      b += this.imageData[srcOff + 2] * wt;
                      a += this.imageData[srcOff + 3] * wt;
                  }
              }
          }
          dstBuff[dstOff]     = r * mix + this.imageData[dstOff] * (1 - mix);
          dstBuff[dstOff + 1] = g * mix + this.imageData[dstOff + 1] * (1 - mix);
          dstBuff[dstOff + 2] = b * mix + this.imageData[dstOff + 2] * (1 - mix)
          dstBuff[dstOff + 3] = this.imageData[dstOff + 3];

        }
      }
    this.imageDataObject = dstData;
    return this;
  
  } 

  PhotoScript.prototype.render = function(){

    Array.prototype.slice.apply(this.image.classList).map(function(cls){

      if ( cls === 'auto-levels' ) this.autoLevels();

      var sharpen = cls.match(/sharpen(:?-(\d{1,3}))?/);
      if ( sharpen ) { 
        var factor = (sharpen[2])? parseInt(sharpen[2],10)/100 : null;  
        this.sharpen({ factor: factor });
      }


    }.bind(this));

    return this.show();

  }

  /* ALIASES */
  PhotoScript.prototype.display = PhotoScript.prototype.show;

  root.PhotoScript = PhotoScript;

}(this));