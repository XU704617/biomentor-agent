---
name: winui-app
description: Bootstrap, develop, and design WinUI 3 desktop applications with C# and Windows App SDK. Invoke when creating WinUI apps, setting up WinUI development environment, or working on Windows desktop apps.
---

# WinUI App

Build WinUI 3 desktop applications with C# and the Windows App SDK using official Microsoft guidance, WinUI Gallery patterns, and Fluent design.

## Overview

Use this skill for WinUI 3 and Windows App SDK work: setup, app bootstrap, modern Windows UX design, implementation, and troubleshooting.

## Environment Setup

### Verify Prerequisites

- Windows 10 version 1809+ or Windows 11
- Visual Studio 2022 with:
  - .NET Desktop Development workload
  - Windows App SDK C# Templates
  - Universal Windows Platform development
- Developer Mode enabled (Settings → For developers)

### Install Templates

```powershell
# Check available templates
dotnet new list winui

# If missing, install Windows App SDK templates
dotnet new install Microsoft.WindowsAppSDK.Templates
```

## Create a New App

```powershell
# Basic WinUI 3 app
dotnet new winui -o MyWinUIApp

# With MVVM
dotnet new winui -o MyWinUIApp --use-mvvm

# Unpackaged (CLI-friendly)
dotnet new winui -o MyWinUIApp --unpackaged
```

Build and run:

```powershell
cd MyWinUIApp
dotnet build
# Run packaged: dotnet run (via Visual Studio)
# Run unpackaged: ./bin/Debug/net10.0/MyWinUIApp.exe
```

## Application Structure

```
MyWinUIApp/
├── App.xaml / App.xaml.cs        # Application entry point
├── MainWindow.xaml / .cs          # Main window
├── app.manifest                   # Package manifest (packaged)
└── MyWinUIApp.csproj              # Project file
```

## Key Patterns

### Navigation with NavigationView

```xml
<NavigationView x:Name="NavView"
    PaneDisplayMode="LeftCompact"
    IsBackButtonVisible="Collapsed"
    SelectionChanged="NavView_SelectionChanged">
    <NavigationView.MenuItems>
        <NavigationViewItem Content="Home" Icon="Home" Tag="home" />
        <NavigationViewItem Content="Settings" Icon="Setting" Tag="settings" />
    </NavigationView.MenuItems>
    <Frame x:Name="ContentFrame" />
</NavigationView>
```

### Data Binding

```csharp
public class MainViewModel : INotifyPropertyChanged
{
    private string _title = "Hello WinUI";
    public string Title
    {
        get => _title;
        set { _title = value; OnPropertyChanged(); }
    }

    public event PropertyChangedEventHandler? PropertyChanged;
    protected void OnPropertyChanged([CallerMemberName] string? name = null)
        => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));
}
```

### Theming (Light/Dark)

```csharp
// In App.xaml.cs
if (App.Current.RequestedTheme == ApplicationTheme.Dark)
{
    // Dark mode handling
}

// Use theme-aware resources
<TextBlock Style="{StaticResource BodyTextBlockStyle}"
           Foreground="{ThemeResource SystemControlForegroundBaseHighBrush}" />
```

### Mica Backdrop

```csharp
// In MainWindow constructor
this.SystemBackdrop = new MicaBackdrop()
{
    Kind = MicaKind.Base
};
```

## Packaging Models

| Model | Use When |
|-------|----------|
| **Packaged** | Store distribution, Visual Studio F5, auto-updates |
| **Unpackaged** | CLI build/run, direct .exe launch, simpler dev loop |

## Controls Reference

| Need | Use |
|------|-----|
| Navigation | `NavigationView` |
| Command bar | `CommandBar` |
| Settings | `SettingsCard`, `Expander` |
| Forms | `TextBox`, `ComboBox`, `DatePicker` |
| Lists | `ListView`, `GridView` |
| Dialogs | `ContentDialog` |
| Teaching UI | `TeachingTip` |
| Progress | `ProgressBar`, `ProgressRing` |
| Info bar | `InfoBar` |

## Styling Principles

- Support both light and dark mode by default
- Use theme-aware resources, system brushes, and WinUI styling hooks
- Never hardcode light-only or dark-only colors
- Use Mica/Acrylic materials for depth
- Follow Fluent typography scale
- Prefer built-in controls before CommunityToolkit

## Design Guidelines

- Plan for wide, medium, and narrow window widths
- Use `NavigationView` for app shell with adaptive pane display
- Use `CommandBar` for grouped command surfaces (not ad hoc button groups)
- Make scroll ownership explicit for collection layouts
- Avoid extra `Border` wrappers unless borders serve a distinct purpose
- Avoid double-card compositions

## Build and Verification

```powershell
dotnet build
dotnet run  # For unpackaged
```

Verify the app launches with a responsive window showing correct title and content.
