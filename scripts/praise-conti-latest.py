"""가장 최근 주일예배 PPT 하나로 찬양 콘티를 만들어 홈페이지에 올린다.

바탕화면 `시드니 주님의 교회\\찬양 콘티 올리기.bat` 이 이 파일을 실행한다. 하는 일:
  1. 주일예배 PPT 폴더에서 날짜가 가장 늦은 파일을 고른다. 이미 올라간 주일이면 멈춘다.
  2. extract-praise-conti.py 와 같은 방식으로 콘티 PPTX를 만든다.
  3. 곡 제목: 가사가 이미지라 글자로 읽을 수 없다. 제목 부분을 Windows OCR로 읽어
     후보를 내고, 제목 그림을 띄워 보여 준 뒤 사람이 확인·수정한다.
  4. 확인을 받고 upload-praise-conti.mjs --apply 로 올린다.
  5. `찬양 콘티 PPT` 폴더에 `yymmdd-곡1-곡2.pptx` 로 사본을 남긴다.

준비: pip install python-pptx pillow, STLC_Web 에서 npm install 이 되어 있어야 한다.
"""

import importlib.util
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import urllib.request

from PIL import Image, ImageDraw, ImageFont, ImageOps

SCRIPTS = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(SCRIPTS)
CHURCH_DIR = r"C:\Users\user\Desktop\시드니 주님의 교회"
PPT_DIR = os.path.join(CHURCH_DIR, "주일예배 PPT 2026")
COPY_DIR = os.path.join(CHURCH_DIR, "찬양 콘티 PPT")

spec = importlib.util.spec_from_file_location("extract", os.path.join(SCRIPTS, "extract-praise-conti.py"))
extract = importlib.util.module_from_spec(spec)
spec.loader.exec_module(extract)


def latest_ppt():
    files = [f for f in os.listdir(PPT_DIR) if f.lower().endswith(".pptx") and extract.NAME_RE.search(f)]
    if not files:
        return None
    return max(files, key=lambda f: extract.NAME_RE.search(f).groups())


def already_uploaded(service_date):
    env = open(os.path.join(ROOT, ".env.local"), encoding="utf8").read()
    url = re.search(r"^NEXT_PUBLIC_SUPABASE_URL=(.*)$", env, re.M).group(1).strip()
    key = open(os.path.join(ROOT, "supabase", "keys", "service_role"), encoding="utf8").read().strip()
    request = urllib.request.Request(
        "%s/rest/v1/praise_setlists?select=service_date&service_date=eq.%s" % (url, service_date),
        headers={"apikey": key, "Authorization": "Bearer " + key},
    )
    with urllib.request.urlopen(request) as response:
        return len(json.load(response)) > 0


def title_crop(path):
    """가사판 왼쪽 위의 "♬ 제목" 띠."""
    image = Image.open(path).convert("RGB")
    w, h = image.size
    return image.crop((int(w * 0.07), 0, int(w * 0.75), int(h * 0.13)))


def ocr_ready(crop, dest):
    """제목은 주황 글씨에 테두리가 있어 그대로는 OCR이 못 읽는다. 주황만 검게 남기고 키운다."""
    pixels = crop.load()
    out = Image.new("L", crop.size, 255)
    dots = out.load()
    for y in range(crop.size[1]):
        for x in range(crop.size[0]):
            r, g, b = pixels[x, y]
            if r > 150 and b < 120 and r - b > 80:
                dots[x, y] = 0
    out = out.resize((out.size[0] * 3, out.size[1] * 3), Image.LANCZOS)
    ImageOps.expand(out, 40, 255).save(dest)


def ocr(paths):
    if not paths:
        return []
    result = subprocess.run(
        ["powershell.exe", "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", os.path.join(SCRIPTS, "ocr-title.ps1")]
        + paths,
        capture_output=True,
    )
    lines = result.stdout.decode("utf8", "replace").splitlines()
    return (lines + [""] * len(paths))[: len(paths)]


def clean_title(text):
    """OCR 잡음과 찬송가 번호를 떼어 낸다 ("412장 ... - 통469" → "...")."""
    text = re.sub(r"[^\w\s가-힣'!?,.-]", " ", text)
    text = re.sub(r"^\s*\d+\s*장\s*", "", text)
    text = re.sub(r"\s*-\s*통\s*\d*\s*$", "", text)
    return re.sub(r"\s+", " ", text).strip()


def hangul_score(text):
    return sum(1 for c in text if "가" <= c <= "힣")


def suggest_titles(meta, work):
    """곡마다 꺼내 둔 가사판(최대 3장)을 다 읽고 한글이 가장 많이 읽힌 것을 후보로."""
    jobs = []
    for number, song in enumerate(meta["songs"]):
        for name in song["titleImages"]:
            dest = os.path.join(work, "ocr-" + os.path.splitext(name)[0] + ".png")
            ocr_ready(title_crop(os.path.join(work, name)), dest)
            jobs.append((number, dest))
    texts = ocr([dest for _, dest in jobs])
    best = [""] * len(meta["songs"])
    for (number, _), text in zip(jobs, texts):
        text = clean_title(text)
        if hangul_score(text) > hangul_score(best[number]):
            best[number] = text
    return best


def contact_sheet(meta, work):
    """곡별 제목 띠를 한 장에 모아 띄운다 — 사람이 보고 제목을 확인하는 용도."""
    rows = []
    for number, song in enumerate(meta["songs"], 1):
        for name in song["titleImages"]:
            rows.append(("%d번 곡" % number, title_crop(os.path.join(work, name))))
    width = max(crop.size[0] for _, crop in rows) + 160
    height = sum(crop.size[1] + 10 for _, crop in rows) + 10
    sheet = Image.new("RGB", (width, height), "white")
    draw = ImageDraw.Draw(sheet)
    try:
        font = ImageFont.truetype("malgun.ttf", 28)
    except OSError:
        font = ImageFont.load_default()
    y = 10
    for label, crop in rows:
        draw.text((10, y + crop.size[1] // 2 - 16), label, fill="black", font=font)
        sheet.paste(crop, (150, y))
        y += crop.size[1] + 10
    path = os.path.join(work, "곡 제목 확인.png")
    sheet.save(path)
    return path


def safe_name(text):
    return re.sub(r'[\\/:*?"<>|]', "", text).strip()


def main():
    name = latest_ppt()
    if not name:
        print("주일예배 PPT 폴더에 예배 PPT가 없습니다: %s" % PPT_DIR)
        return 1
    year, month, day = extract.NAME_RE.search(name).groups()
    service_date = "%s-%s-%s" % (year, month, day)
    print("가장 최근 예배 PPT: %s" % name)

    if already_uploaded(service_date):
        print("%s 콘티는 이미 홈페이지에 올라가 있습니다. 할 일이 없습니다." % service_date)
        return 0

    work = tempfile.mkdtemp(prefix="praise-conti-")
    try:
        meta = extract.process(os.path.join(PPT_DIR, name), work)
        if not meta:
            print("이 주일은 콘티를 만들 수 없습니다(위 메시지 참고).")
            return 1

        print("\n곡 제목을 읽는 중...")
        suggestions = suggest_titles(meta, work)
        os.startfile(contact_sheet(meta, work))

        print("\n띄운 그림의 제목을 보고 확인하세요.")
        print("  · 후보가 맞으면 그냥 Enter")
        print("  · 틀리면 올바른 제목을 입력하고 Enter")
        print("  · 앞 곡을 다시 부르는 경우처럼 같은 제목이면 목록에서 한 번만 남깁니다.\n")
        confirmed = {}  # OCR 후보 → 사람이 확정한 제목. 반복 곡이 같은 오독을 또 내면 확정본을 보여 준다.
        for number, (song, guess) in enumerate(zip(meta["songs"], suggestions), 1):
            raw = guess
            guess = confirmed.get(raw, guess)
            while True:
                prompt = "%d번 곡 [%s]: " % (number, guess) if guess else "%d번 곡 (읽지 못함, 입력 필요): " % number
                answer = clean_title(input(prompt)) or guess
                if answer:
                    break
            song["title"] = answer
            if raw:
                confirmed[raw] = answer

        unique = []
        for song in meta["songs"]:
            if song["title"] in [s["title"] for s in unique]:
                print("  '%s' 는 앞 곡을 다시 부른 것이라 곡 목록에서 뺐습니다(PPT에는 그대로 있음)." % song["title"])
                continue
            unique.append(song)
        meta["songs"] = unique

        print("\n올릴 내용")
        print("  제목: %s" % meta["title"])
        for song in meta["songs"]:
            print("    - %s" % song["title"])
        if input("\n홈페이지에 올릴까요? (y/n): ").strip().lower() not in ("y", "yes", "ㅛ"):
            print("올리지 않았습니다.")
            return 0

        with open(os.path.join(work, "%s.json" % meta["file"][:-5]), "w", encoding="utf8") as f:
            json.dump(meta, f, ensure_ascii=False, indent=2)
        upload = subprocess.run(
            ["node", os.path.join(SCRIPTS, "upload-praise-conti.mjs"), work, "--apply"], cwd=ROOT
        )
        if upload.returncode != 0:
            print("\n업로드에 실패했습니다. 위 메시지를 확인하세요.")
            return 1

        os.makedirs(COPY_DIR, exist_ok=True)
        copy_name = safe_name("-".join([meta["file"][:-5]] + [s["title"] for s in meta["songs"]])) + ".pptx"
        shutil.copy(os.path.join(work, meta["file"]), os.path.join(COPY_DIR, copy_name))
        print("\n완료! 홈페이지 찬양 콘티에 올렸습니다: https://stlc-web.vercel.app/tv/praise")
        print("사본: %s" % os.path.join(COPY_DIR, copy_name))
        return 0
    finally:
        shutil.rmtree(work, ignore_errors=True)


if __name__ == "__main__":
    sys.exit(main())
