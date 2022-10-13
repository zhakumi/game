import GameModel from "../Model/GameModel";
import Toast from '../Utils/Toast';

import { upGameintegral } from '../Utils/RequestUtils';

cc.Class({
  extends: cc.Component,
  properties: {
    grid: {
      default: null,
      type: cc.Node
    },
    audioButton: {
      default: null,
      type: cc.Node
    },
    audioSource: {
      type: cc.AudioSource
    },
    total: {
      type: cc.Label,
      default: null
    },
    gameOver: {
      type: cc.Node,
      default: null
    },
    audioShow: {
      type: cc.Label,
      default: null
    }
  },
  // use this for initialization
  onLoad: function () {
    console.log("game init")
    this.gameOver.active = false;
    let audioButton = this.node.parent.getChildByName('audioButton')
    audioButton.on('click', this.callback, this)
    this.gameModel = new GameModel();
    this.gameModel.init(5);
    var gridScript = this.grid.getComponent("GridView");
    gridScript.setController(this);
    gridScript.initWithCellModels(this.gameModel.getCells());
    this.audioSource = cc.find('Canvas/GameScene')._components[1].audio;
  },

  //设置显示积分
  setTotal: function (total) {
    ++total;
    this.gameModel.total += total;
    this.total.string = this.gameModel.total;
  },

  endGame() {
    this.gameOver.active = true;
    if (this.audioSource._state === 1) {
      this.audioSource.pause();//关闭音乐
    }
    login.upintegral(this.gameModel.total);

    this.scheduleOnce(function () {
      cc.director.preloadScene("Login", function () {
        this.gameOver.active = false;
        cc.director.loadScene("Login");
      }.bind(this));
    }.bind(this), 1.5);
  },

  callback: function () {
    let state = this.audioSource._state;
    state === 1 ? this.audioSource.pause() : this.audioSource.play()
    Toast(state === 1 ? '音乐-关' : '音乐-开');
    this.audioShow.string = state === 1 ? '音乐-开' : '音乐-关';
  },


  selectCell: function (pos) {
    return this.gameModel.selectCell(pos);
  },
  cleanCmd: function () {
    this.gameModel.cleanCmd();
  }
});
