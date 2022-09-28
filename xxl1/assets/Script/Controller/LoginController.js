import AudioUtils from "../Utils/AudioUtils";
import Toast from '../Utils/Toast';

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

  },

  onLoad() {
    this.wxLogin()
    this.gameSceneBGMAudioId = cc.audioEngine.play(this.worldSceneBGM, true, 1);
    this.power = 3
    this.powerShow.string = "剩余次数:" + this.power;
    this.nodePh.active = false
    // 加载排行
    this.setInfor()
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
    }
  },

  wxLogin: function () {
    // if (cc.sys.platform === cc.sys.WECHAT_GAME) {
    //    wx.getSetting({
    //   		success: (res) => {
    //   			console.log(res)
    //   			//是否授权
    //   			if (!res.authSetting['scope.userInfo']) {
    //            var button = wx.createUserInfoButton({
    //   					type: "text",
    //   					text: " ",
    //   					style: {
    //   						left: 0,
    //   						top: 0,
    //   						right: 0,
    //   						bottom: 0,
    //   						width: "1334",
    //   						height: "720",
    //   						lineHeight: 50,
    //   						backgroundColor: "#f00",
    //   						color: "#ffffff",
    //   						textAlign: "center",
    //   						fontSize: 16,
    //   						borderRadius: 4
    //   					}
    //   				});
    //   				button.show();
    //   				//按钮点击事件
    //   				button.onTap((res)=> {
    //   					if (res.userInfo) {
    //   						console.log(res.userInfo)
    //   						button.hide();
    //   						button.destroy();
    //   						this.initGame()
    //   					}
    //   				});
    //   			}else{
    //   			  this.initGame()
    //   			}
    //   		}
    //   		});
    // } else {
    //   this.initGame()
    // }
    if (cc.sys.platform === cc.sys.WECHAT_GAME) {
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
      button.onTap((res) => {
        if (res.userInfo) {
          // this.wxName.string = res.userInfo.nickName;
          // this.wxURL.string = res.userInfo.avatarUrl
          button.hide();
          button.destroy();
        }
      });
    }
  },

  onLogin: function () {
    this.initGame()
  },

  initGame: function () {
    if (this.power <= 0) {
      Toast('剩余次数不够');
      return
    }
    this.loginButton.node.active = false;
    this.shartButton.node.active = false;
    cc.director.preloadScene("Game", function () {
      this.loginButton.node.active = false;
      this.shartButton.node.active = false;
      cc.director.loadScene("Game");
    }.bind(this));
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
    var height=-45;
    //重新排序 小到大
    this.compare(this.arr_infor);
    var nodePh=this.node.getChildByName('nodePH');
    for(let i=0; i< this.arr_infor.length;  i++){
      var node_block = cc.instantiate(this.nodePhValue);//实例化 
      node_block.parent = nodePh; //添加到nodePh
      node_block.getChildByName('label_id').getComponent(cc.Label).string = i+1;
      node_block.getChildByName('label_name').getComponent(cc.Label).string = this.arr_infor[i].name;
      node_block.getChildByName('label_score').getComponent(cc.Label).string =this.arr_infor[i].score;
      var old_block=node_block.getPosition();
      old_block.y=200+i*height;
      node_block.setPosition(old_block);//设置位置
    }

  },

  setInfor: function () {
    this.arr_infor = [
      { name: '2504549300', touXiang: 0, score: 1003 },
      { name: 'cocoscreator_666', touXiang: 1, score: 1002 },
      { name: '我', touXiang: 2, score: 1001 },
      { name: '褪了色旳回憶', touXiang: 3, score: 1001},
      { name: '为爱控', touXiang: 4, score: 999 },
      { name: '等尽歌悲欢', touXiang: 5, score: 888 },
      { name: '妖媚＠', touXiang: 6, score: 777 },
      { name: '时光あ瘦了~', touXiang: 7, score: 666 },
      { name: '别格式化', touXiang: 8, score: 555 },
      { name: '同餐伴枕', touXiang: 9, score: 333 },
    ];
  },

  compare:function(property){
    return function(a,b){
        var value1 = a[property];
        var value2 = b[property];
        return value1 - value2;
    }
},

  onDestroy: function () {
    cc.audioEngine.stop(this.gameSceneBGMAudioId);
  }

});
