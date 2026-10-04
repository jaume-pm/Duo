from __future__ import annotations

import json
import unicodedata
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "src" / "data"

PY: dict[str, str] = {
    "我": "wǒ",
    "你": "nǐ",
    "他": "tā",
    "她": "tā",
    "它": "tā",
    "我们": "wǒmen",
    "你们": "nǐmen",
    "他们": "tāmen",
    "这": "zhè",
    "那": "nà",
    "哪": "nǎ",
    "这个": "zhège",
    "那个": "nàge",
    "这儿": "zhèr",
    "那儿": "nàr",
    "哪儿": "nǎr",
    "这里": "zhèlǐ",
    "那里": "nàlǐ",
    "谁": "shéi",
    "什么": "shénme",
    "怎么": "zěnme",
    "几": "jǐ",
    "多少": "duōshao",
    "大": "dà",
    "小": "xiǎo",
    "多": "duō",
    "少": "shǎo",
    "好": "hǎo",
    "很": "hěn",
    "太": "tài",
    "都": "dōu",
    "不": "bù",
    "没": "méi",
    "没有": "méiyǒu",
    "在": "zài",
    "有": "yǒu",
    "是": "shì",
    "的": "de",
    "得": "de",
    "了": "le",
    "吗": "ma",
    "呢": "ne",
    "吧": "ba",
    "和": "hé",
    "也": "yě",
    "还": "hái",
    "去": "qù",
    "来": "lái",
    "看": "kàn",
    "听": "tīng",
    "说": "shuō",
    "读": "dú",
    "写": "xiě",
    "吃": "chī",
    "喝": "hē",
    "买": "mǎi",
    "做": "zuò",
    "学": "xué",
    "学习": "xuéxí",
    "工作": "gōngzuò",
    "想": "xiǎng",
    "喜欢": "xǐhuan",
    "会": "huì",
    "能": "néng",
    "请": "qǐng",
    "谢谢": "xièxie",
    "叫": "jiào",
    "年": "nián",
    "月": "yuè",
    "日": "rì",
    "天": "tiān",
    "星期": "xīngqī",
    "今天": "jīntiān",
    "明天": "míngtiān",
    "昨天": "zuótiān",
    "现在": "xiànzài",
    "点": "diǎn",
    "分": "fēn",
    "分钟": "fēnzhōng",
    "时候": "shíhou",
    "家": "jiā",
    "学校": "xuéxiào",
    "商店": "shāngdiàn",
    "饭店": "fàndiàn",
    "医院": "yīyuàn",
    "中国": "Zhōngguó",
    "北京": "Běijīng",
    "上海": "Shànghǎi",
    "人": "rén",
    "老师": "lǎoshī",
    "学生": "xuésheng",
    "同学": "tóngxué",
    "朋友": "péngyou",
    "爸爸": "bàba",
    "妈妈": "māma",
    "儿子": "érzi",
    "女儿": "nǚ'ér",
    "水": "shuǐ",
    "茶": "chá",
    "菜": "cài",
    "米饭": "mǐfàn",
    "苹果": "píngguǒ",
    "杯子": "bēizi",
    "钱": "qián",
    "块": "kuài",
    "本": "běn",
    "个": "ge",
    "岁": "suì",
    "号": "hào",
    "件": "jiàn",
    "衣服": "yīfu",
    "书": "shū",
    "桌子": "zhuōzi",
    "椅子": "yǐzi",
    "电脑": "diànnǎo",
    "电视": "diànshì",
    "电影": "diànyǐng",
    "飞机": "fēijī",
    "车": "chē",
    "天气": "tiānqì",
    "热": "rè",
    "冷": "lěng",
    "高兴": "gāoxìng",
    "漂亮": "piàoliang",
    "忙": "máng",
    "开": "kāi",
    "住": "zhù",
    "坐": "zuò",
    "打": "dǎ",
    "电话": "diànhuà",
    "认识": "rènshi",
    "饭": "fàn",
    "睡觉": "shuìjiào",
    "下雨": "xiàyǔ",
    "猫": "māo",
    "狗": "gǒu",
    "医生": "yīshēng",
    "回": "huí",
    "回家": "huíjiā",
    "回来": "huílai",
    "里": "lǐ",
    "上": "shàng",
    "下": "xià",
    "前面": "qiánmiàn",
    "后面": "hòumiàn",
    "上午": "shàngwǔ",
    "中午": "zhōngwǔ",
    "下午": "xiàwǔ",
    "今年": "jīnnián",
    "一点儿": "yìdiǎnr",
    "一下": "yíxià",
    "已经": "yǐjīng",
    "机场": "jīchǎng",
    "接": "jiē",
    "到": "dào",
    "出": "chū",
    "穿": "chuān",
    "着": "zhe",
    "红色": "hóngsè",
    "介绍": "jièshào",
    "妻子": "qīzi",
    "孩子": "háizi",
    "丈夫": "zhàngfu",
    "欢迎": "huānyíng",
    "早上": "zǎoshang",
    "是不是": "shìbushì",
    "给": "gěi",
    "找": "zhǎo",
    "房子": "fángzi",
    "真": "zhēn",
    "离": "lí",
    "公司": "gōngsī",
    "近": "jìn",
    "千": "qiān",
    "房间": "fángjiān",
    "每": "měi",
    "公共汽车": "gōnggòngqìchē",
    "站": "zhàn",
    "两": "liǎng",
    "百": "bǎi",
    "米": "mǐ",
    "超市": "chāoshì",
    "远": "yuǎn",
    "旁边": "pángbiān",
    "走": "zǒu",
    "看看": "kànkan",
    "问问": "wènwen",
    "说说": "shuōshuo",
    "想想": "xiǎngxiang",
    "走走": "zǒuzou",
    "要": "yào",
    "牛奶": "niúnǎi",
    "咖啡": "kāfēi",
    "第一": "dì-yī",
    "第": "dì",
    "一": "yī",
    "二": "èr",
    "三": "sān",
    "四": "sì",
    "五": "wǔ",
    "六": "liù",
    "七": "qī",
    "八": "bā",
    "九": "jiǔ",
    "十": "shí",
    "新": "xīn",
    "上班": "shàngbān",
    "再": "zài",
    "别": "bié",
    "不要": "búyào",
    "对": "duì",
    "身体": "shēntǐ",
    "报纸": "bàozhǐ",
    "迟到": "chídào",
    "等": "děng",
    "送": "sòng",
    "可以": "kěyǐ",
    "快": "kuài",
    "进": "jìn",
    "进来": "jìnlai",
    "进去": "jìnqu",
    "大家": "dàjiā",
    "姓": "xìng",
    "不想": "bùxiǎng",
    "正在": "zhèngzài",
    "虽然": "suīrán",
    "但是": "dànshì",
    "晚上": "wǎnshang",
    "开始": "kāishǐ",
    "课": "kè",
    "让": "ràng",
    "帮助": "bāngzhù",
    "懂": "dǒng",
    "听懂": "tīngdǒng",
    "看见": "kànjiàn",
    "找到": "zhǎodào",
    "做好": "zuòhǎo",
    "长": "cháng",
    "时间": "shíjiān",
    "休息": "xiūxi",
    "班": "bān",
    "男": "nán",
    "女": "nǚ",
    "觉得": "juéde",
    "最": "zuì",
    "哥哥": "gēge",
    "起床": "qǐchuáng",
    "考试": "kǎoshì",
    "教室": "jiàoshì",
    "零": "líng",
    "妹妹": "mèimei",
    "为什么": "wèishénme",
    "道": "dào",
    "题": "tí",
    "准备": "zhǔnbèi",
    "旅游": "lǚyóu",
    "可能": "kěnéng",
    "泰国": "Tàiguó",
    "过": "guo",
    "去过": "qùguo",
    "来过": "láiguo",
    "看过": "kànguo",
    "吃过": "chīguo",
    "坐过": "zuòguo",
    "便宜": "piányi",
    "从": "cóng",
    "小时": "xiǎoshí",
    "火车": "huǒchē",
    "票": "piào",
    "火车站": "huǒchēzhàn",
    "手机": "shǒujī",
    "告诉": "gàosu",
    "知道": "zhīdào",
    "以后": "yǐhòu",
    "的时候": "de shíhou",
    "快乐": "kuàilè",
    "礼物": "lǐwù",
    "手表": "shǒubiǎo",
    "非常": "fēicháng",
    "玩儿": "wánr",
    "去年": "qùnián",
    "雪": "xuě",
    "下雪": "xiàxuě",
    "路": "lù",
    "白": "bái",
    "好吃": "hǎochī",
    "宾馆": "bīnguǎn",
    "游泳": "yóuyǒng",
    "有点儿": "yǒudiǎnr",
    "还可以": "hái kěyǐ",
    "一起": "yìqǐ",
    "生日": "shēngrì",
    "您": "nín",
    "粉色": "fěnsè",
    "别的": "biéde",
    "颜色": "yánsè",
    "黑": "hēi",
    "黑色": "hēisè",
    "拿": "ná",
    "就": "jiù",
    "服务员": "fúwùyuán",
    "比": "bǐ",
    "羊肉": "yángròu",
    "鱼": "yú",
    "洗手间": "xǐshǒujiān",
    "洗": "xǐ",
    "手": "shǒu",
    "门": "mén",
    "外": "wài",
    "外面": "wàimiàn",
    "件件": "jiànjiàn",
    "个个": "gègè",
    "天天": "tiāntiān",
    "生病": "shēngbìng",
    "一直": "yìzhí",
    "事情": "shìqing",
    "因为": "yīnwèi",
    "所以": "suǒyǐ",
    "出院": "chūyuàn",
    "完": "wán",
    "做完": "zuòwán",
    "按时": "ànshí",
    "药": "yào",
    "水果": "shuǐguǒ",
    "运动": "yùndòng",
    "错": "cuò",
    "跑步": "pǎobù",
    "经常": "jīngcháng",
    "打篮球": "dǎ lánqiú",
    "篮球": "lánqiú",
    "踢足球": "tī zúqiú",
    "足球": "zúqiú",
    "踢": "tī",
    "更": "gèng",
    "还没": "hái méi",
    "问": "wèn",
    "问题": "wèntí",
    "阿姨": "āyí",
    "面条": "miàntiáo",
    "希望": "xīwàng",
    "生命": "shēngmìng",
    "娃娃": "wáwa",
    "唱歌": "chànggē",
    "跳舞": "tiàowǔ",
    "照相": "zhàoxiàng",
    "高": "gāo",
    "往": "wǎng",
    "左边": "zuǒbian",
    "右边": "yòubian",
    "笑": "xiào",
    "意思": "yìsi",
    "姐姐": "jiějie",
    "弟弟": "dìdi",
    "次": "cì",
    "只有": "zhǐyǒu",
    "阴": "yīn",
    "晴": "qíng",
    "眼睛": "yǎnjing",
    "就要": "jiùyào",
    "快要": "kuàiyào",
    "度": "dù",
    "说话": "shuōhuà",
    "祝": "zhù",
    "像": "xiàng",
    "舅舅": "jiùjiu",
    "彩色": "cǎisè",
    "铅笔": "qiānbǐ",
    "西瓜": "xīguā",
    "鸡蛋": "jīdàn",
    "骑": "qí",
    "自行车": "zìxíngchē",
    "贵": "guì",
    "慢": "màn",
    "杯": "bēi",
    "汉语": "Hànyǔ",
    "美国": "Měiguó",
    "好看": "hǎokàn",
    "好听": "hǎotīng",
    "不好": "bù hǎo",
    "不太": "bú tài",
    "不是": "búshì",
    "周末": "zhōumò",
    "新年": "xīnnián",
    "家人": "jiārén",
    "东西": "dōngxi",
    "地方": "dìfang",
    "走路": "zǒulù",
    "开车": "kāichē",
    "下雨了": "xià yǔ le",
    "看看书": "kànkan shū",
    "问一问": "wèn yi wèn",
    "看一看": "kàn yi kàn",
    "说一说": "shuō yi shuō",
    "运动运动": "yùndòng yùndòng",
    "准备准备": "zhǔnbèi zhǔnbèi",
    "学习学习": "xuéxí xuéxí",
    "休息休息": "xiūxi xiūxi",
    "介绍介绍": "jièshào jièshào",
    "十几": "shíjǐ",
    "二十": "èrshí",
    "三十": "sānshí",
    "五十": "wǔshí",
    "八十": "bāshí",
    "几十": "jǐshí",
    "第二": "dì-èr",
    "第三": "dì-sān",
    "第四": "dì-sì",
    "字": "zì",
    "北京人": "Běijīng rén",
    "美国": "Měiguó",
    "很好": "hěn hǎo",
    "不太好": "bú tài hǎo",
    "打篮球": "dǎlánqiú",
    "踢足球": "tīzúqiú",
    "好吗": "hǎo ma",
    "还好": "hái hǎo",
    "还行": "hái xíng",
    "行": "xíng",
    "没过": "méi guo",
    "没去过": "méi qùguo",
    "见过": "jiànguo",
    "工作过": "gōngzuòguo",
    "长得": "zhǎng de",
    "长": "cháng",
    "生长": "zhǎng",
    "王": "Wáng",
    "张": "zhāng",
    "李": "Lǐ",
    "常": "cháng",
    "杯": "bēi",
    "星期一": "xīngqīyī",
    "星期二": "xīngqī'èr",
    "星期三": "xīngqīsān",
    "星期六": "xīngqīliù",
    "星期天": "xīngqītiān",
    "问": "wèn",
    "份": "fèn",
    "件": "jiàn",
    "些": "xiē",
    "没": "méi",
    "没有": "méiyǒu",
    "看见": "kànjiàn",
    "听懂": "tīngdǒng",
    "找到": "zhǎodào",
    "做好": "zuòhǎo",
    "休息好": "xiūxi hǎo",
    "看懂": "kàndǒng",
    "做完": "zuòwán",
    "回来": "huílai",
    "回去": "huíqù",
    "下雨": "xiàyǔ",
    "下雪": "xiàxuě",
    "没关系": "méi guānxi",
    "天气": "tiānqì",
    "好吃": "hǎochī",
    "好看": "hǎokàn",
    "好听": "hǎotīng",
    "贵": "guì",
    "慢": "màn",
    "左": "zuǒ",
    "右": "yòu",
    "前": "qián",
    "后": "hòu",
    "边": "bian",
    "站": "zhàn",
    "笑": "xiào",
    "希望": "xīwàng",
    "文化": "wénhuà",
    "有意思": "yǒu yìsi",
    "次": "cì",
    "一次": "yícì",
    "两次": "liǎngcì",
    "三次": "sāncì",
    "阴": "yīn",
    "晴": "qíng",
    "眼睛": "yǎnjing",
    "度": "dù",
    "公斤": "gōngjīn",
    "牛肉": "niúròu",
    "西瓜": "xīguā",
    "考": "kǎo",
    "用": "yòng",
    "支": "zhī",
    "游": "yóu",
    "起": "qǐ",
    "唱": "chàng",
    "天": "tiān",
    "快要": "kuàiyào",
    "就要": "jiùyào",
    "前": "qián",
    "有意思": "yǒu yìsi",
    "回来": "huílai",
    "那么": "nàme",
    "外面": "wàimiàn",
    "最少": "zuìshǎo",
    "进来": "jìnlai",
    "出去": "chūqù",
    "早饭": "zǎofàn",
    "地方": "dìfang",
    "东西": "dōngxi",
    "以后": "yǐhòu",
    "看懂": "kàndǒng",
    "小时": "xiǎoshí",
    "走路": "zǒulù",
    "上课": "shàngkè",
    "早": "zǎo",
    "本本": "běnběn",
    "红": "hóng",
    "见": "jiàn",
    "跑": "pǎo",
    "这么": "zhème",
}


def strip_tones(value: str) -> str:
    return "".join(ch for ch in unicodedata.normalize("NFD", value) if unicodedata.category(ch) != "Mn")


def unique(values: list[str]) -> list[str]:
    seen: set[str] = set()
    out: list[str] = []
    for value in values:
        key = strip_tones(value).replace(" ", "").replace("'", "").replace("-", "").lower()
        if not value or key in seen:
            continue
        seen.add(key)
        out.append(value)
    return out


def answers_for(hanzi: str, *pinyins: str) -> list[str]:
    values = [hanzi]
    for pinyin in pinyins:
        if not pinyin:
            continue
        values.append(pinyin)
        values.append(strip_tones(pinyin))
        values.append(pinyin.replace(" ", ""))
        values.append(strip_tones(pinyin).replace(" ", "").replace("'", "").replace("-", ""))
    return unique(values)


MISSING_PY: set[str] = set()


def py_of(token: str) -> str:
    if token not in PY:
        MISSING_PY.add(token)
        return f"[{token}]"
    return PY[token]


def sentence_pinyin(tokens: list[str], blank: int, end: str) -> str:
    parts = ["____" if i == blank else py_of(token) for i, token in enumerate(tokens)]
    punct = {"。": ".", "？": "?", "！": "!", "": ""}[end]
    text = " ".join(parts) + punct
    return text[0].upper() + text[1:]


def parse_items(block: str) -> list[dict[str, Any]]:
    items: list[dict[str, Any]] = []
    for raw in block.strip().splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        en, tok, blank, end, tip = line.split("|", 4)
        tokens = tok.split()
        if blank.isdigit():
            blank_i = int(blank)
        else:
            try:
                blank_i = tokens.index(blank)
            except ValueError as exc:
                raise ValueError(f"blank {blank!r} not in {tokens} for line {line!r}") from exc
        items.append(
            {
                "en": en.strip(),
                "tokens": tokens,
                "blank": blank_i,
                "end": end.strip(),
                "tip": tip.strip(),
                "blank_hanzi": tokens[blank_i],
                "blank_py": py_of(tokens[blank_i]),
                "pinyin": sentence_pinyin(tokens, blank_i, end.strip()),
                "hanzi": "".join(tokens) + (end.strip() if end.strip() in "。？！" else ""),
            }
        )
    return items


def make_fill(item_id: str, item: dict[str, Any]) -> dict[str, Any]:
    tokens = item["tokens"]
    blank = item["blank"]
    template = "".join("____" if i == blank else token for i, token in enumerate(tokens))
    if item["end"] in "。？！":
        template += item["end"]
    return {
        "id": item_id,
        "prompt": item["en"],
        "template": template,
        "pinyin": item["pinyin"],
        "answers": answers_for(item["blank_hanzi"], item["blank_py"]),
        "tip": item["tip"],
    }


def make_scramble(item_id: str, item: dict[str, Any]) -> dict[str, Any]:
    joined = "".join(item["tokens"])
    return {
        "id": item_id,
        "prompt": item["en"],
        "tokens": item["tokens"],
        "answers": unique([joined]),
        "tip": item["tip"],
    }


def make_translate(item_id: str, item: dict[str, Any]) -> dict[str, Any]:
    joined = "".join(item["tokens"])
    return {
        "id": item_id,
        "source": item["en"],
        "answers": unique([joined]),
        "tip": item["tip"],
    }


def W(hanzi: str, pinyin: str, pos: str, meaning: str) -> dict[str, str]:
    return {"hanzi": hanzi, "pinyin": pinyin, "pos": pos, "meaningEn": meaning}


def split_bank(items: list[dict[str, Any]]) -> tuple[list[dict[str, Any]], list[dict[str, Any]], list[dict[str, Any]]]:
    if len(items) < 20:
        raise ValueError(f"Need 20 items, got {len(items)}")
    return items[:8], items[8:14], items[14:20]


def bank_to_exercises(prefix: str, block: str) -> dict[str, list[dict[str, Any]]]:
    items = parse_items(block)
    fills, scrambles, translations = split_bank(items)
    return {
        "fill": [make_fill(f"{prefix}-f{i+1:02d}", item) for i, item in enumerate(fills)],
        "scramble": [make_scramble(f"{prefix}-s{i+1:02d}", item) for i, item in enumerate(scrambles)],
        "translate": [make_translate(f"{prefix}-t{i+1:02d}", item) for i, item in enumerate(translations)],
    }


def grammar_point(
    gid: str,
    title: str,
    structure: str,
    summary: str,
    example_hanzi: str,
    example_pinyin: str,
    example_en: str,
    block: str,
    prefix: str,
) -> dict[str, Any]:
    return {
        "id": gid,
        "title": title,
        "structure": structure,
        "summary": summary,
        "exampleHanzi": example_hanzi,
        "examplePinyin": example_pinyin,
        "exampleEn": example_en,
        "exercises": bank_to_exercises(prefix, block),
    }


def lesson_json(
    lesson_id: str,
    number: int,
    title_zh: str,
    title_en: str,
    words: list[dict[str, str]],
    vocab_block: str,
    grammar: list[dict[str, Any]],
) -> dict[str, Any]:
    scope = (
        "HSK 1 words plus HSK 2 Lesson 1"
        if number == 1
        else f"HSK 1 plus HSK 2 Lessons 1–{number}"
    )
    return {
        "id": lesson_id,
        "number": number,
        "titleZh": title_zh,
        "titleEn": title_en,
        "sourceNote": scope,
        "vocabScope": scope,
        "words": words,
        "vocabExercises": bank_to_exercises("v", vocab_block),
        "grammar": grammar,
    }


def write_lesson(payload: dict[str, Any]) -> Path:
    path = DATA / f"lesson-{payload['id']}.json"
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return path


def L(tip: str, rows: list[str]) -> str:
    lines: list[str] = []
    for row in rows:
        parts = row.split("|")
        if len(parts) == 4:
            row = row + "|" + tip
        lines.append(row)
    if len(lines) != 20:
        raise ValueError(f"expected 20 rows, got {len(lines)}: {lines[0][:40] if lines else 'empty'}")
    return "\n".join(lines)


def gp(
    gid: str,
    title: str,
    structure: str,
    summary: str,
    zh: str,
    py: str,
    en: str,
    prefix: str,
    tip: str,
    rows: list[str],
) -> dict[str, Any]:
    return grammar_point(gid, title, structure, summary, zh, py, en, L(tip, rows), prefix)
