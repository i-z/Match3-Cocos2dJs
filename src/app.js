var fieldSize = 6;
var tileTypes = ["red", "green", "blue", "grey", "yellow"];
var tileSize = 50;
var tileArray = [];
var globezLayer;

var gameLayer;

var startColor;
var visitedTiles = [];

var touchListener;

var tolerance = 400;

var game = cc.Layer.extend({
  init: function(){
    this._super();

    cc.spriteFrameCache.addSpriteFrames("res/globes.plist", "res/globes.png");

    var backgroundLayer = new cc.LayerGradient(cc.color(0x00,0x22,0x22,255), cc.color(0x22,0x00,0x44,255));

    this.addChild(backgroundLayer);

    globezLayer = new cc.Layer();

    this.addChild(globezLayer);

    this.createLevel1();

    cc.eventManager.addListener(touchListener, this);
  },

  createLevel1: function(){
    for(var i = 0; i < fieldSize; i++){
      tileArray[i] = [];

      for(var j = 0; j < fieldSize; j++){
        this.addTile(i, j);
      }
    }

  },

  addTile: function(row, col){
    var randomTile = Math.floor(Math.random()*tileTypes.length);
    var spriteFrame = cc.spriteFrameCache.getSpriteFrame(tileTypes[randomTile]);

    var sprite = new cc.Sprite(spriteFrame);
    sprite.val = randomTile;
    sprite.picked = false;
    globezLayer.addChild(sprite, 0);

    sprite.setPosition(col * tileSize + tileSize / 2, row * tileSize + tileSize / 2);

    tileArray[row][col] = sprite;
  }
});

var GameScene = cc.Scene.extend({
  onEnter:function () {
    this._super();

    gameLayer = new game();
    gameLayer.init();

    this.addChild(gameLayer);
  }
});

touchListener = cc.EventListener.create({
  event: cc.EventListener.MOUSE,
  onMouseDown: function(event){
    var pickedRow = Math.floor(event._y / tileSize);
    var pickedCol = Math.floor(event._x / tileSize);

    tileArray[pickedRow][pickedCol].setOpacity(128);
    tileArray[pickedRow][pickedCol].picked = true;

    startColor = tileArray[pickedRow][pickedCol].val;

    visitedTiles.push({row: pickedRow, col: pickedCol});
  },
  onMouseUp: function(event){
    startColor = null;

    for(var i = 0; i < visitedTiles.length; i++){
      var tile = visitedTiles[i];

      tileArray[tile.row][tile.col].setOpacity(255);
      tileArray[tile.row][tile.col].picked = false;
    }

    visitedTiles = [];
  },

  onMouseMove: function(event){
    if(startColor != null){
      var currentRow = Math.floor(event._y / tileSize);
      var currentCol = Math.floor(event._x / tileSize);

      var centerX = currentCol * tileSize + tileSize / 2;
      var centerY = currentRow * tileSize + tileSize / 2;

      var distX = event._x - centerX;
      var distY = event._y - centerY;

      if(distX * distX + distY * distY < tolerance){

        if(!tileArray[currentRow][currentCol].picked){

          if(Math.abs(currentRow - visitedTiles[visitedTiles.length - 1].row) <= 1 && Math.abs(currentCol - visitedTiles[visitedTiles.length -1].col) <= 1){

            if(tileArray[currentRow][currentCol].val == startColor){
              tileArray[currentRow][currentCol].setOpacity(128);

              tileArray[currentRow][currentCol].picked = true;

              visitedTiles.push({
                row:currentRow,
                col:currentCol
              });
            }
          }
        }
      }
    }
  }
});

