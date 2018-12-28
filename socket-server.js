
var Socket = require("socket.io");
var global = require("./global");
var Room = require('./room');
var Player = require('./player');

const SocketServer = function (server) {

    var io = Socket(server);
    var roomList = [new Room(0)]; //已創立的房間,預設為１間

    // 當玩家連進伺服器時
    io.on("connection", function (socket) {

        try {           

            console.log("A user connection ( Socket.id: %s )", socket.id); //輸出客戶端的socketid

            // 玩家login事件,參數uid
            socket.on('login', function (uid,Success) {
               
                //------------------------------------------------------檢查ID是否被使用過    

                if (global.players.hasOwnProperty(uid) !== true) { // 沒有人註冊過的名子
                    Success(true); // SwitchScene, roomInfo, playerInfo, timer, getcards
                    //Success() is function at the client side
                    //function (Success) {
                    //
                    //    if (Success) {
                    //        global.uid = uid;
                    //        global.EventListener.fire("SwitchScene", 1);
                    //        global.socket.emit('LoadGame', global.uid);
                    //    }
                    //    else {
                    //        self.Message.string('FAILED');
                    //    }
                    //}
                    var PlayerInfo = new Player(uid, socket); // 創建一個新的player(名子、託管、頭像、socket、有無進入房間、房號、玩家在房間中序號)
                    PlayerInfo.img = (Object.keys(global.players).length) % 6; // 設定玩家頭像
                    // uid, socket, img 填值
                    /* Object.keys()，可以用來取得某個物件{}裡面所有的keys
                       (ex:物件{"a":1,"b":2,"c":3} ==>['a','b','c']     */
                    global.players[uid] = PlayerInfo; // 把該玩家資訊存到管理中心
                    availableRoom().AddPlayer(uid); // 把玩家放到有空位的房間roomList[index]，addplayer是在room.js裡面的函式，幫玩家填上他的inroom, roomid, playerIndex
                    // 寫死當一個人進房，其他四人也加入(AddPlayer：滿五人時開始)

                } else { // 有人註冊過的名子

                    if (global.players[uid].socket.disconnected === true) { // 同名使用者已離線，讓新使用者繼承該同名使用者的資料

                        Success(true);
                        global.players[uid].IsAI = false;
                        global.players[uid].socket = socket;

                    } else {
                        Success(false); //id已使用過,使用client傳來的函式告訴client該名子已被使用,並結束事件
                    }

                }


            });

            socket.on('AIswitch', function (uid,callback) {

                if (global.players[uid].IsAI === true) {
                    global.players[uid].IsAI = false;
                    callback(false);
                    //callback() is function at the client side
                    // function (IsAI) {
                    //     self.autoPlaying.active = IsAI;
                    // }
                }
                else {
                    global.players[uid].IsAI = true;
                    callback(true);
                }
               
            });

            socket.on('InRoom', function (uid,callback) {

                if (global.players[uid].room.Inroom === true) {
                    roomList[global.players[uid].room.id].RemovePlayer(uid);
                }
                availableRoom().AddPlayer(uid);
                callback(true);
            });          

            socket.on('LoadGame', function (uid) {
                roomList[global.players[uid].room.id].LoadGame(uid);
            });

            //當有socket中斷連線時檢查每個room的player中誰disconnect=true;
            socket.on('disconnect', function () {

                for (var playName in global.players) {

                    if (global.players[playName].socket.disconnected == true) {

                        if (global.players[playName].room.Inroom == true) {
                            console.log(playName + ' logout from room ' + global.players[playName].room.id);
                            roomList[global.players[playName].room.id].RemovePlayer(playName); //將玩家移出房間                        
                        } else {
                            delete global.players[playName]; //家玩家資訊從伺服器清除
                        }

                    }
                }

             
            });

            socket.on('EndMyturn', function (uid) {
                roomList[global.players[uid].room.id].skipthisTurn();
            });


            socket.on('SubmitCards', function (uid, cards) {
                roomList[global.players[uid].room.id].GetCards(cards);
            });

            socket.on('ChoseDizhu', function (uid, factor) {
                roomList[global.players[uid].room.id].callDizhu(factor);
            });

            socket.on('CallDouble', function (uid, factor) {
                roomList[global.players[uid].room.id].callDouble(uid, factor);
            });

            socket.on('dealerButton', function (uid, factor) { // 當搶莊時選定按鈕後，將結果紀錄下來，傳來的是名子、選擇幾倍
                roomList[global.players[uid].room.id].dealerButton(uid,factor);
            });
            socket.on('betButton', function (uid, factor) { // 當搶莊時選定按鈕後，將結果紀錄下來，傳來的是名子、選擇幾倍
                roomList[global.players[uid].room.id].betButton(uid,factor);
            });
        }
        catch (e) {
            console.log(e);
        }
       

    });   


    function availableRoom() {
        for (var index = 0; index < roomList.length; index++) {
            if (roomList[index].Avaiable() === true) {
                return roomList[index];
            }
            if (index === roomList.length - 1) //查到最後一房都是滿的就新開一房
            {
                roomList.push(new Room(roomList.length));
                return roomList[roomList.length - 1];                
            }
        }
    }

    function addAI(uid, socket){
        var PlayerInfo = new Player(uid, socket); // 創建一個新的player(名子、託管、頭像、socket、有無進入房間、房號、玩家在房間中序號)
        PlayerInfo.img = (Object.keys(global.players).length) % 6; // 設定玩家頭像
        global.players[uid] = PlayerInfo; // 把該玩家資訊存到管理中心
        availableRoom().AddPlayer(uid); // 把玩家放到有空位的房間roomList[index]，addplayer是在room.js裡面的函式，幫玩家填上他的inroom, roomid, playerIndex
    }

    return io;
}

module.exports = SocketServer;
