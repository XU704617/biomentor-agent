# BioMentor Agent App Shell

这是 BioMentor Agent 的第一版 Android / iOS App 壳。它不重写现有网站功能，而是用 uni-app 的 `web-view` 全屏加载已部署的 BioMentor 前端。

当前加载地址：

```text
http://106.14.194.186:10086
```

## 为什么这样做

- 现有核心功能已经在 Next.js / FastAPI / DeepSeek 服务里。
- App 内不保存 API Key，避免 APK 反编译后泄露密钥。
- 第一版可以快速打包 Android APK 或 iOS IPA，用于安装、演示和真机体验。
- 后续如需相机、文件上传、缓存、推送，可以在这个壳上继续加原生能力。

## 用 HBuilderX 打包 Android

1. 打开 HBuilderX。
2. 选择“文件” -> “打开目录”，打开本目录 `app-shell`。
3. 打开 `manifest.json`，确认应用名称为 `BioMentor Agent`。
4. 如需正式发布，在 HBuilderX 中替换应用图标和启动图；本目录已提供 `static/logo.svg` 和 `static/splash.svg` 作为设计源文件。
5. 选择“发行” -> “原生 App-云打包”。
6. 平台选择 Android，包名默认是 `io.biomentor.agent`。
7. 使用测试证书或自己的 Android 签名证书打包 APK。

## 用 HBuilderX 打包 iOS

1. 打开 HBuilderX，并打开本目录 `app-shell`。
2. 打开 `manifest.json`，确认 iOS Bundle ID 为 `io.biomentor.agent`。
3. 确认当前网站地址是 HTTPS 地址。iOS 真机和上架环境不建议加载 HTTP 页面。
4. 准备 Apple Developer 账号，并在 Apple Developer 后台创建同名 Bundle ID。
5. 准备 iOS 发布证书 `.p12` 和描述文件 `.mobileprovision`。
6. 选择“发行” -> “原生 App-云打包”。
7. 平台选择 iOS，证书类型按使用场景选择：
   - 真机测试或内部分发：Ad Hoc / Development。
   - TestFlight 或 App Store：App Store。
8. 上传 `.p12`、证书密码和 `.mobileprovision` 后打包 IPA。

如果只是在 Windows 上开发，也可以先用 HBuilderX 云打包生成 IPA；如果要本地调试原生 iOS 工程，通常还需要 macOS 和 Xcode。

## 修改加载地址

如果后续切到正式域名，只改这一处：

```text
config/app.js
```

把 `targetUrl` 改为新地址即可。

## 本地校验

在仓库根目录执行：

```bash
node app-shell/scripts/validate-app-shell.mjs
```

校验内容包括：

- 必需的 uni-app 文件是否存在。
- App 名称是否为 `BioMentor Agent`。
- Android 包名和 iOS Bundle ID 是否为 `io.biomentor.agent`。
- `web-view` 是否加载统一配置里的目标地址。
- App 壳源码里是否误写入 API Key 或 DeepSeek 环境变量名。

## 注意事项

- 如果目标网站不可访问，App 也无法使用核心功能。
- AI、文献解析、工具箱和答辩功能仍然依赖线上服务。
- 第一版不是离线 App，也不是重写版原生 App。
