var fieldSize = 6;
var tileTypes = ["red", "green", "blue", "grey", "yellow"];
var tileSize = 50;
var tileArray = [];
var globezLayer;

var gameLayer;


var game = cc.Layer.extend({
  init: function(){
    this._super();

    cc.spriteFrameCache.addSpriteFrames("res/globes.plist", "res/globes.png");

    var backgroundLayer = new cc.LayerGradient(cc.color(0x00,0x22,0x22,255), cc.color(0x22,0x00,0x44,255));

    this.addChild(backgroundLayer);

    globezLayer = new cc.Layer();

    this.addChild(globezLayer);

    this.createLevel1();
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
    console.log(spriteFrame);
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

