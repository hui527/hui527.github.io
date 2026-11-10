# 陈彦辉｜个人作品

这是个人作品集的正式发布项目，当前使用 React + Vite 构建，部署到 GitHub Pages。

## 本地运行

```powershell
npm ci
npm run check
npm run build
npm run dev
```

## 自动部署

向 `main` 分支推送代码后，GitHub Actions 会自动执行类型检查、构建并发布到 GitHub Pages。

- 仓库：[hui527/hui527.github.io](https://github.com/hui527/hui527.github.io)
- 网站：[https://hui527.github.io/](https://hui527.github.io/)

## 更新网站

当前页面源代码来自 Figma Make 的最新导出快照：

- 页面代码：`src/App.tsx`、`src/index.css`
- 入口和构建配置：`src/main.tsx`、`vite.config.ts`
- 图片和视频：`portrait-*.webp`、`public/media/`

以后在 Figma Make 完成并确认页面改动后，将对应的 `App.tsx`、`index.css` 和新增素材同步到本目录，执行 `npm run check` 与 `npm run build`，再提交并推送到 `main`。

## 回滚

在 GitHub 仓库的提交记录中选择目标版本，使用 `git revert <commit>` 生成回滚提交并推送；Actions 会自动重新发布。

## 主题素材与播放

- 背景 `public/media/palace-hero.webp` 保留 2960 × 1648 尺寸，约 1.14 MB。
- 循环视频 `public/media/palace-loop-1080.mp4` 为 1920 × 1080、30 帧/秒，约 5.39 MB；没有自动切换到低清版本。
- `src/useVideoPlayback.ts` 先下载完整的短循环，等待时展示清晰背景；收到 `playing` 后再显示视频。加载失败或自动播放被阻止时，按钮提供重试或点击播放。切到后台暂停视频，返回时保留用户的播放意愿。
- 从 Figma Make 同步页面时，保留该播放模块、`App.tsx` 中的接入、`index.html` 的背景预加载和新素材路径。新增长视频应另设流式播放方案，不直接套用短循环的完整缓存策略。

本次优化前的发布素材可从 Git 提交 `bbe1635` 恢复；本地备份在 `D:\个人网页\figma-make-edits\2026-11-10-performance\before`。
