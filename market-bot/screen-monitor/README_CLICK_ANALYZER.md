# Click Screenshot Analyzer (Safe)

## What it does
- **Passive monitoring only** — listens for your manual mouse clicks and captures a screenshot every N clicks (default N=2).
- Runs analysis on each screenshot:
  - Dominant color detection
  - OCR text extraction (requires Tesseract)
  - Red-pixel detection (heuristic for red player names/gankers)
  - Change detection vs previous screenshot
- Saves screenshots to `screenshots/` directory
- Logs all results to `capture_log.csv`
- Optionally POSTs alerts to your local server (e.g., `http://localhost:4000/publish`) when thresholds are exceeded

## Important safety note
This tool does **NOT** send any mouse/keyboard input to any application. It only listens and analyzes. It's completely safe and allowed for personal use.

## Prerequisites

### 1. Install Tesseract OCR (for text detection)
**Windows:**
- Download installer: https://github.com/UB-Mannheim/tesseract/wiki
- Or use Chocolatey: `choco install tesseract`
- Default install path: `C:\Program Files\Tesseract-OCR\tesseract.exe`

### 2. Python 3.8+
Verify: `python --version`

## Installation

```powershell
# Navigate to the screen-monitor directory
cd C:\Users\Vaishnavi\u-next\market-bot\screen-monitor

# Create a virtual environment
python -m venv .venv

# Activate the virtual environment
.\.venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt
```

## Usage

### Basic usage (screenshot every 2 clicks)
```powershell
python click_screenshot_analyzer.py --clicks-per-shot 2
```

### With server integration (posts alerts to your socket server)
```powershell
python click_screenshot_analyzer.py --clicks-per-shot 2 --post-url http://localhost:4000/publish
```

### With custom Tesseract path
```powershell
python click_screenshot_analyzer.py --clicks-per-shot 2 --tesseract-cmd "C:\Program Files\Tesseract-OCR\tesseract.exe"
```

### With custom ROI for red-name detection
```powershell
# Only analyze top-left 800x120 region starting at (100,50)
python click_screenshot_analyzer.py --clicks-per-shot 2 --roi "[100,50,800,120]"
```

### Full example with all options
```powershell
python click_screenshot_analyzer.py `
  --clicks-per-shot 2 `
  --output-dir "my_screenshots" `
  --csv-log "my_log.csv" `
  --red-threshold 300 `
  --change-threshold 0.05 `
  --post-url http://localhost:4000/publish `
  --tesseract-cmd "C:\Program Files\Tesseract-OCR\tesseract.exe"
```

## Command-line options

| Option | Default | Description |
|--------|---------|-------------|
| `--clicks-per-shot` | 2 | Take screenshot every N manual clicks |
| `--output-dir` | `screenshots` | Directory to save screenshot images |
| `--csv-log` | `capture_log.csv` | CSV log file path |
| `--red-threshold` | 500 | Red pixel count to trigger alert |
| `--change-threshold` | 0.02 | Screen change fraction (0-1) to trigger alert |
| `--post-url` | None | URL to POST alert JSON (optional) |
| `--roi` | None | Region of interest `[x,y,w,h]` or JSON file path |
| `--tesseract-cmd` | System default | Path to tesseract executable |

## Output

### Screenshots
Saved to `screenshots/` (or your custom `--output-dir`) with ISO timestamp filenames.

### CSV Log
`capture_log.csv` contains:
- `ts` — ISO timestamp
- `filename` — screenshot path
- `dominant_r`, `dominant_g`, `dominant_b` — average screen color
- `ocr` — detected text
- `red_pixels` — count of red pixels (ganker detection heuristic)
- `change_score` — fraction of changed pixels vs previous (0-1)
- `alert_sent` — whether an alert was posted to server

### Alert payload (when POST URL configured)
```json
{
  "type": "screen_alert",
  "ts": "2025-11-28T12:34:56.789Z",
  "filename": "screenshots/2025-11-28T12-34-56.789Z.png",
  "dominant_color": {"r": 45, "g": 67, "b": 89},
  "ocr": "Inventory Full You have been attacked",
  "red_pixels": 823,
  "change_score": 0.156,
  "reasons": ["red_pixels=823", "change_score=0.156"]
}
```

## Tips & tuning

### Adjusting sensitivity
- **Red-name detection**: Lower `--red-threshold` (e.g., 200) for more sensitivity, raise (e.g., 800) for less false positives
- **Change detection**: Lower `--change-threshold` (e.g., 0.01) to catch smaller UI changes
- **ROI**: Use a smaller region (e.g., top 20% of screen) to focus on player names and reduce false positives

### Performance
- OCR can be slow on full-screen captures. Consider using `--roi` to analyze only relevant areas.
- Screenshots are saved synchronously; very frequent captures may cause brief UI lag.

### Finding ROI coordinates
Use Windows Snipping Tool or similar to determine pixel coordinates:
1. Take a screenshot with coordinates shown
2. Measure the region you want to monitor
3. Pass as `--roi "[x,y,width,height]"`

## Integration with market-bot server

When you specify `--post-url http://localhost:4000/publish`, alerts are sent to your socket server. The server can:
1. Emit the alert to connected web clients
2. Log high-priority events
3. Trigger notifications (Discord, SMS, etc.)

Make sure your `server.js` handles the `screen_alert` type or treats all POST payloads generically.

## Stop the analyzer
Press `Ctrl+C` in the terminal to stop listening.

## Troubleshooting

**"Tesseract not found"**
- Install Tesseract (see Prerequisites)
- Use `--tesseract-cmd` to specify path explicitly
- Or set environment variable: `$env:TESSERACT_CMD="C:\Program Files\Tesseract-OCR\tesseract.exe"`

**"No module named 'cv2'"**
- Ensure you activated the venv: `.\.venv\Scripts\Activate.ps1`
- Reinstall: `pip install opencv-python`

**Screenshots are black/blank**
- Some games block screen capture APIs
- Try running as Administrator
- Some fullscreen exclusive modes prevent capture; use windowed or borderless mode

**Alert not posting to server**
- Verify server is running: `netstat -aon | Select-String ":4000"`
- Check firewall/antivirus isn't blocking localhost connections
- Examine server logs for incoming POST requests

## Next steps
- Integrate with the real-time worker (`worker.js`) for combined API + screen monitoring
- Add template matching for specific UI elements (buttons, icons)
- Create a live dashboard showing recent screenshots and alerts
- Deploy the stack (server + worker) to a VPS for remote monitoring
