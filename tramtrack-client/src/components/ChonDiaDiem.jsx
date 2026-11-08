import React from 'react';

/**
 * Chọn tỉnh/thành và xã/phường (đơn vị hành chính hiện hành) cho một chặng.
 * `dl` là nội dung data/dvhc.json do nơi gọi nạp; chưa có thì ô chọn bị khóa.
 * Xã/phường không bắt buộc. Trả về mã, không trả tên.
 */
export default function ChonDiaDiem({ dl, tinh, xa, onChange, o, nhan }) {
  const dsXa = dl && tinh ? dl.x[tinh] || [] : [];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className={nhan}>Tỉnh / thành phố</label>
        <select
          value={tinh}
          onChange={(e) => onChange({ tinh: e.target.value, xa: '' })}
          disabled={!dl}
          className={o}
        >
          <option value="">{dl ? 'Chưa chọn' : 'Đang tải danh sách…'}</option>
          {dl && dl.t.map(([ma, ten]) => <option key={ma} value={ma}>{ten}</option>)}
        </select>
      </div>
      <div>
        <label className={nhan}>Xã / phường</label>
        <select
          value={xa}
          onChange={(e) => onChange({ tinh, xa: e.target.value })}
          disabled={!tinh}
          className={`${o} disabled:opacity-50`}
        >
          <option value="">{tinh ? 'Không chọn' : 'Chọn tỉnh trước'}</option>
          {dsXa.map(([ma, ten]) => <option key={ma} value={ma}>{ten}</option>)}
        </select>
      </div>
    </div>
  );
}
