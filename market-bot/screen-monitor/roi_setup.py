"""
ROI Setup helper

Run this script and follow the prompts to capture two screen regions (Caerleon and Black Market).
It saves `rois.json` in the same folder with coordinates you can use in `monitor.py`.

Usage:
  python roi_setup.py

Press Enter to capture a full-screen screenshot, then type coordinates or use the printed guidance.
This is a simple helper; adjust the saved coordinates if necessary.
"""
import json
from PIL import ImageGrab

def prompt_coords(name):
    print(f"\nDefine ROI for {name} market window.")
    print("You can either paste coordinates as: left,top,right,bottom\nOr press Enter to capture the whole screen and then crop manually.")
    s = input(f"Coordinates for {name} (or Enter to take full-screen capture): ").strip()
    if s:
        parts = [int(x.strip()) for x in s.split(',')]
        if len(parts) != 4:
            raise SystemExit('Invalid coords format')
        return parts
    else:
        print('Capturing full screen. Open the market window and press Enter when ready...')
        input('Ready? press Enter to capture...')
        img = ImageGrab.grab()
        path = f'{name}_sample.png'
        img.save(path)
        print(f'Saved {path}. Open it and inspect coordinates (left,top,right,bottom) then paste them back here.')
        coords = input('Paste coords now: ').strip()
        parts = [int(x.strip()) for x in coords.split(',')]
        return parts

def main():
    rois = {}
    rois['caerleon'] = prompt_coords('Caerleon')
    rois['blackmarket'] = prompt_coords('BlackMarket')
    with open('rois.json','w') as f:
        json.dump(rois,f)
    print('Saved rois.json with:', rois)

if __name__ == '__main__':
    main()
