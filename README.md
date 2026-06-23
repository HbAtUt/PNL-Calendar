# PNL Calendar

Full-stack desktop P&L calendar app for tracking daily profit and loss on a monthly calendar. Click any day to enter or edit an amount.

## Download (Windows)

Get the latest installer from [GitHub Releases](https://github.com/HbAtUt/PNL-Calendar/releases).

## Features

- Dark-themed calendar matching a trading PNL layout
- Click a day to set profit (positive) or loss (negative)
- Month navigation, currency selector (USD, EUR, GBP, CAD, AUD, JPY)
- Monthly totals, win/loss day counts, and best-day highlight (gold)
- Data saved automatically to your user profile folder
- Export / import JSON backups

## Run

Double-click **`PNL Calendar`** on your desktop (recommended), or run **`Create Desktop Shortcut.ps1`** once to recreate it.

You can also use **`Start PNL Calendar.vbs`** (no terminal) or **`Start PNL Calendar.bat`**.

For development:

```bash
cd pnl-calendar
npm install
npm start
```

## Build installer (optional)

```bash
npm run dist
```

The Windows installer will be in the `dist` folder.

## Editing amounts

When editing a day, you can type:

- `25000` or `25K` or `$25K`
- `-1500` or `-1.5K` for losses
- Leave empty and save (or use **Clear**) to remove a day

## Data location

Your data is stored at:

`%APPDATA%\pnl-calendar\pnl-data.json` (Windows)
