import React, { useState } from 'react';
import { MapPin, Loader2, Check } from 'lucide-react';
import { guiKhuVuc, laLoiKetNoi } from '../services/api';

/**
 * Người mua tự chọn tỉnh/thành và xã/phường nơi họ đang ở, sau khi kích hoạt.
 *
 * Hoàn toàn tùy chọn và không ảnh hưởng kết quả xác thực. Danh sách đơn vị
 * hành chính (34 tỉnh/thành, 3.321 xã/phường theo Nghị quyết 202/2025/QH15)
 * nạp theo yêu cầu khi người dùng mở khung này, không nằm trong gói tải đầu.
 *
 * Chỉ nhận về mã đơn vị hành chính. Không xin vị trí điện thoại, không lưu
 * toạ độ, không lưu địa chỉ mạng.
 */
export default function KhuVucTuChon({ serial, dau }) {
  const [mo, setMo] = useState(false);
  const [dl, setDl] = useState(null);
  const [tinh, setTinh] = useState('');
  const [xa, setXa] = useState('');
  const [trang, setTrang] = useState('cho'); // cho | dang | xong
  const [loi, setLoi] = useState(null);

  if (!serial || !dau) return null;

  async function moKhung() {
    setMo(true);
    if (!dl) {
      try {
        const m = await import('../data/dvhc.json');
        setDl(m.default || m);
      } catch {
        setLoi('Không tải được danh sách khu vực. Bạn có thể bỏ qua bước này.');
      }
    }
  }

  async function gui() {
    if (!tinh || trang === 'dang') return;
    setLoi(null);
    setTrang('dang');
    try {
      await guiKhuVuc(serial, dau, tinh, xa || null);
      setTrang('xong');
    } catch (e) {
      setTrang('cho');
      setLoi(laLoiKetNoi(e) ? 'Chưa nối được máy chủ. Bạn có thể thử lại hoặc bỏ qua.' : (e.message || 'Chưa lưu được'));
    }
  }

  if (trang === 'xong') {
    return (
      <div className="w-full bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-6 flex items-center gap-3 text-[13px] text-emerald-900">
        <Check size={18} className="text-[#135E3E] shrink-0" /> Cảm ơn bạn. Cơ sở sản xuất đã nhận được khu vực.
      </div>
    );
  }

  if (!mo) {
    return (
      <button
        type="button"
        onClick={moKhung}
        className="w-full bg-white/80 border border-emerald-900/15 rounded-2xl p-4 mb-6 flex items-center gap-3 text-left hover:bg-white transition-colors"
      >
        <MapPin size={18} className="text-[#8C6928] shrink-0" />
        <span className="text-[13px] text-[#0A1A12] leading-relaxed">
          <strong>Bạn đang ở đâu?</strong> Chọn tỉnh/thành để giúp cơ sở biết chai này đến vùng nào. Không bắt buộc.
        </span>
      </button>
    );
  }

  const dsXa = dl && tinh ? dl.x[tinh] || [] : [];

  return (
    <div className="w-full bg-white/90 border border-emerald-900/15 rounded-2xl p-4 sm:p-5 mb-6">
      <div className="flex items-center gap-2 mb-3 text-[#8C6928]">
        <MapPin size={16} /> <span className="text-[11px] font-bold uppercase tracking-wider">Khu vực của bạn (không bắt buộc)</span>
      </div>

      <label className="block text-[11px] font-semibold text-[#4F6357] uppercase tracking-wider mb-1">Tỉnh / thành phố</label>
      <select
        value={tinh}
        onChange={(e) => { setTinh(e.target.value); setXa(''); }}
        disabled={!dl}
        className="w-full mb-3 px-3 py-2.5 bg-slate-50 border border-emerald-900/15 rounded-xl text-sm outline-none focus:border-[#135E3E]"
      >
        <option value="">{dl ? 'Chọn tỉnh / thành phố' : 'Đang tải…'}</option>
        {dl && dl.t.map(([ma, ten]) => <option key={ma} value={ma}>{ten}</option>)}
      </select>

      <label className="block text-[11px] font-semibold text-[#4F6357] uppercase tracking-wider mb-1">Xã / phường (tùy chọn)</label>
      <select
        value={xa}
        onChange={(e) => setXa(e.target.value)}
        disabled={!tinh}
        className="w-full mb-3 px-3 py-2.5 bg-slate-50 border border-emerald-900/15 rounded-xl text-sm outline-none focus:border-[#135E3E] disabled:opacity-50"
      >
        <option value="">{tinh ? 'Không chọn' : 'Chọn tỉnh trước'}</option>
        {dsXa.map(([ma, ten]) => <option key={ma} value={ma}>{ten}</option>)}
      </select>

      {loi && <p role="alert" className="text-rose-700 text-[12.5px] mb-3">{loi}</p>}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={gui}
          disabled={!tinh || trang === 'dang'}
          className="bg-[#135E3E] text-white font-semibold text-sm px-5 py-2.5 rounded-xl disabled:opacity-45 flex items-center gap-2"
        >
          {trang === 'dang' && <Loader2 size={15} className="animate-spin" />} Gửi
        </button>
        <button type="button" onClick={() => setMo(false)} className="text-sm text-[#4F6357] hover:underline">Bỏ qua</button>
      </div>

      <p className="text-[11.5px] text-[#4F6357] leading-relaxed mt-3">
        Chỉ lưu tên đơn vị hành chính bạn chọn. Không lưu vị trí chính xác và không lưu địa chỉ mạng.
        Việc này không ảnh hưởng kết quả xác thực.
      </p>
    </div>
  );
}
