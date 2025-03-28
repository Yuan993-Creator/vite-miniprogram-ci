# vite-miniprogram-ci

一个用于Vite的小程序CI插件，用于在构建完成后自动完成小程序的预览、上传等操作。

## 功能特点

- 支持微信小程序的预览和上传
- 自动生成体验版和预览版二维码
- 支持自定义版本号和描述
- 完全使用TypeScript编写，提供类型定义
- 集成在Vite构建流程中，无需额外脚本

## 安装

```bash
# 安装插件
npm install vite-miniprogram-ci -D

# 安装必要的依赖
npm install miniprogram-ci -D
```

> 注意：如果你使用的是 0.1.1 版本之前的包，可能需要手动安装 jsqr 依赖：`npm install jsqr -D`。0.1.2 版本及以后已经将 jsqr 作为依赖项包含在内。

## 基本用法

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import miniCI from 'vite-miniprogram-ci';

export default defineConfig({
  plugins: [
    miniCI({
      // 平台类型
      type: 'weapp',
      
      // 操作类型: 'open' | 'preview' | 'upload'
      action: 'preview',
      
      // 微信小程序配置
      weapp: {
        // 微信小程序的appid
        appid: 'wx1234567890',
        
        // 项目路径
        projectPath: './dist/wx',
        
        // 私钥路径
        privateKeyPath: './private.key',
        
        // 忽略的文件
        ignores: ['node_modules/**/*'],
        
        // 机器人编号
        robot: 1,
        
        // 编译设置
        setting: {
          es6: true,
          minify: true,
          autoPrefixWXSS: true,
        }
      },
      
      // 日志级别
      logLevel: 'info',
      
      // 版本号，默认从package.json获取
      version: '1.0.0',
      
      // 上传描述
      desc: '版本更新说明'
    })
  ]
});
```

## 详细配置选项

### 顶级选项

| 选项 | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| `type` | `string` | - | 平台类型，目前支持: `weapp`(微信小程序) |
| `action` | `'open' \| 'preview' \| 'upload'` | - | 操作类型: 打开开发工具、预览或上传 |
| `logLevel` | `'info' \| 'debug' \| 'warn' \| 'error' \| 'silent'` | `'info'` | 日志级别 |
| `version` | `string` | package.json的version字段 | 版本号 |
| `desc` | `string` | 自动生成 | 描述信息 |
| `weapp` | `object` | - | 微信小程序配置 |

### 微信小程序配置 (weapp)

| 选项 | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| `appid` | `string` | - | 微信小程序的appid |
| `projectPath` | `string` | - | 小程序项目路径 |
| `privateKeyPath` | `string` | - | 上传密钥路径 |
| `ignores` | `string[]` | - | 忽略的文件 |
| `robot` | `number` | `1` | 机器人编号 |
| `setting` | `object` | - | 编译设置 |
| `devToolsInstallPath` | `string` | 自动检测 | 微信开发者工具安装路径 |

## 操作类型说明

- `open`: 自动打开微信开发者工具
- `preview`: 预览小程序，生成开发版二维码
- `upload`: 上传小程序，生成体验版二维码（可能需要手动在微信后台设置为体验版）

## 命令行使用

您也可以在命令行中使用此插件：

```bash
# 预览小程序
npx vite build --mode preview -- type=weapp action=preview

# 上传小程序
npx vite build --mode production -- type=weapp action=upload
```

## 示例：构建并预览微信小程序

```ts
import { defineConfig } from 'vite';
import miniCI from 'vite-miniprogram-ci';

export default defineConfig({
  plugins: [
    miniCI({
      type: 'weapp',
      action: 'preview',
      weapp: {
        appid: 'wx1234567890',
        projectPath: './dist/wx',
        privateKeyPath: './private.key',
      }
    })
  ]
});
```

## 许可证

MIT 