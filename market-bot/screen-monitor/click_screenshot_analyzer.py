#!/usr/bin/env python3
"""
click_screenshot_analyzer.py

Safe screenshot analyzer: listens to manual mouse clicks and captures a screenshot
every N clicks. Performs:
 - dominant color
 - OCR (pytesseract)
 - red-pixels detection (heuristic for red-names/gankers)
 - change_score compared to previous screenshot (absolute diff)
Saves screenshots to disk, logs CSV, and optionally POSTs alerts to a local server.

Usage examples:
  python click_screenshot_analyzer.py --clicks-per-shot 2
  python click_screenshot_analyzer.py --clicks-per-shot 2 --post-url http://localhost:4000/publish
"""

import argparse
import csv
import json
import os
import sys
import time
from datetime import datetime
from pathlib import Path

import cv2
import numpy as np
import pytesseract
import requests
from PIL import Image, ImageGrab
from pynput import mouse

# ---- Defaults ----
DEFAULT_OUTPUT_DIR = "screenshots"
DEFAULT_LOG = "capture_log.csv"
DEFAULT_CLICKS_PER_SHOT = 2
DEFAULT_RED_PIXEL_THRESHOLD = 500  # heuristic
DEFAULT_CHANGE_THRESHOLD = 0.02    # fraction of changed pixels (0..1)
DEFAULT_POST_URL = None            # e.g., http://localhost:4000/publish

# Allow override via env var if Tesseract is installed in non-standard path
TESSERACT_CMD_ENV = os.getenv("TESSERACT_CMD")
if TESSERACT_CMD_ENV:
    pytesseract.pytesseract.tesseract_cmd = TESSERACT_CMD_ENV

# ---- Helpers ----
def ensure_dir(p):
    Path(p).mkdir(parents=True, exist_ok=True)

def now_iso():
    return datetime.utcnow().isoformat() + "Z"

def save_image_pil(img_pil, out_path):
    img_pil.save(out_path)

def pil_to_cv(img_pil):
    return cv2.cvtColor(np.array(img_pil), cv2.COLOR_RGB2BGR)

def dominant_color(cv_img, downscale=64):
    # downscale then compute mean for robust dominant color
    h, w = cv_img.shape[:2]
    if max(h, w) > downscale:
        cv_img_small = cv2.resize(cv_img, (downscale, int(downscale * h / w))) if w >= h else cv2.resize(cv_img, (int(downscale * w / h), downscale))
    else:
        cv_img_small = cv_img
    b, g, r = cv_img_small.mean(axis=0).mean(axis=0)
    return int(r), int(g), int(b)

def ocr_text(pil_img):
    try:
        text = pytesseract.image_to_string(pil_img)
        return " ".join(text.split())
    except Exception as e:
        return f"OCR_ERROR: {e}"

def red_pixel_count(cv_img, roi=None):
    # cv_img in BGR
    h, w = cv_img.shape[:2]
    if roi:
        x, y, rw, rh = roi
        x1, y1 = int(x), int(y)
        x2, y2 = int(x + rw), int(y + rh)
        crop = cv_img[y1:y2, x1:x2]
    else:
        # heuristic: consider upper area where player names appear (top 20% of screen)
        crop = cv_img[0:int(h * 0.2), :]
    if crop.size == 0:
        return 0
    hsv = cv2.cvtColor(crop, cv2.COLOR_BGR2HSV)
    # red can be at two ends of hue wheel; define two ranges
    lower1 = np.array([0, 80, 50])
    upper1 = np.array([10, 255, 255])
    lower2 = np.array([170, 80, 50])
    upper2 = np.array([180, 255, 255])
    mask1 = cv2.inRange(hsv, lower1, upper1)
    mask2 = cv2.inRange(hsv, lower2, upper2)
    mask = cv2.bitwise_or(mask1, mask2)
    return int(cv2.countNonZero(mask))

def change_score(prev_cv, cur_cv):
    if prev_cv is None:
        return 0.0
    # convert to gray & resize to small thumbnail for speed
    try:
        prev_gray = cv2.cvtColor(prev_cv, cv2.COLOR_BGR2GRAY)
        cur_gray = cv2.cvtColor(cur_cv, cv2.COLOR_BGR2GRAY)
    except Exception:
        return 0.0
    h, w = prev_gray.shape[:2]
    # resize both to the smaller of the two shapes
    min_h, min_w = min(prev_gray.shape[0], cur_gray.shape[0]), min(prev_gray.shape[1], cur_gray.shape[1])
    prev_r = cv2.resize(prev_gray, (min_w, min_h))
    cur_r = cv2.resize(cur_gray, (min_w, min_h))
    diff = cv2.absdiff(prev_r, cur_r)
    _, th = cv2.threshold(diff, 30, 255, cv2.THRESH_BINARY)
    changed = np.count_nonzero(th)
    total = th.size
    return float(changed) / float(total) if total else 0.0

def post_alert(url, payload):
    try:
        r = requests.post(url, json=payload, timeout=5)
        return r.status_code, r.text
    except Exception as e:
        return None, str(e)

# ---- Main analyzer class ----
class ClickScreenshotAnalyzer:
    def __init__(self, out_dir=DEFAULT_OUTPUT_DIR, clicks_per_shot=DEFAULT_CLICKS_PER_SHOT,
                 csv_log=DEFAULT_LOG, red_threshold=DEFAULT_RED_PIXEL_THRESHOLD,
                 change_threshold=DEFAULT_CHANGE_THRESHOLD, post_url=DEFAULT_POST_URL, roi=None):
        self.out_dir = Path(out_dir)
        self.csv_log = Path(csv_log)
        self.clicks_per_shot = int(clicks_per_shot)
        self.counter = 0
        self.prev_cv = None
        self.red_threshold = int(red_threshold)
        self.change_threshold = float(change_threshold)
        self.post_url = post_url
        self.roi = roi  # format [x,y,w,h] in pixels
        ensure_dir(self.out_dir)
        # Prepare CSV header
        if not self.csv_log.exists():
            with open(self.csv_log, "w", newline="", encoding="utf-8") as fh:
                writer = csv.writer(fh)
                writer.writerow(["ts", "filename", "dominant_r", "dominant_g", "dominant_b", "ocr", "red_pixels", "change_score", "alert_sent"])

    def on_click(self, x, y, button, pressed):
        if not pressed:
            return
        self.counter += 1
        print(f"[{now_iso()}] Click #{self.counter} at ({x},{y})")

        if (self.counter % self.clicks_per_shot) == 0:
            try:
                self.capture_and_analyze()
            except Exception as e:
                print("Error during capture:", e)

    def capture_and_analyze(self):
        ts = now_iso()
        filename = f"{ts.replace(':','-')}.png"
        out_path = self.out_dir / filename
        # Full-screen screenshot; if you want ROI cropping, pass roi into analyze
        img_pil = ImageGrab.grab()
        save_image_pil(img_pil, out_path)
        cv_img = pil_to_cv(img_pil)

        # dominant color
        r, g, b = dominant_color(cv_img)

        # OCR (do on a smaller crop for speed if desired)
        text = ocr_text(img_pil)

        # red pixel detection (use self.roi if configured)
        red_count = red_pixel_count(cv_img, roi=self.roi)

        # change score vs previous
        cscore = change_score(self.prev_cv, cv_img)

        # decide if alert should be posted
        alert = False
        alert_reasons = []
        if red_count >= self.red_threshold:
            alert = True
            alert_reasons.append(f"red_pixels={red_count}")
        if cscore >= self.change_threshold:
            alert = True
            alert_reasons.append(f"change_score={cscore:.3f}")

        alert_sent = False
        if alert and self.post_url:
            payload = {
                "type": "screen_alert",
                "ts": ts,
                "filename": str(out_path),
                "dominant_color": {"r": r, "g": g, "b": b},
                "ocr": text,
                "red_pixels": red_count,
                "change_score": cscore,
                "reasons": alert_reasons
            }
            code, resp = post_alert(self.post_url, payload)
            alert_sent = True
            print(f"Posted alert to {self.post_url} -> status {code} / {resp}")

        # log to CSV
        with open(self.csv_log, "a", newline="", encoding="utf-8") as fh:
            writer = csv.writer(fh)
            writer.writerow([ts, str(out_path), r, g, b, text, red_count, f"{cscore:.6f}", alert_sent])

        # console summary
        print(f"[{ts}] Saved {out_path} | Dominant R{r} G{g} B{b} | OCR='{text[:80]}' | red={red_count} | change={cscore:.3f} | alert={alert}")

        # store previous image
        self.prev_cv = cv_img

    def run(self):
        print("Starting ClickScreenshotAnalyzer")
        print(f"Output dir: {self.out_dir} | CSV log: {self.csv_log}")
        print(f"Clicks per shot: {self.clicks_per_shot} | red_threshold: {self.red_threshold} | change_threshold: {self.change_threshold}")
        if self.post_url:
            print("POST URL:", self.post_url)
        print("Listener starting in 2 seconds. Switch to the app/game window you want to monitor.")
        time.sleep(2)
        with mouse.Listener(on_click=self.on_click) as listener:
            try:
                listener.join()
            except KeyboardInterrupt:
                print("Stopping (KeyboardInterrupt)")

# ---- CLI ----
def parse_roi_arg(s):
    # Accept either JSON string like "[x,y,w,h]" or path to JSON file
    if not s:
        return None
    try:
        if os.path.exists(s):
            with open(s, "r") as fh:
                obj = json.load(fh)
                return list(obj)
        else:
            obj = json.loads(s)
            return list(obj)
    except Exception:
        raise argparse.ArgumentTypeError("ROI must be JSON array or path to JSON file containing [x,y,w,h]")

def main():
    parser = argparse.ArgumentParser(description="Screenshot analyzer (captures every N manual clicks)")
    parser.add_argument("--clicks-per-shot", type=int, default=DEFAULT_CLICKS_PER_SHOT, help="Take a screenshot every N clicks")
    parser.add_argument("--output-dir", default=DEFAULT_OUTPUT_DIR, help="Where to save screenshots")
    parser.add_argument("--csv-log", default=DEFAULT_LOG, help="CSV log file path")
    parser.add_argument("--red-threshold", type=int, default=DEFAULT_RED_PIXEL_THRESHOLD, help="Red pixel count threshold to trigger an alert")
    parser.add_argument("--change-threshold", type=float, default=DEFAULT_CHANGE_THRESHOLD, help="Change fraction threshold to trigger an alert (0..1)")
    parser.add_argument("--post-url", default=DEFAULT_POST_URL, help="Optional URL to POST alerts (JSON)")
    parser.add_argument("--roi", type=parse_roi_arg, default=None, help="ROI json [x,y,w,h] or path to file")
    parser.add_argument("--tesseract-cmd", default=None, help="If set, use this path for pytesseract (overrides env)")
    args = parser.parse_args()

    if args.tesseract_cmd:
        pytesseract.pytesseract.tesseract_cmd = args.tesseract_cmd

    analyzer = ClickScreenshotAnalyzer(
        out_dir=args.output_dir,
        clicks_per_shot=args.clicks_per_shot,
        csv_log=args.csv_log,
        red_threshold=args.red_threshold,
        change_threshold=args.change_threshold,
        post_url=args.post_url,
        roi=args.roi
    )
    analyzer.run()

if __name__ == "__main__":
    main()
