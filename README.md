# PhotoScript
An experimental image manipulation library written in JavaScript

# Usage

Use the `.photoscript` class in your image tags, along with `auto-levels` and `sharpen`.
The `sharpen` class, can also take an optional parameter: `sharpen-75`, `sharpen-50`, etc.

```javascript
document.addEventListener('DOMContentLoaded', function(){

  // FIND ALL IMAGES WITH A .photoscript CLASS AND APPLY FILTERING ACCORDING TO CLASS NAMES
  Array.prototype.slice.apply(document.querySelectorAll('img.photoscript')).forEach(function(img){

    new PhotoScript(img).render()

  });

  // SINGLE IMAGE WITHOUT .photoscript CLASS
  new PhotoScript(document.getElementById('my-awesome-image'))
  .autoLevels()
  .sharpen({ factor: 0.5 })
  .show();

  // ALTERNATE SYNTAX
  new PhotoScript(document.querySelector('img.filterme'))
  ['autoLevels']()
  ['sharpen']({ factor: 0.9 })
  ['show']();


});
```

## TODO

```
var image = new PhotoScript(document.querySelector('img.filterme'));
image.selectArea(0,0,50,100).sharpen().selectArea(50,0,100,100).invert().show();
```

# References and Sources

### [auto-color-level](https://github.com/ajfarkas/auto-color-level)

Automatic color leveling for HTML images by [AJ Farkas](http://www.afarkas.com)

 
