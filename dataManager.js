
var global = require('./global');

/*var GameStep = Object.freeze({
    "Waiting": 0, "GameStart": 1, "callDizhu": 2, "RaiseDizhu": 3
    , "PersonalDouble": 4, "Playing": 5, "choseLaiziCard": 6, "Result": 7
});*/
var GameStep = Object.freeze({
    "Waiting": 0, "GameStart": 1, "callDizhu": 2,

    "PersonalDouble": 3, "Playing": 4, "Result": 5, "Continue": 6
});

var dataManager = {

    //I:room.game
    timer: function (game, index, cleanUp) { // room.js.game, 玩家在房間的座位號碼(0-4)+5 = (5-9), 是否重設timer
        var Info = game.timer;

        var transferData = {
            active: null, //按鍵是否可按(牛牛都一起顯示)
            whosTurn: null, //鬧鐘顯示位置:Me,Next,Pre(牛牛都在中間), null是不顯示
            countdownSecond: null, //倒數秒數
        };

        if (cleanUp) // 回傳到client全null(淨空)
            return transferData;

        /*//---------------------------------------------算出計數器顯示的位置
        switch (Info.whosTurn - index) {
            case 1:
            case -2:
                transferData.whosTurn = 'Next';
                break;
            case 0:
                transferData.whosTurn = 'Me';
                break;
            case -1:
            case 2:
                transferData.whosTurn = 'Pre';
                break;
        }
        //-----------------------------------------------

        
        //加倍/不加階段大家同時進行
        if (Info.stage === GameStep.PersonalDouble)
            transferData.whosTurn = "Me";*/

        // 大家同時進行每個階段
        transferData.whosTurn = "Me"; // 大家同時搶莊、押倍、選牛、結果噴幣、繼續遊戲

        // 當輪流出牌時輪到本位玩家才顯示按鈕(牛牛每個階段都是一起顯示：whosturn都是me)
        transferData.active = transferData.whosTurn == "Me" ? Info.stage : null;

        /*// 選玩加倍/不加的玩家不再顯示button
        if ((Info.stage === GameStep.PersonalDouble) && (game.result.personalOdds[index] !== -1))
            transferData.active = null;*/

        // 倒數秒數更新
        transferData.countdownSecond = Info.countdown;
      
        // 列隊及顯示遊戲開始階段不顯示緊鈴及倒數
        if (Info.stage === GameStep.Waiting || Info.stage === GameStep.GameStart) {
            transferData.active = Info.stage;
            transferData.whosTurn = null; //
            transferData.countdownSecond=null;
        }

        // 結果階段的whosturn 是 result
        if (Info.stage === GameStep.Result) {
            transferData.active = Info.stage;
            transferData.whosTurn = "Result";
        }

        return transferData;
    },    

    //I:room
    room: function (Info,index) { // (room.js, playerIndex(玩家在房間中的座位號碼))
        
        var transferData = {
            playerPoint: null, //目前點數
            currentOdds: null, //目前賠分
            odds: null //賠分賠率
        };

        if (Info.game.timer.stage != GameStep.Waiting) { // 正在玩遊戲時，才更新點數、賠分、倍率
            transferData.playerPoint = "....";
            transferData.currentOdds = 12345;
            transferData.odds = Info.game.result.Odds;
        }

        return transferData;
    },

/*    //player(三人)
    //I:room.room
    player: function (Info, index) { //(room.js.room(房號與玩家們), 玩家在房間的座位號碼(0,1,2)+3=(3,4,5))

        var transferData = {
            me: {
                name: null,
                img: null,
                coin:1234
            },
            NextRival: {
                name: null,
                img: null,
                coin:"12,004.56"
            },
            PreRival: {
                name: null,
                img: null,
                coin:null
            },
        };
        if (typeof (transferData.IsAI = global.players[Info.players[index % 3]]) == "undefined") return transferData;
       
        transferData.IsAI = global.players[Info.players[index % 3]].IsAI;

        transferData.me.name = global.players[Info.players[index % 3]].uid;
        transferData.NextRival.name = Info.players[(index + 1) % 3] == null ? '' : global.players[Info.players[(index + 1) % 3]].uid;
        transferData.PreRival.name = Info.players[(index - 1) % 3] == null ? '' : global.players[Info.players[(index - 1) % 3]].uid;

        transferData.me.img = global.players[Info.players[index % 3]].img;
        transferData.NextRival.img = Info.players[(index + 1) % 3] == null ? null : global.players[Info.players[(index + 1) % 3]].img;
        transferData.PreRival.img = Info.players[(index - 1) % 3] == null ? null : global.players[Info.players[(index - 1) % 3]].img;



        return transferData;
    },*/

    player: function (Info, index) { //(room.js.room(房號與玩家們), 玩家在房間的座位號碼(0, 1, 2, 3, 4)+5=(5, 6, 7, 8, 9))

        var transferData = {
            me: {
                name: null,
                img: null,
                coin: "666"
            },
            NextRival: {
                name: null,
                img: null,
                coin:"888"
            },
            PreRival: {
                name: null,
                img: null,
                coin: 456
            },
            NextNextRival: {
                name: null,
                img: null,
                coin:"8888"
            },
            PrePreRival: {
                name: null,
                img: null,
                coin: 123
            },
        };
        if (typeof (transferData.IsAI = global.players[Info.players[index % 5]]) == "undefined") return transferData;

        transferData.IsAI = global.players[Info.players[index % 5]].IsAI;

        transferData.me.name = global.players[Info.players[index % 5]].uid;
        transferData.NextRival.name = Info.players[(index + 1) % 5] == null ? '' : global.players[Info.players[(index + 1) % 5]].uid;
        transferData.PreRival.name = Info.players[(index - 1) % 5] == null ? '' : global.players[Info.players[(index - 1) % 5]].uid;
        transferData.NextNextRival.name = Info.players[(index + 2) % 5] == null ? '' : global.players[Info.players[(index + 2) % 5]].uid;
        transferData.PrePreRival.name = Info.players[(index - 2) % 5] == null ? '' : global.players[Info.players[(index - 2) % 5]].uid;


        transferData.me.img = global.players[Info.players[index % 5]].img;
        transferData.NextRival.img = Info.players[(index + 1) % 5] == null ? null : global.players[Info.players[(index + 1) % 5]].img;
        transferData.PreRival.img = Info.players[(index - 1) % 5] == null ? null : global.players[Info.players[(index - 1) % 5]].img;
        transferData.NextNextRival.img = Info.players[(index + 2) % 5] == null ? null : global.players[Info.players[(index + 2) % 5]].img;
        transferData.PrePreRival.img = Info.players[(index - 2) % 5] == null ? null : global.players[Info.players[(index - 2) % 5]].img;



        return transferData;
    },

/*    //cards(三人)
    //I:room.game
    cards: function (game, index) {// room.js.game, 玩家在房間的座位號碼(0-4)+5 = (5-9)

        var Info = game.CardsConfig;

        var transferData = {
            DizhuCards: [], // 地主牌
            MyCards: null, // 我的手牌
            currentStatus: {
                Me: null,
                Pre: null,
                Next: null

            },//目前牌型
            PreRivalCards: 0, // 前一位玩家的手牌數
            NextRivalCards: 0, // 後一位玩家的手牌數
            IsDizhu: {
                Me: null,
                Pre: null,
                Next: null
            }
        };
        if (game.timer.stage > GameStep.RaiseDizhu) {
            transferData.DizhuCards = Info.Dizhu;
            transferData.IsDizhu.Me = Info.dizhuIndex == (index % 3) ? true : null;
            transferData.IsDizhu.Pre = Info.dizhuIndex == ((index - 1) % 3) ? true : null;
            transferData.IsDizhu.Next = Info.dizhuIndex == ((index + 1) % 3) ? true : null;
        }
        else if (game.timer.stage !== GameStep.Waiting) {
            transferData.DizhuCards = [null, null, null];
        }

        transferData.currentStatus.Me = Info.current[index % 3];
        transferData.currentStatus.Pre = Info.current[(index - 1) % 3];
        transferData.currentStatus.Next = Info.current[(index + 1) % 3];

        transferData.MyCards = Info.cards[index % 3];

        if ((game.result.personalOdds[game.CardsConfig.dizhuIndex] == 2) && (game.timer.stage > GameStep.PersonalDouble)) {

            if (((index - 1) % 3) == game.CardsConfig.dizhuIndex)
                transferData.PreRivalCards = Info.cards[(index - 1) % 3];
            else
                transferData.PreRivalCards = Info.cards[(index - 1) % 3].length;
            if (((index + 1) % 3) == game.CardsConfig.dizhuIndex)
                transferData.NextRivalCards = Info.cards[(index + 1) % 3];
            else
                transferData.NextRivalCards = Info.cards[(index + 1) % 3].length;

        }
        else {
            transferData.PreRivalCards = Info.cards[(index - 1) % 3].length;
            transferData.NextRivalCards = Info.cards[(index + 1) % 3].length;
        }



        return transferData;
    },*/

    cards: function (game, index) {// room.js.game, 玩家在房間的座位號碼(0-4)+5 = (5-9)

        var Info = game.CardsConfig;

        // dizhuIndex: -1,
        // current: [[], [], [], [], []], //5個玩家的排型
        // cards: [[], [], [], [], []], //5個玩家的手牌

        var transferData = {
            currentStatus: {
                Me: null,
                Pre: null,
                Next: null,
                PrePre: null,
                NextNext: null

            },//目前牌型(搶幾倍、下幾倍、所有玩家的排型)
            IsDizhu: {
                Me: null,
                Pre: null,
                Next: null,
                PrePre: null,
                NextNext: null
            },// 誰是地主
            cards: {
                Me: null,
                Pre: null,
                Next: null,
                PrePre: null,
                NextNext: null
            },// 各家卡牌
            cardType: {
                Me: null,
                Pre: null,
                Next: null,
                PrePre: null,
                NextNext: null
            },
        };
        if (game.timer.stage == GameStep.callDizhu || game.timer.stage == GameStep.Result || game.timer.stage == GameStep.Playing) { // 搶地主時填上
            transferData.IsDizhu.Me = Info.dizhuIndex == (index %5) ? true : null;
            transferData.IsDizhu.Pre = Info.dizhuIndex == ((index - 1) % 5) ? true : null;
            transferData.IsDizhu.Next = Info.dizhuIndex == ((index + 1) % 5) ? true : null;
            transferData.IsDizhu.PrePre = Info.dizhuIndex == ((index - 2) % 5) ? true : null;
            transferData.IsDizhu.NextNext = Info.dizhuIndex == ((index + 2) % 5) ? true : null;
        }

        transferData.currentStatus.Me = Info.current[index % 5]; // [[here],[],[],[],[]] : [here]
        transferData.currentStatus.Pre = Info.current[(index - 1) % 5];
        transferData.currentStatus.Next = Info.current[(index + 1) % 5];
        transferData.currentStatus.PrePre = Info.current[(index - 2) % 5];
        transferData.currentStatus.NextNext = Info.current[(index + 2) % 5];

        transferData.cards.Me = Info.cards[index % 5];
        transferData.cards.Pre = Info.cards[(index - 1) % 5];
        transferData.cards.Next = Info.cards[(index + 1) % 5];
        transferData.cards.PrePre = Info.cards[(index - 2) % 5];
        transferData.cards.NextNext = Info.cards[(index + 2) % 5];

        transferData.cardType.Me = Info.cardType[index % 5];
        transferData.cardType.Pre = Info.cardType[(index - 1) % 5];
        transferData.cardType.Next = Info.cardType[(index + 1) % 5];
        transferData.cardType.PrePre = Info.cardType[(index - 2) % 5];
        transferData.cardType.NextNext = Info.cardType[(index + 2) % 5];

        /*if ((game.result.personalOdds[game.CardsConfig.dizhuIndex] == 2) && (game.timer.stage > GameStep.PersonalDouble)) {

            if (((index - 1) % 3) == game.CardsConfig.dizhuIndex)
                transferData.PreRivalCards = Info.cards[(index - 1) % 3];
            else
                transferData.PreRivalCards = Info.cards[(index - 1) % 3].length;
            if (((index + 1) % 3) == game.CardsConfig.dizhuIndex)
                transferData.NextRivalCards = Info.cards[(index + 1) % 3];
            else
                transferData.NextRivalCards = Info.cards[(index + 1) % 3].length;

        }
        else {
            transferData.PreRivalCards = Info.cards[(index - 1) % 3].length;
            transferData.NextRivalCards = Info.cards[(index + 1) % 3].length;
        }*/



        console.log("send card info...");

        return transferData;
    },

    clearCards: function (Info, index) {
        var transferData = {
            DizhuCards: [],
            MyCards: [],
            currentStatus: {
                Me: [],
                Pre: [],
                Next: []
            },
            PreRivalCards: 0,
            NextRivalCards: 0,
            IsDizhu: {
                Me: null,
                Pre: null,
                Next: null
            }
        }

        return transferData;

    },

};

module.exports = dataManager;