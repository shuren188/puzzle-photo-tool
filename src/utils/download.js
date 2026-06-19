/**
 * 下载功能模块
 * 支持微信环境和普通浏览器
 */

/**
 * 检测是否在微信环境
 */
export function isWeChat() {
  return /MicroMessenger/i.test(navigator.userAgent);
}

/**
 * 检测是否在淘宝/千牛等阿里系应用
 */
export function isAliApp() {
  return /Alibaba|AliApp|TB|TM|QN|ANBOT/i.test(navigator.userAgent);
}

/**
 * 下载图片
 * @param {HTMLCanvasElement} canvas - 要导出的 Canvas
 * @param {string} filename - 下载文件名
 * @param {string} format - 图片格式 (image/png / image/jpeg)
 * @param {number} dpi - 输出分辨率 (嵌入 PNG pHYs 元数据)
 */
export function downloadImage(canvas, filename = 'puzzle-photo.png', format = 'image/png', dpi = 72) {
  const dataUrl = canvas.toDataURL(format, 0.95);

  if (isWeChat() || isAliApp()) {
    wechatDownload(dataUrl);
  } else {
    // 嵌入 DPI 元数据后下载
    embedDPI(canvas, dpi, (blobUrl) => {
      browserDownload(blobUrl, filename);
    });
  }
}

/**
 * 将 DPI 信息嵌入 PNG (pHYs chunk)
 * Canvas.toDataURL 不包含 DPI 信息，需要手动写入 pHYs chunk
 */
function embedDPI(canvas, dpi, callback) {
  canvas.toBlob((blob) => {
    if (!blob) {
      // fallback: 直接用 canvas dataURL
      callback(canvas.toDataURL('image/png', 0.95));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const bytes = new Uint8Array(reader.result);
      // PNG 签名: 89 50 4E 47 0D 0A 1A 0A
      // IHDR chunk 从第 8 字节开始: 4字节长度 + 4字节"IHDR" + 13字节数据 + 4字节CRC
      // pHYs 插入在 IHDR 之后 (IHDR 总长 = 4 + 4 + 13 + 4 = 25)
      const ihdrEnd = 8 + 25;

      // 构建 pHYs chunk: 9 字节数据
      // 单位: 像素/米 (72 DPI = 2835 px/m, 300 DPI = 11811 px/m)
      const ppm = Math.round(dpi / 0.0254);
      const physData = new Uint8Array(9);
      physData[0] = (ppm >>> 24) & 0xFF;
      physData[1] = (ppm >>> 16) & 0xFF;
      physData[2] = (ppm >>> 8) & 0xFF;
      physData[3] = ppm & 0xFF;           // X 像素/米
      physData[4] = (ppm >>> 24) & 0xFF;
      physData[5] = (ppm >>> 16) & 0xFF;
      physData[6] = (ppm >>> 8) & 0xFF;
      physData[7] = ppm & 0xFF;           // Y 像素/米
      physData[8] = 1;                    // 单位: 米

      // CRC32 of "pHYs" + physData
      const typeAndData = new Uint8Array(9 + 4);
      typeAndData[0] = 0x70; typeAndData[1] = 0x48; typeAndData[2] = 0x59; typeAndData[3] = 0x73; // pHYs
      typeAndData.set(physData, 4);
      const crc = crc32(typeAndData);

      // chunk length (9) + "pHYs" + data + CRC
      const physChunk = new Uint8Array(4 + 4 + 9 + 4);
      // length = 9
      physChunk[0] = 0; physChunk[1] = 0; physChunk[2] = 0; physChunk[3] = 9;
      // type = "pHYs"
      physChunk[4] = 0x70; physChunk[5] = 0x48; physChunk[6] = 0x59; physChunk[7] = 0x73;
      // data
      physChunk.set(physData, 8);
      // CRC
      physChunk[12] = (crc >>> 24) & 0xFF;
      physChunk[13] = (crc >>> 16) & 0xFF;
      physChunk[14] = (crc >>> 8) & 0xFF;
      physChunk[15] = crc & 0xFF;

      // 拼接: PNG签名 + IHDR + pHYs + 剩余原始数据
      const result = new Uint8Array(bytes.length + 16);
      result.set(bytes.slice(0, ihdrEnd), 0);    // PNG签名 + IHDR
      result.set(physChunk, ihdrEnd);              // pHYs chunk
      result.set(bytes.slice(ihdrEnd), ihdrEnd + 16); // 剩余数据

      const blob2 = new Blob([result], { type: 'image/png' });
      callback(URL.createObjectURL(blob2));
    };
    reader.readAsArrayBuffer(blob);
  }, 'image/png');
}

/** CRC32 查找表 */
const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[n] = c;
  }
  return table;
})();

function crc32(data) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < data.length; i++) {
    c = crcTable[(c ^ data[i]) & 0xFF] ^ (c >>> 8);
  }
  return (c ^ 0xFFFFFFFF) >>> 0;
}

/**
 * 普通浏览器下载（支持 Blob URL）
 */
function browserDownload(url, filename) {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * 微信/千牛等环境下载
 * 在新窗口/当前窗口显示图片，提示用户长按保存
 */
function wechatDownload(dataUrl) {
  // 创建全屏图片预览
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.95);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 99999;
    padding: 20px;
  `;

  const img = document.createElement('img');
  img.src = dataUrl;
  img.style.cssText = `
    max-width: 100%;
    max-height: 80vh;
    object-fit: contain;
    border-radius: 4px;
  `;

  const tip = document.createElement('p');
  tip.textContent = '长按图片保存到相册';
  tip.style.cssText = `
    color: rgba(255,255,255,0.7);
    font-size: 14px;
    margin-top: 16px;
  `;

  const closeBtn = document.createElement('button');
  closeBtn.textContent = '关闭';
  closeBtn.style.cssText = `
    margin-top: 12px;
    padding: 8px 24px;
    border: 1px solid rgba(255,255,255,0.3);
    border-radius: 6px;
    background: transparent;
    color: white;
    font-size: 14px;
    cursor: pointer;
  `;
  closeBtn.onclick = () => document.body.removeChild(overlay);

  overlay.appendChild(img);
  overlay.appendChild(tip);
  overlay.appendChild(closeBtn);
  document.body.appendChild(overlay);
}

/**
 * 获取输出文件名
 */
export function getOutputFilename(sizeName, dpi) {
  const ts = Date.now();
  const dpiStr = dpi === 300 ? '_300dpi' : '';
  return `puzzle_${sizeName}${dpiStr}_${ts}.png`;
}
