import Toast from '../Utils/Toast';
import { userInfo, gameRanking, addGametimes, updateGametimes, wxAuthCode, wxAuth, upGameintegral } from '../Utils/RequestUtils';

cc.Class({
  extends: cc.Component,

  properties: {
    loginButton: {
      type: cc.Button,
      default: null,
    },
    shartButton: {
      type: cc.Button,
      default: null,
    },
    worldSceneBGM: {
      type: cc.AudioClip,
      default: null,
    },
    wxName: {
      type: cc.Label,
      default: null
    },
    powerShow: {
      type: cc.Label,
      default: null
    },
    nodePh: {
      type: cc.Node,
      default: null
    },
    nodePhValue: {
      type: cc.Prefab,
      default: null
    },
    phButton: {
      type: cc.Button,
      default: null
    },
    
  },

  onLoad() {
    console.log("onLoad")
    this.wxAuthCode = 0;
    this.uid = 2;
    this.power = 0
    wxAuthCode().then(res => {
      this.wxAuthCode = res.code
      this.wxLogin(this.wxAuthCode)
    })
    this.gameSceneBGMAudioId = cc.audioEngine.play(this.worldSceneBGM, true, 1);
    this.nodePh.active = false
    this.powerShow.active = false;
    this.nodePhValue.active = false;
    window.login = this;
  },

  // 分享
  onShare: function () {
    if (cc.sys.platform === cc.sys.WECHAT_GAME) {
      wx.shareAppMessage({
        title: "大家都来参半消消乐",
        imageUrl: "https://image.baidu.com/search/detail?ct=503316480&z=undefined&tn=baiduimagedetail&ipn=d&word=%E5%A4%A7%E7%99%BD%E7%89%99%E7%89%99%E9%BD%BF%E5%9B%BE%E7%89%87&step_word=&ie=utf-8&in=&cl=2&lm=-1&st=undefined&hd=undefined&latest=undefined&copyright=undefined&cs=668063612,1847095016&os=1872563657,3207724429&simid=3044484461,3709176146&pn=133&rn=1&di=7117150749552803841&ln=1504&fr=&fmq=1663514332010_R&fm=&ic=undefined&s=undefined&se=&sme=&tab=0&width=undefined&height=undefined&face=undefined&is=0,0&istype=0&ist=&jit=&bdtype=0&spn=0&pi=0&gsm=5a&objurl=https%3A%2F%2Fgimg2.baidu.com%2Fimage_search%2Fsrc%3Dhttp%253A%252F%252Fdpic.tiankong.com%252Fvd%252F51%252FQJ8155259097.jpg%253Fx-oss-process%253Dstyle%252Fshows%26refer%3Dhttp%253A%252F%252Fdpic.tiankong.com%26app%3D2002%26size%3Df9999%2C10000%26q%3Da80%26n%3D0%26g%3D0n%26fmt%3Dauto%3Fsec%3D1666106333%26t%3D53a13e49311b40089a6f7d40fb6bdfb3&rpstart=0&rpnum=0&adpicid=0&nojc=undefined&dyTabStr=MCwzLDIsMSw2LDQsNSw3LDgsOQ%3D%3D",
        success(res) {
          console.log("share success")
        },
        fail(res) {
          console.log("share error", res)
        }
      });
      addGametimes(this.uid).then(res => {
        this.getPower();
      })
    }
  },

  wxLogin: function (code) {
    if (cc.sys.platform === cc.sys.WECHAT_GAME) {
      wx.getSetting({
        success: (res) => {
          if (!res.authSetting['scope.userInfo']) {
            this.showAuth(code)
          } else {
            this.getUser(code);
          }
        }
      });
    }
  },

  //获取用户点数
  getPower: function () {
    userInfo(this.uid).then(res => {
      console.log("cb user", res.data.data)
      this.power = 0;
      if (res.data.data != undefined) {
        this.power = res.data.data[0].game_life;
      }
      this.powerShow.string = this.uid + "剩余次数：" + this.power + "次";
    });
  },

  //获取微信用户信息，并登陆
  getUser: function (code) {
    let self = this;
    wx.getUserInfo({
      success: function (res) {
        console.log("wx user", res)
        wxAuth(code, res.iv, res.encryptedData).then(res => {
          let user=res.data.data.userInfo;
          console.log(user)
          self.uid = user.uid;
          self.power = 0;
          if (res.data.data != undefined) {
            self.power = user.game_life;
          }
          self.powerShow.string = self.uid + "剩余次数：" + self.power + "次";
        })
      }
    })
  },

  showAuth: function (code) {
    var button = wx.createUserInfoButton({
      type: "text",
      text: " ",
      style: {
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        width: "1334",
        height: "720",
        lineHeight: 50,
        backgroundColor: "#f00",
        color: "#ffffff",
        textAlign: "center",
        fontSize: 16,
        borderRadius: 4
      }
    });
    button.show();
    //按钮点击事件
    button.onTap(res => {
      if (res.userInfo) {
        console.log("showAuth", res)
        button.hide();
        button.destroy();
        this.getUser(code);
      }
    });
  },

  wxAuth: function () {
    wx.login({
      success(res) {
        if (res.code) {
          this.wxAuthCode = res.code;
        } else {
          console.log("wx登录失败" + res.errMsg);
        }
      }
    });
  },

  begin: function () {
    this.initGame()
  },

  // 增加游戏积分
  upintegral: function (total) {
    upGameintegral(this.uid, total).then(res => {
    });
  },


  initGame: function () {
    if (this.power <= 0) {
      Toast('剩余次数不够');
      return
    }
    //扣减游戏次数
    updateGametimes(this.uid).then(res => {
      this.powerShow.node.active = false;
      this.phButton.active = false;
      this.loginButton.node.active = false;
      this.shartButton.node.active = false;
      cc.director.preloadScene("Game", function () {
        this.loginButton.node.active = false;
        this.shartButton.node.active = false;
        cc.director.loadScene("Game");
      }.bind(this));
    })
  },

  showPh: function () {
    this.nodePh.active = true
    this.setPhOver()
  },
  //关闭排行
  closePh: function () {
    this.nodePh.active = false
  },

  // 设置排行数据
  setPhOver: function () {
    var height = -80;
    this.arr_infor = [];
    gameRanking().then(res => {
      this.arr_infor = res.data.data;
      //重新排序 小到大
      this.compare(this.arr_infor);
      var nodePh = this.node.getChildByName('nodePH');
      for (let i = 0; i < this.arr_infor.length; i++) {
        var node_block = cc.instantiate(this.nodePhValue);//实例化 
        node_block.parent = nodePh; //添加到nodePh
        node_block.getChildByName('label_id').getComponent(cc.Label).string = i + 1;
        node_block.getChildByName('label_name').getComponent(cc.Label).string = this.arr_infor[i].nickname;
        node_block.getChildByName('label_score').getComponent(cc.Label).string = this.arr_infor[i].game_integral;
        var old_block = node_block.getPosition();
        old_block.y = 200 + i * height;
        node_block.setPosition(old_block);//设置位置
      }
    });
  },


  compare: function (property) {
    return function (a, b) {
      var value1 = a[property];
      var value2 = b[property];
      return value1 - value2;
    }
  },

  onDestroy: function () {
    cc.audioEngine.stop(this.gameSceneBGMAudioId);
  },
});
