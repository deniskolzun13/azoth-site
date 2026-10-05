#!/usr/bin/env python3
# ============================================================
# Генератор арт-визуала для демо-сайтов (demo/<id>/img/).
# Дуотоны, свечение, зерно — атмосфера вместо фейковых фото.
# Всё детерминировано (seed), JPEG q82. Запуск: python3 tools/gen-demo-art.py
# ============================================================
import math
import os
import random

from PIL import Image, ImageChops, ImageDraw, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEMO = os.path.join(ROOT, 'demo')


# ---------- помощники ----------
def vgrad(w, h, top, bottom):
    """Вертикальный градиент между двумя RGB."""
    img = Image.new('RGB', (w, h))
    px = img.load()
    for y in range(h):
        t = y / max(1, h - 1)
        c = tuple(int(top[i] + (bottom[i] - top[i]) * t) for i in range(3))
        for x in range(w):
            px[x, y] = c
    return img


def hgrad(w, h, left, right):
    img = Image.new('RGB', (w, h))
    px = img.load()
    for x in range(w):
        t = x / max(1, w - 1)
        c = tuple(int(left[i] + (right[i] - left[i]) * t) for i in range(3))
        for y in range(h):
            px[x, y] = c
    return img


def glow(img, cx, cy, rx, ry, color, blur, alpha=0.8, angle=None):
    """Мягкое световое пятно (эллипс с гауссовым краем)."""
    layer = Image.new('RGB', img.size, color)
    mask = Image.new('L', img.size, 0)
    d = ImageDraw.Draw(mask)
    box = [cx - rx, cy - ry, cx + rx, cy + ry]
    if angle:
        spot = Image.new('L', (int(rx * 2) + 4, int(ry * 2) + 4), 0)
        ds = ImageDraw.Draw(spot)
        ds.ellipse([2, 2, spot.width - 2, spot.height - 2], fill=int(255 * alpha))
        spot = spot.rotate(angle, expand=True)
        mask.paste(spot, (int(cx - spot.width / 2), int(cy - spot.height / 2)))
        mask = mask.filter(ImageFilter.GaussianBlur(blur))
    else:
        d.ellipse(box, fill=int(255 * alpha))
        mask = mask.filter(ImageFilter.GaussianBlur(blur))
    img.paste(layer, (0, 0), mask)
    return img


def shade(img, cx, cy, rx, ry, blur, alpha=0.5):
    """Мягкая тень."""
    layer = Image.new('RGB', img.size, (0, 0, 0))
    mask = Image.new('L', img.size, 0)
    d = ImageDraw.Draw(mask)
    d.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=int(255 * alpha))
    mask = mask.filter(ImageFilter.GaussianBlur(blur))
    img.paste(layer, (0, 0), mask)
    return img


def rays(img, ox, oy, n, length, color, alpha=0.10, width=None, blur=60, rng=None):
    """Лучи света из точки (веер треугольников)."""
    rng = rng or random.Random(7)
    poly_layer = Image.new('RGB', img.size, color)
    mask = Image.new('L', img.size, 0)
    d = ImageDraw.Draw(mask)
    for i in range(n):
        a0 = rng.uniform(-math.pi / 2.6, math.pi / 2.6)
        w = width or rng.uniform(0.02, 0.09)
        p1 = (ox + math.cos(a0 - w) * length, oy + math.sin(a0 - w) * length)
        p2 = (ox + math.cos(a0 + w) * length, oy + math.sin(a0 + w) * length)
        d.polygon([ox, oy, p1, p2], fill=int(255 * alpha * rng.uniform(0.5, 1.4)))
    mask = mask.filter(ImageFilter.GaussianBlur(blur))
    img.paste(poly_layer, (0, 0), mask)
    return img


def particles(img, n, color, rmin=1, rmax=3, alpha=0.7, glowr=0, rng=None, yband=None):
    rng = rng or random.Random(11)
    overlay = Image.new('RGB', img.size, color)
    mask = Image.new('L', img.size, 0)
    d = ImageDraw.Draw(mask)
    gmask = Image.new('L', img.size, 0)
    gd = ImageDraw.Draw(gmask)
    w, h = img.size
    for _ in range(n):
        x = rng.uniform(0, w)
        y = rng.uniform(0, h) if not yband else rng.uniform(yband[0] * h, yband[1] * h)
        r = rng.uniform(rmin, rmax)
        a = int(255 * alpha * rng.uniform(0.3, 1.0))
        d.ellipse([x - r, y - r, x + r, y + r], fill=a)
        if glowr:
            gd.ellipse([x - r * glowr, y - r * glowr, x + r * glowr, y + r * glowr],
                       fill=int(a * 0.35))
    if glowr:
        gmask = gmask.filter(ImageFilter.GaussianBlur(glowr * 1.5))
        img.paste(overlay, (0, 0), gmask)
    img.paste(overlay, (0, 0), mask)
    return img


def stroke(draw, pts, color, width, close=False):
    """Ломаная/кривая линия со скруглёнными стыками."""
    draw.line(pts, fill=color, width=width, joint='curve')
    for (x, y) in (pts if close else [pts[0], pts[-1]]):
        r = width / 2
        draw.ellipse([x - r, y - r, x + r, y + r], fill=color)


def grain(img, amount=0.06):
    """Плёночное зерно."""
    noise = Image.effect_noise(img.size, 64).convert('RGB')
    return Image.blend(img, ImageChops.overlay(img, noise), amount)


def vignette(img, strength=0.35):
    w, h = img.size
    mask = Image.new('L', (w, h), 0)
    d = ImageDraw.Draw(mask)
    d.ellipse([-w * 0.25, -h * 0.25, w * 1.25, h * 1.25], fill=255)
    mask = ImageChops.invert(mask).filter(ImageFilter.GaussianBlur(min(w, h) // 5))
    dark = Image.new('RGB', (w, h), (0, 0, 0))
    return Image.composite(img, Image.blend(img, dark, strength), ImageChops.invert(mask))


def save(img, demo, name, q=82):
    d = os.path.join(DEMO, demo, 'img')
    os.makedirs(d, exist_ok=True)
    img.save(os.path.join(d, name + '.jpg'), 'JPEG', quality=q, optimize=True)
    print(f'✓ demo/{demo}/img/{name}.jpg')


# ---------- СОЛЬ: тёмный тёплый ресторан ----------
def salt():
    W, H = 1920, 1080
    amber = (214, 160, 82)
    cream = (238, 226, 205)
    coal = (24, 18, 12)
    coal2 = (38, 27, 16)

    img = vgrad(W, H, coal2, coal)
    img = glow(img, W * 0.72, H * 0.18, 560, 420, amber, 240, 0.85)
    img = glow(img, W * 0.78, H * 0.30, 300, 260, (255, 216, 160), 160, 0.5)
    img = shade(img, W * 0.18, H * 0.85, 700, 300, 200, 0.55)
    # дым над столом
    smoke = Image.new('RGB', img.size, cream)
    m = Image.new('L', img.size, 0)
    d = ImageDraw.Draw(m)
    for i in range(6):
        x0 = W * (0.3 + 0.06 * i)
        pts = [(x0 + math.sin(k / 3 + i) * 40, H * 0.95 - k * 46) for k in range(16)]
        d.line(pts, fill=40, width=26 - i * 3, joint='curve')
    m = m.filter(ImageFilter.GaussianBlur(22))
    img.paste(smoke, (0, 0), m)
    img = particles(img, 70, cream, 0.6, 2.0, 0.25, rng=random.Random(3))
    img = vignette(img, 0.5)
    save(grain(img, 0.07), 'salt', 'hero')

    # атмосфера зала: боке
    img = vgrad(1600, 900, (26, 19, 12), (15, 11, 7))
    rng = random.Random(5)
    for _ in range(26):
        img = glow(img, rng.uniform(0, 1600), rng.uniform(0, 900),
                   rng.uniform(30, 130), rng.uniform(30, 130),
                   rng.choice([amber, cream, (180, 120, 60)]),
                   rng.uniform(40, 90), rng.uniform(0.12, 0.5))
    img = vignette(img, 0.45)
    save(grain(img, 0.07), 'salt', 'about')

    # шеф: тёмный портрет со световым контуром
    img = vgrad(900, 1150, (30, 22, 14), (12, 9, 6))
    img = glow(img, 450, 200, 420, 300, amber, 180, 0.55)
    # силуэт плеч/головы
    sil = Image.new('RGB', img.size, (8, 6, 4))
    m = Image.new('L', img.size, 0)
    d = ImageDraw.Draw(m)
    d.ellipse([450 - 190, 240, 450 + 190, 640], fill=235)          # голова
    d.polygon([(90, 1150), (180, 780), (450, 660), (720, 780), (810, 1150)], fill=235)
    m = m.filter(ImageFilter.GaussianBlur(8))
    img.paste(sil, (0, 0), m)
    img = glow(img, 450, 300, 60, 200, amber, 90, 0.30)
    img = vignette(img, 0.5)
    save(grain(img, 0.07), 'salt', 'chef')

    # четыре тарелки: круг на тёмном со световой дугой
    seeds = [12, 23, 34, 45]
    for i, sd in enumerate(seeds):
        img = vgrad(1200, 900, (28, 21, 14), (14, 10, 6))
        rng = random.Random(sd)
        cx, cy = rng.uniform(0.35, 0.65) * 1200, rng.uniform(0.4, 0.6) * 900
        r = rng.uniform(230, 300)
        img = shade(img, cx, cy + r * 0.25, r * 1.5, r * 0.7, 120, 0.5)
        plate = Image.new('RGB', img.size, (44, 33, 22))
        m = Image.new('L', img.size, 0)
        d = ImageDraw.Draw(m)
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=255)
        m = m.filter(ImageFilter.GaussianBlur(3))
        img.paste(plate, (0, 0), m)
        # дуга света на кромке
        d2 = ImageDraw.Draw(img)
        a0 = rng.uniform(0, 360)
        d2.arc([cx - r, cy - r, cx + r, cy + r], a0, a0 + rng.uniform(90, 160),
               fill=cream, width=5)
        d2.arc([cx - r * 0.82, cy - r * 0.82, cx + r * 0.82, cy + r * 0.82],
               a0 + 180, a0 + 260, fill=(150, 110, 66), width=3)
        # текстура блюда: крапинки
        img = particles(img, 26, (90, 66, 40), 2, 5, 0.5, rng=rng,
                        yband=(cy - r * 0.5) / 900 and ((cy - r * 0.6) / 900, (cy + r * 0.6) / 900))
        img = glow(img, cx + rng.uniform(-1, 1) * r * 0.4, cy - r * 0.4,
                   90, 70, amber, 90, 0.35)
        img = vignette(img, 0.5)
        save(grain(img, 0.07), 'salt', f'g{i + 1}')


# ---------- ФОРМА: светлая мебель ----------
def sofa(demo_name, name, body, w=1200, h=900, seed=1):
    rng = random.Random(seed)
    bg_top = (244, 240, 232)
    bg_bot = (228, 221, 208)
    img = vgrad(w, h, bg_top, bg_bot)
    # свет из окна
    img = glow(img, w * 0.8, h * 0.15, w * 0.4, h * 0.5, (255, 253, 246), 150, 0.75)
    # тень под диваном
    img = shade(img, w * 0.5, h * 0.78, w * 0.36, h * 0.06, 60, 0.30)
    d = ImageDraw.Draw(img)
    bw, bh = w * 0.62, h * 0.30
    x0, y0 = (w - bw) / 2, h * 0.42
    dark = tuple(int(c * 0.72) for c in body)
    light = tuple(min(255, int(c * 1.12)) for c in body)
    # спинка
    d.rounded_rectangle([x0, y0 - bh * 0.55, x0 + bw, y0 + bh * 0.2],
                        radius=38, fill=body)
    # сиденье
    d.rounded_rectangle([x0 + 8, y0 + bh * 0.05, x0 + bw - 8, y0 + bh],
                        radius=30, fill=light)
    # подлокотники
    d.rounded_rectangle([x0 - 26, y0 - bh * 0.18, x0 + 34, y0 + bh * 1.02],
                        radius=26, fill=body)
    d.rounded_rectangle([x0 + bw - 34, y0 - bh * 0.18, x0 + bw + 26, y0 + bh * 1.02],
                        radius=26, fill=body)
    # подушки
    d.rounded_rectangle([x0 + bw * 0.10, y0 - bh * 0.30, x0 + bw * 0.40, y0 + bh * 0.16],
                        radius=24, fill=dark)
    d.rounded_rectangle([x0 + bw * 0.52, y0 - bh * 0.30, x0 + bw * 0.86, y0 + bh * 0.16],
                        radius=24, fill=dark)
    # ножки
    for lx in (x0 + bw * 0.08, x0 + bw * 0.88):
        d.rounded_rectangle([lx, y0 + bh, lx + 16, y0 + bh + 46], radius=6,
                            fill=(74, 60, 48))
    img = vignette(img, 0.16)
    save(grain(img, 0.045), demo_name, name)


def forma():
    W, H = 1920, 1080
    img = vgrad(W, H, (243, 239, 231), (225, 218, 205))
    img = glow(img, W * 0.78, H * 0.2, W * 0.45, H * 0.55, (255, 254, 248), 160, 0.8)
    img = shade(img, W * 0.2, H * 0.9, 800, 260, 180, 0.18)
    d = ImageDraw.Draw(img)
    # арт-объект: арка + постамент
    d.rounded_rectangle([W * 0.16, H * 0.52, W * 0.44, H * 0.86], radius=24, fill=(176, 108, 66))
    d.ellipse([W * 0.18, H * 0.30, W * 0.42, H * 0.66], fill=(196, 128, 80))
    d.rectangle([W * 0.18, H * 0.48, W * 0.42, H * 0.62], fill=(243, 239, 231))
    d.rounded_rectangle([W * 0.12, H * 0.86, W * 0.50, H * 0.90], radius=8, fill=(58, 50, 44))
    # ваза
    d.ellipse([W * 0.58, H * 0.55, W * 0.70, H * 0.86], fill=(150, 138, 120))
    d.rounded_rectangle([W * 0.615, H * 0.48, W * 0.665, H * 0.60], radius=14, fill=(150, 138, 120))
    img = vignette(img, 0.14)
    save(grain(img, 0.05), 'forma', 'hero')

    sofa('forma', 'sofa-1', (186, 94, 52), seed=11)    # терракота
    sofa('forma', 'sofa-2', (128, 132, 104), seed=22)  # олива
    sofa('forma', 'sofa-3', (202, 182, 150), seed=33)  # песок
    sofa('forma', 'sofa-4', (92, 90, 88), seed=44)     # графит

    # мастерская: доски с текстурой
    img = vgrad(1600, 900, (226, 214, 196), (198, 182, 158))
    d = ImageDraw.Draw(img)
    rng = random.Random(9)
    for i in range(9):
        y = 60 + i * 92
        tone = rng.uniform(0.86, 1.06)
        c = tuple(min(255, int(v * tone)) for v in (168, 128, 88))
        d.rounded_rectangle([40, y, 1560, y + 74], radius=10, fill=c)
        for k in range(5):
            gy = y + rng.uniform(10, 64)
            d.line([60, gy, 1540, gy + rng.uniform(-8, 8)],
                   fill=tuple(int(v * 0.85) for v in c), width=2)
    img = glow(img, 1300, 150, 420, 240, (255, 252, 242), 140, 0.5)
    img = vignette(img, 0.2)
    save(grain(img, 0.06), 'forma', 'workshop')


# ---------- ПУЛЬС: чёрный + лайм ----------
def pulse_trail(w, h, seed, name, demo='pulse'):
    rng = random.Random(seed)
    img = vgrad(w, h, (16, 16, 16), (7, 7, 7))
    lime = (200, 245, 66)
    # световой след: плавная кривая через кадр
    pts = []
    n = 14
    for k in range(n):
        t = k / (n - 1)
        x = w * (0.08 + 0.84 * t)
        y = h * (0.75 - 0.5 * t) + math.sin(t * math.pi * 2 + seed) * h * 0.14
        pts.append((x, y))
    for wdt, col, blur in [(46, lime, 26), (16, (235, 255, 160), 8), (6, (255, 255, 240), 2)]:
        layer = Image.new('RGB', img.size, col)
        m = Image.new('L', img.size, 0)
        d = ImageDraw.Draw(m)
        d.line(pts, fill=255, width=wdt, joint='curve')
        m = m.filter(ImageFilter.GaussianBlur(blur))
        img.paste(layer, (0, 0), m)
    img = particles(img, 60, lime, 0.6, 1.8, 0.35, rng=rng)
    img = vignette(img, 0.45)
    save(grain(img, 0.06), demo, name)


def pulse():
    W, H = 1920, 1080
    img = vgrad(W, H, (14, 14, 14), (6, 6, 6))
    lime = (200, 245, 66)
    img = glow(img, W * 0.16, H * 0.85, 520, 320, (60, 80, 20), 200, 0.6)
    img = glow(img, W * 0.85, H * 0.2, 420, 280, (50, 66, 18), 190, 0.5)
    # диагональные полосы энергии
    for i, (x0, alp) in enumerate([(-100, 0.5), (300, 0.3), (700, 0.4), (1200, 0.25)]):
        layer = Image.new('RGB', img.size, lime)
        m = Image.new('L', img.size, 0)
        d = ImageDraw.Draw(m)
        d.polygon([(x0 + i * 120, H + 100), (x0 + i * 120 + 260, H + 100),
                   (x0 + i * 120 + 900, -100), (x0 + i * 120 + 640, -100)],
                  fill=int(255 * alp))
        m = m.filter(ImageFilter.GaussianBlur(30))
        img.paste(layer, (0, 0), m)
    img = particles(img, 90, lime, 0.6, 2.2, 0.4, rng=random.Random(17))
    img = vignette(img, 0.5)
    save(grain(img, 0.06), 'pulse', 'hero')

    pulse_trail(900, 1150, 21, 'dir-1')
    pulse_trail(900, 1150, 57, 'dir-2')
    pulse_trail(900, 1150, 93, 'dir-3')

    # тренеры: силуэт с лаймовым контровым светом
    for i, sd in enumerate([31, 62, 87]):
        img = vgrad(900, 1150, (18, 18, 18), (8, 8, 8))
        img = glow(img, 620, 320, 360, 420, lime, 170, 0.4)
        sil = Image.new('RGB', img.size, (4, 4, 4))
        m = Image.new('L', img.size, 0)
        d = ImageDraw.Draw(m)
        cx = 400 + i * 30
        d.ellipse([cx - 130, 260, cx + 130, 560], fill=255)               # голова
        d.polygon([(120, 1150), (200, 700), (cx, 560), (cx + 200, 720), (760, 1150)],
                  fill=255)                                               # корпус
        m = m.filter(ImageFilter.GaussianBlur(6))
        img.paste(sil, (0, 0), m)
        img = vignette(img, 0.5)
        save(grain(img, 0.06), 'pulse', f'coach-{i + 1}')


# ---------- ИНДИГО: чёрный минимализм, ivory-линогравюра ----------
def indigo_piece(w, h, seed, style, name):
    rng = random.Random(seed)
    ink = (232, 230, 224)
    seal = (178, 58, 47)
    img = vgrad(w, h, (17, 17, 20), (10, 10, 12))
    img = glow(img, w * 0.5, h * 0.42, w * 0.42, h * 0.34, (34, 34, 40), 140, 0.8)
    layer = Image.new('RGB', img.size, ink)
    m = Image.new('L', img.size, 0)
    d = ImageDraw.Draw(m)
    cx, cy = w * 0.5, h * 0.46

    if style == 'orn':       # орнамент: кольца и лепестки
        for k in range(5):
            r = 60 + k * 52
            bbox = [cx - r, cy - r, cx + r, cy + r]
            a0 = rng.uniform(0, 360)
            d.arc(bbox, a0, a0 + rng.uniform(200, 320), fill=255, width=10 - k)
        for k in range(8):
            a = k * math.pi / 4 + seed
            r0, r1 = 90, 240
            pts = [(cx + math.cos(a + j * 0.06) * (r0 + (r1 - r0) * j / 14),
                    cy + math.sin(a + j * 0.06) * (r0 + (r1 - r0) * j / 14)) for j in range(15)]
            d.line(pts, fill=200, width=5, joint='curve')
    elif style == 'graf':    # графика: смелые мазки
        for k in range(4):
            x0 = w * rng.uniform(0.15, 0.55)
            y0 = h * rng.uniform(0.15, 0.75)
            ln = w * rng.uniform(0.3, 0.55)
            ang = rng.uniform(-0.5, 0.5)
            pts = [(x0 + t * 12, y0 + math.sin(t / 2 + k) * 18 + t * ang * 12)
                   for t in range(30)]
            pts = [(x + t * ln / 30 * math.cos(ang), y0 + t * ln / 30 * math.sin(ang)
                    + math.sin(t / 2 + k) * 20) for t, (x, y) in enumerate(pts)]
            d.line(pts, fill=255, width=rng.choice([26, 34, 44]), joint='curve')
        d.ellipse([cx - 30, cy + h * 0.22, cx + 30, cy + h * 0.22 + 60], fill=255)
    else:                    # минимализм: одна тонкая линия
        pts = [(w * 0.2 + (w * 0.6) * t / 40,
                cy + math.sin(t / 4 + seed) * h * 0.16) for t in range(41)]
        d.line(pts, fill=255, width=6, joint='curve')
        r = 26
        d.ellipse([cx - r, cy - h * 0.30 - r, cx + r, cy - h * 0.30 + r],
                  outline=255, width=6)
    m = m.filter(ImageFilter.GaussianBlur(1.2))
    img.paste(layer, (0, 0), m)
    # красная печать
    d2 = ImageDraw.Draw(img)
    d2.rounded_rectangle([w - 120, h - 120, w - 68, h - 68], radius=6, fill=seal)
    img = vignette(img, 0.42)
    save(grain(img, 0.055), 'indigo', name)


def indigo():
    W, H = 1920, 1080
    img = vgrad(W, H, (16, 16, 19), (9, 9, 11))
    ink = (232, 230, 224)
    # большая каллиграфическая дуга
    layer = Image.new('RGB', img.size, ink)
    m = Image.new('L', img.size, 0)
    d = ImageDraw.Draw(m)
    pts = [(W * 0.12 + (W * 0.76) * t / 60, H * 0.62 - math.sin(t / 9) * H * 0.20 - t * 2.2)
           for t in range(61)]
    for wdt, blr in [(64, 30), (30, 8), (12, 2)]:
        mm = m.copy()
        dd = ImageDraw.Draw(mm)
        dd.line(pts, fill=255, width=wdt, joint='curve')
        mm = mm.filter(ImageFilter.GaussianBlur(blr))
        img.paste(layer, (0, 0), mm)
    d2 = ImageDraw.Draw(img)
    d2.rounded_rectangle([W * 0.82, H * 0.68, W * 0.87, H * 0.76], radius=8,
                         fill=(178, 58, 47))
    img = particles(img, 40, ink, 0.5, 1.6, 0.2, rng=random.Random(8))
    img = vignette(img, 0.5)
    save(grain(img, 0.055), 'indigo', 'hero')

    styles = ['orn', 'graf', 'mini', 'graf', 'orn', 'mini']
    for i, st in enumerate(styles):
        indigo_piece(900, 1150, 101 + i * 37, st, f'work-{i + 1}')

    # мастера: световая арка над рабочим местом
    for i in range(2):
        img = vgrad(900, 1000, (15, 15, 18), (8, 8, 10))
        img = glow(img, 450, 260, 300, 200, (210, 205, 195), 150, 0.35)
        d = ImageDraw.Draw(img)
        d.arc([200, 140, 700, 480], 200, 340, fill=ink, width=8)
        d.line([120, 760, 780, 760], fill=(70, 68, 66), width=10)
        img = vignette(img, 0.45)
        save(grain(img, 0.055), 'indigo', f'master-{i + 1}')


# ---------- ГЛУБИНА: глубокий синий океан ----------
def glubina():
    W, H = 1920, 1080
    cyan = (87, 193, 232)
    img = vgrad(W, H, (24, 74, 110), (4, 14, 26))
    img = rays(img, W * 0.5, -80, 12, H * 1.4, (160, 220, 245), 0.10, blur=70,
               rng=random.Random(4))
    img = glow(img, W * 0.5, -100, 900, 300, (150, 210, 240), 200, 0.5)
    img = particles(img, 130, (200, 235, 250), 0.8, 2.6, 0.5, glowr=3,
                    rng=random.Random(6), yband=(0.35, 1.0))
    # силуэт ската вдали
    d = ImageDraw.Draw(img)
    m = Image.new('L', img.size, 0)
    dm = ImageDraw.Draw(m)
    dm.polygon([(W * 0.58, H * 0.58), (W * 0.72, H * 0.50), (W * 0.88, H * 0.56),
                (W * 0.74, H * 0.60), (W * 0.66, H * 0.62)], fill=110)
    m = m.filter(ImageFilter.GaussianBlur(14))
    img.paste(Image.new('RGB', img.size, (8, 30, 48)), (0, 0), m)
    img = vignette(img, 0.5)
    save(grain(img, 0.05), 'glubina', 'hero')

    # зал 1: лучи
    img = vgrad(1600, 900, (30, 90, 128), (6, 20, 36))
    img = rays(img, 800, -60, 10, 1300, (170, 225, 245), 0.13, blur=60,
               rng=random.Random(14))
    img = particles(img, 90, (210, 240, 250), 0.8, 2.4, 0.5, glowr=3,
                    rng=random.Random(15), yband=(0.3, 1.0))
    img = vignette(img, 0.45)
    save(grain(img, 0.05), 'glubina', 'hall-1')

    # зал 2: биолюминесценция
    img = vgrad(1600, 900, (10, 40, 70), (3, 10, 20))
    rng = random.Random(21)
    for _ in range(30):
        img = glow(img, rng.uniform(0, 1600), rng.uniform(0, 900),
                   rng.uniform(10, 36), rng.uniform(10, 36),
                   (110, 230, 220), rng.uniform(18, 40), rng.uniform(0.4, 0.9))
    img = particles(img, 160, (120, 240, 225), 0.7, 2.0, 0.7, glowr=3, rng=rng)
    img = vignette(img, 0.45)
    save(grain(img, 0.05), 'glubina', 'hall-2')

    # зал 3: медуза в темноте
    img = vgrad(1600, 900, (8, 26, 48), (2, 8, 16))
    cx, cy = 800, 430
    img = glow(img, cx, cy, 120, 160, (150, 220, 240), 60, 0.9)
    d = ImageDraw.Draw(img)
    for k in range(9):
        a = (k / 9) * math.pi - math.pi / 2
        pts = [(cx + math.cos(a) * t * 9, cy + 90 + math.sin(t / 2 + k) * 14 + t * 11)
               for t in range(30)]
        d.line(pts, fill=(90, 160, 190), width=3, joint='curve')
    img = particles(img, 80, (160, 210, 230), 0.6, 1.8, 0.35,
                    rng=random.Random(30), yband=(0.5, 1.0))
    img = vignette(img, 0.5)
    save(grain(img, 0.05), 'glubina', 'hall-3')


if __name__ == '__main__':
    salt()
    forma()
    pulse()
    indigo()
    glubina()
    print('Готово.')
