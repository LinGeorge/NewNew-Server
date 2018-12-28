const Player = require('./player');
const dataManager = require('./dataManager');
const DoDizhuRule = require('./DoDizhuRule');
const findtype = require('./findtype');
const CardUtil = require('./partCards/CardUtil');
var global = require('./global');
const countDownSecond = 5;
const countDownSecond2 = 12;
const Initialpoint = 25;
const BASE_ODDS = 2;
var cleanup = false;

/*var GameStep = Object.freeze({
    "Waiting": 0, "GameStart": 1, "callDizhu": 2, "RaiseDizhu": 3
    , "PersonalDouble": 4, "Playing": 5,"choseLaiziCard":6 ,"Result": 7
});*/
var GameStep = Object.freeze({
    "Waiting": 0, "GameStart": 1, "callDizhu": 2,
    "PersonalDouble": 3, "Playing": 4, "Result": 5, "Continue": 6
});

var AnimationDelay = Object.freeze({
    "None": 0, "GameStart": 2170, "AddDizhuCard": 0, "PASScard": 300,
    "straigth": 830, "Spring": 2080, "reverseSpring": 2080, "airplane": 2000, "bomb": 1750, "laizi": 1500, "rocket": 2920,
    "dealer":3000, "bet":3000, "result":6000,
});
//Object.freeze是const的概念，防止物件內的東西被改動

var pokerCardType = {
    spade: "spade",//黑桃
    hearts: "hearts",//红桃
    redslice: "redslice",//红方
    blackberry: "blackberry",//黑梅
};
var cardNo = ["A", 2, 3, 4, 5, 6, 7, 8, 9, 10, "J", "Q", "K"];

class Room {

    constructor(index) { // 當實例化新房間時的初始化



        //房間資訊，房號與玩家們
        this.room = {
            id: index, // 第幾號房，從0開始依序往下增加
            players: [null, null, null, null, null] //以玩家名稱作為紀錄

        };

        //開始遊戲資訊
        this.game = {

            //倒數計時器資訊
            timer: {

                stage: GameStep.Waiting,
                countdown: countDownSecond, //目前玩家剩下時間
                whosTurn: 0, //目前輪到哪個玩家(0, 1, 2, 3, 4)，牛牛不用，大家都是一起進行
                timer: null, //儲存setInterval Object(每多少毫秒, 做什麼事) 用於停止倒數

            },


            /*CardsConfig: { //各個玩家得牌
                dizhuIndex: -1,
                who: 0,//目前最大牌是誰出的                
                current: [[], [], []],//目前牌型
                cards: [[], [], []],  //3個玩家的手牌       
                Dizhu: [],   //地主牌
                submitCardTimes: [0, 0, 0] //紀錄玩家出了幾手牌(春天/返春)
            },*/

            // 選牛階段階段各家排型
            CardsConfig: { // 各個玩家得牌
                dizhuIndex: -1, // 誰是莊家
                who: 0, //
                current: [-1, -1, -1, -1, -1], //5個玩家的排型
                cards: [[-1], [-1], [-1], [-1], [-1]], //5個玩家的手牌
                Dizhu: [],   //地主牌型(噴金幣流向)
                cardType: [-1, -1, -1, -1, -1] //紀錄玩家出了幾手牌(春天/返春)
            },

            //
            result: {
                //底分
                point: Initialpoint,
                //賠率:含飛機,炸彈,春天...
                Odds: -1,
                //紀錄搶地主階段每個玩家的叫分,-1表示未叫分,0:不要,1:1分,2:2分,3:3分
                playerChosenOdds: [-1, -1, -1, -1, -1],

                dizhuIndex: -1,
                //紀錄
                log: {
                    bomb: 1,
                    rocket: 1,
                    RSpring: 1,
                },
                //押倍階段玩家叫分 : 3, 6, 9, 12, 15
                personalOdds: [-1, -1, -1, -1, -1],
            }
        };

        this.Laizi = {
            origionCards: [],
            Possibles: [],            
        }
    }

/*    // ResetTimer(三人)
    //重設遊戲遊戲計數器
    ResetTimer() {

        var game = this.game;

        game.timer.stage = GameStep.Waiting;
        this.game.timer.whosTurn = Math.round(Math.random() * 10) % 3;
        game.timer.countdown = countDownSecond;

        if (game.timer.timer != null) // timer已經註冊，先暫停
            clearInterval(this.game.timer.timer);
        game.timer.timer = null;



    };*/

    //重設遊戲遊戲計數器
    ResetTimer() {

        var game = this.game;

        game.timer.stage = GameStep.Waiting; // 回到列隊等待狀態
        this.game.timer.whosTurn = Math.round(Math.random() * 10) % 5;
        game.timer.countdown = countDownSecond;

        if (game.timer.timer != null) // timer已經註冊，先暫停
            clearInterval(this.game.timer.timer);
        game.timer.timer = null;



    };

    //清除上一局牌面
    ResetGame() {
        
        var game = this.game;

        game.CardsConfig.dizhuIndex = -1;
        game.CardsConfig.who = this.game.timer.whosTurn;
        game.CardsConfig.current = [[], [], []];
        game.CardsConfig.cards = [[], [], []];
        game.CardsConfig.Dizhu = [];
        game.CardsConfig.submitCardTimes = [0, 0, 0];



        game.result.point = Initialpoint;
        game.result.Odds = -1;
        game.result.playerChosenOdds = [-1, -1, -1];
        game.result.log = {
            bomb: 1,
            rocket: 1,
            RSpring: 1,
        };
        game.result.personalOdds = [-1, -1, -1];

    };

/*    //LoadGame(三人)
    //中斷連線的玩家連回來
    LoadGame(uid) {

        global.players[uid].socket
            .emit('SwitchScene', 1) // 進入遊戲畫面
            .emit('roomInfo', dataManager.room(this, global.players[uid].room.playerIndex)) // 送資訊給這個剛剛進房的玩家，目前點數、賠分倍率、目前賠分(牛牛都不用)
            .emit('playerInfo', dataManager.player(this.room, global.players[uid].room.playerIndex + 3))
            .emit('timer', dataManager.timer(this.game, global.players[uid].room.playerIndex + 3, false))
            .emit('GetCards', dataManager.cards(this.game, global.players[uid].room.playerIndex + 3));

        if (this.game.timer.stage === GameStep.Result) {
            this.showGameResult();
        }
        
    }*/

    //中斷連線的玩家連回來
    LoadGame(uid) {

        global.players[uid].socket
            .emit('SwitchScene', 1) // 進入遊戲畫面
            .emit('roomInfo', dataManager.room(this, global.players[uid].room.playerIndex)) // 送資訊給這個剛剛進房的玩家，目前點數、賠分倍率、目前賠分(牛牛都不用)
            .emit('playerInfo', dataManager.player(this.room, global.players[uid].room.playerIndex + 5)) // 送資訊給這個剛剛進房的玩家，大家的名子、錢錢、頭像(依照圓桌順序逆時針)
            .emit('timer', dataManager.timer(this.game, global.players[uid].room.playerIndex + 5, false)) // 送資訊給玩家，所在階段、剩餘時間
            .emit('GetCards', dataManager.cards(this.game, global.players[uid].room.playerIndex + 5)); // 誰是地主、各家卡片、各家狀態或排型

        if (this.game.timer.stage === GameStep.Result) {
            this.showGameResult();
        }

    }

/*  //玩家是否可加入房間Avaiable(三人)
    Avaiable() {

        if (this.game.timer.stage != GameStep.Waiting)
            return false;
        for (var i = 0; i < 3; i++) { // 這裡設定最多幾人(牛牛要5人)
            if (this.room.players[i] == null) {
                return true;
            }
        }
        return false;
    }*/

    //玩家是否可加入房間
    Avaiable() {

        if (this.game.timer.stage !== GameStep.Waiting) // 預設的stage是waiting，代表遊戲已經開始，不能進房了
            return false;
        for (var i = 0; i < 5; i++) { // 這裡設定最多幾人(牛牛要5人)
            if (this.room.players[i] == null) { // 所以玩家是依序放入房間的
                return true;
            }
        }
        return false;
    }

    /*//房間內新增玩家AddPlayer(三人)
    AddPlayer(uid) {

        for (var i = 0; i < 3; i++) { // 這裡設定最多幾人(牛牛要5人)
            if (this.room.players[i] == null) {
                this.room.players[i] = uid; // 房間自己也有紀錄，誰進了房間(用玩家名子紀錄)
                global.players[uid].room.playerIndex = i; // 0 or 1 or 2
                break;
            }
        }

        global.players[uid].room.id = this.room.id;
        global.players[uid].room.Inroom = true;
        console.log(uid, ' is in room ', global.players[uid].room.id);

        var self = this;
        // 當玩家滿3人自動開始
        if ((this.room.players[0] != null) && (this.room.players[1] != null) && (this.room.players[2] != null)) {
                self.Gamestart();
           
        }

        //每當新增玩家的時候，傳遞資料給client
        self.UpdateRoomInfo(); //
        self.UpdatePlayerInfo();
        self.Updatetimer();

       
    };
    */

    // 滿五人才開始
    AddPlayer(uid) {

        for (var i = 0; i < 5; i++) { // 這裡設定最多幾人(牛牛要5人)
            if (this.room.players[i] == null) {
                this.room.players[i] = uid; // 房間自己也有紀錄，誰進了房間(用玩家名子紀錄)
                global.players[uid].room.playerIndex = i; // 0 or 1 or 2
                break;
            }
        }

        global.players[uid].room.id = this.room.id;
        global.players[uid].room.Inroom = true;
        console.log(uid, ' is in room ', global.players[uid].room.id);

        var self = this;
        // 當玩家滿5人自動開始
        if ((this.room.players[0] != null) && (this.room.players[1] != null) && (this.room.players[2] != null) && (this.room.players[3] != null) && (this.room.players[4] != null)) {
            self.Gamestart();

        }

        //每當新增玩家的時候，傳遞資料給client
        self.UpdateRoomInfo();
        self.UpdatePlayerInfo();
        self.Updatetimer();


    };

    //移除房間的玩家
    RemovePlayer(uid) {


     
        if (this.game.timer.stage == GameStep.Result) {
            this.room.players[global.players[uid].room.playerIndex] = null;
            global.players[uid].room.Inroom = false;
    
        } else if (this.game.timer.stage != GameStep.Waiting) {
            global.players[uid].IsAI = true; 
        }
        else {
            this.room.players[global.players[uid].room.playerIndex] = null;
           
            global.players[uid].room.Inroom = false;
            this.UpdatePlayerInfo();
        }

        var self = this;
        if ((this.room.players[0] == null) && (this.room.players[1] == null) && (this.room.players[2] == null)) {
            setTimeout(function () {
                self.GameStop();
            },500);
        }

    };

/*    //UpdateRoomInfo(三人)
    //更新房間的資訊
    UpdateRoomInfo() {
        for (var i = 0; i < 3; i++) {
            if (this.room.players[i] != null) {
                //傳資料給每個player的sokcet
                global.players[this.room.players[i]].socket.emit('roomInfo', dataManager.room(this));
                //global.players[玩家名子].socket.emit
            }
        }

    }*/

    UpdateRoomInfo() {
        for (var i = 0; i < 5; i++) {
            if (this.room.players[i] != null) {
                //傳資料給每個player的sokcet
                global.players[this.room.players[i]].socket.emit('roomInfo', dataManager.room(this));
                //global.players[玩家名子].socket.emit
            }
        }

    }

/*    //UpdatePlayerInfo(三人)
    //更新玩家資訊
    UpdatePlayerInfo() {
        for (var i = 1; i < 4; i++) {
            if (this.room.players[i % 3] != null) {
                //傳資料給個player的sokcet
                global.players[this.room.players[i % 3]].socket.emit('playerInfo', dataManager.player(this.room, i));
            }
        }
    }*/

    UpdatePlayerInfo() {
        for (var i = 2; i < 7; i++) { // 在dataManager計算時最多-2不能讓他小於0
            if (this.room.players[i % 5] != null) {
                //傳資料給個player的sokcet
                global.players[this.room.players[i % 5]].socket.emit('playerInfo', dataManager.player(this.room, i));
            }
        }
    }

/*    //Updatetimer(三人)
    //向client端傳送倒數計時的資料
    Updatetimer(cleanUp = false) {
        for (var i = 0; i < 3; i++) {
            if (this.room.players[i] != null) {
                //傳資料給每個player的sokcet
                global.players[this.room.players[i]].socket.emit('timer', dataManager.timer(this.game, i, cleanUp));
            }
        }

    }*/

    Updatetimer(cleanUp = false) {
        for (var i = 0; i < 5; i++) {
            if (this.room.players[i] != null) {
                //傳資料給每個player的sokcet
                global.players[this.room.players[i]].socket.emit('timer', dataManager.timer(this.game, i, cleanUp));
            }
        }

    }


/*    //UpdateCardsInfo(三人)
    //更新牌組的資訊
    UpdateCardsInfo(cards) {

        for (var i = 1; i < 4; i++) {
            if (this.room.players[i % 3] != null) {
                //傳資料給個player的sokcet
                global.players[this.room.players[i % 3]].socket.emit('GetCards', cards(this.game, i));
            }
        }

    }*/

    //更新牌組的資訊
    UpdateCardsInfo(cards) { // (dataManager.cards)

        for (var i = 2; i < 7; i++) {
            if (this.room.players[i % 5] != null) {
                //傳資料給個player的sokcet
                global.players[this.room.players[i % 5]].socket.emit('GetCards', cards(this.game, i));
            }
        }

    }

    UpdateDealerInfo() { // (dataManager.cards)

        for (var i = 2; i < 7; i++) {
            if (this.room.players[i % 5] != null) {
                //傳資料給個player的sokcet
                global.players[this.room.players[i % 5]].socket.emit('GetDealer', dataManager.cards(this.game, i));
            }
        }

    }

    UpdateBetInfo(){
        for (var i = 2; i < 7; i++) {
            if (this.room.players[i % 5] != null) {
                //傳資料給個player的sokcet
                global.players[this.room.players[i % 5]].socket.emit('GetBet', dataManager.cards(this.game, i));
            }
        }

    }



    //開始遊戲
/*    Gamestart() {

        var self = this;
        var GamingObj = this.game;
        var Gamingtimer = this.game.timer;

        //當遊戲一開始時初始化出牌起頭人,跟倒數的秒數

        if (Gamingtimer.stage === GameStep.Waiting) {
            DoDizhuRule.ConfigCard(self.game.CardsConfig); //發牌
            self.UpdateRoomInfo();
            self.game.timer.stage++; // 走到gameStart Stage
            self.WaitForAnimations("gameStart", AnimationDelay.GameStart, function () {
                self.UpdateCardsInfo(dataManager.cards);//把牌面傳給client
                self.game.timer.stage++;
                self.UpdateRoomInfo();
            });// 等待delay秒後，進到下一個階段

        }

        self.Updatetimer(); //更新client的timer資訊

        if (Gamingtimer.timer != null)
            clearInterval(Gamingtimer.timer); // js寫好的，暫停timer

        Gamingtimer.timer = setInterval(function () { //將interval儲存,用於停止interval

            Gamingtimer.countdown--;  //開始倒數計時


            //託管自動出牌

            if (global.players[self.room.players[self.game.timer.whosTurn]] != null) {
                if (self.game.timer.stage == GameStep.PersonalDouble) {
                    
                    if (global.players[self.room.players[0]].IsAI) {
                        self.callDouble(global.players[self.room.players[0]].uid, 1);                        
                    }
                    if (global.players[self.room.players[1]].IsAI) {
                        self.callDouble(global.players[self.room.players[1]].uid, 1);
                    }
                    if (global.players[self.room.players[2]].IsAI) {
                        self.callDouble(global.players[self.room.players[2]].uid, 1);                      
                    }
                    
                }
                else if (global.players[self.room.players[self.game.timer.whosTurn]].IsAI) {
                    if (self.game.timer.stage == GameStep.callDizhu) {
                        var point = Math.round(Math.random() * 10) % 2;
                        if (point == 0)
                            self.callDizhu("call");
                        else
                            self.callDizhu("notCall");
                    }
                    else if (self.game.timer.stage == GameStep.RaiseDizhu) {
                        var point = Math.round(Math.random() * 10) % 2;

                        if (point == 0)
                            self.callDizhu("Raise");
                        else
                            self.callDizhu("notRaise");
                    }
                    else if (self.game.timer.stage == GameStep.Playing) {
                        var HintCards = findtype.GetAllType(self.game.CardsConfig.cards[self.game.timer.whosTurn], self.game.CardsConfig.current[self.game.CardsConfig.who]);

                        if ((typeof (HintCards) == "undefined") || (HintCards.length == 0))
                            self.skipthisTurn();
                        else {

                            var longest = HintCards[0];
                            for (var i = 1; i < HintCards.length; i++) {
                                if (typeof (HintCards[i]) == "undefined") break;
                                if (HintCards[i].length > longest.length) {
                                    longest = HintCards[i];
                                }
                            }
                            self.GetCards(longest);
                        }
                    }
                    else if (self.game.timer.stage == GameStep.choseLaiziCard) {
                        if (self.Laizi.Possibles != null) {
                            self.GetCards(0);
                        }
                    }
                 
                }
            }



            if (Gamingtimer.countdown == 0) {   //當數道零換下一位玩家
                self.skipthisTurn();
                return;
            }

            self.Updatetimer(); //更新client的timer資訊

        }, 1000); //每1000ms觸發一次(秒)

    }*/

    Gamestart() {

        var self = this;
        var GamingObj = this.game;
        var Gamingtimer = this.game.timer;

        //當遊戲一開始時初始化出牌起頭人,跟倒數的秒數

        if (Gamingtimer.stage === GameStep.Waiting) {

            self.game.timer.stage++; // 走到gameStart Stage

            self.WaitForAnimations("gameStart", AnimationDelay.GameStart, function () {
                self.UpdateCardsInfo(dataManager.cards);//把牌面傳給client
                self.game.timer.stage++; // 走到搶莊
                Gamingtimer.countdown = countDownSecond; // 倒數時間設回5秒
                self.UpdateRoomInfo();
            });// 等待delay秒後，進到下一個階段
        }

        self.Updatetimer(); //更新client的timer資訊

        if (Gamingtimer.timer != null) // 如果還已經有設定好timer每幾秒鐘要做什麼，要重設
            clearInterval(Gamingtimer.timer); // js寫好的，暫停timer

        // 這裡是每次每次timer要做什麼事情
        Gamingtimer.timer = setInterval(function () { //將interval儲存,用於停止interval

            Gamingtimer.countdown--;  //開始倒數計時


            //託管自動出牌

            /*if (global.players[self.room.players[self.game.timer.whosTurn]] != null) {
                if (self.game.timer.stage == GameStep.PersonalDouble) {

                    if (global.players[self.room.players[0]].IsAI) {
                        self.callDouble(global.players[self.room.players[0]].uid, 1);
                    }
                    if (global.players[self.room.players[1]].IsAI) {
                        self.callDouble(global.players[self.room.players[1]].uid, 1);
                    }
                    if (global.players[self.room.players[2]].IsAI) {
                        self.callDouble(global.players[self.room.players[2]].uid, 1);
                    }

                }
                else if (global.players[self.room.players[self.game.timer.whosTurn]].IsAI) {
                    if (self.game.timer.stage == GameStep.callDizhu) {
                        var point = Math.round(Math.random() * 10) % 2;
                        if (point == 0)
                            self.callDizhu("call");
                        else
                            self.callDizhu("notCall");
                    }
                    else if (self.game.timer.stage == GameStep.RaiseDizhu) {
                        var point = Math.round(Math.random() * 10) % 2;

                        if (point == 0)
                            self.callDizhu("Raise");
                        else
                            self.callDizhu("notRaise");
                    }
                    else if (self.game.timer.stage == GameStep.Playing) {
                        var HintCards = findtype.GetAllType(self.game.CardsConfig.cards[self.game.timer.whosTurn], self.game.CardsConfig.current[self.game.CardsConfig.who]);

                        if ((typeof (HintCards) == "undefined") || (HintCards.length == 0))
                            self.skipthisTurn();
                        else {

                            var longest = HintCards[0];
                            for (var i = 1; i < HintCards.length; i++) {
                                if (typeof (HintCards[i]) == "undefined") break;
                                if (HintCards[i].length > longest.length) {
                                    longest = HintCards[i];
                                }
                            }
                            self.GetCards(longest);
                        }
                    }
                    else if (self.game.timer.stage == GameStep.choseLaiziCard) {
                        if (self.Laizi.Possibles != null) {
                            self.GetCards(0);
                        }
                    }

                }
            }*/



            if (Gamingtimer.countdown === 0) {   //當數到零換下一階段

                if(Gamingtimer.stage === GameStep.callDizhu){ // 是搶莊的終點

                    for(let i = 0 ; i < 5 ; i++){ // 看誰沒選，幫他填值
                        if(GamingObj.CardsConfig.current[i] == -1 ){ // 有人超時沒選
                            GamingObj.CardsConfig.current[i] = 0; // 視同不搶(短期紀錄)
                            GamingObj.result.playerChosenOdds[i] = 0; // 視同不搶(長期紀錄)
                        }
                        console.log("seat%d dealer : %d", i, GamingObj.CardsConfig.current[i]);
                    }


                    GamingObj.CardsConfig.dizhuIndex = 0;
                    for(let i =  1; i < 5 ; i++){ // 看誰是莊家(我沒寫如果一樣就比金錢)
                        if(GamingObj.CardsConfig.current[i] >= GamingObj.CardsConfig.current[GamingObj.CardsConfig.dizhuIndex]){
                            GamingObj.CardsConfig.dizhuIndex = i;
                        }
                    }

                    GamingObj.result.dizhuIndex = GamingObj.CardsConfig.dizhuIndex;

                    // self.UpdateCardsInfo(dataManager.cards); // 傳輸資料給所有玩家
                    self.UpdateDealerInfo(); // 傳輸資料給所有玩家

                    cleanup = true;
                    self.WaitForAnimations("dealer", AnimationDelay.GameStart, function () {
                        self.game.timer.stage++; // 走到押注
                        Gamingtimer.countdown = countDownSecond; // 倒數時間設回5秒
                        cleanup = false;
                        self.ResetCardConfig();
                        self.UpdateCardsInfo(dataManager.cards); // 讓CardManager知道要結束顯示
                    });// 等待delay秒後，進到下一個階段


                }

                if(Gamingtimer.stage === GameStep.PersonalDouble){
                    for(let i = 0 ; i < 5 ; i++){ // 看誰沒選，幫他填值
                        if(GamingObj.CardsConfig.current[i] == -1 ){ // 有人超時沒選
                            GamingObj.CardsConfig.current[i] = 3; // 視同不搶(短期紀錄)
                            GamingObj.result.personalOdds[i] = 3; // 視同不搶(長期紀錄)
                        }
                        console.log("seat%d bet: %d",i ,GamingObj.CardsConfig.current[i]);
                    }

                    self.UpdateBetInfo();

                    cleanup = true;
                    self.WaitForAnimations("bet", AnimationDelay.GameStart, function () {
                        self.game.timer.stage++; // 走到押注
                        Gamingtimer.countdown = 12; // 倒數時間設回5秒
                        cleanup = false;
                        self.ResetCardConfig();
                        self.UpdateCardsInfo(dataManager.cards); // 讓CardManager知道要結束顯示
                        self.dealCard();
                        self.UpdateCardsInfo(dataManager.cards);
                    });// 等待delay秒後，進到下一個階段
                }

                if(Gamingtimer.stage === GameStep.Playing){ //當playing階段結束時
                    console.log("enter playing finished");
                    cleanup = true;
                    self.Updatetimer(cleanup);
                    GamingObj.CardsConfig.dizhuIndex = GamingObj.result.dizhuIndex;
                    console.log("dizhuIndex = %d", GamingObj.CardsConfig.dizhuIndex);
                    self.setCardType();
                    GamingObj.CardsConfig.current[GamingObj.result.dizhuIndex] = GamingObj.result.playerChosenOdds[GamingObj.result.dizhuIndex];
                    self.UpdateCardsInfo(dataManager.cards);
                    self.game.timer.stage++;
                    Gamingtimer.countdown = 12;
                }

                if(Gamingtimer.stage === GameStep.Result){
                    self.WaitForAnimations("result", AnimationDelay.result, function () {
                        self.game.timer.stage++; // 走到continue
                        Gamingtimer.countdown = 60; // 倒數時間設回5秒
                        cleanup = false;
                        self.ResetCardConfig();
                        self.UpdateCardsInfo(dataManager.cards); // 讓CardManager知道要結束顯示
                    });// 等待delay秒後，進到下一個階段
                }

                if(Gamingtimer.stage === GameStep.Continue){

                }
                //self.skipthisTurn();
                //return;

            }

            self.Updatetimer(cleanup); //最後一起更新client的timer資訊

        }, 1000); //每1000ms觸發一次(秒)

    }

    ResetCardConfig(){
        let gameCardConfig = this.game.CardsConfig;
        gameCardConfig.dizhuIndex = -1;
        //gameCardConfig.current = [[-1], [-1], [-1], [-1], [-1]];
        gameCardConfig.current = [-1, -1, -1, -1, -1];
        gameCardConfig.cards = [[-1], [-1], [-1], [-1], [-1]];
    }

    dealCard(){
        var self = this.game;

        // 1st card ： 牛六 jqk79
        self.CardsConfig.cards[0][0] = { // j 陶
            showTxt: cardNo[10],
            showType: pokerCardType["spade"],
            NO: 1
        };
        self.CardsConfig.cards[0][1] = { // q 心
            showTxt: cardNo[11],
            showType: pokerCardType["hearts"],
            NO: 2
        };
        self.CardsConfig.cards[0][2] = { // k 方
            showTxt: cardNo[12],
            showType: pokerCardType["redslice"],
            NO: 3
        };
        self.CardsConfig.cards[0][3] = { // 7 梅
            showTxt: cardNo[6],
            showType: pokerCardType["blackberry"],
            NO: 4
        };
        self.CardsConfig.cards[0][4] = { // 9 陶
            showTxt: cardNo[8],
            showType: pokerCardType["spade"],
            NO: 5
        };

        //2nd card ： 金牛jqkjq
        self.CardsConfig.cards[1][0] = { // j 心
            showTxt: cardNo[10],
            showType: pokerCardType["hearts"],
            NO: 1
        };
        self.CardsConfig.cards[1][1] = { // q 陶
            showTxt: cardNo[11],
            showType: pokerCardType["spade"],
            NO: 2
        };
        self.CardsConfig.cards[1][2] = { // k 梅
            showTxt: cardNo[12],
            showType: pokerCardType["blackberry"],
            NO: 3
        };
        self.CardsConfig.cards[1][3] = { // j 梅
            showTxt: cardNo[10],
            showType: pokerCardType["blackberry"],
            NO: 4
        };
        self.CardsConfig.cards[1][4] = { // q 梅
            showTxt: cardNo[11],
            showType: pokerCardType["blackberry"],
            NO: 5
        };

        //3rd card ： 炸彈，33336
        self.CardsConfig.cards[2][0] = {
            showTxt: cardNo[2],
            showType: pokerCardType["spade"],
            NO: 1
        };
        self.CardsConfig.cards[2][1] = {
            showTxt: cardNo[2],
            showType: pokerCardType["hearts"],
            NO: 2
        };
        self.CardsConfig.cards[2][2] = {
            showTxt: cardNo[2],
            showType: pokerCardType["redslice"],
            NO: 3
        };
        self.CardsConfig.cards[2][3] = {
            showTxt: cardNo[2],
            showType: pokerCardType["blackberry"],
            NO: 4
        };
        self.CardsConfig.cards[2][4] = {
            showTxt: cardNo[5],
            showType: pokerCardType["spade"],
            NO: 5
        };

        // 4th card：A2222，五小牛
        self.CardsConfig.cards[3][0] = {
                showTxt: cardNo[1],
                showType: pokerCardType["spade"],
                NO: 1
            };
        self.CardsConfig.cards[3][1] = {
            showTxt: cardNo[1],
            showType: pokerCardType["hearts"],
            NO: 2
        };
        self.CardsConfig.cards[3][2] = {
            showTxt: cardNo[1],
            showType: pokerCardType["redslice"],
            NO: 3
        };
        self.CardsConfig.cards[3][3] = {
            showTxt: cardNo[1],
            showType: pokerCardType["blackberry"],
            NO: 4
        };
        self.CardsConfig.cards[3][4] = {
            showTxt: cardNo[0],
            showType: pokerCardType["spade"],
            NO: 5
        };

        // 5th card：JQKK10
        self.CardsConfig.cards[4][0] = {
            showTxt: cardNo[10],
            showType: pokerCardType["redslice"],
            NO: 1
        };
        self.CardsConfig.cards[4][1] = {
            showTxt: cardNo[11],
            showType: pokerCardType["redslice"],
            NO: 2
        };
        self.CardsConfig.cards[4][2] = {
            showTxt: cardNo[12],
            showType: pokerCardType["hearts"],
            NO: 3
        };
        self.CardsConfig.cards[4][3] = {
            showTxt: cardNo[12],
            showType: pokerCardType["spade"],
            NO: 4
        };
        self.CardsConfig.cards[4][4] = {
            showTxt: cardNo[9],
            showType: pokerCardType["spade"],
            NO: 5
        };

        self.CardsConfig.current = self.result.personalOdds;
    }

    setCardType(){
        var self = this.game;
        self.CardsConfig.cardType[0] = 6;
        self.CardsConfig.cardType[1] = 12;
        self.CardsConfig.cardType[2] = 13;
        self.CardsConfig.cardType[3] = 14;
        self.CardsConfig.cardType[4] = 11;
    }
    //清除timer,game資訊
    GameStop(update = true) {
        this.ResetTimer();
        this.ResetGame();

        if (update) {
            this.Updatetimer();
            this.UpdateCardsInfo(dataManager.clearCards);
            this.UpdateRoomInfo();
        }
    }

    /*    //暫停等待某秒數後做func:After(三人)
     WaitForAnimations(Animation, delaySecond, After) {

            var self = this;
            this.GamePause();


            for (var i = 0; i < 3; i++) {
                if (this.room.players[i] != null) {
                    //傳資料給個player的sokcet

                    //順子特效在每個人的位置，其餘特效都在場中央
                    if (Animation == "straight") {
                        switch (self.game.timer.whosTurn - i) {
                            case 1:
                            case -2:
                                global.players[this.room.players[i]].socket.emit('Animation', Animation, "Next");
                                break;
                            case 0:
                                global.players[this.room.players[i]].socket.emit('Animation', Animation, "Me");
                                break;
                            case -1:
                            case 2:
                                global.players[this.room.players[i]].socket.emit('Animation', Animation, "Pre");
                                break;
                        }
                    }
                    else {
                        global.players[this.room.players[i]].socket.emit('Animation', Animation, "Me");
                    }

                }
            }

            //表演完接著做的function
            //setTimeout是js寫好的func，delaySecond之後要做function()
            setTimeout(function () {

                if (typeof (After) != "undefined") {
                    After();
                }
                self.Gamestart();

            }, delaySecond, After);
        }*/

    //暫停等待某秒數後做func:After
    WaitForAnimations(Animation, delaySecond, After) {

        var self = this;
        this.GamePause(); // 遊戲先暫停

        //確認特效所在位置

        for (var i = 0; i < 5; i++) { // 傳播放animation的指令給client
            if (this.room.players[i] != null) {
                //傳資料給個player的sokcet

                /*//順子特效在每個人的位置，其餘特效都在場中央
                if (Animation == "straight") {
                    switch (self.game.timer.whosTurn - i) {
                        case 1:
                        case -2:
                            global.players[this.room.players[i]].socket.emit('Animation', Animation, "Next");
                            break;
                        case 0:
                            global.players[this.room.players[i]].socket.emit('Animation', Animation, "Me");
                            break;
                        case -1:
                        case 2:
                            global.players[this.room.players[i]].socket.emit('Animation', Animation, "Pre");
                            break;
                    }
                }
                else
                    global.players[this.room.players[i]].socket.emit('Animation', Animation, "Me");
                }*/

                global.players[this.room.players[i]].socket.emit('Animation', Animation, "Me");

            }
        }

        //表演完接著做的function
        //setTimeout是js寫好的func，delaySecond之後要做function()
        setTimeout(function () {

            if (typeof (After) != "undefined") {
                After();
            }
            self.Gamestart(); // After是undefined，遊戲重啟

        }, delaySecond, After);
    }

    //清除timer但不重設目前計數資料
    GamePause() {
        clearInterval(this.game.timer.timer); // 暫停
        this.Updatetimer(true);
    }

    dealerButton(playerid, factor){
        //依名字找出對應的player Socket
        let playerIndex = 0;
        for (playerIndex = 0; playerIndex < 5; playerIndex++)
            if (global.players[this.room.players[playerIndex]].uid == playerid) break;

        this.game.CardsConfig.current[playerIndex] = factor; // 將玩家所搶的莊倍數填入目前牌型中
        this.game.result.playerChosenOdds[playerIndex] = factor; // 將玩家所搶的莊倍數填入結果紀錄中

        console.log("dealer button was called");
    }

    betButton(playerid, factor){
        //依名字找出對應的player Socket
        let playerIndex = 0;
        for (playerIndex = 0; playerIndex < 5; playerIndex++)
            if (global.players[this.room.players[playerIndex]].uid == playerid) break;

        this.game.CardsConfig.current[playerIndex] = factor * 3; // 將玩家所搶的莊倍數填入目前牌型中
        this.game.result.personalOdds[playerIndex] = factor * 3; // 將玩家所搶的莊倍數填入結果紀錄中

        console.log("bet button was called(pressed by client)");
    }
    //===========================================================
    //這裡是鬥地主區域
    //===========================================================
    //跳過這個回合
    skipthisTurn() {


        if ((this.game.timer.stage == GameStep.choseLaiziCard)) {

            if (this.Laizi.Possibles != null) {
                this.GetCards(0);
                return
            }
            this.game.timer.stage = GameStep.Playing;

        }
        //加倍階段大家都加倍了就跳過
        else if (this.game.timer.stage == GameStep.PersonalDouble) {
            for (var i = 0; i < 3; i++) {
                if (this.game.result.personalOdds[i] == -1) {
                    this.callDouble(global.players[this.room.players[i]].uid, 1);
                }
            }
            return;
        }
        //叫分階段要切換到下一個玩家前的自動不叫
        else if ((this.game.result.playerChosenOdds[this.game.timer.whosTurn] == -1) && (JSON.stringify(this.game.CardsConfig.current[this.game.timer.whosTurn]) == JSON.stringify([]))) {
            if (this.game.timer.stage == GameStep.callDizhu)
                this.callDizhu("notCall");
            else if (this.game.timer.stage == GameStep.RaiseDizhu)
                this.callDizhu("notRaise");

            return;
        }
        //出牌階段要切換到下一個玩家前的自動出牌
        else if ((this.game.timer.stage == GameStep.Playing) && (JSON.stringify(this.game.CardsConfig.current[this.game.timer.whosTurn]) == JSON.stringify([]))) {

            var AutoChoseCard = DoDizhuRule.AutoSubmitCard(
                this.game.CardsConfig.current[this.game.CardsConfig.who],
                this.game.CardsConfig.cards[this.game.timer.whosTurn],
                this.game.timer.whosTurn == this.game.CardsConfig.who);


            this.GetCards(AutoChoseCard);

            if (AutoChoseCard != "PASS")
                return;
        }
        //自動退出遊戲
        else if (this.game.timer.stage == GameStep.Result) {
            var self = this;

            this.room.players.forEach(function (playerindex, index) {

                var player = global.players[playerindex]

                if (player == null) return;

                if (player.room.id == self.room.id) {
                    player.Inroom = false;
                    player.socket.emit("SwitchScene", 0);
                    delete global.players[playerindex];
                }

                self.room.players[index] = null;

            });
            self.GameStop();
        }

        //輪到下一個玩家
        this.game.timer.whosTurn++;
        if (this.game.timer.whosTurn > 2) this.game.timer.whosTurn = 0;
        this.game.timer.countdown = countDownSecond;
        this.game.CardsConfig.current[this.game.timer.whosTurn] = [];

        //更新user端資訊
        this.Updatetimer();
        this.UpdateCardsInfo(dataManager.cards);

        //假如PASS一圈回到自己可以出任意牌
        if (this.game.timer.whosTurn == this.game.CardsConfig.who) {
            var self = this;
            //當大家都PASS時不會立即清除牌面，以防未顯示最後一個人的PASS
            self.WaitForAnimations("None", AnimationDelay.PASScard, function () {
                self.game.CardsConfig.current = [[], [], []];
                self.UpdateCardsInfo(dataManager.cards);
            });
        }
    }

    //取得這回合出牌           
    GetCards(cards) {

        var self = this;
        var legal = false;
        //回傳是文字狀態
        if (typeof (cards) == "string") {
            this.game.CardsConfig.current[this.game.timer.whosTurn] = cards;
        }
        else {

            if ((self.game.timer.stage == GameStep.Playing) && DoDizhuRule.hasLaiziCards(cards)) {

                //存入原本的牌型
                self.Laizi.origionCards = cards;
                self.Laizi.Possibles = DoDizhuRule.GetTwoPossibleCardType(cards);
                
                for (var i = 0; i < self.Laizi.Possibles.length; i++) {
                    if (DoDizhuRule.Islegal(this.game.CardsConfig.current[this.game.CardsConfig.who], self.Laizi.Possibles[i]) == true) {
                        legal = true;
                        break;
                    }
                }

                if (legal == false) {
                    global.players[this.room.players[this.game.timer.whosTurn]].socket.emit("Animation", 'illegal', "Me");
                    return;
                }

                self.game.timer.stage = GameStep.choseLaiziCard;
                self.Updatetimer();              

                global.players[self.room.players[self.game.timer.whosTurn]].socket.emit("ShowLaiziPossibleTypes", self.Laizi.Possibles);
                return;
            }

            
            //玩家所選參數換成真的牌型
            if (self.game.timer.stage == GameStep.choseLaiziCard) {
                cards = self.Laizi.Possibles[cards];
                self.Updatetimer();
            }


            //判斷是否為可以出的牌型
            legal = DoDizhuRule.Islegal(this.game.CardsConfig.current[this.game.CardsConfig.who], cards);
                          

            //可出牌
            if (legal) {

                this.game.CardsConfig.who = this.game.timer.whosTurn;
                this.game.CardsConfig.current[this.game.timer.whosTurn] = cards;
                this.game.CardsConfig.submitCardTimes[this.game.timer.whosTurn]++;
                
                //是否為炸彈/飛機/順子... 紀錄倍率跟執行動畫
                var cardAnimation = "None";
                var cardAnimationDelay = AnimationDelay.None;
                switch (DoDizhuRule.CardType(cards)) {
                    case 12:
                        cardAnimation = "rocket";
                        cardAnimationDelay = AnimationDelay.rocket;
                        this.game.result.log.rocket *= 2;
                        this.game.result.Odds *= 2;
                        this.UpdateRoomInfo();
                        break;
                    case 6:
                        cardAnimation = "straight";
                        cardAnimationDelay = AnimationDelay.straigth;
                        break;
                    case 11:
                        cardAnimation = "bomb";
                        cardAnimationDelay = AnimationDelay.bomb;
                        this.game.result.log.bomb *= 2;
                        this.game.result.Odds *= 2;
                        this.UpdateRoomInfo();
                        break;

                }

                //清除癩子牌原本的樣子
                if (self.game.timer.stage == GameStep.choseLaiziCard) {
                    cards = self.Laizi.origionCards.slice(0, 20);
                    self.Laizi.Possibles = null;
                }
                self.RemoveCardsFromDeck(self.game.CardsConfig.cards[self.game.timer.whosTurn], cards)


                self.UpdateCardsInfo(dataManager.cards);
                this.WaitForAnimations(cardAnimation, cardAnimationDelay, function () {

                    //判斷是否結束遊戲
                    if (self.game.CardsConfig.cards[self.game.timer.whosTurn].length == 0) {
                       
                        //地主贏嗎
                        var DizhuWin = (JSON.stringify(self.game.timer.whosTurn) == JSON.stringify(self.game.CardsConfig.dizhuIndex));

                        //判定春天或返春
                        if (DizhuWin) {

                            //春天:農民一張牌未出

                            var SubmitCardstimesEqZero = 0;
                            for (var i = 0; i < 3; i++) {
                                if (self.game.CardsConfig.submitCardTimes[i] == 0)
                                    SubmitCardstimesEqZero++;
                            }

                            if (SubmitCardstimesEqZero == 2) {
                                self.game.result.Odds *= 3;
                                self.game.result.log.RSpring *= 3;;
                                self.WaitForAnimations("spring", AnimationDelay.Spring, function () {
                                    self.showGameResult();
                                });
                            } else {
                                self.WaitForAnimations("None", AnimationDelay.PASScard, function () {
                                    self.showGameResult();
                                });
                            }
                        }
                        else {
                            //反春:地主只出第一手牌
                            if (self.game.CardsConfig.submitCardTimes[self.game.CardsConfig.dizhuIndex] == 1) {
                                self.game.result.Odds *= 3;
                                self.game.result.log.RSpring *= 3;
                                self.WaitForAnimations("Rspring", AnimationDelay.reverseSpring, function () {
                                    self.showGameResult();
                                });
                            }
                            else {
                                self.WaitForAnimations("None", AnimationDelay.PASScard, function () {
                                    self.showGameResult();
                                });
                            }
                        }
                    }
                    self.skipthisTurn();
                });


            }
            else {
                global.players[this.room.players[this.game.timer.whosTurn]].socket.emit("Animation", 'illegal', "Me");
            }
        }
    }

    //農民/地主加倍
    callDouble(playerid, factor) {

        //依名字找出對應的player Socket
        var playerIndex = 0;
        for (playerIndex = 0; playerIndex < 3; playerIndex++)
            if (global.players[this.room.players[playerIndex]].uid == playerid) break;

        //設定結算倍率
        this.game.result.personalOdds[playerIndex] = factor;
        this.game.timer.whosTurn = playerIndex;

        //根據玩家是地主或農民顯示動畫
        if (factor == 2) {
            this.GetCards("Double");
            this.UpdateCardsInfo(dataManager.cards);
            this.Updatetimer();
            global.players[this.room.players[playerIndex]].socket.emit("Animation", playerIndex == this.game.CardsConfig.dizhuIndex ? "dizhuDouble" : "farmerDouble", "Me");

        }
        else if (factor == 1) {
            this.GetCards("notDouble");
            this.Updatetimer();
            this.UpdateCardsInfo(dataManager.cards);
        }

        //檢查是否都叫過了
        var allCall = true;
        for (var i = 0; i < 3; i++) {
            if (this.game.result.personalOdds[i] == -1) {
                allCall = false;
            }
        }

        if (allCall) {
            this.game.timer.stage++;
            this.game.timer.countdown = countDownSecond;
            this.game.timer.whosTurn = this.game.CardsConfig.dizhuIndex;
            this.game.CardsConfig.who = this.game.CardsConfig.dizhuIndex;

            this.game.CardsConfig.current = [[], [], []];

            var self = this;
            this.WaitForAnimations("AddDizhuCard", 500, function () {
                self.UpdateCardsInfo(dataManager.cards);

            });
        }

    }

    //遊戲結算
    showGameResult() {

        var self = this;
                
        var DizhuWin = (JSON.stringify(self.game.CardsConfig.dizhuIndex) == JSON.stringify(self.game.CardsConfig.who));
        self.game.timer.stage = GameStep.Result;
        self.Updatetimer();

        self.room.players.forEach(function (playerindex, index) {

            global.players[playerindex].socket.emit("ResultMessage", {
                whoWin:(DizhuWin == true) ? "dizhuWin" : "farmerWin",
                odds: {
                    dizhu: "地主 x " + self.game.result.log.dizhu * (index == self.game.CardsConfig.dizhuIndex ? 2 : 1),
                    bomb: "炸彈 x " + self.game.result.log.bomb,
                    rocket: "火箭 x " + self.game.result.log.rocket,
                    RSpring: "春天/返春 x " + self.game.result.log.RSpring,
                },
                remainCards: {
                    player1: {
                        name: global.players[self.room.players[(self.game.CardsConfig.who + 1) % 3]].uid + (((self.game.CardsConfig.who + 1) % 3) == self.game.CardsConfig.dizhuIndex ? "(地主)" : "(農民)"),
                        card1stRow: self.game.CardsConfig.cards[(self.game.CardsConfig.who + 1) % 3].slice(0, 10),
                        card2ndRow: self.game.CardsConfig.cards[(self.game.CardsConfig.who + 1) % 3].slice(10, 20),
                    },
                    player2: {
                        name: global.players[self.room.players[(self.game.CardsConfig.who + 2) % 3]].uid + (((self.game.CardsConfig.who + 2) % 3) == self.game.CardsConfig.dizhuIndex ? "(地主)" : "(農民)"),
                        card1stRow: self.game.CardsConfig.cards[(self.game.CardsConfig.who + 2) % 3].slice(0, 10),
                        card2ndRow: self.game.CardsConfig.cards[(self.game.CardsConfig.who + 2) % 3].slice(10, 20),
                    }
                },
                Personalodds: {
                    player1: {
                        personalDouble: (self.game.result.personalOdds[0] == 2) ? true : false,
                        name: global.players[self.room.players[0]].uid + (0 == self.game.CardsConfig.dizhuIndex ? "(地主)" : "(農民)"),
                        points: "1.00",
                        IsMe: (index == 0),
                    },
                    player2: {
                        personalDouble: (self.game.result.personalOdds[1] == 2) ? true : false,
                        name: global.players[self.room.players[1]].uid + (1 == self.game.CardsConfig.dizhuIndex ? "(地主)" : "(農民)"),
                        points: "2",
                        IsMe: (index == 1),
                    }, player3: {
                        personalDouble: (self.game.result.personalOdds[2] == 2) ? true : false,
                        name: global.players[self.room.players[2]].uid + (2 == self.game.CardsConfig.dizhuIndex ? "(地主)" : "(農民)"),
                        points: "-50",
                        IsMe: (index == 2),
                    },
                },
                timer: "20"
            });

        });

    }

    //搶地主時依照叫分設定:notcall/notRaise
    callDizhu(factor) {
        var self = this;
        var called = false;

        if ((factor == "notCall")) {
            this.game.CardsConfig.who = this.game.timer.whosTurn;
            this.game.result.playerChosenOdds[this.game.timer.whosTurn] = 0;
        }
        else if ((factor == "notRaise")) {
            this.game.CardsConfig.who = this.game.timer.whosTurn;
            this.game.result.playerChosenOdds[this.game.timer.whosTurn] = 0;

            //都不raise的話
            //就直接當地主 自己不能在raise
            var countNotRaise = 0;
            for (var i = 0; i < 3; i++) {
                if (this.game.result.playerChosenOdds[i] == 0)
                    countNotRaise++;
            }           
            if (countNotRaise == 2)
                for (var i = 0; i < 3; i++) {
                    this.game.result.playerChosenOdds[i] = 0;
                }

        }
        else if (factor == "call") {
            this.game.result.Odds = BASE_ODDS;
            this.game.CardsConfig.dizhuIndex = this.game.timer.whosTurn;
            this.game.CardsConfig.who = this.game.timer.whosTurn;
            this.game.result.playerChosenOdds[this.game.timer.whosTurn] = 0;

            called = true;
        }
        else if (factor == "Raise") {
            this.game.result.Odds *= 2;
            this.game.CardsConfig.dizhuIndex = this.game.timer.whosTurn;
            this.game.result.playerChosenOdds[this.game.timer.whosTurn] = 0;
        }

        this.GetCards(factor);

        //檢查是否每個人都叫分了
        var allcall = true;
        for (var i = 0; i < 3; i++) {
            if (this.game.result.playerChosenOdds[i] == -1)
                allcall = false;

        }

        this.UpdateRoomInfo();

        if (this.game.timer.stage == GameStep.callDizhu) {

            if (called) {
                this.game.result.playerChosenOdds[0] = -1;
                this.game.result.playerChosenOdds[1] = -1;
                this.game.result.playerChosenOdds[2] = -1;
                this.game.timer.stage = GameStep.RaiseDizhu;
                this.skipthisTurn();
            }
            else if (allcall) {
                //大家都不叫分
                this.UpdateCardsInfo(dataManager.cards);
                this.WaitForAnimations("None", AnimationDelay.PASScard, function () {
                    self.GameStop();
                    self.Gamestart();
                });
            }
            else {
                this.skipthisTurn();
            }

        }
        else if (this.game.timer.stage == GameStep.RaiseDizhu) {

            if (allcall) {

                this.game.result.log.dizhu = this.game.result.Odds;
                //初始化計數器 進入出牌階段
                this.game.timer.countdown = countDownSecond;
                this.game.timer.whosTurn = this.game.CardsConfig.dizhuIndex;
                this.game.CardsConfig.who = this.game.CardsConfig.dizhuIndex;

                //初始化地主:加手牌,升倍率                   
                this.game.timer.stage = GameStep.PersonalDouble;
               
                //叫完地主顯示第一張癩子牌
                var LaiZinumber = (Math.round(Math.random() * 10) % 13) + 1;
                var Animation = "laizi" + CardUtil.Card[LaiZinumber];

                self.UpdateCardsInfo(dataManager.cards);
                self.game.CardsConfig.current = [[], [], []];
               

                this.WaitForAnimations("None", 500, function () {
                    self.UpdateCardsInfo(dataManager.cards);
                    

                    //新增地主牌
                    self.game.CardsConfig.cards[self.game.CardsConfig.dizhuIndex].push(self.game.CardsConfig.Dizhu[0]);
                    self.game.CardsConfig.cards[self.game.CardsConfig.dizhuIndex].push(self.game.CardsConfig.Dizhu[1]);
                    self.game.CardsConfig.cards[self.game.CardsConfig.dizhuIndex].push(self.game.CardsConfig.Dizhu[2]);
                    DoDizhuRule.sortCard(self.game.CardsConfig.cards[self.game.CardsConfig.dizhuIndex]);
                    
                    
                    self.WaitForAnimations(Animation, AnimationDelay.laizi, function () {
                        self.Updatetimer(true);
                        DoDizhuRule.setLaiZi(self.game.CardsConfig, LaiZinumber);
                        self.UpdateCardsInfo(dataManager.cards);
                       
                    });

                });


            }
            else {
                this.skipthisTurn();
            }

        }

    }

    //將牌從牌堆移除
    RemoveCardsFromDeck(deck, cards) {

        //把出出來的牌從手牌中剃除
        cards.forEach(function (card) {

            for (var i = 0; i < deck.length; i++) {
                if (JSON.stringify(deck[i]) == JSON.stringify(card)) {
                    deck.splice(i, 1);
                    break;
                }
            }

        });

    }

}


module.exports = Room;