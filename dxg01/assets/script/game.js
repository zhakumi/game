
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

        this.i_game = 1 //1:大西瓜 
        // 1的概率最大
        this.arr_num = [1,4,5,5,5]

        this.label_tlz.string = "剩余次数：3次";


        this.begain_game.active = true
        this.nodePHB.active = false
        this.nodePHB.zIndex = 10

        this.setInfor()

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
        this.f_scale = 0.6
        this.block_show.scale = this.f_scale
       
        this.score_curr = 0 //当前分数
        this.f_xian = 300 //警戒线显示的高度
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
            //this.createBlock(10,pos_touch)

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
        }else if (i_type == 7) {
            node_tx.color = new cc.Color(245,159,98);
        }else if (i_type == 8) {
            node_tx.color = new cc.Color(255,225,69);
        }else if (i_type == 9) {
            node_tx.color = new cc.Color(205,201,189);
        }else if (i_type == 10) {
            node_tx.color = new cc.Color(248,64,100);
        }

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
                console.log("缓存"+userInfo)
                self.wxLogin(userInfo)
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
                    console.log("wxbutton.onTap")
                    console.log(res.userInfo);
                    self.wxLogin(res.userInfo)
                    wxbutton.destroy();
                });
            }
        });
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
        if (str == 'btn_rePlay') {
            this.init()
        }
    },

    //开始游戏
    btnBegainGame:function(sender,str){
        //开始游戏
        if (str == 'btn_begain') {
            this.begain_game.active = false
            this.init()
        }
    },

    wxLogin(userInfo){
        let self = this;
        wx.login({
            success(res) {
                if (res.code) {
                // 发起网络请求给游戏后台
                wx.request({
                        url:"http://localhost:8081/manual/login",
                        method: "POST",
                        header:{
                            'content-type':'application/x-www-form-urlencoded'
                        },
                        data:{
                            code:res.code,
                            nickName:userInfo.nickName,
                            avatarUrl:userInfo.avatarUrl
                        },
                        success: resp =>{
                            // openId
                            let openId = resp.data;
                            console.log("登录成功"+ resp.data);
                            self.getTlz(openId);
                        }
                    })
                } else {
                    console.log("登录失败"+ res.errMsg);
                }
            }
        })

    },

    // 获取体力值
    getTlz(tlz){
        wx.request({
            url:"http://localhost:8081/manual/tlz",
            method: "POST",
            header:{
                'content-type':'application/x-www-form-urlencoded'
            },
            data:{
                code:tlz
            },
            success: resp =>{
                console.log("获取体力值成功"+ resp.data);
                this.label_tlz.string = "剩余次数：" + resp.data + "次"
            }
        })
    },

    //分享
    btnShare:function(sender,str){
        //重新开始游戏
        if (str == 'btn_share') {
            wx.shareAppMessage({
                title: "大家都来玩合成大白牙",
                imageUrl: "https://image.baidu.com/search/detail?ct=503316480&z=undefined&tn=baiduimagedetail&ipn=d&word=%E5%A4%A7%E7%99%BD%E7%89%99%E7%89%99%E9%BD%BF%E5%9B%BE%E7%89%87&step_word=&ie=utf-8&in=&cl=2&lm=-1&st=undefined&hd=undefined&latest=undefined&copyright=undefined&cs=668063612,1847095016&os=1872563657,3207724429&simid=3044484461,3709176146&pn=133&rn=1&di=7117150749552803841&ln=1504&fr=&fmq=1663514332010_R&fm=&ic=undefined&s=undefined&se=&sme=&tab=0&width=undefined&height=undefined&face=undefined&is=0,0&istype=0&ist=&jit=&bdtype=0&spn=0&pi=0&gsm=5a&objurl=https%3A%2F%2Fgimg2.baidu.com%2Fimage_search%2Fsrc%3Dhttp%253A%252F%252Fdpic.tiankong.com%252Fvd%252F51%252FQJ8155259097.jpg%253Fx-oss-process%253Dstyle%252Fshows%26refer%3Dhttp%253A%252F%252Fdpic.tiankong.com%26app%3D2002%26size%3Df9999%2C10000%26q%3Da80%26n%3D0%26g%3D0n%26fmt%3Dauto%3Fsec%3D1666106333%26t%3D53a13e49311b40089a6f7d40fb6bdfb3&rpstart=0&rpnum=0&adpicid=0&nojc=undefined&dyTabStr=MCwzLDIsMSw2LDQsNSw3LDgsOQ%3D%3D",
                success(res){
                    console.log(res)
                },
                fail(res){
                    console.log(res)
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
            this.addItem(50)
            this.nodePHB.active = true
        }
    },

    addItem:function(num){
        // 清空view中的 content数据
        this.itemParent.removeAllChildren()
        // arr_infor 是初始化的假数据 
        this.arr_infor.sort(this.compare('score'))
        // cc.log(this.arr_infor)
        // 实例化 排行榜模板
        var item = cc.instantiate(this.pre_item)
        var itemH = item.height
        this.itemParent.height = itemH * num
        for (let i = 0; i < num; i++) {
            var item = cc.instantiate(this.pre_item)
            item.parent = this.itemParent
            var js = item.getComponent('item')
            if(js){
                var name = this.arr_infor[i].name
                var score = this.arr_infor[i].score
                var touxing = this.arr_infor[i].touXiang
                js.init(i+1,name,score,touxing)
            }
            item.y = -48 - i * itemH
        }
    },

    compare:function(property){
        return function(a,b){
            var value1 = a[property];
            var value2 = b[property];
            return value2 - value1;
        }
    },

    setInfor:function(){
        this.arrColorBg = [
            {r:191,g:192,b:201},
            {r:244,g:220,b:216},
            {r:198,g:224,b:211},
            {r:242,g:215,b:171},
            {r:165,g:191,b:216},
            {r:231,g:219,b:222},
        ]
        this.arr_infor = [
            {name:'2504549300',touXiang:0,score:1003},
            {name:'cocoscreator_666',touXiang:1,score:1002},
            {name:'我',touXiang:2,score:1001},
            {name:'褪了色旳回憶',touXiang:3,score:Math.round(Math.random() * 1000)},
            {name:'为爱控',touXiang:4,score:Math.round(Math.random() * 1000)},
            {name:'等尽歌悲欢',touXiang:5,score:Math.round(Math.random() * 1000)},
            {name:'妖媚＠',touXiang:6,score:Math.round(Math.random() * 1000)},
            {name:'时光あ瘦了~',touXiang:7,score:Math.round(Math.random() * 1000)},
            {name:'别格式化',touXiang:8,score:Math.round(Math.random() * 1000)},
            {name:'同餐伴枕',touXiang:9,score:Math.round(Math.random() * 1000)},
            {name:'曾有↘几人',touXiang:10,score:Math.round(Math.random() * 1000)},
            {name:'柠檬味的鱼',touXiang:11,score:Math.round(Math.random() * 1000)},
            {name:'没有范儿',touXiang:12,score:Math.round(Math.random() * 1000)},
            {name:'自然而然',touXiang:13,score:Math.round(Math.random() * 1000)},
            {name:'亲，我没跑',touXiang:14,score:Math.round(Math.random() * 1000)},
            {name:'主音King',touXiang:15,score:Math.round(Math.random() * 1000)},
            {name:'名钻',touXiang:16,score:Math.round(Math.random() * 1000)},
            {name:'莫再执迷不悟。',touXiang:17,score:Math.round(Math.random() * 1000)},
            {name:'多啦呮諟個夢',touXiang:18,score:Math.round(Math.random() * 1000)},
            {name:'大哥大@',touXiang:19,score:Math.round(Math.random() * 1000)},

            {name:'女人本该霸气',touXiang:20,score:Math.round(Math.random() * 500)},
            {name:'喓浭喓姒氺溫柔',touXiang:21,score:Math.round(Math.random() * 500)},
            {name:'回忆刺穿心脏╮',touXiang:22,score:Math.round(Math.random() * 500)},
            {name:'爷丶有特点',touXiang:23,score:0},
            {name:'感谢经历。',touXiang:24,score:Math.round(Math.random() * 500)},
            {name:'疾风魔影',touXiang:25,score:Math.round(Math.random() * 500)},
            {name:'坚强的爱恋',touXiang:26,score:Math.round(Math.random() * 500)},
            {name:'路还长别猖狂',touXiang:27,score:Math.round(Math.random() * 500)},
            {name:'余生梦断',touXiang:28,score:Math.round(Math.random() * 500)},
            {name:'笑话太过',touXiang:29,score:Math.round(Math.random() * 500)},
            {name:'白龙吟',touXiang:30,score:Math.round(Math.random() * 500)},
            {name:'心底青苔',touXiang:31,score:Math.round(Math.random() * 500)},
            {name:'独立于世',touXiang:32,score:Math.round(Math.random() * 500)},
            {name:'mo_虚冇',touXiang:33,score:Math.round(Math.random() * 500)},
            {name:'无所谓的结局',touXiang:34,score:Math.round(Math.random() * 500)},
            {name:'半夜成仙',touXiang:35,score:Math.round(Math.random() * 500)},
            {name:'完了丶然后@',touXiang:36,score:Math.round(Math.random() * 500)},

            {name:'没爱没恨-',touXiang:37,score:Math.round(Math.random() * 100)},
            {name:'凉纪之城',touXiang:38,score:Math.round(Math.random() * 110)},
            {name:'梦如南筏〞',touXiang:39,score:Math.round(Math.random() * 100)},
            {name:'-夲亼光锟',touXiang:40,score:Math.round(Math.random() * 100)},
            {name:'褐色眼眸~',touXiang:41,score:Math.round(Math.random() * 100)},
            {name:'太坚强是软弱',touXiang:42,score:Math.round(Math.random() * 100)},
            {name:'暮色伊人',touXiang:43,score:Math.round(Math.random() * 100)},
            {name:'不必谁懂我',touXiang:44,score:Math.round(Math.random() * 100)},
            {name:'嫩HEI炮@!',touXiang:45,score:Math.round(Math.random() * 100)},
            {name:'奈河桥等你',touXiang:46,score:Math.round(Math.random() * 100)},
            {name:'一舞驚鴻',touXiang:47,score:Math.round(Math.random() * 100)},
            {name:'三五七年',touXiang:48,score:Math.round(Math.random() * 100)},
            {name:'冰落風嘯',touXiang:49,score:Math.round(Math.random() * 10)},
        ];
    },

    // 如果打开会不断执行 大概每秒输出60次
    update (dt) {
        this.showXian()
    },
});
