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

var arrowsLayer;

var game = cc.Layer.extend({
  init: function(){
    this._super();

    cc.spriteFrameCache.addSpriteFrames("res/globes.plist", "res/globes.png");

    var backgroundLayer = new cc.LayerGradient(cc.color(0x00,0x22,0x22,255), cc.color(0x22,0x00,0x44,255));

    this.addChild(backgroundLayer);

    globezLayer = new cc.Layer();

    this.addChild(globezLayer);

    arrowsLayer = new cc.DrawNode();
    this.addChild(arrowsLayer);

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
    arrowsLayer.clear();

    startColor = null;

    for(var i = 0; i < visitedTiles.length; i++){
      var tile = visitedTiles[i];

      if(visitedTiles.length < 3) {
        tileArray[tile.row][tile.col].setOpacity(255);
        tileArray[tile.row][tile.col].picked = false;
      } else {
        globezLayer.removeChild(tileArray[tile.row][tile.col]);
        tileArray[tile.row][tile.col] = null;
      }

    }

    if(visitedTiles.length >= 3){
      for(var i = 1; i < fieldSize; i++){
        for(var j = 0; j < fieldSize; j++){
          if(tileArray[i][j] != null){
            var holesBelow = 0;

            for(var k = i - 1; k >= 0; k --){
              if(tileArray[k][j] == null){
                holesBelow++;
              }
            }

            if(holesBelow > 0){
              var moveAction = cc.moveTo(0.5, new cc.Point(tileArray[i][j].x,tileArray[i][j].y - holesBelow * tileSize));
              tileArray[i][j].runAction(moveAction);
              tileArray[i - holesBelow][j] = tileArray[i][j];
              tileArray[i][j] = null;
            }
          }
        }
      }

      var i, j; // i - column, j - row
      for(i = 0; i < fieldSize; i++){
        for(j = fieldSize-1; j >= 0; j--){
          if(tileArray[j][i] != null){
            break;
          }
        }

        var missingGlobes = fieldSize - 1- j;

        if(missingGlobes > 0){
          for(j = 0; j < missingGlobes; j++){
            this.fallTile(fieldSize - j - 1, i, missingGlobes - j);
          }
        }
      }
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
        } else {
          if(visitedTiles.length >= 2 && currentRow == visitedTiles[visitedTiles.length - 2].row && currentCol == visitedTiles[visitedTiles.length - 2].col){
            tileArray[visitedTiles[visitedTiles.length - 1].row][visitedTiles[visitedTiles.length - 1].col].setOpacity(255);
            tileArray[visitedTiles[visitedTiles.length - 1].row][visitedTiles[visitedTiles.length - 1].col].picked = false;

            visitedTiles.pop();
          }
        }

        this.drawPath();
      }
    }
  },

  fallTile: function(row, col, height){
    var randomTile = Math.floor(Math.random()*tileTypes.length);
    var spriteFrame = cc.spriteFrameCache.getSpriteFrame(tileTypes[randomTile]);

    var sprite = new cc.Sprite(spriteFrame);
    sprite.val = randomTile;
    sprite.picked = false;
    globezLayer.addChild(sprite, 0);

    sprite.setPosition(col*tileSize+tileSize/2,(fieldSize+height)*tileSize);
    var moveAction = cc.moveTo(0.5, new cc.Point(col*tileSize+tileSize/2,row*tileSize+tileSize/2));
    sprite.runAction(moveAction);
    tileArray[row][col] = sprite;
  },

  drawPath: function(){
    arrowsLayer.clear();
    if(visitedTiles.length>0){
      for(var i=1;i<visitedTiles.length;i++){
        arrowsLayer.drawSegment(
          new cc.Point(visitedTiles[i-1].col*tileSize+tileSize/2,visitedTiles[i-1].row*tileSize+tileSize/2),
          new cc.Point(visitedTiles[i].col*tileSize+tileSize/2,visitedTiles[i].row*tileSize+tileSize/2), 4,
          cc.color(255, 255, 255, 255)
        );
      }
    }
  }
});

