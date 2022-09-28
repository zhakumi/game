
cc.Class({
    extends: cc.Component,

    properties: {
        lab_num:cc.Label,
        lab_name:cc.Label,
        lab_score:cc.Label,
        spf_bg:cc.SpriteFrame,
        spa_touXiang:cc.SpriteAtlas,
    },

    onLoad () {
        
    },

    init:function(num,name,score){
        this.lab_num.string = num
        this.lab_name.string = name
        this.lab_score.string = score
        if(num % 2 == 0){
            this.node.getComponent(cc.Sprite).spriteFrame = this.spf_bg
        }
    },

    update (dt) {

    },
});
