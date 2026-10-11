/*
 * ids_radicals.js — 部首・部品パレット用のデータ(画数別)
 *
 * kangxi:   康熙部首214字(通常の漢字コードで表記。例: 木 U+6728)
 * variants: 部首の変形・よく使う部品(亻 氵 艹 辶 𧾷 ⻖ ⻏ など)
 * parts:    その他の部品(拡張漢字・CJK筆画・IDSでよく使う構成要素)
 *
 * すべてのグループを通して同じ字は1回しか出てきません(重複は先の画数を優先)。
 * 13画以上は1グループにまとめています。
 * 純粋なデータです。UIは移植先で自由に作ってください。
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.IDSRadicals = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const RADICALS = [
    { strokes: 1, label: "1画",
      kangxi: "一丨丶丿乙亅",
      variants: "乚",
      parts: "乀乛𠃍𠃌㇇㇈𠄎㇁𠃊㇄𠄌𠃑㇉𠃋𡿨㇂" },
    { strokes: 2, label: "2画",
      kangxi: "二亠人儿入八冂冖冫几凵刀力勹匕匚匸十卜卩厂厶又",
      variants: "亻刂丷𠆢",
      parts: "丅丆丂𠂇𬺰𠀁𫠠⺊〢丄𠃎𠂉⺈乂㐅𠂊𰀪𠂆𠤎⺆讠⺀𬼀コ㔾龴ユ𰆊丩𠂈巜𢎘" },
    { strokes: 3, label: "3画",
      kangxi: "口囗土士夂夊夕大女子宀寸小尢尸屮山巛工己巾干幺广廴廾弋弓彐彡彳",
      variants: "忄扌氵犭艹辶阝⻖⻏",
      parts: "亍𰀁卄𰀄亐㐄𠫓𠫔𠆣𰀃𡕒夨𡭔⺌𰀠𠔼〣𣥂𠀃饣亼亇乇𫶧𰃦𠂋𠂎亽𠓛𠚤𱍸䒑丬𭕄𫜹⺕卪卂𠃓彑𫝀亾乆纟" },
    { strokes: 4, label: "4画",
      kangxi: "心戈戶手支攴文斗斤方无日曰月木欠止歹殳毋比毛氏气水火爪父爻爿片牙牛犬",
      variants: "灬爫牜礻攵耂王𤣩戸",
      parts: "龷卝廿𠮛帀旡厷龶𢆰朩丏𠔿龰⺝冄冃𫩏𦉪𰀡𦉫𠁣⺼𧘇仌壬𡈼𠂔龵厃尣卬卆仒𠂒丯𱼀冘㓁夬肀弔𠬝刅𢀳𠃜丮㣺𠬞㞢丱厸" },
    { strokes: 5, label: "5画",
      kangxi: "玄玉瓜瓦甘生用田疋疒癶白皮皿目矛矢石示禸禾穴立",
      variants: "罒衤",
      parts: "犮戊𰀉𡗜𠀎𡗗𫇦戉𣄼圥戋朮𤴓卌𬺻𪩲冋曳𠕁歺龱𪠲龸𠀐𦉰囙丗𮍌钅氐卯㐱㐌尒夗刍㕣𠂡夘𬼉𢆉宂𰃮㠯𢀖𠬤氶㞋𡰪𤴔氺弁" },
    { strokes: 6, label: "6画",
      kangxi: "竹米糸缶网羊羽老而耒耳聿肉臣自至臼舌舛舟艮色艸虍虫血行衣襾",
      variants: "糹⺮",
      parts: "覀𢦏朿幵㓞巩𤰔㐁𠀠吅尗𠕋𥫗𦥑𠂤囟夅𠂢甶𠇍𠂭𧰨𠫤𫥞乑𭤨龹𦍌㐫屰𣅀𰁜帇𢑑劦叒䏍厽" },
    { strokes: 7, label: "7画",
      kangxi: "見角言谷豆豕豸貝赤走足身車辛辰辵邑酉釆里",
      variants: "𧾷訁麦",
      parts: "巠孛𦣞尨𦣻𦔮耴𡉵丣𫠩𢦒镸肙圼冏囧甹𣦼夆攸寽䖝𦥔佥皃𦈢𭻾㐬𠬶𠃬夋矣𣧄戼" },
    { strokes: 8, label: "8画",
      kangxi: "金長門阜隶隹雨靑非",
      variants: "釒飠青",
      parts: "枼夌戔𦭝疌𠦝臤坴豖亟㚔叀𡘆忝𣏟咼㝵畀冐㡀𫩠𦙃卥臾𠈌臽匊𨸏匋𥝢忩㸚㸒㑒㦰咅𣏋㐭罙𢼄斉㫄叕𡬠沓㣇甾" },
    { strokes: 9, label: "9画",
      kangxi: "面革韋韭音頁風飛食首香",
      variants: "",
      parts: "畐壴垔耎荅㪅𠀷曷昜禺昷耑咢咠𬙙𠧪臿叟爰禹𣬉矦弇㲋爯叜㒸叚癸凾𢏚彖㚇芔𡿺𩠐" },
    { strokes: 10, label: "10画",
      kangxi: "馬骨高髟鬥鬯鬲鬼",
      variants: "",
      parts: "尃㱿冓𤰇𡘤𦐇眔𧴪畟丵䍃奚芻虒𠂹皋𰮤竜𤇾𡨄隺冡圅𣁋" },
    { strokes: 11, label: "11画",
      kangxi: "魚鳥鹵鹿麥麻",
      variants: "黄",
      parts: "殸堇㒼埶𦰩殹𠩺桼䙴𢛳𮍏虘虖啚𠁁皐悤𬀷𣶒𡕩啇羕翏" },
    { strokes: 12, label: "12画",
      kangxi: "黃黍黑黹",
      variants: "",
      parts: "尞賁𦓔朁厤棥畱菐戢敫翕雋㫺衆𡍮𤔔舄戠𰕎叅" },
    { strokes: 13, label: "13画以上",
      kangxi: "黽鼎鼓鼠鼻齊齒龍龜龠",
      variants: "",
      parts: "畺𣪠皷𰯲臧𡏳賛𧶠韯奭𤴡雚霝夒喿睘睪豊豦㬎畾嶲瞏瞿𪉷僉𦥯㥯夐臱䝿𢀩毚韱𤐫亶𣎆稟廌賔廛褱襄𦎫𦎧𬴘𩫏𡕰㡭巤䜌" }
  ];

  return { RADICALS };
});
