const wordsData = [
  {
    "unit": "Unit 1",
    "words": [
      {"word": "sci-fi movie", "syllables": "sci / fi · mo / vie", "pronunciation": "/ˈsaɪ.faɪ ˈmuːvi/", "meaning": "科幻电影"},
      {"word": "mystery", "syllables": "mys / te / ry", "pronunciation": "/ˈmɪstəri/", "meaning": "悬疑片"},
      {"word": "adventure movie", "syllables": "ad / ven / ture · mo / vie", "pronunciation": "/ədˈventʃər ˈmuːvi/", "meaning": "冒险电影"},
      {"word": "action movie", "syllables": "ac / tion · mo / vie", "pronunciation": "/ˈækʃən ˈmuːvi/", "meaning": "动作电影"},
      {"word": "fantasy movie", "syllables": "fan / ta / sy · mo / vie", "pronunciation": "/ˈfæntəsi ˈmuːvi/", "meaning": "奇幻电影"},
      {"word": "horror movie", "syllables": "hor / ror · mo / vie", "pronunciation": "/ˈhɔrər ˈmuːvi/", "meaning": "恐怖电影"},
      {"word": "stuntwoman", "syllables": "stunt / wo / man", "pronunciation": "/ˈstʌntˌwʊmən/", "meaning": "女特技演员"},
      {"word": "actress", "syllables": "ac / tress", "pronunciation": "/ˈæktrəs/", "meaning": "女演员"},
      {"word": "cameraman", "syllables": "ca / me / ra / man", "pronunciation": "/ˈkæmərəˌmæn/", "meaning": "摄影师"},
      {"word": "director", "syllables": "di / rec / tor", "pronunciation": "/dəˈrektər/", "meaning": "导演"},
      {"word": "actor", "syllables": "ac / tor", "pronunciation": "/ˈæktər/", "meaning": "男演员"},
      {"word": "martial arts", "syllables": "mar / tial · arts", "pronunciation": "/ˈmɑrʃəl ɑrts/", "meaning": "武术"},
      {"word": "animated movie", "syllables": "a / ni / ma / ted · mo / vie", "pronunciation": "/ˈænɪmeɪtɪd ˈmuːvi/", "meaning": "动画电影"},
      {"word": "comedy", "syllables": "co / me / dy", "pronunciation": "/ˈkɒmədi/", "meaning": "喜剧"},
      {"word": "romantic movie", "syllables": "ro / man / tic · mo / vie", "pronunciation": "/rəʊˈmæntɪk ˈmuːvi/", "meaning": "爱情电影"},
      {"word": "exciting", "syllables": "ex / ci / ting", "pronunciation": "/ɪkˈsaɪtɪŋ/", "meaning": "令人兴奋的"}
    ]
  },
  {
    "unit": "Unit 2",
    "words": [
      {"word": "cup", "syllables": "cup", "pronunciation": "/kʌp/", "meaning": "杯子"},
      {"word": "knife", "syllables": "knife", "pronunciation": "/naɪf/", "meaning": "刀"},
      {"word": "stove", "syllables": "stove", "pronunciation": "/stəʊv/", "meaning": "炉子"},
      {"word": "teaspoon", "syllables": "tea / spoon", "pronunciation": "/ˈtiːspuːn/", "meaning": "茶匙"},
      {"word": "peel", "syllables": "peel", "pronunciation": "/piːl/", "meaning": "剥皮"},
      {"word": "sprinkle", "syllables": "sprin / kle", "pronunciation": "/ˈsprɪŋkəl/", "meaning": "撒"},
      {"word": "fry", "syllables": "fry", "pronunciation": "/fraɪ/", "meaning": "煎"},
      {"word": "spicy", "syllables": "spi / cy", "pronunciation": "/ˈspaɪsi/", "meaning": "辣的"},
      {"word": "sweet", "syllables": "sweet", "pronunciation": "/swiːt/", "meaning": "甜的"},
      {"word": "delicious", "syllables": "de / li / cious", "pronunciation": "/dɪˈlɪʃəs/", "meaning": "美味的"},
      {"word": "mix", "syllables": "mix", "pronunciation": "/mɪks/", "meaning": "混合"},
      {"word": "add", "syllables": "add", "pronunciation": "/æd/", "meaning": "添加"},
      {"word": "serve", "syllables": "serve", "pronunciation": "/sɜːv/", "meaning": "上菜"},
      {"word": "oven", "syllables": "o / ven", "pronunciation": "/ˈʌvən/", "meaning": "烤箱"},
      {"word": "bake", "syllables": "bake", "pronunciation": "/beɪk/", "meaning": "烘烤"},
      {"word": "cut", "syllables": "cut", "pronunciation": "/kʌt/", "meaning": "切"}
    ]
  },
  {
    "unit": "Unit 3",
    "words": [
      {"word": "cough", "syllables": "cough", "pronunciation": "/kɒf/", "meaning": "咳嗽"},
      {"word": "hay fever", "syllables": "hay · fe / ver", "pronunciation": "/ˈheɪ ˈfiːvə/", "meaning": "花粉过敏"},
      {"word": "sore throat", "syllables": "sore · throat", "pronunciation": "/sɔː θrəʊt/", "meaning": "喉咙痛"},
      {"word": "flu", "syllables": "flu", "pronunciation": "/fluː/", "meaning": "流感"},
      {"word": "x-ray", "syllables": "x · ray", "pronunciation": "/ˈeks.reɪ/", "meaning": "X 光"},
      {"word": "medicine", "syllables": "me / di / cine", "pronunciation": "/ˈmedsɪn/", "meaning": "药"},
      {"word": "cream", "syllables": "cream", "pronunciation": "/kriːm/", "meaning": "药膏"},
      {"word": "injection", "syllables": "in / jec / tion", "pronunciation": "/ɪnˈdʒekʃən/", "meaning": "注射"},
      {"word": "sling", "syllables": "sling", "pronunciation": "/slɪŋ/", "meaning": "吊带"},
      {"word": "bandage", "syllables": "ban / dage", "pronunciation": "/ˈbændɪdʒ/", "meaning": "绷带"},
      {"word": "fever", "syllables": "fe / ver", "pronunciation": "/ˈfiːvə/", "meaning": "发烧"},
      {"word": "sprained ankle", "syllables": "sprained · an / kle", "pronunciation": "/spreɪnd ˈæŋkəl/", "meaning": "扭伤的脚踝"},
      {"word": "chicken pox", "syllables": "chick / en · pox", "pronunciation": "/ˈtʃɪkɪn pɒks/", "meaning": "水痘"},
      {"word": "stomach ache", "syllables": "sto / mach · ache", "pronunciation": "/ˈstʌmək eɪk/", "meaning": "胃痛"},
      {"word": "runny nose", "syllables": "run / ny · nose", "pronunciation": "/ˈrʌni nəʊz/", "meaning": "流鼻涕"},
      {"word": "sneezing", "syllables": "snee / zing", "pronunciation": "/ˈsniːzɪŋ/", "meaning": "打喷嚏"},
      {"word": "food poisoning", "syllables": "food · poi / so / ning", "pronunciation": "/fuːd ˈpɔɪzənɪŋ/", "meaning": "食物中毒"},
      {"word": "stitches", "syllables": "sti / tches", "pronunciation": "/ˈstɪtʃɪz/", "meaning": "缝针"}
    ]
  },
  {
    "unit": "Unit 4",
    "words": [
      {"word": "earring", "syllables": "ear / ring", "pronunciation": "/ˈɪərɪŋ/", "meaning": "耳环"},
      {"word": "leather", "syllables": "lea / ther", "pronunciation": "/ˈleðə/", "meaning": "皮革"},
      {"word": "cotton", "syllables": "cot / ton", "pronunciation": "/ˈkɒtn/", "meaning": "棉布"},
      {"word": "button", "syllables": "but / ton", "pronunciation": "/ˈbʌtn/", "meaning": "纽扣"},
      {"word": "bracelet", "syllables": "brace / let", "pronunciation": "/ˈbreɪslɪt/", "meaning": "手镯"},
      {"word": "zipper", "syllables": "zip / per", "pronunciation": "/ˈzɪpə/", "meaning": "拉链"},
      {"word": "ring", "syllables": "ring", "pronunciation": "/rɪŋ/", "meaning": "戒指"},
      {"word": "silk", "syllables": "silk", "pronunciation": "/sɪlk/", "meaning": "丝绸"},
      {"word": "watch", "syllables": "watch", "pronunciation": "/wɒtʃ/", "meaning": "手表"},
      {"word": "belt", "syllables": "belt", "pronunciation": "/belt/", "meaning": "皮带"},
      {"word": "fancy", "syllables": "fan / cy", "pronunciation": "/ˈfænsi/", "meaning": "华丽的"},
      {"word": "shiny", "syllables": "shi / ny", "pronunciation": "/ˈʃaɪni/", "meaning": "闪亮的"},
      {"word": "wool", "syllables": "wool", "pronunciation": "/wʊl/", "meaning": "羊毛"},
      {"word": "necklace", "syllables": "neck / lace", "pronunciation": "/ˈneklɪs/", "meaning": "项链"},
      {"word": "light", "syllables": "light", "pronunciation": "/laɪt/", "meaning": "浅色的"}
    ]
  },
  {
    "unit": "Unit 5",
    "words": [
      {"word": "planet", "syllables": "pla / net", "pronunciation": "/ˈplænɪt/", "meaning": "行星"},
      {"word": "shoot the laser", "syllables": "shoot · the · la / ser", "pronunciation": "/ʃuːt ðə ˈleɪzə/", "meaning": "发射激光"},
      {"word": "start the engine", "syllables": "start · the · en / gine", "pronunciation": "/stɑːt ðə ˈendʒɪn/", "meaning": "启动引擎"},
      {"word": "tentacle", "syllables": "ten / ta / cle", "pronunciation": "/ˈtentəkəl/", "meaning": "触手"},
      {"word": "asteroid", "syllables": "as / te / roid", "pronunciation": "/ˈæstərɔɪd/", "meaning": "小行星"},
      {"word": "hardworking", "syllables": "hard / wor / king", "pronunciation": "/ˈhɑːdˌwɜːkɪŋ/", "meaning": "努力的"},
      {"word": "comet", "syllables": "co / met", "pronunciation": "/ˈkɒmɪt/", "meaning": "彗星"},
      {"word": "intelligent", "syllables": "in / te / lli / gent", "pronunciation": "/ɪnˈtelɪdʒənt/", "meaning": "聪明的"},
      {"word": "cruel", "syllables": "cru / el", "pronunciation": "/ˈkruːəl/", "meaning": "残忍的"},
      {"word": "slimy", "syllables": "sli / my", "pronunciation": "/ˈslaɪmi/", "meaning": "黏糊糊的"},
      {"word": "scared", "syllables": "scared", "pronunciation": "/skɛəd/", "meaning": "害怕的"},
      {"word": "chase after", "syllables": "chase · af / ter", "pronunciation": "/tʃeɪs ˈɑːftə/", "meaning": "追赶"},
      {"word": "helpful", "syllables": "help / ful", "pronunciation": "/ˈhelpfəl/", "meaning": "乐于助人的"},
      {"word": "friendly", "syllables": "friend / ly", "pronunciation": "/ˈfrendli/", "meaning": "友好的"},
      {"word": "spaceship", "syllables": "space / ship", "pronunciation": "/ˈspeɪsˌʃɪp/", "meaning": "宇宙飞船"},
      {"word": "alien", "syllables": "a / li / en", "pronunciation": "/ˈeɪliən/", "meaning": "外星人"},
      {"word": "creep past", "syllables": "creep · past", "pronunciation": "/kriːp pɑːst/", "meaning": "蹑手蹑脚地经过"}
    ]
  },
  {
    "unit": "Unit 6",
    "words": [
      {"word": "making pottery", "syllables": "ma / king · pot / te / ry", "pronunciation": "/ˈmeɪkɪŋ ˈpɒtəri/", "meaning": "制作陶器"},
      {"word": "doing origami", "syllables": "do / ing · o / ri / ga / mi", "pronunciation": "/ˈduːɪŋ ˌɒrɪˈɡɑːmi/", "meaning": "折纸"},
      {"word": "making jewelry", "syllables": "ma / king · jew / el / ry", "pronunciation": "/ˈmeɪkɪŋ ˈdʒuːəlri/", "meaning": "制作珠宝"},
      {"word": "drawing", "syllables": "draw / ing", "pronunciation": "/ˈdrɔːɪŋ/", "meaning": "画画"},
      {"word": "knitting", "syllables": "knit / ting", "pronunciation": "/ˈnɪtɪŋ/", "meaning": "编织"},
      {"word": "terrible", "syllables": "te / rri / ble", "pronunciation": "/ˈterɪbəl/", "meaning": "糟糕的"},
      {"word": "crazy about", "syllables": "cra / zy · a / bout", "pronunciation": "/ˈkreɪzi əˈbaʊt/", "meaning": "痴迷于"},
      {"word": "interested in", "syllables": "in / te / res / ted · in", "pronunciation": "/ˈɪntrɪstɪd ɪn/", "meaning": "对……感兴趣"},
      {"word": "bad at", "syllables": "bad · at", "pronunciation": "/bæd æt/", "meaning": "不擅长"},
      {"word": "messy", "syllables": "mes / sy", "pronunciation": "/ˈmesi/", "meaning": "乱糟糟的"},
      {"word": "difficult", "syllables": "dif / fi / cult", "pronunciation": "/ˈdɪfɪkəlt/", "meaning": "困难的"},
      {"word": "making cards", "syllables": "ma / king · cards", "pronunciation": "/ˈmeɪkɪŋ kɑːdz/", "meaning": "做贺卡"},
      {"word": "making models", "syllables": "ma / king · mo / dels", "pronunciation": "/ˈmeɪkɪŋ ˈmɒdəlz/", "meaning": "制作模型"},
      {"word": "making sculptures", "syllables": "ma / king · sculp / tures", "pronunciation": "/ˈmeɪkɪŋ ˈskʌlptʃəz/", "meaning": "制作雕塑"},
      {"word": "writing stories", "syllables": "wri / ting · sto / ries", "pronunciation": "/ˈraɪtɪŋ ˈstɔːriz/", "meaning": "写故事"},
      {"word": "all right", "syllables": "all · right", "pronunciation": "/ɔːl raɪt/", "meaning": "还好"},
      {"word": "awesome", "syllables": "awe / some", "pronunciation": "/ˈɔːsəm/", "meaning": "太棒了"}
    ]
  }
];