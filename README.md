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

向 `main` 分支推送代码后，GitHub Actions 会自动执行类型检查、构建并发布到 GitHub Pages。仓库地址和站点地址在部署完成后补充到这里。

## 更新网站

当前页面源代码来自 Figma Make 的最新导出快照：

- 页面代码：`src/App.tsx`、`src/index.css`
- 入口和构建配置：`src/main.tsx`、`vite.config.ts`
- 图片和视频：`portrait-*.webp`、`public/media/`

以后在 Figma Make 完成并确认页面改动后，将对应的 `App.tsx`、`index.css` 和新增素材同步到本目录，执行 `npm run check` 与 `npm run build`，再提交并推送到 `main`。

## 回滚

在 GitHub 仓库的提交记录中选择目标版本，使用 `git revert <commit>` 生成回滚提交并推送；Actions 会自动重新发布。
