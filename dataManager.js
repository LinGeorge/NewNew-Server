
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
    timer: function (game, index, cleanUp) { // room.js.game, ���a�b�ж����y�츹�X(0-4)+5 = (5-9), �O�_���]timer
        var Info = game.timer;

        var transferData = {
            active: null, //����O�_�i��(�������@�_���)
            whosTurn: null, //�x����ܦ�m:Me,Next,Pre(�������b����), null�O�����
            countdownSecond: null, //�˼Ƭ��
        };

        if (cleanUp) // �^�Ǩ�client��null(�b��)
            return transferData;

        /*//---------------------------------------------��X�p�ƾ���ܪ���m
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

        
        //�[��/���[���q�j�a�P�ɶi��
        if (Info.stage === GameStep.PersonalDouble)
            transferData.whosTurn = "Me";*/

        // �j�a�P�ɶi��C�Ӷ��q
        transferData.whosTurn = "Me"; // �j�a�P�ɷm���B�㭿�B����B���G�Q���B�~��C��

        // ����y�X�P�ɽ��쥻�쪱�a�~��ܫ��s(�����C�Ӷ��q���O�@�_��ܡGwhosturn���Ome)
        transferData.active = transferData.whosTurn == "Me" ? Info.stage : null;

        /*// �缾�[��/���[�����a���A���button
        if ((Info.stage === GameStep.PersonalDouble) && (game.result.personalOdds[index] !== -1))
            transferData.active = null;*/

        // �˼Ƭ�Ƨ�s
        transferData.countdownSecond = Info.countdown;
      
        // �C������ܹC���}�l���q����ܺ�a�έ˼�
        if (Info.stage === GameStep.Waiting || Info.stage === GameStep.GameStart) {
            transferData.active = Info.stage;
            transferData.whosTurn = null; //
            transferData.countdownSecond=null;
        }

        // ���G���q��whosturn �O result
        if (Info.stage === GameStep.Result) {
            transferData.active = Info.stage;
            transferData.whosTurn = "Result";
        }

        return transferData;
    },    

    //I:room
    room: function (Info,index) { // (room.js, playerIndex(���a�b�ж������y�츹�X))
        
        var transferData = {
            playerPoint: null, //�ثe�I��
            currentOdds: null, //�ثe�ߤ�
            odds: null //�ߤ��߲v
        };

        if (Info.game.timer.stage != GameStep.Waiting) { // ���b���C���ɡA�~��s�I�ơB�ߤ��B���v
            transferData.playerPoint = "....";
            transferData.currentOdds = 12345;
            transferData.odds = Info.game.result.Odds;
        }

        return transferData;
    },

/*    //player(�T�H)
    //I:room.room
    player: function (Info, index) { //(room.js.room(�и��P���a��), ���a�b�ж����y�츹�X(0,1,2)+3=(3,4,5))

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

    player: function (Info, index) { //(room.js.room(�и��P���a��), ���a�b�ж����y�츹�X(0, 1, 2, 3, 4)+5=(5, 6, 7, 8, 9))

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

/*    //cards(�T�H)
    //I:room.game
    cards: function (game, index) {// room.js.game, ���a�b�ж����y�츹�X(0-4)+5 = (5-9)

        var Info = game.CardsConfig;

        var transferData = {
            DizhuCards: [], // �a�D�P
            MyCards: null, // �ڪ���P
            currentStatus: {
                Me: null,
                Pre: null,
                Next: null

            },//�ثe�P��
            PreRivalCards: 0, // �e�@�쪱�a����P��
            NextRivalCards: 0, // ��@�쪱�a����P��
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

    cards: function (game, index) {// room.js.game, ���a�b�ж����y�츹�X(0-4)+5 = (5-9)

        var Info = game.CardsConfig;

        // dizhuIndex: -1,
        // current: [[], [], [], [], []], //5�Ӫ��a���ƫ�
        // cards: [[], [], [], [], []], //5�Ӫ��a����P

        var transferData = {
            currentStatus: {
                Me: null,
                Pre: null,
                Next: null,
                PrePre: null,
                NextNext: null

            },//�ثe�P��(�m�X���B�U�X���B�Ҧ����a���ƫ�)
            IsDizhu: {
                Me: null,
                Pre: null,
                Next: null,
                PrePre: null,
                NextNext: null
            },// �֬O�a�D
            cards: {
                Me: null,
                Pre: null,
                Next: null,
                PrePre: null,
                NextNext: null
            },// �U�a�d�P
            cardType: {
                Me: null,
                Pre: null,
                Next: null,
                PrePre: null,
                NextNext: null
            },
        };
        if (game.timer.stage == GameStep.callDizhu || game.timer.stage == GameStep.Result || game.timer.stage == GameStep.Playing) { // �m�a�D�ɶ�W
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