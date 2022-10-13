import Toast from './Toast';
import { gameRanking,wxAuth } from './RequestUtils';
import { PATH, APP_ID } from './ConstValue'
cc.Class({
    extends: cc.Component,

    properties: {
        block_show:{
            type:cc.Node,
            default:null
        },
        block_arr:{
            type:[cc.Prefab],
            default:[]
        },

        // lable组件 当前得分
        label_score:{
            type:cc.Label,
            default:null
        },
        // lable组件 当前得分剩余次数
        label_tlz:{
            type:cc.Label,
            default:null
        },
        // 碰撞特效
        pre_tx:{
            type:cc.Prefab,
            default:null
        },
        node_xian:{
            type:cc.Node,
            default:null
        },
        layerOver:{
            type:cc.Node,
            default:null
        },
        audoi_pz:{
            type:cc.AudioClip,
            default:null
        },
        audoi_bg:{
            type:cc.AudioClip,
            default:null
        },
        begain_game:{
            type:cc.Node,
            default:null
        },
        // 定义排行榜
        nodePHB:cc.Node,
        // 定义 view中的 content数据
        itemParent:cc.Node,
        // 定义排行模板
        pre_item:cc.Prefab,
    
    },



    onLoad () {
        // console.log('onLoad');
        // block.js需要使用game.js 需要将game设置为全局
        window.game = this
        

        // 1的概率最大
        this.arr_num = [1,2,3,1,2,1,3,2,1,2,4,1,1]

        this.label_tlz.string = "剩余次数： 次";
		
		this.userId = ""
		this.game_time = 0 //还剩游戏次数


        this.begain_game.active = true
        this.nodePHB.active = false
        this.nodePHB.zIndex = 10

        this.init()
        this.setTouch()
        this.playbgSound()
        cc.director.getPhysicsManager().enabled = true;
    },

    init:function(){
        this.block_show.active = false
        this.node_xian.active = false

        this.layerOver.active = false
        // 使gameover界面在最上面
        this.layerOver.zIndex = 9

    
        // 缩放
        this.f_scale = 0.8
        this.block_show.scale = this.f_scale
       
        this.score_curr = 0 //当前分数
        this.f_xian = 360 //警戒线显示的高度
        this.is_over = false

        this.label_score.string = this.score_curr
        this.block_random = 1
        // 开始就显示一个元素
        this.showBlock()
        // 清空所有的元素块 
        this.cleanAllBlocks()
    },

    // 爆炸音效
    playpzSound:function(){
        cc.audioEngine.play(this.audoi_pz, false, 1)
    },

    // 背景音效
    playbgSound:function(){
        cc.audioEngine.playMusic(this.audoi_bg,true,1)
    },

    
    //屏幕触摸
    setTouch:function(){
        // 使用事件名来注册
        this.node.on('touchstart', function (event) {
            // console.log("touchstart")
            if (this.block_show.active == false || this.is_over) {
                return
            }

            var pos_touch = event.getLocation()
            pos_touch = this.node.convertToNodeSpaceAR(pos_touch);
            // 掉落球只能是在X方向变动 Y不变
            this.block_show.x = pos_touch.x
        }, this);
        this.node.on('touchmove', function (event) {
            // console.log("touchmove")
            if (this.block_show.active == false || this.is_over) {
                return
            }
            var pos_touch = event.getLocation()
            pos_touch = this.node.convertToNodeSpaceAR(pos_touch);
            this.block_show.x = pos_touch.x
            // console.log('x:'+pos_touch.x+' y:'+pos_touch.y);
        }, this);
        this.node.on('touchend', function (event) {
            // console.log("touchend")
            if (this.block_show.active == false || this.is_over) {
                return
            }
            this.block_show.active = false
            var pos_blockShow = this.block_show.getPosition()
           this.createBlock(this.block_random,pos_blockShow,false)

            // 直接从半个西瓜生成起 用于快速生成西瓜
            // this.createBlock(6,pos_blockShow,false)

            var arr_length = this.arr_num.length
            var i_arrRandom = Math.floor(Math.random()*arr_length)
            this.block_random = this.arr_num[i_arrRandom]

            this.scheduleOnce(function() {
                this.showBlock()
            }.bind(this), 1);

        }, this);
        this.node.on('touchcancel', function (event) {
            // console.log('touchcancel');
            if (this.block_show.active == false || this.is_over) {
                return
            }
            this.block_show.active = false
            var pos_blockShow = this.block_show.getPosition()
            this.createBlock(this.block_random,pos_blockShow,false)
            //this.createBlock(10,pos_touch)
            this.block_random = Math.floor(Math.random()*5)+1 // 1-5

            this.scheduleOnce(function() {
                this.showBlock()
            }.bind(this), 1);
        }, this);
    },

    //显示生成的元素块
    showBlock:function(){
        this.block_show.active = true
        this.block_show.setPosition(cc.v2(0,530))

        var children = this.block_show.children
        for (let i = 0; i < children.length; i++) {
            if (children[i].name == this.block_random) {
                children[i].active = true
            }else{
                children[i].active = false
            }
        }

        this.block_show.scale = 0
        var act_1 = cc.scaleTo(0.15,this.f_scale)
        this.block_show.runAction(act_1)
    },

    //创建元素块
    createBlock:function(i_type,pos_touch,can_scale){
        var node_block = cc.instantiate(this.block_arr[i_type])//实例化
        node_block.parent = this.node
        
        // 缩放
        node_block.scale = this.f_scale
        node_block.setPosition(pos_touch)
        var js_block = node_block.getComponent('block')
        js_block.init(i_type)

        if (can_scale) {
            node_block.scale = 0.3
            var act_1 = cc.scaleTo(0.12,this.f_scale)
            node_block.runAction(act_1)
        }
    },

    //创建爆炸特效
    createTx:function(i_type,pos_block,block_wh){
        var node_tx = cc.instantiate(this.pre_tx)//实例化
        node_tx.parent = this.node
        node_tx.scale = 0

        // 为了特效不被新创建的元素挡住
        node_tx.zIndex = 3

        node_tx.width = block_wh
        node_tx.height = block_wh
        node_tx.setPosition(pos_block)

        if (i_type == 1) {
            node_tx.color = new cc.Color(110,16,100);
        }else if (i_type == 2) {
            node_tx.color = new cc.Color(255,9,36);
        }else if (i_type == 3) {
            node_tx.color = new cc.Color(253,111,1);
        }else if (i_type == 4) {
            node_tx.color = new cc.Color(255,230,23);
        }else if (i_type == 5) {
            node_tx.color = new cc.Color(93,222,31);
        }else if (i_type == 6) {
            node_tx.color = new cc.Color(229,25,50);
        }
        // else if (i_type == 7) {
        //     node_tx.color = new cc.Color(245,159,98);
        // }else if (i_type == 8) {
        //     node_tx.color = new cc.Color(255,225,69);
        // }else if (i_type == 9) {
        //     node_tx.color = new cc.Color(205,201,189);
        // }else if (i_type == 10) {
        //     node_tx.color = new cc.Color(248,64,100);
        // }

        // 将爆炸缩小指定倍数 
        var act_1 = cc.scaleTo(0.16,1)
        // 回调函数
        var act_2 = cc.callFunc(function(){
            node_tx.removeFromParent()
        })
        var end = cc.sequence(act_1,act_2)
        node_tx.runAction(end)

    },

    //增加分数
    addScore:function(i_score){
        this.score_curr = this.score_curr + i_score
        this.label_score.string = this.score_curr
    },

    //显示警戒线
    showXian:function(){
        var can_show = false
        var children = this.node.children
        for (let i = 0; i < children.length; i++) {
            var js_block = children[i].getComponent('block')
            if (js_block && js_block.is_pz) {
                var y_block = children[i].y
                var y_gao = y_block + children[i].height / 2 * this.f_scale
                if (y_gao > this.f_xian) {
                    can_show = true
                    break
                }
            }
        }

        if (can_show) {
            this.node_xian.active = true
        }else{
            this.node_xian.active = false
        }
    },



    //游戏结束
    gameOver:function(){

        // 游戏结束后 显示当前游戏分数，并存储最高分到本地
        this.node_xian.active = false
        this.block_show.active = false

        this.layerOver.getChildByName('label_score').getComponent(cc.Label).string = this.score_curr
        var num_bestScore = cc.sys.localStorage.getItem('num_bestScore')
        if (!num_bestScore) {
            num_bestScore = 0
        }

        if (num_bestScore < this.score_curr) {
            num_bestScore = this.score_curr
        }
        this.layerOver.getChildByName('label_bestScore').getComponent(cc.Label).string = num_bestScore
        cc.sys.localStorage.setItem('num_bestScore', num_bestScore)


        // 上传本次游戏积分
        this.uploadJf(this.score_curr);


        var f_timeLong = 0
        this.is_over = true
        var children = this.node.children
        for (let i = 0; i < children.length; i++) {
            var js_block = children[i].getComponent('block')
            if (js_block) {
                var f_time = 0.1+0.025*i
                if (f_timeLong < f_time) {
                    f_timeLong = f_time
                }
                var act_1 = cc.delayTime(f_time)
                var act_2 = cc.callFunc(function(){
                    var js_block = children[i].getComponent('block')
                    var block_type = js_block.block_type
                    var pos_block = children[i].getPosition()
                    var block_wh = children[i].width
                    this.createTx(block_type,pos_block,block_wh)
                    // this.addScore(block_type)
                    children[i].active = false
                },this)
                var end = cc.sequence(act_1,act_2)
                children[i].runAction(end)
            }
        }

        this.scheduleOnce(function(){
            this.layerOver.active = true
        },f_timeLong+0.1)
        
    },

    start () {
        console.log("start1")

        let self = this;

        // 缓存获取 用户信息
        wx.getUserInfo({
            success(res){
                let userInfo = res.userInfo;
                self.wxLogin(res.encryptedData,res.iv)
            },
            fail(){
                console.log("缓存中未获取到用户信息基础信息")
                let sysInfo =  wx.getSystemInfoSync();
                // 获取微信屏幕大小
                let screenWidth = sysInfo.screenWidth;
                let screenHeight = sysInfo.screenHeight;

                var wxbutton = wx.createUserInfoButton({
                    type: "text",
                    text: "",
                    style: {
                        left: 0,
                        top: 0,
                        width: screenWidth,
                        height: screenHeight,
                        lineHeight: 40,
                        backgroundColor: "#00000000",
                        color: "#ffffff",
                        textAlign: "center"
                    }
                });

                
                wxbutton.onTap((res) =>{
                    self.wxLogin(res.encryptedData,res.iv)
                    wxbutton.destroy();
                });
            }
        });
    },


    wxLogin(encryptedData,iv){
        let self = this;
        wx.login({
            success(res) {

                if (res.code) {
                    console.log("登录code",res.code);
                    console.log("登录iv",iv);
                    console.log("登录encryptedData",encryptedData);
                // 发起网络请求给游戏后台
                wx.request({
                        url:"https://xcxtest.canban.cn/api/wxgame/routine_auth",
                        method: "POST",
                        header:{
                            'content-type':'application/x-www-form-urlencoded'
                        },
                        data:{
                            code:res.code,
                            apptype: 2,
                            iv:iv,
                            encryptedData:encryptedData
                        },
                        success: resp =>{
                            console.log("登录成功", resp);
                            self.userId = resp.data.data.userInfo.uid;
                            self.getTlz(self.userId);
                        }
                    })
                } else {
                    console.log("登录失败"+ res.errMsg);
                }
            }
        })

    },

    //清空所有的元素块 
    cleanAllBlocks:function(){
        var children = this.node.children
        for (let i = children.length-1; i >= 0; i--) {
            var js_block = children[i].getComponent('block')
            if (js_block) {
                children[i].removeFromParent()
            }
        }
    },

    //重新开始游戏
    btnCallBack:function(sender,str){
        //重新开始游戏
		 console.log("重新开始游戏",this.game_time)
        if (str == 'btn_rePlay') {
            if(this.game_time<=0) {
                Toast('剩余次数不够');
                return
            }
            this.init()
            this.begainExpendTlz();
        }
    },

    //手动游戏结束
    btnGameOver:function(sender,str){
        let self = this;
        //手动游戏结束
        if (str == 'btn_over') {
            this.gameOver()
            //self.uploadJf(this.score_curr);
        }
    },

    //开始游戏
    btnBegainGame:function(sender,str){
        //开始游戏
		console.log("开始游戏次数",this.game_time)
        if (str == 'btn_begain') {
            if(this.game_time<=0){
              Toast('剩余次数不够');
              return
            }
            this.begain_game.active = false
            this.init()
            this.begainExpendTlz();
        }
    },

    //分享
    btnShare:function(sender,str){
        let self = this;
        //重新开始游戏
        if (str == 'btn_share') {
            self.uploadTime();
            wx.shareAppMessage({
                title: "大家都来玩合成大白牙",
                imageUrl: "https://image.baidu.com/search/detail?ct=503316480&z=undefined&tn=baiduimagedetail&ipn=d&word=%E5%A4%A7%E7%99%BD%E7%89%99%E7%89%99%E9%BD%BF%E5%9B%BE%E7%89%87&step_word=&ie=utf-8&in=&cl=2&lm=-1&st=undefined&hd=undefined&latest=undefined&copyright=undefined&cs=668063612,1847095016&os=1872563657,3207724429&simid=3044484461,3709176146&pn=133&rn=1&di=7117150749552803841&ln=1504&fr=&fmq=1663514332010_R&fm=&ic=undefined&s=undefined&se=&sme=&tab=0&width=undefined&height=undefined&face=undefined&is=0,0&istype=0&ist=&jit=&bdtype=0&spn=0&pi=0&gsm=5a&objurl=https%3A%2F%2Fgimg2.baidu.com%2Fimage_search%2Fsrc%3Dhttp%253A%252F%252Fdpic.tiankong.com%252Fvd%252F51%252FQJ8155259097.jpg%253Fx-oss-process%253Dstyle%252Fshows%26refer%3Dhttp%253A%252F%252Fdpic.tiankong.com%26app%3D2002%26size%3Df9999%2C10000%26q%3Da80%26n%3D0%26g%3D0n%26fmt%3Dauto%3Fsec%3D1666106333%26t%3D53a13e49311b40089a6f7d40fb6bdfb3&rpstart=0&rpnum=0&adpicid=0&nojc=undefined&dyTabStr=MCwzLDIsMSw2LDQsNSw3LDgsOQ%3D%3D",
                success(res){
                    console.log("分享成功:"+res)
                },
                fail(res){
                    console.log("分享失败:"+res)
                }
            });
        }
    },

        
    //关闭排行榜
    btnGbPhBGame:function(sender,str){
        //关闭排行榜
        if (str == 'btn_gbphb') {
            console.log("关闭排行榜")
            this.nodePHB.active = false
        }
    },

    
    //排行榜
    btnPhBGame:function(sender,str){
        //排行榜
        if (str == 'btn_phb') {
            console.log("排行榜")
            this.arr_infor = [];
            let num = 5;
            gameRanking().then(res => {
                this.arr_infor = res.data.data;
                // 清空view中的 content数据
                this.itemParent.removeAllChildren()
                this.arr_infor.sort(this.compare('game_integral'))
                // 实例化 排行榜模板
                var item = cc.instantiate(this.pre_item)
                var itemH = item.height
                this.itemParent.height = itemH * num
                if(this.arr_infor.length < num){
                    num = this.arr_infor.length
                }
                for (let i = 0; i < num; i++) {
                    var item = cc.instantiate(this.pre_item)
                    item.parent = this.itemParent
                    var js = item.getComponent('item')
                    if(js){
                        var name = this.arr_infor[i].nickname
                        var score = this.arr_infor[i].game_integral
                        js.init(i+1,name,score,"")
                    }
                    item.y = -48 - i * itemH
                }
                
           });
        this.nodePHB.active = true
        }
    },

    // 获取体力值
    getTlz(userId){
        let self = this;
        wx.request({
            url:"https://xcxtest.canban.cn/api/wxgame/userInfo",
            method: "POST",
            header:{
                'content-type':'application/x-www-form-urlencoded'
            },
            data:{
                uid: userId,
                appid: APP_ID
            },
            success(res){
                let gameLife = res.data.data[0].game_life;
                console.log("获取体力值成功"+ gameLife);
                self.getTlz1(gameLife);
                
            }
        })
    },

    getTlz1:function(gameLife){
        this.game_time = gameLife;
        this.label_tlz.string = "剩余次数："+gameLife+"次";
    },

    //开始游戏 扣减游戏次数
    begainExpendTlz:function(){
        let self = this;
		console.log("开始游戏 扣减游戏次数APP_ID：", APP_ID);
		console.log("开始游戏 扣减游戏次数userId：", self.userId);
        wx.request({
            url:"https://xcxtest.canban.cn/api/wxgame/updateGametimes",
            method: "POST",
            header:{
                'content-type':'application/x-www-form-urlencoded'
            },
            data:{
                appid:APP_ID,
                uid: self.userId
            },
            success(res){
                console.log("开始游戏 扣减游戏次数结果：", res);
				self.game_time = self.game_time - 1
				console.log("开始游戏结束后次数：", self.game_time);
				if(self.game_time < 0){
					self.game_time = 0
				}
					
            },
            fail(res){
                console.log("开始游戏 扣减游戏次数失败：", res)
            }
        })
    },

     //上传游戏积分 更新游戏积分
     uploadJf:function(jf){
		 console.log("上传游戏积分", jf);
        let self = this;
        wx.request({
            url:"https://xcxtest.canban.cn/api/wxgame/upGameIntegral",
            method: "POST",
            header:{
                'content-type':'application/x-www-form-urlencoded'
            },
            data:{
                appid:APP_ID,
                uid: self.userId,
                integral: jf
            },
            success(res){
                console.log("上传游戏积分结果：", res);
            },
            fail(res){
                console.log("上传游戏积分失败：",res)
            }
        })
    },   

    //分享 上传游戏次数
    uploadTime:function(){
    let self = this;
    wx.request({
        url:"https://xcxtest.canban.cn/api/wxgame/addGametimes",
        method: "POST",
        header:{
            'content-type':'application/x-www-form-urlencoded'
        },
        data:{
            appid:APP_ID,
            uid: self.userId,
            gametimes: 1
        },
        success(res){
            console.log("上传游戏次数：", res.data.data);
            self.getTlz(self.userId);
        },
        fail(res){
            console.log("上传游戏次数：失败：",res)
        }
    })
    },  

    compare:function(property){
        return function(a,b){
            var value1 = a[property];
            var value2 = b[property];
            return value2 - value1;
        }
    },

    // 如果打开会不断执行 大概每秒输出60次
    update (dt) {
        this.showXian()
    },
});
