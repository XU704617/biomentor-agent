---
name: screenshot
description: Capture desktop screenshots across Windows, macOS, and Linux. Invoke when user asks for a screenshot, needs visual inspection of an app, or wants to capture a specific region or window.
---

# Screenshot Capture

## Save Location Rules

1. If the user specifies a path, save there.
2. If the user asks for a screenshot without a path, save to the default location (Desktop or Pictures).
3. If a screenshot is needed for internal visual inspection, save to the temp directory.

## Windows (PowerShell)

Use .NET's System.Windows.Forms or built-in screen capture:

```powershell
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

# Full screen
$screen = [System.Windows.Forms.Screen]::PrimaryScreen
$bitmap = New-Object System.Drawing.Bitmap($screen.Bounds.Width, $screen.Bounds.Height)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.CopyFromScreen(0, 0, 0, 0, $bitmap.Size)
$bitmap.Save("$env:TEMP\screenshot.png", [System.Drawing.Imaging.ImageFormat]::Png)
$graphics.Dispose()
$bitmap.Dispose()
```

Or use the built-in `snippingtool` via command line:

```powershell
# Windows 11 Snipping Tool
Start-Process "ms-screensketch:" -Wait
```

## macOS

```bash
# Full screen to file
screencapture -x output/screen.png

# Pixel region (x,y,w,h)
screencapture -x -R100,200,800,600 output/region.png

# Specific window (interactive selection)
screencapture -x -i -W output/window.png

# Interactive region selection
screencapture -x -i output/interactive.png
```

## Linux

Use available tools (checked in priority order):

```bash
# Full screen
scrot output/screen.png
# or
gnome-screenshot -f output/screen.png
# or
import -window root output/screen.png

# Region
scrot -a 100,200,800,600 output/region.png
# or
import -window root -crop 800x600+100+200 output/region.png

# Active window
scrot -u output/window.png
# or
gnome-screenshot -w -f output/window.png
```

## Error Handling

- If screen capture tools are not available, ask the user to install the missing tool
- For Windows: .NET assemblies should be available by default
- For macOS: `screencapture` is built-in
- For Linux: check `which scrot gnome-screenshot import` and install if needed
- Always report the saved file path in the response
