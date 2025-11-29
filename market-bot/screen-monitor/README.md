# Screen-monitor (prototype)

This prototype monitors two screen regions (Caerleon and Black Market market windows) and attempts to OCR item names and prices to detect profitable flips.

Setup

1. Install Tesseract for Windows:

- Download and install from: https://github.com/tesseract-ocr/tesseract (or use the official installer).
- Make sure the `tesseract.exe` is on your PATH.

2. Install Python dependencies (use a virtualenv):

```powershell
cd market-bot\screen-monitor
pip install -r requirements.txt
```

3. Define ROIs (screen coordinates) for your two market windows:

```powershell
python roi_setup.py
```

4. Start the socket server (from repo root):

```powershell
# in another terminal
node ../server.js
```

5. Run the monitor:

```powershell
# optional env
$env:SM_SERVER_URL='http://localhost:4000/publish'
$env:SM_POLL_INTERVAL='2'
$env:SM_FEE_PERCENT='5'
$env:SM_MIN_PROFIT='100'
python monitor.py
```

Notes & limitations
- OCR is fragile: ensure your game UI scale is standard, disable anti-aliasing if possible, and use high contrast.
- The parser is best-effort; named variants may require tuning of parsing rules.
- This prototype logs found opportunities to `opportunities.csv` and attempts to POST them to the socket server's `/publish` endpoint.

If you want, I can refine the OCR pipeline (train tesseract or use template matching for the price area), add a GUI to select ROIs, or integrate a more robust image-to-value extractor.
