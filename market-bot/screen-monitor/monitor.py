"""
Screen monitor for Albion Market windows

Requirements:
 - Install Tesseract OCR on your Windows machine and ensure `tesseract` is on PATH.
 - Install Python deps: `pip install -r requirements.txt`

Usage:
 - Run `python roi_setup.py` and provide two ROIs: Caerleon and BlackMarket.
 - Run `python monitor.py` to start monitoring.

What it does:
 - Captures the two ROIs periodically
 - Preprocesses image, runs pytesseract OCR
 - Parses item names and prices from text (best-effort)
 - Compares prices and logs/publishes flip opportunities to socket server `/publish` endpoint

Note: This is a best-effort prototype. OCR accuracy depends on screen scale, font, and UI contrast.
"""
import time
import json
import re
import os
from datetime import datetime
from PIL import Image
import numpy as np
import pytesseract
import mss
import cv2
import requests

# Config
ROIS_FILE = 'rois.json'
POLL_INTERVAL = float(os.environ.get('SM_POLL_INTERVAL', '2.0'))
SERVER_URL = os.environ.get('SM_SERVER_URL', 'http://localhost:4000/publish')
FEE_PERCENT = float(os.environ.get('SM_FEE_PERCENT', '5'))
MIN_PROFIT = float(os.environ.get('SM_MIN_PROFIT', '50'))

def load_rois():
    if not os.path.exists(ROIS_FILE):
        raise SystemExit(f'rois.json not found; run roi_setup.py first')
    with open(ROIS_FILE,'r') as f:
        return json.load(f)

def grab_roi(monitor):
    with mss.mss() as sct:
        img = sct.grab(monitor)
        arr = np.array(img)
        # convert BGRA to BGR
        if arr.shape[2] == 4:
            arr = arr[:,:,:3]
        return arr

def preprocess_for_ocr(img):
    # img is BGR
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    # increase contrast
    gray = cv2.equalizeHist(gray)
    # threshold
    _, th = cv2.threshold(gray, 180, 255, cv2.THRESH_BINARY)
    return th

def ocr_text(img):
    pil = Image.fromarray(img)
    txt = pytesseract.image_to_string(pil, config='--psm 6')
    return txt

price_re = re.compile(r"([0-9,]+)\s*(?:g|silver|\$)?")

def parse_items_from_text(text):
    # Very simple parser: look for lines with a name and a trailing price
    items = []
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    for line in lines:
        # common pattern: "Item Name  123,456"
        parts = line.rsplit(' ', 1)
        if len(parts) == 2:
            name, maybe_price = parts
            m = price_re.search(maybe_price.replace('.', '').replace('\xa0',''))
            if m:
                price = int(m.group(1).replace(',',''))
                items.append({'name': name.strip(), 'price': price})
                continue
        # fallback: try if line is just price (we skip)
    return items

def compute_profit(buy, sell):
    # gross profit = sell - buy
    gross = sell - buy
    fees = sell * (FEE_PERCENT/100.0)
    profit = gross - fees
    return profit

def publish_opportunity(op):
    try:
        # POST to socket server which will emit
        requests.post(SERVER_URL, json={
            'itemId': op.get('id','SCREEN_'+op['name']),
            'region': [op['from'], op['to']],
            'prices': {op['from']: {'sell': op['buy']}, op['to']: {'buy': op['sell']}},
            'opportunity': op
        }, timeout=5)
    except Exception as e:
        print('Publish error', e)

def monitor_loop():
    rois = load_rois()
    caer = rois.get('caerleon')
    black = rois.get('blackmarket')
    if not caer or not black:
        raise SystemExit('Both ROIs required in rois.json')

    monitor_caer = {'left': caer[0], 'top': caer[1], 'width': caer[2]-caer[0], 'height': caer[3]-caer[1]}
    monitor_black = {'left': black[0], 'top': black[1], 'width': black[2]-black[0], 'height': black[3]-black[1]}

    print('Monitoring ROIs:', monitor_caer, monitor_black)
    last_seen = {}

    while True:
        try:
            img_caer = grab_roi(monitor_caer)
            img_black = grab_roi(monitor_black)

            t_caer = preprocess_for_ocr(img_caer)
            t_black = preprocess_for_ocr(img_black)

            txt_caer = ocr_text(t_caer)
            txt_black = ocr_text(t_black)

            items_caer = parse_items_from_text(txt_caer)
            items_black = parse_items_from_text(txt_black)

            # map by name (best-effort)
            map_caer = {it['name'].lower(): it['price'] for it in items_caer}
            map_black = {it['name'].lower(): it['price'] for it in items_black}

            # check for overlaps
            for name in set(list(map_caer.keys()) + list(map_black.keys())):
                buy = map_caer.get(name)
                sell = map_black.get(name)
                if buy and sell:
                    profit = compute_profit(buy, sell)
                    if profit >= MIN_PROFIT:
                        op = {'name': name, 'from': 'Caerleon', 'to': 'BlackMarket', 'buy': buy, 'sell': sell, 'profit': int(profit), 'ts': datetime.utcnow().isoformat()}
                        # dedupe by last seen
                        key = f"{name}:{buy}:{sell}"
                        if last_seen.get(key) != op['ts']:
                            print('Found opportunity:', op)
                            publish_opportunity(op)
                            # append to CSV
                            with open('opportunities.csv','a') as f:
                                f.write(json.dumps(op) + '\n')
                            last_seen[key] = op['ts']

            print(datetime.utcnow().isoformat(), 'scanned: caerlen items', len(items_caer), 'black items', len(items_black))
        except Exception as e:
            print('Monitor error', e)

        time.sleep(POLL_INTERVAL)

if __name__ == '__main__':
    monitor_loop()
