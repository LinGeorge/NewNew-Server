class Player{

    constructor(uid, socket) {
        this.uid = uid; // 玩家自己註冊的名子
        this.IsAI = false; // 有無託管
        this.img = 0; // 玩家頭像
        this.socket = socket; //
        this.room = {
            Inroom:false,
            id:null,
            playerIndex: null // 若房間內有5人，那id就是0,1,2,3,4
        } 
    }

}

module.exports = Player;