/** 拼图尺寸配置 (物理厘米) */
export const SIZES = [
  { name: '35片', widthCm: 10, heightCm: 15, label: '10×15cm' },
  { name: '70片', widthCm: 15, heightCm: 20, label: '15×20cm' },
  { name: '120片', widthCm: 20, heightCm: 25, label: '20×25cm' },
  { name: '200片', widthCm: 21, heightCm: 30, label: '21×30cm' },
  { name: '300/520片', widthCm: 26, heightCm: 38, label: '26×38cm' },
];

/** 输出质量 (DPI) */
export const QUALITIES = [
  { name: '原图', dpi: 72 },
  { name: '高清', dpi: 300 },
];

/** 预设填充颜色 */
export const PRESET_COLORS = [
  { name: '纯白', hex: '#FFFFFF' },
  { name: '黑色', hex: '#000000' },
  { name: '科技蓝', hex: '#06B6D4' },
  { name: '霓虹紫', hex: '#A855F7' },
  { name: '樱花粉', hex: '#EC4899' },
];

/** 默认设置 */
export const DEFAULTS = {
  sizeIndex: 0,            // 默认 35片
  quality: 72,             // 默认 72 DPI（原图）
  fillColor: '#FFFFFF',    // 默认纯白
  zoom: 100,               // 默认 100%
  offsetX: 0,              // 默认水平居中
  offsetY: 0,              // 默认垂直居中
  rotation: 0,             // 默认不旋转
};

/** 缩放范围 */
export const ZOOM_RANGE = { min: 50, max: 150, step: 1 };

/** 偏移范围 (%) */
export const OFFSET_RANGE = { min: -100, max: 100, step: 1 };

/** 拖拽灵敏度 */
export const DRAG_SENSITIVITY = 2.5;

/** 文案 */
export const TEXT = {
  title: '拼图裁剪效果图',
  subtitle: '完整保留画面 · 智能白边适配 · 35至520片',
  previewTitle: '拼图预览',
  reUpload: '重新上传',
  sizeLabel: '选择尺寸',
  qualityLabel: '输出质量',
  adjustLabel: '调整',
  colorLabel: '颜色',
  rotateLeft: '↺ 左转90°',
  rotateRight: '↻ 右转90°',
  download: '下载高清图片',
};
