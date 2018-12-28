const PokerData = require('./partCards/PokerData');
const CardUtil = require('./partCards/CardUtil');
const CardType = require('./CardType');
const LaiZifindType = require('./LaiZifindType');

const Rule = {
    /*
  0  "���~�P��",
 1  "��i", x1
 2  "��l", x2
 3  "�T�i�P", x3
 4  "�T�a�@", x4
 5  "�T�a�G", x4
 6  "�涶�l", x5up
 7  "�����l", x6
 8  "�T���l", x9
 9  "�|�a�G��", x6
 10"�|�a�@��", x6
 11"���u", x4
 12"���b", x2Gg
 13" ����"
     */
    CardType: function (cards) {
        return CardType.judgeType(cards);
    },

    //�^��true��ܥi�H�X�P false��ܤ��X�P
    Islegal: function (current, newCards) {
        //�P�ƶV�h�V�j


        if (CardType.judgeType(newCards) == 0) {
            console.log("Wrong CardType");
            console.log("/////////////////")
            return false;
        }

        if ((current == "PASS" || current == 0) && newCards.length != 0) {

            console.log("NewCard Type :" + CardType.Types[CardType.judgeType(newCards)]);
            console.log("NewCard Most:" + CardType.findMost(newCards));
            console.log("/////////////////")
            return true;
        }
        else {
            var currentType = CardType.judgeType(current);
            var newCardsType = CardType.judgeType(newCards);
            var currentMost = CardUtil.cardGrade[CardType.findMost(current)];
            var newCardsMost = CardUtil.cardGrade[CardType.findMost(newCards)];

            console.log("Current Type :" + CardType.Types[currentType]);
            console.log("Current Most :" + currentMost)
            console.log("NewCard Type :" + CardType.Types[newCardsType])
            console.log("NewCard Most :" + newCardsMost);
            console.log("/////////////////")
            //���b
            if (newCardsType == 12) {

                console.log("ROCKET INCOMING!!");
                console.log("/////////////////")
                return true;
            }//���u
            else if ((currentType != 11 || currentType != 12 || currentType != 14) && (newCardsType == 11 || newCardsType == 14)) {
                return true;
            }//�n���w
            else if (currentType == 11 && newCardsType == 14) {
                if (newCards.length >= 5)//�n���u�j��5�i�i��
                    return true;
                else {
                    console.log("Not long enough for hard bomb");
                    console.log("/////////////////")
                    return false;
                }
            }//�w���n
            else if (currentType == 14 && newCardsType == 11) {
                if (current.length < 5)//�Y�n���u�p��5�i�h�w���u�i��
                    return true;
                else {
                    console.log("The current bomb is longer than 4");
                    console.log("/////////////////")
                    return false;
                }
            } //��L�P��
            else if (newCardsType == currentType) {
                if (newCardsType == 14) {//�n���n
                    if (current.length == newCards.length) {//�i�ƬۦP��Ʀr
                        if (currentMost < newCardsMost)
                            return true;
                        else {
                            console.log("Softbomb is not BIG enough");
                            console.log("/////////////////")
                            return false;
                        }
                    }
                }
                else {
                    if (current.length != newCards.length) {
                        console.log("Diff length")
                        console.log("/////////////////")
                        return false;
                    }
                    if (currentMost >= newCardsMost) {
                        console.log("Not BIG enough");
                        console.log("/////////////////")
                        return false;
                    }
                    else if (currentMost < newCardsMost) {
                        console.log("Success !!")
                        console.log("/////////////////")
                        return true;
                    }
                }
            }
            else {
                console.log("FAILED");
                console.log("/////////////////")
                return false;
            }
        }
    },

    //I:�Nroom.game.CardsConfig�ǤJ
    //P:�N���a��P,�a�D�P��J�������ܼƤ�
    ConfigCard: function (cardconfig) {

        PokerData.load();
        var cards = JSON.parse(JSON.stringify(PokerData.getPartCardsData()));
        //var cards = [[], [], [], []]
        //cards[0].push(PokerData.Card("hearts", 7));
        //cards[0].push(PokerData.Card("hearts", 7));
        //cards[0].push(PokerData.Card("hearts", 7));
        //cards[0].push(PokerData.Card("hearts", 8));
        //cards[0].push(PokerData.Card("hearts", 8));
        //cards[0].push(PokerData.Card("hearts", 8));
        //cards[0].push(PokerData.Card("hearts", 9));
        //cards[0].push(PokerData.Card("hearts", 9));
        //cards[0].push(PokerData.Card("hearts", 9));
        //cards[0].push(PokerData.Card("hearts", 10));
        //cards[0].push(PokerData.Card("hearts", 10));
        //cards[0].push(PokerData.Card("hearts", 10));
        //cards[0].push(PokerData.Card("hearts", 11));
        //cards[0].push(PokerData.Card("hearts", 11));
        //cards[0].push(PokerData.Card("hearts", 11));

        //cards[1].push(PokerData.Card("hearts", 10));
        //cards[1].push(PokerData.Card("blackberry", 8));
        //cards[1].push(PokerData.Card("blackberry", 9));
        //cards[1].push(PokerData.Card("blackberry", 10));
        //cards[1].push(PokerData.Card("blackberry", 11));
        //cards[1].push(PokerData.Card("blackberry", 12));


        //cards[2].push(PokerData.Card("spade", 4));
        //cards[2].push(PokerData.Card("spade", 5));
        //cards[2].push(PokerData.Card("spade", 6));
        //cards[2].push(PokerData.Card("spade", 7));
        //cards[2].push(PokerData.Card("spade", 8));
        //cards[2].push(PokerData.Card("spade", 9));

        this.sortCard(cards[0]);
        this.sortCard(cards[1]);
        this.sortCard(cards[2]);

        cardconfig.cards[0] = cards[0];
        cardconfig.cards[1] = cards[1];
        cardconfig.cards[2] = cards[2];
        cardconfig.Dizhu = cards[3];
    },

    //�۰ʥX�P����C
    //I:�ثe�P���A�ثe��P,�j��X�P(��j�a�W�@����PASS�ɥ����j��X�P)
    //O:��ܪ���X�P��
    AutoSubmitCard(currentCards, MyCards, forceToSubmit) {
        //return "PASS";
        if (forceToSubmit == true) {
            return [MyCards[MyCards.length - 1]];
        }
        else {
            return "PASS";
        }

    },

    sortCard(cards) {
        cards.sort(CardUtil.Laizi);
    },
    setLaiZi(Cards, LaiZi) {


        Cards.Dizhu.push({ showTxt: CardUtil.Card[LaiZi], showType: 'laizi', NO: -1 });


        for (var i = 0; i < Cards.cards.length; i++) {
            for (var j = 0; j < Cards.cards[i].length; j++) {

                if (CardUtil.cardGrade[Cards.cards[i][j].showTxt] == LaiZi) {
                    Cards.cards[i][j].showType = 'laizi';
                }
            }
        }
       
        this.sortCard(Cards.cards[0]);
        this.sortCard(Cards.cards[1]);
        this.sortCard(Cards.cards[2]);
    },

    hasLaiziCards(cards) {

        var LaiziCardsCount = 0;

        for (var i = 0; i < cards.length; i++) {
            if (cards[i].showType == 'laizi') {
                LaiziCardsCount++;
            }
        }

        //�S����l�P
        if (LaiziCardsCount == 0) {
            return false;
        }
        //��i��l�P
        else if (LaiziCardsCount == 1 && cards.length == 1) {
            return false;
        }
        //�@����l�P
        else if (LaiziCardsCount == 2 && cards.length == 2) {
            return false;
        }
        //�T�i��l�P
        else if (LaiziCardsCount == 3 && cards.length == 3) {
            return false;
        }
        
        return true;

       
    },

    GetTwoPossibleCardType(cards) {
        
        var allPossible = LaiZifindType.findCardType(cards);

      
        var Top2Possible = [];
        
        for (var i = allPossible.length-1; i >=0 ; i--) {
            for (var j = allPossible[i].length-1; j >=0 ; j--) {
                Top2Possible.push(JSON.parse(JSON.stringify(allPossible[i][j])));
                if (Top2Possible.length == 2)
                    return Top2Possible;
            }
        }

        return Top2Possible;

    }
};

module.exports = Rule;