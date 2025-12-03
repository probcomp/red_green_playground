import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';

// Metrics data
const metricsData = {
  'rmse_RGU': {
    name: 'RMSE (Red, Green, Uncertain)',
    data: {'E1': 0.10420262067135921, 'E2': 0.08395084798232277, 'E3': 0.11164286721056305, 'E4': 0.028651471611551925, 'E5': 0.10204211923046196, 'E6': 0.1093907669534604, 'E7': 0.16539957643421777, 'E8': 0.09907321080959146, 'E9': 0.04959255159791788, 'E10': 0.07542742165275704, 'E11': 0.15735476623934003, 'E12': 0.18786582248289302, 'E13': 0.14626406337373063, 'E14': 0.17269724312178075, 'E15': 0.08139040281508149, 'E16': 0.06547168001846974, 'E17': 0.09964760315311769, 'E18': 0.10091848903708878, 'E19': 0.12349779508382462, 'E20': 0.07706348214996302, 'E21': 0.19362241326766708, 'E22': 0.1922736180976428, 'E23': 0.11814155513748391, 'E24': 0.09271386889065418, 'E25': 0.168393364123013, 'E26': 0.16511189559171094, 'E27': 0.18335102459171854, 'E28': 0.09929817363836363, 'E29': 0.14271334966354815, 'E30': 0.13525711745730465, 'E31': 0.09148468622064032, 'E32': 0.18082002447608372, 'E33': 0.1266533561979928, 'E34': 0.05120057617945384, 'E35': 0.13418104248530013, 'E36': 0.10407600050690861, 'E37': 0.0990938587189566, 'E38': 0.07899387238891685, 'E39': 0.11396565861688421, 'E40': 0.1401716493474017, 'E41': 0.08350171144944198, 'E42': 0.11334102505569381, 'E43': 0.13469204324346862, 'E44': 0.08875713572145628, 'E45': 0.13027212523470943, 'E46': 0.06952318400342455, 'E47': 0.07070852317626627, 'E48': 0.10013530365195572, 'E49': 0.10812350985390483, 'E50': 0.06156415875752233}
  },
  'rmse_RG': {
    name: 'RMSE (Red, Green)',
    data: {'E1': 0.09750067104240216, 'E2': 0.06757057114520638, 'E3': 0.11339011296636024, 'E4': 0.027059922396885445, 'E5': 0.11019312437898003, 'E6': 0.1295152871257022, 'E7': 0.1267321097685789, 'E8': 0.1000497949565201, 'E9': 0.04422669751141776, 'E10': 0.06064409266136239, 'E11': 0.15872968747050212, 'E12': 0.17008840199566985, 'E13': 0.17178141091547933, 'E14': 0.17764535627294986, 'E15': 0.06947961843422147, 'E16': 0.05431312302003462, 'E17': 0.11035907409614897, 'E18': 0.115523132902664, 'E19': 0.1408968924132784, 'E20': 0.08681191749239611, 'E21': 0.23212204676767412, 'E22': 0.23348973165437703, 'E23': 0.13194487783761719, 'E24': 0.10813896887976841, 'E25': 0.1998422362422834, 'E26': 0.19192669287489533, 'E27': 0.2208140011169806, 'E28': 0.11769118920743236, 'E29': 0.1193473897351559, 'E30': 0.11634068770582488, 'E31': 0.08851401999599705, 'E32': 0.21702202855069497, 'E33': 0.1305978968822472, 'E34': 0.05345162490620348, 'E35': 0.13784405970057634, 'E36': 0.1141689724745873, 'E37': 0.11587044200503384, 'E38': 0.08745720599340595, 'E39': 0.11008489161627544, 'E40': 0.14304278753391345, 'E41': 0.07406761116872533, 'E42': 0.13189189416573155, 'E43': 0.15301126236675086, 'E44': 0.10321265126189749, 'E45': 0.15039106886845405, 'E46': 0.0683740097042994, 'E47': 0.07541611616504977, 'E48': 0.11676682187620158, 'E49': 0.09517591920277459, 'E50': 0.06079119890498451}
  },
  'rmse_(|R-G|)': {
    name: 'RMSE (|Red - Green|)',
    data: {'E1': 0.1550671512583873, 'E2': 0.07906616139969863, 'E3': 0.19933917977573878, 'E4': 0.043939912656149833, 'E5': 0.1419706686468106, 'E6': 0.16831810263376765, 'E7': 0.11290951007331632, 'E8': 0.12579572711230405, 'E9': 0.06554940247988299, 'E10': 0.07069899600963965, 'E11': 0.25694225830733247, 'E12': 0.2303723868035214, 'E13': 0.30738292807635154, 'E14': 0.3155350343142418, 'E15': 0.09534836786954659, 'E16': 0.06934757395983826, 'E17': 0.14657215172796653, 'E18': 0.17743897552596505, 'E19': 0.24897833132938987, 'E20': 0.16544244980120695, 'E21': 0.30076217958381546, 'E22': 0.2683222164071067, 'E23': 0.24935588535686112, 'E24': 0.2106576252791645, 'E25': 0.33382304780583505, 'E26': 0.24777462355036134, 'E27': 0.2507365832342752, 'E28': 0.18190339148691514, 'E29': 0.10763134237573962, 'E30': 0.12168168858655895, 'E31': 0.1027835286225598, 'E32': 0.1268353536837029, 'E33': 0.22872758278943675, 'E34': 0.0915616144168537, 'E35': 0.24151258717286506, 'E36': 0.13680954099308124, 'E37': 0.19588700596003322, 'E38': 0.15492447940226475, 'E39': 0.12482631932178766, 'E40': 0.23493824778688382, 'E41': 0.0749157239666624, 'E42': 0.2009843739575843, 'E43': 0.17835909845425396, 'E44': 0.18350737848501095, 'E45': 0.16596925390452746, 'E46': 0.11018544860602078, 'E47': 0.09500058144498717, 'E48': 0.15093108479871756, 'E49': 0.09573892396914287, 'E50': 0.09267376071068398}
  },
  'rmse_(R-G)': {
    name: 'RMSE (Red - Green)',
    data: {'E1': 0.15640884456441326, 'E2': 0.07906616139969863, 'E3': 0.19937782452960354, 'E4': 0.043939912656149833, 'E5': 0.20400334720606111, 'E6': 0.25445282060043994, 'E7': 0.11956214377684461, 'E8': 0.174966469715443, 'E9': 0.06601318894449981, 'E10': 0.07069899600963965, 'E11': 0.27728886514281026, 'E12': 0.2601916316662046, 'E13': 0.3359666502986457, 'E14': 0.31602883141648547, 'E15': 0.09534836786954659, 'E16': 0.06956916946330333, 'E17': 0.20805243802866644, 'E18': 0.22253076444683417, 'E19': 0.270844031831264, 'E20': 0.16553402450555757, 'E21': 0.4591458927344335, 'E22': 0.46497020988351867, 'E23': 0.25016879016894356, 'E24': 0.2106576252791645, 'E25': 0.39313170957823124, 'E26': 0.3731344508748852, 'E27': 0.4378357498871473, 'E28': 0.23135884300932616, 'E29': 0.1560816968866007, 'E30': 0.16225741963499946, 'E31': 0.14798664458809635, 'E32': 0.4295389638937979, 'E33': 0.23283394535966936, 'E34': 0.0963221689298817, 'E35': 0.2449331588027447, 'E36': 0.21380337698660495, 'E37': 0.2260464055790622, 'E38': 0.16484077667873565, 'E39': 0.1837051608993663, 'E40': 0.25263246139504913, 'E41': 0.10953747623754762, 'E42': 0.2565818906269906, 'E43': 0.29334082383312887, 'E44': 0.20070779969555091, 'E45': 0.29119128031737673, 'E46': 0.11640280012241838, 'E47': 0.13829843713945555, 'E48': 0.22743286269579296, 'E49': 0.13884759064231578, 'E50': 0.10393739584609618}
  },
  'KL_divergence': {
    name: 'KL Divergence',
    data: {'E1': 0.12049930449042294, 'E2': 0.38465186223978665, 'E3': 0.18423115922813257, 'E4': 0.3803363839009539, 'E5': 0.210626186276109, 'E6': 0.1461032793941189, 'E7': 0.26084399636832495, 'E8': 0.09500044346888614, 'E9': 0.07364060034582688, 'E10': 0.08452453851130838, 'E11': 0.11968941853796562, 'E12': 0.2592912515474428, 'E13': 0.12367816756291011, 'E14': 0.20917912016124154, 'E15': 0.1723999962655592, 'E16': 0.16436238189763536, 'E17': 0.16194625863250572, 'E18': 0.12374430470583586, 'E19': 0.21206867824260112, 'E20': 0.15389656365498636, 'E21': 0.19383184331562756, 'E22': 0.3712926708537913, 'E23': 0.1868000391851739, 'E24': 0.15841286676669092, 'E25': 0.14621996489158237, 'E26': 0.20005085605166872, 'E27': 0.2389194684046155, 'E28': 0.12694375367001648, 'E29': 0.19436019600336726, 'E30': 0.1883934064043339, 'E31': 0.07722798008787556, 'E32': 0.16936672758812116, 'E33': 0.2325437885231531, 'E34': 0.05682591227418932, 'E35': 0.1695010675936457, 'E36': 0.09665797316698968, 'E37': 0.07808755123551503, 'E38': 0.13937532487278848, 'E39': 0.1227930811503799, 'E40': 0.149072686483608, 'E41': 0.10654676571570249, 'E42': 0.16224173797633687, 'E43': 0.1889686943055357, 'E44': 0.1614839007741302, 'E45': 0.1672715279774626, 'E46': 0.08930373827673188, 'E47': 0.0744658297356701, 'E48': 0.173315170271005, 'E49': 0.09562451873740391, 'E50': 0.033548183678911284}
  },
  'discrete_mutual_information': {
    name: 'Discrete Mutual Information',
    data: {'E1': 1.256577662868925, 'E2': 0.9957253951137326, 'E3': 1.0756614725091205, 'E4': 1.1105607491151936, 'E5': 1.0709247430957651, 'E6': 1.1777169212513077, 'E7': 0.9403097150170625, 'E8': 1.187286091494989, 'E9': 1.1141821292310292, 'E10': 0.9704211232784172, 'E11': 0.9712665406453824, 'E12': 0.9661778619494086, 'E13': 0.9725408375911149, 'E14': 1.0038664845161225, 'E15': 1.222354277699099, 'E16': 1.0598460559683731, 'E17': 1.145068887811048, 'E18': 1.079369277604053, 'E19': 0.9682823554404564, 'E20': 1.2405036333722212, 'E21': 0.950604108462478, 'E22': 0.9030706964981488, 'E23': 1.0508951303627903, 'E24': 1.3225920389890384, 'E25': 1.1142824894107284, 'E26': 1.178791341392294, 'E27': 0.7836309770321316, 'E28': 1.0994428231922875, 'E29': 0.8957236344068642, 'E30': 0.979167332976369, 'E31': 1.1495943628436291, 'E32': 1.060173456710111, 'E33': 0.9874880946163548, 'E34': 1.281598827643422, 'E35': 1.0539909659062427, 'E36': 1.1027429299594937, 'E37': 1.275569538865657, 'E38': 1.2093901841713892, 'E39': 0.9564530249469844, 'E40': 1.1578187063966616, 'E41': 1.1198048521262807, 'E42': 1.1773557147243938, 'E43': 1.1230553115906852, 'E44': 1.2335846166271505, 'E45': 1.076381236100233, 'E46': 1.2625764452992936, 'E47': 1.2453158936781479, 'E48': 0.9910684104117451, 'E49': 1.227253446796942, 'E50': 1.2619645774110413}
  },
  'red_green_ordering': {
    name: 'Red vs Green Ordering',
    data: {'E1': 0.8974358974358975, 'E2': 0.84375, 'E3': 0.9318181818181818, 'E4': 0.9795918367346939, 'E5': 0.5428571428571428, 'E6': 0.59375, 'E7': 0.8405797101449275, 'E8': 0.7142857142857143, 'E9': 0.975, 'E10': 0.975, 'E11': 0.803921568627451, 'E12': 0.875, 'E13': 0.5531914893617021, 'E14': 0.9, 'E15': 0.9, 'E16': 0.9459459459459459, 'E17': 0.8571428571428571, 'E18': 0.7142857142857143, 'E19': 0.631578947368421, 'E20': 0.9705882352941176, 'E21': 0.45, 'E22': 0.5357142857142857, 'E23': 0.8947368421052632, 'E24': 0.9722222222222222, 'E25': 0.782608695652174, 'E26': 0.8103448275862069, 'E27': 0.4, 'E28': 0.5576923076923077, 'E29': 0.7878787878787878, 'E30': 0.7941176470588235, 'E31': 0.734375, 'E32': 0.3076923076923077, 'E33': 0.890625, 'E34': 0.75, 'E35': 0.9285714285714286, 'E36': 0.627906976744186, 'E37': 0.6829268292682927, 'E38': 0.8823529411764706, 'E39': 0.6111111111111112, 'E40': 0.8545454545454545, 'E41': 0.5897435897435898, 'E42': 0.6875, 'E43': 0.38461538461538464, 'E44': 0.8055555555555556, 'E45': 0.6885245901639344, 'E46': 0.8461538461538461, 'E47': 0.717948717948718, 'E48': 0.4878048780487805, 'E49': 0.5625, 'E50': 0.8529411764705882}
  },
  'decision_prob_rmse': {
    name: 'P(Decision) RMSE',
    data: {'E1': 0.11645512765395992, 'E2': 0.10959776667922755, 'E3': 0.10806365698021866, 'E4': 0.03159496283067561, 'E5': 0.08338304965836114, 'E6': 0.04848299171351407, 'E7': 0.22349273894483837, 'E8': 0.09709057811488107, 'E9': 0.05887496901437444, 'E10': 0.0985518942593626, 'E11': 0.1545682373767181, 'E12': 0.219135968714952, 'E13': 0.07184582403702078, 'E14': 0.16234921661315083, 'E15': 0.10108589543390141, 'E16': 0.08342536777829535, 'E17': 0.07369317452630937, 'E18': 0.06214849810972008, 'E19': 0.07778976531820292, 'E20': 0.05238055751726807, 'E21': 0.06861215320595336, 'E22': 0.04327265964796452, 'E23': 0.08398440078813445, 'E24': 0.04898480655531056, 'E25': 0.0720772951029914, 'E26': 0.09007831771228525, 'E27': 0.05775074439277031, 'E28': 0.04333531850147815, 'E29': 0.18059264005872466, 'E30': 0.1667727562788622, 'E31': 0.0971538983621528, 'E32': 0.06237404910759929, 'E33': 0.11837058996437753, 'E34': 0.0463718081715305, 'E35': 0.12653729449396986, 'E36': 0.08016441288212607, 'E37': 0.05105741715513787, 'E38': 0.058502733821962194, 'E39': 0.12135545849942792, 'E40': 0.13424528189611806, 'E41': 0.09972755585330785, 'E42': 0.06121781104202575, 'E43': 0.08718340849707541, 'E44': 0.048247120778455756, 'E45': 0.07534940377143849, 'E46': 0.07176634960644734, 'E47': 0.06019887535880708, 'E48': 0.053030705541892896, 'E49': 0.13021201541023858, 'E50': 0.06308167088745717}
  },
  'green_given_decision_rmse': {
    name: 'Weighted P(Green|Decision) RMSE',
    data: {'E1': 0.15115594730722853, 'E2': 0.030376897533456706, 'E3': 0.16946351344696586, 'E4': 0.04705532315078076, 'E5': 0.17624954352250832, 'E6': 0.21487988872240954, 'E7': 0.11928319286934362, 'E8': 0.14864446899023165, 'E9': 0.04600468478173696, 'E10': 0.05293988244476476, 'E11': 0.1679087854734715, 'E12': 0.1500956476586325, 'E13': 0.2541542697883775, 'E14': 0.18345687165959473, 'E15': 0.05689425792740224, 'E16': 0.01837064587216074, 'E17': 0.12557759044433037, 'E18': 0.1405835950545933, 'E19': 0.21733357858494146, 'E20': 0.1269234070168537, 'E21': 0.2801776069138563, 'E22': 0.30954926829221396, 'E23': 0.16271735664359363, 'E24': 0.15043698673520056, 'E25': 0.23557842480215815, 'E26': 0.2402799250965525, 'E27': 0.3493762043721869, 'E28': 0.18090647162312312, 'E29': 0.1493745899203797, 'E30': 0.13843698094784276, 'E31': 0.1212413142344492, 'E32': 0.31705431378961774, 'E33': 0.17165098669199458, 'E34': 0.06416025414862268, 'E35': 0.16681294443067998, 'E36': 0.16102037906229918, 'E37': 0.1844284242136697, 'E38': 0.10026226153271384, 'E39': 0.14482258432513684, 'E40': 0.16457259698994697, 'E41': 0.1290604674513261, 'E42': 0.18257852417982467, 'E43': 0.1988364131587126, 'E44': 0.14935691326489225, 'E45': 0.18038230101313346, 'E46': 0.09829544837379564, 'E47': 0.10394906807921554, 'E48': 0.2000160523641119, 'E49': 0.12404026117248804, 'E50': 0.09013044448217966}
  },
  'decision_prob_correlation': {
    name: 'P(Decision) Correlation',
    data: {'E1': 0.9877085642889583, 'E2': 0.9730837889871465, 'E3': 0.9859427767304632, 'E4': 0.9972018140155291, 'E5': 0.9766663433206972, 'E6': 0.9940172430640628, 'E7': 0.9531186068850896, 'E8': 0.9743958484615934, 'E9': 0.989804462956383, 'E10': 0.9795217470708596, 'E11': 0.9295471122312214, 'E12': 0.8886137856342735, 'E13': 0.9866003852651137, 'E14': 0.9607694406605494, 'E15': 0.9768759516675206, 'E16': 0.9846872221876833, 'E17': 0.9745315601827056, 'E18': 0.9930307345419688, 'E19': 0.9848725753044323, 'E20': 0.989442010735715, 'E21': 0.9852322703862751, 'E22': 0.9919259239942989, 'E23': 0.9894476394268169, 'E24': 0.9940953513248872, 'E25': 0.9762507106871039, 'E26': 0.9790412384076803, 'E27': 0.9864222432165992, 'E28': 0.9925992409567144, 'E29': 0.9419342485640307, 'E30': 0.9552319557175977, 'E31': 0.9605707929535688, 'E32': 0.9970441229119588, 'E33': 0.9504705693126386, 'E34': 0.9938718067780412, 'E35': 0.965543398762173, 'E36': 0.9720121415914943, 'E37': 0.991030919235139, 'E38': 0.9918672857269072, 'E39': 0.9775742775992579, 'E40': 0.9490824144893617, 'E41': 0.9599023828449412, 'E42': 0.9953322457960213, 'E43': 0.9735222894858598, 'E44': 0.9914492457731215, 'E45': 0.9778010978862502, 'E46': 0.9875266157928179, 'E47': 0.9900002807171802, 'E48': 0.9836856810865436, 'E49': 0.9664524903292344, 'E50': 0.9770619273499164}
  },
  'green_given_decision_correlation': {
    name: 'Weighted P(Green|Decision) Correlation',
    data: {'E1': 0.8647962739015834, 'E2': NaN, 'E3': 0.7248987885236223, 'E4': NaN, 'E5': 0.6998588958162267, 'E6': 0.8811620525622876, 'E7': 0.7549942488847233, 'E8': 0.9136562833630189, 'E9': 0.7882960183655919, 'E10': 0.530582566340881, 'E11': 0.8775912333467095, 'E12': 0.911588347675964, 'E13': 0.8683284662853354, 'E14': 0.682658243204618, 'E15': 0.9020772232498255, 'E16': 0.9407026913469139, 'E17': 0.8875626415948444, 'E18': 0.9750237445725031, 'E19': 0.9307893435251615, 'E20': 0.8984331592792697, 'E21': 0.7623244317481664, 'E22': 0.9270801437582691, 'E23': 0.8473424709159019, 'E24': 0.8355706245053931, 'E25': 0.9879276820167902, 'E26': 0.9355833029641036, 'E27': 0.9377385189407956, 'E28': 0.8747574067046868, 'E29': 0.7341395339697686, 'E30': 0.8566644985530575, 'E31': 0.8877241779675379, 'E32': 0.9468309752670278, 'E33': 0.5360872209696301, 'E34': 0.9662584396172288, 'E35': 0.25762034237908166, 'E36': 0.7872276849177793, 'E37': 0.9045138628838812, 'E38': 0.9580526800087992, 'E39': 0.7413532211956542, 'E40': 0.9490293431348409, 'E41': 0.8596921029375085, 'E42': 0.8176932000286411, 'E43': 0.9444403975530367, 'E44': 0.9535028528965529, 'E45': 0.878065591623713, 'E46': 0.9367353001628347, 'E47': 0.9644365263766251, 'E48': 0.4591608780228287, 'E49': 0.9228301250890915, 'E50': 0.9611842345691115}
  }
};

// Metrics where higher values are better (sorted descending)
const higherBetterMetrics = new Set([
  'discrete_mutual_information',
  'red_green_ordering',
  'decision_prob_correlation',
  'green_given_decision_correlation'
]);

// Enable/disable metrics - set to false to hide a metric from the dropdown
const metricsEnabled = {
  'rmse_RGU': false,
  'rmse_RG': true,
  'rmse_(|R-G|)': true,
  'rmse_(R-G)': true,
  'KL_divergence': true,
  'discrete_mutual_information': true,
  'red_green_ordering': true,
  'decision_prob_rmse': true,
  'green_given_decision_rmse': true,
  'decision_prob_correlation': true,
  'green_given_decision_correlation': true
};

function TrialByTrialPage() {
  const [selectedTrial, setSelectedTrial] = useState(null);
  const [hidePlotInitially, setHidePlotInitially] = useState(false);
  const [plotRevealed, setPlotRevealed] = useState(false);
  const [hideVideo, setHideVideo] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState(null);
  const allTrials = Array.from({ length: 50 }, (_, i) => `E${i + 1}`);

  // Compute sorted trials based on selected metric
  const { sortedTrials, trialRankings, trialLosses } = useMemo(() => {
    if (!selectedMetric) {
      return {
        sortedTrials: allTrials,
        trialRankings: {},
        trialLosses: {}
      };
    }

    const metricData = metricsData[selectedMetric].data;
    const isHigherBetter = higherBetterMetrics.has(selectedMetric);

    // Build list with possible NaNs/undefined marked as null, then:
    // - sort only valid values
    // - append invalid ones at the end with no ranking
    const trialsWithLoss = allTrials.map(trial => {
      const raw = metricData[trial];
      const isValidNumber = typeof raw === 'number' && !Number.isNaN(raw);
      return {
        trial,
        loss: isValidNumber ? raw : null
      };
    });

    const validTrials = trialsWithLoss
      .filter(item => item.loss !== null)
      .sort((a, b) => isHigherBetter ? b.loss - a.loss : a.loss - b.loss); // Sort from best to worst

    const invalidTrials = trialsWithLoss.filter(item => item.loss === null);

    const sorted = [
      ...validTrials.map(item => item.trial),
      ...invalidTrials.map(item => item.trial)
    ];
    const rankings = {};
    const losses = {};

    validTrials.forEach((item, index) => {
      rankings[item.trial] = index + 1;
      losses[item.trial] = item.loss;
    });

    return {
      sortedTrials: sorted,
      trialRankings: rankings,
      trialLosses: losses
    };
  }, [selectedMetric, allTrials]);

  const trials = sortedTrials;

  const navigateTrial = (direction) => {
    if (selectedTrial === null) return;
    
    const currentIndex = trials.indexOf(selectedTrial);
    const newIndex = currentIndex + direction;
    
    if (newIndex >= 0 && newIndex < trials.length) {
      setSelectedTrial(trials[newIndex]);
      setPlotRevealed(false); // Reset plot reveal when navigating
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedTrial === null) return;

      if (e.key === 'Escape') {
        setSelectedTrial(null);
      } else if (e.key === 'ArrowLeft') {
        navigateTrial(-1);
      } else if (e.key === 'ArrowRight') {
        navigateTrial(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTrial]);

  const openModal = (trialName) => {
    setSelectedTrial(trialName);
    setPlotRevealed(false); // Reset plot reveal when opening a new trial
  };

  const closeModal = () => {
    setSelectedTrial(null);
    setPlotRevealed(false); // Reset plot reveal when closing
  };

  const handleModalClick = (e) => {
    // Close modal if clicking on the backdrop (not the image)
    if (e.target.id === 'modal-backdrop') {
      closeModal();
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      padding: '40px',
      backgroundColor: '#f8fafc',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    }}>
      {/* Navigation */}
      <div style={{
        marginBottom: '40px',
        paddingBottom: '20px',
        borderBottom: '2px solid #e2e8f0'
      }}>
        <Link 
          to="/jtap/cogsci2025-tuned" 
          style={{ 
            color: '#3b82f6',
            textDecoration: 'none',
            fontSize: '16px',
            fontWeight: '600',
            padding: '8px 16px',
            borderRadius: '6px',
            backgroundColor: '#eff6ff',
            display: 'inline-block',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#dbeafe';
            e.target.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#eff6ff';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          ← Back to Cogsci 2025 Tuned Results
        </Link>
      </div>

      {/* Header */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto 40px auto'
      }}>
        <h1 style={{
          fontSize: '48px',
          fontWeight: '700',
          color: '#1e293b',
          marginBottom: '16px',
          letterSpacing: '-0.025em'
        }}>
          Trial-by-Trial Plots
        </h1>
        <p style={{
          fontSize: '20px',
          color: '#64748b',
          lineHeight: '1.6'
        }}>
          In each plot, you will see a dark gray and light gray region. The dark gray region means that the ball if fully occluded, while the light gray region means that the ball is partially occluded. Any other region implies that the ball is fully visible.
        </p>
      </div>

      {/* Toggle for Hide Plot Initially */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto 40px auto',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '16px 24px',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '2px solid #e2e8f0',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
      }}>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: '500',
          color: '#1e293b',
          userSelect: 'none'
        }}>
          {/* Custom Toggle Switch */}
          <div
            onClick={() => setHidePlotInitially(!hidePlotInitially)}
            style={{
              position: 'relative',
              width: '56px',
              height: '32px',
              borderRadius: '16px',
              backgroundColor: hidePlotInitially ? '#3b82f6' : '#e2e8f0',
              transition: 'background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer',
              flexShrink: 0,
              boxShadow: hidePlotInitially 
                ? '0 2px 8px rgba(59, 130, 246, 0.4)' 
                : 'inset 0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
            onMouseEnter={(e) => {
              if (!hidePlotInitially) {
                e.currentTarget.style.backgroundColor = '#cbd5e1';
              }
            }}
            onMouseLeave={(e) => {
              if (!hidePlotInitially) {
                e.currentTarget.style.backgroundColor = '#e2e8f0';
              }
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '3px',
                left: hidePlotInitially ? '27px' : '3px',
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.25), 0 1px 2px rgba(0, 0, 0, 0.15)',
                transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {hidePlotInitially && (
                <span style={{ fontSize: '14px', lineHeight: '1' }}>👁️</span>
              )}
            </div>
          </div>
          <span>Hide results plot initially (click plot to reveal)</span>
        </label>
        
        {/* Toggle for Hide Video */}
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: '500',
          color: '#1e293b',
          userSelect: 'none',
          marginLeft: '32px',
          paddingLeft: '32px',
          borderLeft: '1px solid #e2e8f0'
        }}>
          {/* Custom Toggle Switch */}
          <div
            onClick={() => setHideVideo(!hideVideo)}
            style={{
              position: 'relative',
              width: '56px',
              height: '32px',
              borderRadius: '16px',
              backgroundColor: hideVideo ? '#3b82f6' : '#e2e8f0',
              transition: 'background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer',
              flexShrink: 0,
              boxShadow: hideVideo 
                ? '0 2px 8px rgba(59, 130, 246, 0.4)' 
                : 'inset 0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
            onMouseEnter={(e) => {
              if (!hideVideo) {
                e.currentTarget.style.backgroundColor = '#cbd5e1';
              }
            }}
            onMouseLeave={(e) => {
              if (!hideVideo) {
                e.currentTarget.style.backgroundColor = '#e2e8f0';
              }
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '3px',
                left: hideVideo ? '27px' : '3px',
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.25), 0 1px 2px rgba(0, 0, 0, 0.15)',
                transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {hideVideo && (
                <span style={{ fontSize: '14px', lineHeight: '1' }}>🎥</span>
              )}
            </div>
          </div>
          <span>Hide video</span>
        </label>
        
        <div style={{
          fontSize: '14px',
          color: '#64748b',
          marginLeft: 'auto'
        }}>
          {hidePlotInitially 
            ? 'Video will show first, click plot area to reveal results' 
            : hideVideo
            ? 'Only results plot will show'
            : 'Both results plot and video will show together'}
        </div>
      </div>

      {/* Sort by Metric Dropdown */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto 40px auto',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '16px 24px',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '2px solid #e2e8f0',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
      }}>
        <label style={{
          fontSize: '16px',
          fontWeight: '500',
          color: '#1e293b',
          userSelect: 'none'
        }}>
          Sort by metric:
        </label>
        <select
          value={selectedMetric || ''}
          onChange={(e) => setSelectedMetric(e.target.value || null)}
          style={{
            padding: '8px 16px',
            fontSize: '16px',
            borderRadius: '8px',
            border: '2px solid #e2e8f0',
            backgroundColor: '#ffffff',
            color: '#1e293b',
            cursor: 'pointer',
            outline: 'none',
            transition: 'all 0.2s ease',
            minWidth: '300px'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#3b82f6';
            e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e2e8f0';
            e.target.style.boxShadow = 'none';
          }}
        >
          <option value="">No sorting (default)</option>
          {Object.entries(metricsData)
            .filter(([key]) => metricsEnabled[key] !== false)
            .map(([key, metric]) => (
              <option key={key} value={key}>
                {metric.name}
              </option>
            ))}
        </select>
        {selectedMetric && (
          <div style={{
            fontSize: '14px',
            color: '#64748b',
            marginLeft: 'auto'
          }}>
            Sorted from best to worst
          </div>
        )}
      </div>

      {/* Trials Grid */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '24px',
        paddingBottom: '40px'
      }}>
        {trials.map((trialName) => {
          const ranking = trialRankings[trialName];
          const loss = trialLosses[trialName];
          const showRanking = selectedMetric && ranking !== undefined;
          const metricValue =
            selectedMetric && metricsData[selectedMetric]
              ? metricsData[selectedMetric].data[trialName]
              : undefined;
          const metricIsInvalid =
            !!selectedMetric &&
            (typeof metricValue !== 'number' || Number.isNaN(metricValue));
          
          return (
            <div
              key={trialName}
              onClick={() => openModal(trialName)}
              style={{
                cursor: 'pointer',
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '16px',
                border: '2px solid #e2e8f0',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.borderColor = '#3b82f6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }}
            >
              {showRanking && (
                <div style={{
                  position: 'absolute',
                  top: '8px',
                  left: '8px',
                  backgroundColor: '#3b82f6',
                  color: '#ffffff',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: '700',
                  boxShadow: '0 2px 8px rgba(59, 130, 246, 0.4)',
                  zIndex: 1
                }}>
                  {ranking}
                </div>
              )}
              <img
                src={`/cogsci2025_tuned/${trialName}_trajectory.png`}
                alt={`${trialName} trajectory`}
                style={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: '8px',
                  display: 'block'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = `<div style="text-align: center; color: #64748b; padding: 20px;">${trialName}<br/>Image not found</div>`;
                }}
              />
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                width: '100%'
              }}>
                <div style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1e293b'
                }}>
                  {trialName}
                </div>
                {selectedMetric && (
                  metricIsInvalid ? (
                    <div style={{
                      fontSize: '12px',
                      color: '#b91c1c',
                      fontWeight: '500',
                      textAlign: 'center'
                    }}>
                      Metric invalid for this trial
                    </div>
                  ) : (
                    showRanking && loss !== undefined && (
                      <div style={{
                        fontSize: '12px',
                        color: '#64748b',
                        fontWeight: '500'
                      }}>
                        {(selectedMetric === 'discrete_mutual_information' ||
                          selectedMetric === 'red_green_ordering' ||
                          selectedMetric === 'decision_prob_correlation' ||
                          selectedMetric === 'green_given_decision_correlation')
                          ? 'Value'
                          : 'Loss'}: {loss.toFixed(6)}
                      </div>
                    )
                  )
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {selectedTrial && (
        <div
          id="modal-backdrop"
          onClick={handleModalClick}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '40px'
          }}
        >
          {/* Close Button */}
          <button
            onClick={closeModal}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              fontSize: '24px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#1e293b',
              fontWeight: 'bold',
              transition: 'all 0.2s ease',
              zIndex: 1001
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#ffffff';
              e.target.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
              e.target.style.transform = 'scale(1)';
            }}
          >
            ×
          </button>

          {/* Left Arrow */}
          {trials.indexOf(selectedTrial) > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigateTrial(-1);
              }}
              style={{
                position: 'absolute',
                left: '20px',
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: 'none',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                fontSize: '24px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#1e293b',
                fontWeight: 'bold',
                transition: 'all 0.2s ease',
                zIndex: 1001
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#ffffff';
                e.target.style.transform = 'translateY(-50%) scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                e.target.style.transform = 'translateY(-50%) scale(1)';
              }}
            >
              ←
            </button>
          )}

          {/* Right Arrow */}
          {trials.indexOf(selectedTrial) < trials.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigateTrial(1);
              }}
              style={{
                position: 'absolute',
                right: '20px',
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: 'none',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                fontSize: '24px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#1e293b',
                fontWeight: 'bold',
                transition: 'all 0.2s ease',
                zIndex: 1001
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#ffffff';
                e.target.style.transform = 'translateY(-50%) scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                e.target.style.transform = 'translateY(-50%) scale(1)';
              }}
            >
              →
            </button>
          )}

          {/* Modal Content */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: '95vw',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '20px',
              width: '100%',
              overflow: 'auto'
            }}
          >
            {/* Trial Name */}
            <div style={{
              color: '#ffffff',
              fontSize: '24px',
              fontWeight: '600',
              textAlign: 'center'
            }}>
              {selectedTrial}
            </div>

            {/* Plot and Video Container */}
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              gap: '24px',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              maxHeight: '75vh',
              flexWrap: 'wrap'
            }}>
              {/* Plot Image */}
              <div 
                style={{
                  flex: hideVideo ? '1 1 100%' : '1 1 50%',
                  minWidth: hideVideo ? 'min(600px, 100%)' : 'min(400px, 100%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px'
                }}
                onClick={() => {
                  if (hidePlotInitially && !plotRevealed) {
                    setPlotRevealed(true);
                  }
                }}
              >
                {hidePlotInitially && !plotRevealed ? (
                  <div style={{
                    width: '100%',
                    minHeight: '400px',
                    maxHeight: '75vh',
                    borderRadius: '8px',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '2px dashed rgba(255, 255, 255, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                  }}
                  >
                    <div style={{
                      textAlign: 'center',
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontSize: '18px',
                      fontWeight: '500',
                      padding: '20px'
                    }}>
                      <div>Click to see results</div>
                    </div>
                  </div>
                ) : (
                  <img
                    src={`/cogsci2025_tuned/${selectedTrial}_plot.png`}
                    alt={`${selectedTrial} plot`}
                    style={{
                      width: '100%',
                      height: 'auto',
                      maxHeight: '75vh',
                      borderRadius: '8px',
                      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                      backgroundColor: '#ffffff',
                      padding: '8px',
                      objectFit: 'contain'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const errorDiv = document.createElement('div');
                      errorDiv.style.cssText = `
                        color: #ffffff; 
                        text-align: center; 
                        padding: 40px;
                        font-size: 18px;
                      `;
                      errorDiv.textContent = `Image not found for ${selectedTrial}`;
                      e.target.parentElement.appendChild(errorDiv);
                    }}
                  />
                )}
              </div>

              {/* Video Player */}
              {!hideVideo && (
                <div style={{
                  flex: '1 1 40%',
                  minWidth: 'min(300px, 100%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <video
                    key={selectedTrial} // Force re-render when trial changes
                    src={`/cogsci2025_tuned/${selectedTrial}_stimulus.mp4`}
                    controls
                    style={{
                      width: '100%',
                      height: 'auto',
                      maxHeight: '75vh',
                      borderRadius: '8px',
                      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                      backgroundColor: '#000000'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const errorDiv = document.createElement('div');
                      errorDiv.style.cssText = `
                        color: #ffffff; 
                        text-align: center; 
                        padding: 40px;
                        font-size: 18px;
                        background: rgba(255, 255, 255, 0.1);
                        border-radius: 8px;
                      `;
                      errorDiv.textContent = `Video not found for ${selectedTrial}`;
                      e.target.parentElement.appendChild(errorDiv);
                    }}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}
            </div>

            {/* Trial Counter */}
            <div style={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '16px',
              textAlign: 'center'
            }}>
              {trials.indexOf(selectedTrial) + 1} / {trials.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TrialByTrialPage;

