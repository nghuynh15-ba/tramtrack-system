/** Ảnh phiếu đi trong thân JSON nên phải nhỏ: máy chủ giới hạn 256 KB cho cả yêu cầu. */
export const TOI_DA_ANH_KY_TU = 190000;

export function nenAnh(file, toiDa = TOI_DA_ANH_KY_TU) {
  return new Promise((resolve, reject) => {
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
      reject(new Error('Chỉ nhận ảnh JPG, PNG hoặc WebP (không nhận PDF). Hãy chụp hoặc xuất thành ảnh.'));
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      let canh = 1400;
      for (let lan = 0; lan < 6; lan++) {
        const tiLe = Math.min(1, canh / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * tiLe);
        c.height = Math.round(img.height * tiLe);
        const g = c.getContext('2d');
        g.fillStyle = '#fff';
        g.fillRect(0, 0, c.width, c.height);
        g.drawImage(img, 0, 0, c.width, c.height);
        for (const q of [0.8, 0.65, 0.5]) {
          const d = c.toDataURL('image/jpeg', q);
          if (d.length <= toiDa) { resolve(d); return; }
        }
        canh = Math.round(canh * 0.75);
      }
      reject(new Error('Ảnh quá lớn, không nén nhỏ được. Hãy chọn ảnh khác.'));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Không đọc được ảnh này.')); };
    img.src = url;
  });
}
