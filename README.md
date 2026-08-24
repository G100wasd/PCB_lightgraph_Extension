<h1 align="center">PCB_lightgraph_Extension</h1>

<p align="center">
  <img alt="Language" src="https://img.shields.io/badge/Language-TypeScript%20%2F%20JavaScript-3178C6?logo=typescript&logoColor=white">
  <img alt="License" src="https://img.shields.io/badge/License-MIT-D22128">
  <br>
  <img alt="Framework" src="https://img.shields.io/badge/Framework-HTML5%20Canvas-E34F26?logo=html5&logoColor=white">
  <img alt="Runtime" src="https://img.shields.io/badge/Runtime-嘉立创%20EDA%20专业版-2563EB">
</p>

<p align="center">
  <strong>PCB_lightgraph_Extension</strong> 直接将软件内置在嘉立创 EDA 专业版
  <br>
  直接下载并导入插件扩展包至EDA专业版<br>
  即可<strong> 跳过原软件导出再导入图片 </strong>的中间流程！
</p>

## 界面&完整功能

- **两种分层模式**：纯灰度三分模式输出铜层、阻焊层和丝印层；彩色识别模式额外支持背透光层与 LED 灯条参考图。
- **贴近实际工艺的参数**：支持 ENIG 沉金、HASL 喷锡、OSP 玫瑰金、阻焊颜色、裸露基材绑定及边缘增强／描边。
- **直接导入 EDA**：可选单层或全部生产层，按指定坐标转换为当前 PCB 中的图元，无需先落地导出文件。
- **图纸编辑与预览**：支持缩放、平移、四分预览、快捷画笔编辑，以及自动／手动 LED 布灯；灯光仅影响预览与参考图，不污染生产层。
- **工程可携带**：支持保存和导入 `.pcblg` 工程包，保存原图、参数、视图和灯条数据，并与安装版工程格式兼容。
- **导出兼容保护**：默认在导出 PNG 时加入边角兼容标记，以降低部分 EDA 对空白／透明图层误判的风险；可在“选项”菜单关闭。

## 快速开始

### 安装扩展

1. 前往 [Releases](https://github.com/G100wasd/PCB_lightgraph_Extension/releases) 下载最新的 `.eext` 扩展包。
2. 在嘉立创 EDA 专业版中打开扩展管理页面，导入该扩展包并完成安装。
3. 打开或新建一个 PCB，使用顶部菜单的 `PCB lightgraph → Open` 启动工具。

> [!WARNING]
> 在 PCB 编辑器中打开时，可直接把生成的生产层导入当前 PCB ，在首页或原理图编辑器中同样可以打开工具，但 **不能执行** EDA 导入。

### 基本流程

1. 点击 `文件 → 导入图片`，按需在裁剪窗口中调整范围。
2. 选择 **纯灰度三分分层** 或 **彩色识别分层**，再调整对应参数。
3. 在合成预览与生产层预览中检查结果；需要时使用 `编辑 → 图纸快捷编辑` 回读修改后的原图。
4. 在“导入到 EDA 中”填写目标坐标，选择单层或全部导入；也可在“图纸操作”中导出 PNG。
5. 通过 `文件 → 保存工程` 保存 `.pcblg`，方便后续继续调整。

> [!CAUTION]
> 图片分层结果受原始素材的色彩、对比度和细节影响。导入 EDA 或实际制板前，**请在 PCB 中检查图元、层别、尺寸与可制造性**。

## 功能说明

具体功能和 [PCB_lightgraph_Portable](https://github.com/Ashlixy17/PCB_lightgraph_Portable) 完全相同，具体功能可以看 [README](https://github.com/Ashlixy17/PCB_lightgraph_Portable/blob/main/README.md) 中的解释。

## 技术与许可

- 界面和图像处理运行在 EDA 扩展的内嵌页面中，基于 Canvas `ImageData` 完成逐像素分层。
- 扩展清单标注为 MIT License；仓库中的开发工具包文件保留其原有的 Apache-2.0 许可，使用和再分发时请同时遵守对应文件的许可证。
- 素材版权、图纸审查、生产质量与制板合规性由使用者自行确认。

## 支持
<p align="center">
  <img src="images/support.gif" alt="感谢支持" width="180">
</p>

**原安装版软件**：
[PCB_lightgraph](https://github.com/tomatorigid/PCB_lightgraph)<br>
**便捷版软件**：
[PCB_lightgraph_Portable](https://github.com/Ashlixy17/PCB_lightgraph_Portable)<br>
**PCB 绘制交流群**（非群主）：<br>
[[QQ] 雷霆 PCB 的雷霆大群-1](https://qm.qq.com/q/v7i4PKNlzW)<br>
[[QQ] 雷霆 PCB 的雷霆大群-2](https://qm.qq.com/q/pVp5vf3RLi)
> [!TIP]
> 遇到问题、有新想法或愿意参与改进，欢迎 [提交Issue](https://github.com/G100wasd/PCB_lightgraph_Extension/issues) 反馈。
### 如果觉得项目对你有帮助，请给此项目和原软件点一个 Star 吧！(ﾉ>ω<)ﾉ

## 声明

本网站是一款将 2D 插画转换为 PCB 分层图纸的开源HTML工具（以下简称“本工具”），**主要面向学习与个人创作**。

1. **素材版权由使用者负责**：本工具不会为输入图像做版权审查。若您使用他人的原创作品（插画、角色形象、图片等）进行制作，请确保已获得相应授权；因素材侵权产生的纠纷与责任由使用者自行承担，与作者及本工具无关。
2. **肖像与隐私**：请勿使用本工具处理涉及他人肖像、隐私或敏感内容的图像。
3. **商用免责**：若有商家／商贩使用本工具进行 PCB 周边产品的生产与销售，由此产生的产品质量、商业模式、版权纠纷及其他一切问题与后果，均与作者及本工具无关，作者不承担任何责任。
4. **按现状提供（AS-IS）**：本工具按现状提供，不附带任何明示或暗示的担保，作者不对其适用性、可靠性或特定用途作出任何保证。
5. 使用本工具即视为已阅读并同意以上内容。
