import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { chiTietLo, laLoiHetPhien, laLoiKetNoi } from '../../services/api';
import HanhTrinhLo from '../../components/HanhTrinhLo';

/**
 * Xem trước hành trình của một lô trong khu quản trị — GET /api/v1/qt/lo/:maLo.
 * Dùng đúng component mà người mua thấy, nên không có chuyện hai nơi lệch nhau.
 * Lô nháp cũng xem được.
 */
export default function XemTruocHanhTrinh({ maLo, onBack, onHetPhien }) {
  const [lo, setLo] = useState(null);
  const [loi, setLoi] = useState(null);

  useEffect(() => {
    if (!maLo) { setLoi('Chưa chọn lô để xem trước.'); return undefined; }
    let huy = false;
    chiTietLo(maLo)
      .then((d) => { if (!huy) setLo(d); })
      .catch((e) => {
        if (huy) return;
        if (laLoiHetPhien(e)) { if (onHetPhien) onHetPhien(); return; }
        setLoi(laLoiKetNoi(e) ? 'Chưa nối được máy chủ. Thử lại sau vài giây.' : (e.message || 'Không đọc được lô'));
      });
    return () => { huy = true; };
  }, [maLo, onHetPhien]);

  if (loi) {
    return (
      <div className="p-8 max-w-xl">
        <div role="alert" className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-4 text-sm mb-4">{loi}</div>
        <button onClick={onBack} className="text-sm font-semibold text-[#135E3E] underline">Về danh sách lô</button>
      </div>
    );
  }
  if (!lo) {
    return <div className="p-8 flex items-center gap-2 text-sm text-[#4F6357]"><Loader2 size={16} className="animate-spin" /> Đang tải…</div>;
  }
  return <HanhTrinhLo lo={lo} xemTruoc nhungSan onClose={onBack} />;
}
