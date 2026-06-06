<template>
  <view class="shell">
    <web-view
      v-if="showWebView"
      class="biomentor-webview"
      :src="targetUrl"
      :webview-styles="webviewStyles"
      :update-title="false"
      @load="handleLoad"
      @error="handleError"
    />

    <view v-if="isLoading || hasError" class="state-layer">
      <view class="brand-card">
        <image class="brand-logo" src="/static/logo.svg" mode="aspectFit" />
        <text class="brand-name">BioMentor Agent</text>
        <text class="brand-subtitle">
          {{ hasError ? "暂时无法连接学习平台" : "正在进入智能生物学习平台" }}
        </text>
        <text v-if="hasError" class="state-copy">
          请确认网络可用，或稍后重试。AI、文献、工具箱和学术答辩能力均由线上服务提供。
        </text>
        <button v-if="hasError" class="reload-button" type="default" @click="reload">
          重新加载
        </button>
      </view>
    </view>
  </view>
</template>

<script>
import { APP_CONFIG } from "@/config/app.js";

export default {
  data() {
    return {
      targetUrl: APP_CONFIG.targetUrl,
      isLoading: true,
      hasError: false,
      showWebView: true,
      webviewStyles: {
        progress: {
          color: "#2563eb",
        },
      },
    };
  },
  onLoad() {
    uni.setNavigationBarTitle({
      title: APP_CONFIG.name,
    });
  },
  methods: {
    handleLoad() {
      this.isLoading = false;
      this.hasError = false;
    },
    handleError() {
      this.isLoading = false;
      this.hasError = true;
      this.showWebView = false;
    },
    reload() {
      this.isLoading = true;
      this.hasError = false;
      this.showWebView = false;
      this.$nextTick(() => {
        setTimeout(() => {
          this.showWebView = true;
        }, 80);
      });
    },
  },
};
</script>

<style scoped>
.shell {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #f7fbff;
}

.biomentor-webview {
  width: 100vw;
  height: 100vh;
}

.state-layer {
  position: absolute;
  inset: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 56rpx;
  background:
    radial-gradient(circle at 28% 18%, rgba(37, 99, 235, 0.16), transparent 32%),
    radial-gradient(circle at 72% 80%, rgba(20, 184, 166, 0.18), transparent 34%),
    linear-gradient(135deg, #f8fbff 0%, #eef7ff 46%, #f7f2ff 100%);
}

.brand-card {
  width: 100%;
  max-width: 560rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 56rpx 44rpx;
  border-radius: 36rpx;
  background: rgba(255, 255, 255, 0.76);
  border: 1rpx solid rgba(255, 255, 255, 0.92);
  box-shadow: 0 30rpx 90rpx rgba(28, 45, 80, 0.14);
}

.brand-logo {
  width: 132rpx;
  height: 132rpx;
  margin-bottom: 28rpx;
}

.brand-name {
  font-size: 42rpx;
  line-height: 1.15;
  font-weight: 800;
  color: #111827;
  text-align: center;
}

.brand-subtitle {
  margin-top: 18rpx;
  font-size: 27rpx;
  line-height: 1.55;
  color: #475569;
  text-align: center;
}

.state-copy {
  margin-top: 22rpx;
  font-size: 24rpx;
  line-height: 1.65;
  color: #64748b;
  text-align: center;
}

.reload-button {
  margin-top: 34rpx;
  width: 100%;
  height: 88rpx;
  border-radius: 999rpx;
  background: #111827;
  color: #ffffff;
  font-size: 28rpx;
  font-weight: 700;
}
</style>
