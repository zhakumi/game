import { PATH, APP_ID } from './ConstValue'
// export default class RequestUtils {

//登录授权
function wxAuth(code, iv, encryptedData) {
    console.log(code, iv, encryptedData)
    return new Promise((resolve, reject) => {
        wx.request({
            url: PATH + "/routine_auth",
            method: "POST",
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
                code: code,
                apptype: 1,
                iv: iv,
                encryptedData: encryptedData
            },
            success(res) {
                console.log("用户信息", res)
                resolve(res);
            },
            fail(res) {
                console.log("获取用户数据错误：" + res)
            }
        })
    })
}

//获取用户游戏信息
function userInfo(uid) {
    return new Promise((resolve, reject) => {
        wx.request({
            url: PATH + "/userInfo",
            method: "POST",
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
                appid: APP_ID,
                uid: uid
            },
            success(res) {
                console.log("用户信息",res)
                resolve(res);
            },
            fail(res) {
                console.log("获取用户数据错误：" + res)
            }
        })
    })
}

//更新游戏积分
function upGameintegral(uid, integral) {
    return new Promise((resolve, reject) => {
        wx.request({
            url: PATH + "/upGameIntegral",
            method: "POST",
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
                appid: APP_ID,
                uid: uid,
                integral: integral
            },
            success(res) {
                console.log("更新游戏积分",res)
                resolve(res);  
            },
            fail(res) {
                console.log("更新游戏积分错误：" + res)
            }
        })
    })
}


// 更新用户 游戏次数
function updateGametimes(uid) {
    return new Promise((resolve, reject) => {
        wx.request({
            url: PATH + "/updateGametimes",
            method: "POST",
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
                appid: APP_ID,
                uid: uid
            },
            success(res) {
                console.log("次数扣减",res)
                resolve(res);
            },
            fail(res) {
                console.log("开始游戏 扣减游戏次数失败：" + res)
            }
        })
    })
}

// 增加用户 游戏次数
function addGametimes(uid) {
    return new Promise((resolve, reject) => {
        wx.request({
            url: PATH + "/addGametimes",
            method: "POST",
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
                appid: APP_ID,
                uid: uid,
                gametimes: 1
            },
            success(res) {
                console.log("次数增加",res)
                resolve(res);
            },
            fail(res) {
                console.log("增加游戏次数失败：" + res)
            }
        })
    })
}

//获取排行
function gameRanking() {
    return new Promise((resolve, reject) => {
        wx.request({
            url: PATH + "/gameRanking",
            method: "POST",
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
                appid: APP_ID,
                num: 5
            },
            success(res) {
                console.log("排行获取",res)
                resolve(res);
            },
            fail(res) {
                console.log("获取排行失败失败：" + res)
            }
        })
    });
}

export { userInfo,upGameintegral,gameRanking, addGametimes, updateGametimes }