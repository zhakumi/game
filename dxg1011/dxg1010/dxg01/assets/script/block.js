
cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    onLoad () {},

    init:function(i_type){
        // 给每一个元素一个唯一的值
        this.block_type = i_type

        this.is_pz = false //是否发生过碰撞

        this.can_pz = true //是否可以碰撞
        if (i_type >= 7) {
            this.can_pz = false //是否可以碰撞
        }

        this.i_over = 0
    },

    // 只在两个碰撞体开始接触时被调用一次
    onBeginContact: function (contact, selfCollider, otherCollider) {
        // console.log('只在两个碰撞体开始接触时被调用一次');
        //因为球在于左右墙壁碰撞时  高度会超过警戒线 此时时不能报警的
        // tag = 99 时给墙打的一个标记
        if (otherCollider.tag != 99) {
            this.is_pz = true
        }
        // 获取block组件
        var js_otherBlock = otherCollider.node.getComponent('block')
        // js_otherBlock 先判断是否存在有可能是跟墙碰撞
        if (js_otherBlock && this.can_pz) {
            if (this.block_type == js_otherBlock.block_type) {
                this.can_pz = false
                js_otherBlock.can_pz = false
                
                var pos_self = this.node.getPosition()
                var pos_other = otherCollider.node.getPosition()
                var pos_min = pos_self
                if (pos_min.y > pos_other.y) {
                    pos_min = pos_other
                }
                
                // 相同的两个元素删除
                this.node.removeFromParent()
                otherCollider.node.removeFromParent()
                game.playpzSound()


                // 碰撞特效
                {
                    var block_wh = this.node.width
                    game.createTx(this.block_type,pos_self,block_wh)
                    game.createTx(this.block_type,pos_other,block_wh)
                }

                // 增加分数
                game.addScore(this.block_type)

                // 删除碰撞元素 需要创建一个新的元素
                this.scheduleOnce(function() {
                    game.createBlock(this.block_type+1,pos_min,true)
                }.bind(this), 0.15);
            }
        }
        
    },

    // 只在两个碰撞体结束接触时被调用一次
    onEndContact: function (contact, selfCollider, otherCollider) {
    },

    // 每次将要处理碰撞体接触逻辑时被调用
    onPreSolve: function (contact, selfCollider, otherCollider) {
    },

    // 每次处理完碰撞体接触逻辑时被调用
    onPostSolve: function (contact, selfCollider, otherCollider) {
    },

    update (dt) {
        if (game.is_over) {
            return
        }
        var y_gao = this.node.y + this.node.height * game.f_scale / 2
        if (y_gao > game.node_xian.y) {
            this.i_over++
            if (this.i_over > 120) {
                game.gameOver()
            }
        }else{
            this.i_over = 0
        }
    },
});
