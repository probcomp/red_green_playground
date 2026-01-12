import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ASSETS_BASE_PATH } from '../constants';

// Metrics data
const metricsData = {
  'rmse_RGU': {
    name: 'RMSE (Red, Green, Uncertain)',
    data: {'E1': 0.10765777735684094, 'E2': 0.08395084798232277, 'E3': 0.10814078650789205, 'E4': 0.028651471611551925, 'E5': 0.10065736140668985, 'E6': 0.1093907669534604, 'E7': 0.0979252150627977, 'E8': 0.09907321080959146, 'E9': 0.04846208628155116, 'E10': 0.07542742165275704, 'E11': 0.161247839845111, 'E12': 0.18786582248289302, 'E13': 0.13616274959989014, 'E14': 0.17269724312178075, 'E15': 0.08139040281508149, 'E16': 0.06547168001846974, 'E17': 0.08182762273468426, 'E18': 0.10091848903708878, 'E19': 0.1297227110526641, 'E20': 0.07706348214996302, 'E21': 0.20692350336633014, 'E22': 0.1922736180976428, 'E23': 0.11922048466506613, 'E24': 0.09271386889065418, 'E25': 0.1829760297597688, 'E26': 0.16511189559171094, 'E27': 0.20653121781522088, 'E28': 0.09929817363836363, 'E29': 0.14554267434007012, 'E30': 0.13525711745730465, 'E31': 0.09166696100254818, 'E32': 0.17875814925846203, 'E33': 0.12063836938258528, 'E34': 0.057915541902361006, 'E35': 0.11733690533555592, 'E36': 0.10258945924333113, 'E37': 0.10018001969906608, 'E38': 0.06635311679914706, 'E39': 0.11456696023213786, 'E40': 0.14959669230318542, 'E41': 0.08524429052549534, 'E42': 0.08366676308453991, 'E43': 0.15868634250888056, 'E44': 0.08273169782172421, 'E45': 0.06163415603226407, 'E46': 0.07076719910408384, 'E47': 0.06797092371725394, 'E48': 0.1495506934721418, 'E49': 0.11466367865342754, 'E50': 0.0783730081208633}
  },
  'rmse_RG': {
    name: 'RMSE',
    data: {'E1': 0.10156797879957123, 'E2': 0.06757057114520638, 'E3': 0.10901543761504913, 'E4': 0.027059922396885445, 'E5': 0.10905635867487579, 'E6': 0.1295152871257022, 'E7': 0.08757773483331625, 'E8': 0.1000497949565201, 'E9': 0.042378766187961436, 'E10': 0.06064409266136239, 'E11': 0.1614642862421131, 'E12': 0.17008840199566985, 'E13': 0.1591397795075889, 'E14': 0.17764535627294986, 'E15': 0.06947961843422147, 'E16': 0.05431312302003462, 'E17': 0.08621606876800669, 'E18': 0.115523132902664, 'E19': 0.14890165354122892, 'E20': 0.08681191749239611, 'E21': 0.250456336569506, 'E22': 0.23348973165437703, 'E23': 0.13337768275058454, 'E24': 0.10813896887976841, 'E25': 0.21854222185182418, 'E26': 0.19192669287489533, 'E27': 0.25017107892147566, 'E28': 0.11769118920743236, 'E29': 0.12139478505371946, 'E30': 0.11634068770582488, 'E31': 0.09125444799145217, 'E32': 0.21424821529216112, 'E33': 0.1276779438422897, 'E34': 0.06429738626614823, 'E35': 0.10811990534187668, 'E36': 0.11222030285500031, 'E37': 0.11731227654217104, 'E38': 0.06646539417580193, 'E39': 0.10872506188058358, 'E40': 0.15408682823018754, 'E41': 0.07713102734224346, 'E42': 0.09883064522651905, 'E43': 0.18472540731036952, 'E44': 0.09595901650932351, 'E45': 0.05270264024094386, 'E46': 0.07028840498208377, 'E47': 0.07179283731729062, 'E48': 0.178235253382847, 'E49': 0.10582403067817078, 'E50': 0.08381987437283993}
  },
  'rmse_(|R-G|)': {
    name: 'RMSE (|Red - Green|)',
    data: {'E1': 0.16342530272192335, 'E2': 0.07906616139969863, 'E3': 0.1902826749608973, 'E4': 0.043939912656149833, 'E5': 0.15756793756893275, 'E6': 0.16831810263376765, 'E7': 0.12832087130807895, 'E8': 0.12579572711230405, 'E9': 0.06057244069912779, 'E10': 0.07069899600963965, 'E11': 0.26699196203819536, 'E12': 0.2303723868035214, 'E13': 0.2597658043292617, 'E14': 0.3155350343142418, 'E15': 0.09534836786954659, 'E16': 0.06934757395983826, 'E17': 0.13739401998464618, 'E18': 0.17743897552596505, 'E19': 0.26441386183017274, 'E20': 0.16544244980120695, 'E21': 0.34801657800500296, 'E22': 0.2683222164071067, 'E23': 0.25237075827378413, 'E24': 0.2106576252791645, 'E25': 0.3429867609288137, 'E26': 0.24777462355036134, 'E27': 0.33154463962510444, 'E28': 0.18190339148691514, 'E29': 0.10997800973765792, 'E30': 0.12168168858655895, 'E31': 0.11290571112021835, 'E32': 0.11811899563975846, 'E33': 0.2285908059783927, 'E34': 0.11632141258765795, 'E35': 0.16483844517430635, 'E36': 0.13368606218504472, 'E37': 0.19934807235861926, 'E38': 0.11011267890144347, 'E39': 0.11624394896188046, 'E40': 0.2613024928317259, 'E41': 0.08665628695364311, 'E42': 0.15244362944066567, 'E43': 0.2515736612537496, 'E44': 0.1676500304892193, 'E45': 0.07095642929813595, 'E46': 0.11580864607834983, 'E47': 0.10144472046048261, 'E48': 0.3066743764868097, 'E49': 0.12411349625483856, 'E50': 0.14667340080098476}
  },
  'rmse_(R-G)': {
    name: 'RMSE (Red - Green)',
    data: {'E1': 0.16469892175826625, 'E2': 0.07906616139969863, 'E3': 0.19032315862965166, 'E4': 0.043939912656149833, 'E5': 0.20239570891811912, 'E6': 0.25445282060043994, 'E7': 0.1313434984912553, 'E8': 0.174966469715443, 'E9': 0.061074033118845975, 'E10': 0.07069899600963965, 'E11': 0.2800387416517694, 'E12': 0.2601916316662046, 'E13': 0.31037386068181855, 'E14': 0.31602883141648547, 'E15': 0.09534836786954659, 'E16': 0.06956916946330333, 'E17': 0.15656303380948045, 'E18': 0.22253076444683417, 'E19': 0.28730866550682754, 'E20': 0.16553402450555757, 'E21': 0.497913898611717, 'E22': 0.46497020988351867, 'E23': 0.2531739829527782, 'E24': 0.2106576252791645, 'E25': 0.4314203680769468, 'E26': 0.3731344508748852, 'E27': 0.4975419385094051, 'E28': 0.23135884300932616, 'E29': 0.15770907667998502, 'E30': 0.16225741963499946, 'E31': 0.1573396022971325, 'E32': 0.4237338300824299, 'E33': 0.23269958221041573, 'E34': 0.1214178458976159, 'E35': 0.1698105872012773, 'E36': 0.20972979472094722, 'E37': 0.22905220436469298, 'E38': 0.11531558182129853, 'E39': 0.17762339191425094, 'E40': 0.27444305923100726, 'E41': 0.1178787727779446, 'E42': 0.19391904723416634, 'E43': 0.35943955088353075, 'E44': 0.1863201428274047, 'E45': 0.07258858147649468, 'E46': 0.12090810494934319, 'E47': 0.13063356968050546, 'E48': 0.3514407539496387, 'E49': 0.16658053669873055, 'E50': 0.15403779676927767}
  },
  'KL_divergence': {
    name: 'KL Divergence',
    data: {'E1': 0.11922100926026889, 'E2': 0.38465186223978665, 'E3': 0.18171486866372108, 'E4': 0.3803363839009539, 'E5': 0.20893824918612952, 'E6': 0.1461032793941189, 'E7': 0.1413899980772877, 'E8': 0.09500044346888614, 'E9': 0.07051937626562405, 'E10': 0.08452453851130838, 'E11': 0.13001074047711472, 'E12': 0.2592912515474428, 'E13': 0.11422360027359729, 'E14': 0.20917912016124154, 'E15': 0.1723999962655592, 'E16': 0.16436238189763536, 'E17': 0.13057054649531746, 'E18': 0.12374430470583586, 'E19': 0.2189495894474831, 'E20': 0.15389656365498636, 'E21': 0.20693511795712113, 'E22': 0.3712926708537913, 'E23': 0.18858883434345705, 'E24': 0.15841286676669092, 'E25': 0.18073877150830273, 'E26': 0.20005085605166872, 'E27': 0.3222276068093732, 'E28': 0.12694375367001648, 'E29': 0.1946025015102276, 'E30': 0.1883934064043339, 'E31': 0.07616924809353169, 'E32': 0.16618693926561326, 'E33': 0.22487349022192907, 'E34': 0.05444183632165837, 'E35': 0.15668165722646105, 'E36': 0.09503522161944794, 'E37': 0.07860088313959916, 'E38': 0.11865813375181734, 'E39': 0.12707026339894126, 'E40': 0.16677916627054476, 'E41': 0.10815768694660544, 'E42': 0.1330659721638574, 'E43': 0.21439381684578, 'E44': 0.1579884487937152, 'E45': 0.125357926404155, 'E46': 0.09028630705848187, 'E47': 0.07388282681196542, 'E48': 0.25085821844564365, 'E49': 0.10226059853738136, 'E50': 0.05075235052076038}
  },
  'discrete_mutual_information': {
    name: 'Discrete Mutual Information',
    data: {'E1': 1.2294394999232674, 'E2': 0.9957253951137326, 'E3': 1.1022892137223812, 'E4': 1.1105607491151936, 'E5': 1.051290500148518, 'E6': 1.1777169212513077, 'E7': 1.1386331350732883, 'E8': 1.187286091494989, 'E9': 1.1141821292310292, 'E10': 0.9704211232784172, 'E11': 0.9386221318838879, 'E12': 0.9661778619494086, 'E13': 0.99805642471822, 'E14': 1.0038664845161225, 'E15': 1.222354277699099, 'E16': 1.0598460559683731, 'E17': 1.2318305035556043, 'E18': 1.079369277604053, 'E19': 0.9656775062474348, 'E20': 1.2405036333722212, 'E21': 0.8981379058168492, 'E22': 0.9030706964981488, 'E23': 1.0445389612463742, 'E24': 1.3225920389890384, 'E25': 1.0581051343043228, 'E26': 1.178791341392294, 'E27': 0.7296320869098849, 'E28': 1.0994428231922875, 'E29': 0.8817813272073755, 'E30': 0.979167332976369, 'E31': 1.1319414543323854, 'E32': 1.0655280908781115, 'E33': 1.0156907814854497, 'E34': 1.1952441731386099, 'E35': 1.071011623427946, 'E36': 1.1197300885605814, 'E37': 1.297421825656084, 'E38': 1.214793928751294, 'E39': 0.9770040959847518, 'E40': 1.1551703999074983, 'E41': 1.103454530608032, 'E42': 1.1605948015907934, 'E43': 1.1018199786571259, 'E44': 1.3222011650652412, 'E45': 1.3121531253296241, 'E46': 1.2561447712924658, 'E47': 1.2541701362040878, 'E48': 0.8393103175440503, 'E49': 1.2873911512390954, 'E50': 1.2216356394684238}
  },
  'red_green_ordering': {
    name: 'Red vs Green Ordering',
    data: {'E1': 0.8974358974358975, 'E2': 0.84375, 'E3': 0.9318181818181818, 'E4': 0.9795918367346939, 'E5': 0.5428571428571428, 'E6': 0.59375, 'E7': 0.8405797101449275, 'E8': 0.7142857142857143, 'E9': 0.975, 'E10': 0.975, 'E11': 0.803921568627451, 'E12': 0.875, 'E13': 0.5106382978723404, 'E14': 0.9, 'E15': 0.9, 'E16': 0.9459459459459459, 'E17': 0.875, 'E18': 0.7142857142857143, 'E19': 0.631578947368421, 'E20': 0.9705882352941176, 'E21': 0.45, 'E22': 0.5357142857142857, 'E23': 0.8947368421052632, 'E24': 0.9722222222222222, 'E25': 0.7391304347826086, 'E26': 0.8103448275862069, 'E27': 0.4, 'E28': 0.5576923076923077, 'E29': 0.7878787878787878, 'E30': 0.7941176470588235, 'E31': 0.703125, 'E32': 0.3076923076923077, 'E33': 0.890625, 'E34': 0.8214285714285714, 'E35': 0.9285714285714286, 'E36': 0.6046511627906976, 'E37': 0.6829268292682927, 'E38': 0.8676470588235294, 'E39': 0.6296296296296297, 'E40': 0.8363636363636363, 'E41': 0.5897435897435898, 'E42': 0.6666666666666666, 'E43': 0.38461538461538464, 'E44': 0.8055555555555556, 'E45': 0.9180327868852459, 'E46': 0.8717948717948718, 'E47': 0.717948717948718, 'E48': 0.4878048780487805, 'E49': 0.4375, 'E50': 0.8529411764705882}
  },
  'decision_prob_rmse': {
    name: 'P(Decision) RMSE',
    data: {'E1': 0.11890535076852135, 'E2': 0.10959776667922755, 'E3': 0.10636991042035868, 'E4': 0.03159496283067561, 'E5': 0.08129658345357821, 'E6': 0.04848299171351407, 'E7': 0.11588064531325427, 'E8': 0.09709057811488107, 'E9': 0.05876905455300196, 'E10': 0.0985518942593626, 'E11': 0.16081407308066561, 'E12': 0.219135968714952, 'E13': 0.07049783182736281, 'E14': 0.16234921661315083, 'E15': 0.10108589543390141, 'E16': 0.08342536777829535, 'E17': 0.07225550843783557, 'E18': 0.06214849810972008, 'E19': 0.07836160050646358, 'E20': 0.05238055751726807, 'E21': 0.054728929101084796, 'E22': 0.04327265964796452, 'E23': 0.08403189501307616, 'E24': 0.04898480655531056, 'E25': 0.0701375572434591, 'E26': 0.09007831771228525, 'E27': 0.05286108530142194, 'E28': 0.04333531850147815, 'E29': 0.18459312686473894, 'E30': 0.1667727562788622, 'E31': 0.09248646745269692, 'E32': 0.06370896535951075, 'E33': 0.10515480880243902, 'E34': 0.04235944074484301, 'E35': 0.13388061920570463, 'E36': 0.07991870055113078, 'E37': 0.05083078383914785, 'E38': 0.06612799014785121, 'E39': 0.12543718335734153, 'E40': 0.1401856261393555, 'E41': 0.09950566036083246, 'E42': 0.03828039789962276, 'E43': 0.08542314489980686, 'E44': 0.04601451699759553, 'E45': 0.0764275538840261, 'E46': 0.07171519823064211, 'E47': 0.05959627868245089, 'E48': 0.059670919693768906, 'E49': 0.13055966708390696, 'E50': 0.06614712787401562}
  },
  'green_given_decision_rmse': {
    name: 'Weighted P(Green|Decision) RMSE',
    data: {'E1': 0.156086569865108, 'E2': 0.030376897533456706, 'E3': 0.16432988630286374, 'E4': 0.04705532315078076, 'E5': 0.17492895341469022, 'E6': 0.21487988872240954, 'E7': 0.07724403076967754, 'E8': 0.14864446899023165, 'E9': 0.04291218835030937, 'E10': 0.05293988244476476, 'E11': 0.16545819466496564, 'E12': 0.1500956476586325, 'E13': 0.2387921075745424, 'E14': 0.18345687165959473, 'E15': 0.05689425792740224, 'E16': 0.01837064587216074, 'E17': 0.09583894370276648, 'E18': 0.1405835950545933, 'E19': 0.22632301801288884, 'E20': 0.1269234070168537, 'E21': 0.3082806395157173, 'E22': 0.30954926829221396, 'E23': 0.16431930959240698, 'E24': 0.15043698673520056, 'E25': 0.25988968239612026, 'E26': 0.2402799250965525, 'E27': 0.37448679814796976, 'E28': 0.18090647162312312, 'E29': 0.14673595693208172, 'E30': 0.13843698094784276, 'E31': 0.12778152622565728, 'E32': 0.3134784923103197, 'E33': 0.17195330847131884, 'E34': 0.07955272709124812, 'E35': 0.1007143224275133, 'E36': 0.1585231241876484, 'E37': 0.18591568554943655, 'E38': 0.06426883903435154, 'E39': 0.14140851551434883, 'E40': 0.1820252784020715, 'E41': 0.13411983706005307, 'E42': 0.15442417521137491, 'E43': 0.23448878109678323, 'E44': 0.14206770683901485, 'E45': 0.04456030602209344, 'E46': 0.10050071711153466, 'E47': 0.1006346568383902, 'E48': 0.2684705518247437, 'E49': 0.146361086206286, 'E50': 0.11112960647267864}
  },
  'decision_prob_correlation': {
    name: 'P(Decision) Correlation',
    data: {'E1': 0.9864791886072867, 'E2': 0.9730837889871465, 'E3': 0.9861375354763054, 'E4': 0.9972018140155291, 'E5': 0.9764666159470555, 'E6': 0.9940172430640628, 'E7': 0.9767801474584907, 'E8': 0.9743958484615934, 'E9': 0.9898602899417521, 'E10': 0.9795217470708596, 'E11': 0.9433260944149967, 'E12': 0.8886137856342735, 'E13': 0.9869486369431527, 'E14': 0.9607694406605494, 'E15': 0.9768759516675206, 'E16': 0.9846872221876833, 'E17': 0.9753790206853064, 'E18': 0.9930307345419688, 'E19': 0.983991592159656, 'E20': 0.989442010735715, 'E21': 0.9901617682120613, 'E22': 0.9919259239942989, 'E23': 0.9896734297341894, 'E24': 0.9940953513248872, 'E25': 0.9788267759815922, 'E26': 0.9790412384076803, 'E27': 0.9836801220525109, 'E28': 0.9925992409567144, 'E29': 0.9415310425957455, 'E30': 0.9552319557175977, 'E31': 0.9618514564218261, 'E32': 0.9968049058108335, 'E33': 0.9591496386989057, 'E34': 0.9919503246409159, 'E35': 0.9705909818142536, 'E36': 0.9722975794643959, 'E37': 0.9915919203515302, 'E38': 0.9901300174444334, 'E39': 0.9801206121140448, 'E40': 0.9434352180932176, 'E41': 0.9589633822313117, 'E42': 0.9967746215022805, 'E43': 0.9770607585349427, 'E44': 0.9920620362805361, 'E45': 0.9778173086944741, 'E46': 0.9872410218704546, 'E47': 0.9901038493062418, 'E48': 0.9866962713209451, 'E49': 0.9644687837428622, 'E50': 0.9829317552484518}
  },
  'green_given_decision_correlation': {
    name: 'Weighted P(Green|Decision) Correlation',
    data: {'E1': 0.8361469568375938, 'E2': NaN, 'E3': 0.7645037539089866, 'E4': NaN, 'E5': 0.6988776242915842, 'E6': 0.8811620525622876, 'E7': 0.8724865670446825, 'E8': 0.9136562833630189, 'E9': 0.7786740087396903, 'E10': 0.530582566340881, 'E11': 0.8882313918756684, 'E12': 0.911588347675964, 'E13': 0.8916812854065004, 'E14': 0.682658243204618, 'E15': 0.9020772232498255, 'E16': 0.9407026913469139, 'E17': 0.9663020037550852, 'E18': 0.9750237445725031, 'E19': 0.9300606107820142, 'E20': 0.8984331592792697, 'E21': 0.649415444744521, 'E22': 0.9270801437582691, 'E23': 0.8587967684299921, 'E24': 0.8355706245053931, 'E25': 0.9711210758747342, 'E26': 0.9355833029641036, 'E27': 0.9153101114741337, 'E28': 0.8747574067046868, 'E29': 0.7400467407407348, 'E30': 0.8566644985530575, 'E31': 0.8929924977985578, 'E32': 0.9433618223965643, 'E33': 0.5580806515308366, 'E34': 0.9500191101667036, 'E35': 0.4700894382476143, 'E36': 0.7800984520397435, 'E37': 0.9112325522840407, 'E38': 0.9904748992686726, 'E39': 0.7687077763088784, 'E40': 0.9554892287457315, 'E41': 0.862635837839401, 'E42': 0.9670349154768589, 'E43': 0.9089404178628777, 'E44': 0.9447113350528271, 'E45': 0.990704988600573, 'E46': 0.9417521450748857, 'E47': 0.9617620723172425, 'E48': 0.7441171072481327, 'E49': 0.9372439048972536, 'E50': 0.9352958628598199}
  },
  'absolute_score_difference': {
    name: 'Absolute Trial Score Difference',
    data: {'E1': 12.911186440677952, 'E2': 3.2457415254237247, 'E3': 16.487318952234197, 'E4': 2.204635074368724, 'E5': 6.011079903147692, 'E6': 16.30614406779661, 'E7': 9.57137803979365, 'E8': 9.233753026634375, 'E9': 3.781813559322032, 'E10': 4.077203389830501, 'E11': 9.966819541375873, 'E12': 0.356906779661017, 'E13': 24.238817165524704, 'E14': 28.442318644067804, 'E15': 6.9229830508474635, 'E16': 2.2128263857077286, 'E17': 9.217736077481845, 'E18': 17.484140435835357, 'E19': 24.90695807314897, 'E20': 12.795214356929215, 'E21': 36.74345762711866, 'E22': 31.165980629539938, 'E23': 20.19371989295275, 'E24': 13.649359698681742, 'E25': 35.03711127487104, 'E26': 24.992413793103445, 'E27': 42.94419722650231, 'E28': 16.273989569752274, 'E29': 7.651052901900357, 'E30': 12.216530408773664, 'E31': 8.394957627118643, 'E32': 34.35085614950022, 'E33': 10.24280720338983, 'E34': 6.200326876513316, 'E35': 11.609023405972557, 'E36': 9.758202601497832, 'E37': 18.81069863579991, 'E38': 6.281794616151537, 'E39': 5.99151286880101, 'E40': 21.071593220338983, 'E41': 8.483911342894395, 'E42': 15.93604519774011, 'E43': 29.08080312907431, 'E44': 11.665687382297556, 'E45': 4.08983606557377, 'E46': 5.955462842242511, 'E47': 7.25807909604519, 'E48': 30.40926002480364, 'E49': 13.106080508474573, 'E50': 13.847786640079782}
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
  'green_given_decision_correlation': true,
  'absolute_score_difference': true
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
                src={`${ASSETS_BASE_PATH}/cogsci2025_tuned/${trialName}_trajectory.png`}
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
                    src={`${ASSETS_BASE_PATH}/cogsci2025_tuned/${selectedTrial}_plot.png`}
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
                    src={`${ASSETS_BASE_PATH}/cogsci2025_tuned/${selectedTrial}_stimulus.mp4`}
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

