import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Lock, Download, ShieldCheck, Cpu, KeyRound, CheckCircle2, ChevronRight, AlertTriangle } from 'lucide-react';
import {
  chiTietLo, sinhMa, ganAnhPhieu, laLoiHetPhien, laLoiKetNoi, LoiKhongDuQuyen,
} from '../../services/api';
import { nenAnh } from '../../services/anh';

/**
 * Sinh mã và xuất tệp in — GỌI THẬT POST /api/v1/qt/lo/:maLo/sinh-ma.
 *
 * Đây là màn nguy hiểm nhất của hệ thống. Mã bí mật chỉ nằm trong ĐÚNG câu trả
 * lời HTTP này; cơ sở dữ liệu chỉ giữ bản băm Argon2id. Mất câu trả lời là cả
 * dải tem vĩnh viễn không kích hoạt được. Vì vậy:
 *
 *  1. CSV được tải xuống NGAY khi máy chủ trả lời, không chờ bấm thêm nút nào.
 *  2. Nội dung CSV giữ trong `useRef`, không trong state, và chỉ để cho nút
 *     "Tải lại" phòng khi trình duyệt chặn tải tự động. Bấm "Đã lưu xong" hoặc
 *     rời màn là xoá.
 *  3. Mã thô không bao giờ được vẽ ra màn hình, không vào console.
 *  4. Mất kết nối GIỮA CHỪNG không được coi là "chưa có gì xảy ra": máy chủ có
 *     thể đã ghi tem. Thông báo nói rõ điều đó.
 *
 * Tệp CSV: cột serial, ma_bi_mat, url_tang_1 — không BOM (BOM làm hỏng tên cột
 * đầu tiên khi xưởng in đọc bằng script).
 */

const TOI_DA_MOT_LAN = 500;

function taoCsv(tem) {
  const dong = ['serial,ma_bi_mat,url_tang_1'];
  for (const t of tem) dong.push(`${t.serial},${t.ma},${t.url_t1}`);
  return dong.join('\n') + '\n';
}

function taiXuong(noiDung, tenTep) {
  const blob = new Blob([noiDung], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = tenTep;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

export default function SecurityMintingPrintExport({ maLo, onBack, onComplete, onThietKeTem, onHetPhien }) {
  const [lo, setLo] = useState(null);
  const [loiLo, setLoiLo] = useState(null);
  const [soLuong, setSoLuong] = useState('20');
  const [trang, setTrang] = useState('cho'); // cho | dang | xong
  const [loi, setLoi] = useState(null);
  const [ketQua, setKetQua] = useState(null); // { soLuong, tu, den, tenTep } — KHÔNG có mã
  const [giay, setGiay] = useState(0);
  const csvRef = useRef(null);
  const [dangGanAnh, setDangGanAnh] = useState(false);
  const [loiAnh, setLoiAnh] = useState(null);

  // Rời màn là xoá mã khỏi bộ nhớ.
  useEffect(() => () => { csvRef.current = null; }, []);

  useEffect(() => {
    if (!maLo) return;
    let huy = false;
    chiTietLo(maLo)
      .then((d) => { if (!huy) setLo(d); })
      .catch((e) => {
        if (huy) return;
        if (laLoiHetPhien(e)) { if (onHetPhien) onHetPhien(); return; }
        setLoiLo(e.message || 'Không đọc được thông tin lô');
      });
    return () => { huy = true; };
  }, [maLo]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (trang !== 'dang') return undefined;
    setGiay(0);
    const id = setInterval(() => setGiay((g) => g + 1), 1000);
    return () => clearInterval(id);
  }, [trang]);

  // Chốt phải nằm sau mọi hook.
  if (!maLo) {
    return (
      <div className="p-6 sm:p-8 max-w-3xl">
        <h1 className="text-xl font-bold mb-2">Chưa chọn lô nào</h1>
        <p className="text-sm text-[#4F6357] mb-5">Sinh mã luôn gắn với một lô cụ thể. Hãy chọn lô từ danh sách trước.</p>
        <button onClick={onBack} className="bg-[#135E3E] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md">
          Về danh sách lô
        </button>
      </div>
    );
  }

  const n = Number.parseInt(soLuong, 10);
  const nHopLe = Number.isInteger(n) && n >= 1 && n <= TOI_DA_MOT_LAN;
  const thieuCoa = lo && (!lo.so_phieu_coa || lo.ham_luong_cineole === null);
  const daThuHoi = lo && lo.trang_thai === 'DA_THU_HOI';
  const daCoTem = lo && lo.so_tem > 0;
  const thieuAnh = lo && !lo.anh_phieu_coa;

  const batDau = async () => {
    setLoi(null);
    setTrang('dang');
    try {
      const kq = await sinhMa(maLo, n);
      const csv = taoCsv(kq.tem);
      const tenTep = `tem-${maLo}-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '')}.csv`;
      csvRef.current = { csv, tenTep };
      // Tải NGAY, trước cả khi vẽ màn kết quả.
      taiXuong(csv, tenTep);
      setKetQua({
        soLuong: kq.so_luong,
        tu: kq.tem[0]?.serial,
        den: kq.tem[kq.tem.length - 1]?.serial,
        tenTep,
      });
      setTrang('xong');
    } catch (e) {
      if (laLoiHetPhien(e)) { if (onHetPhien) onHetPhien(); return; }
      setTrang('cho');
      if (e instanceof LoiKhongDuQuyen) {
        setLoi('Tài khoản của bạn không có quyền sinh mã. Chỉ vai trò quản trị làm được việc này.');
      } else if (laLoiKetNoi(e)) {
        setLoi(
          'Mất kết nối trong lúc sinh mã. Máy chủ CÓ THỂ ĐÃ tạo tem nhưng bạn không nhận được mã. ' +
          'Mở "Xem tem" của lô này để kiểm tra. Nếu có tem mới xuất hiện thì dải đó không dùng được, ' +
          'đừng in; hãy sinh dải mới.'
        );
      } else {
        setLoi(e.message || 'Không sinh được mã');
      }
    }
  };

  const chonAnh = async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    setLoiAnh(null);
    setDangGanAnh(true);
    try {
      const anh = await nenAnh(file);
      await ganAnhPhieu(maLo, anh);
      setLo(await chiTietLo(maLo));
    } catch (err) {
      if (laLoiHetPhien(err)) { if (onHetPhien) onHetPhien(); return; }
      setLoiAnh(laLoiKetNoi(err) ? 'Chưa nối được máy chủ, ảnh chưa được lưu.' : (err.message || 'Không gắn được ảnh'));
    } finally {
      setDangGanAnh(false);
    }
  };

  const taiLai = () => {
    if (csvRef.current) taiXuong(csvRef.current.csv, csvRef.current.tenTep);
  };
  const daLuuXong = () => {
    csvRef.current = null;
    if (onComplete) onComplete();
  };

  return (
    <div className="min-h-screen bg-[#F6F8F5] text-[#0A1A12] py-8 px-4 sm:px-6 lg:px-8 font-sans pb-24">
      <div className="max-w-[900px] mx-auto">

        <div className="flex items-center gap-4 mb-8 border-b border-emerald-900/10 pb-6">
          <button
            onClick={onBack}
            disabled={trang === 'dang'}
            className="flex items-center justify-center w-10 h-10 shrink-0 rounded-full bg-white border border-emerald-900/10 hover:bg-emerald-50 shadow-sm disabled:opacity-40"
          >
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
          <div>
            <h1 className="font-['Be_Vietnam_Pro'] font-bold text-xl sm:text-2xl uppercase tracking-wider leading-tight">
              Sinh mã & xuất tệp in tem
            </h1>
            <div className="font-mono text-xs text-[#135E3E] font-bold mt-1 tracking-widest">
              LÔ {maLo}{lo ? ` · ${lo.ten_dong_sp}` : ''}
            </div>
          </div>
        </div>

        {loiLo && (
          <div role="alert" className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-3 text-sm mb-6">{loiLo}</div>
        )}
        {thieuCoa && (
          <div role="alert" className="bg-amber-50 border border-amber-300 text-amber-900 rounded-xl p-3 text-sm mb-6">
            Lô này chưa có số phiếu COA hoặc hàm lượng cineole nên máy chủ sẽ từ chối sinh mã.
          </div>
        )}
        {lo && !lo.anh_phieu_coa && !daThuHoi && (
          <div role="alert" className="bg-rose-50 border border-rose-300 text-rose-900 rounded-xl p-4 text-sm mb-6 leading-relaxed">
            <p className="font-bold mb-1">Lô này chưa có ảnh phiếu kiểm nghiệm, nên chưa sinh mã được.</p>
            <p className="mb-3">
              Ảnh phiếu là <strong>bắt buộc</strong> trước khi sinh mã. Ảnh chỉ <strong>thêm</strong> được một lần,
              không thay được sau đó, nên hãy chọn đúng ảnh.
            </p>
            <label className={`inline-block bg-white border border-rose-400 rounded-lg px-4 py-2 font-semibold cursor-pointer hover:bg-rose-100 ${dangGanAnh ? 'opacity-60 pointer-events-none' : ''}`}>
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={chonAnh} className="hidden" />
              {dangGanAnh ? 'Đang gửi ảnh…' : 'Chọn ảnh phiếu (JPG, PNG)'}
            </label>
            {loiAnh && <p role="alert" className="text-rose-700 mt-2">{loiAnh}</p>}
          </div>
        )}
        {lo && lo.anh_phieu_coa && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl p-3 text-sm mb-6">
            Lô đã có ảnh phiếu kiểm nghiệm.
          </div>
        )}
        {daThuHoi && (
          <div role="alert" className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-3 text-sm mb-6">
            Lô đã thu hồi, không sinh mã được.
          </div>
        )}

        <div className="bg-white border border-emerald-900/10 rounded-3xl p-6 sm:p-8 shadow-sm space-y-8">

          <div>
            <h3 className="text-[11px] font-bold uppercase text-[#4F6357] tracking-wider mb-4 border-b border-emerald-900/10 pb-2">
              01 // Cách mã được bảo vệ
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <Cpu size={18} className="text-[#8C6928] mb-2" />
                <p className="text-[10px] font-bold text-[#4F6357] uppercase tracking-wider mb-1">Bộ sinh mã</p>
                <p className="font-mono text-xs font-bold">Ngẫu nhiên an toàn mật mã</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <Lock size={18} className="text-[#8C6928] mb-2" />
                <p className="text-[10px] font-bold text-[#4F6357] uppercase tracking-wider mb-1">Cách lưu trên máy chủ</p>
                <p className="font-mono text-xs font-bold">Chỉ lưu bản băm Argon2id</p>
              </div>
            </div>
            <div className="bg-emerald-900/5 p-3 rounded-xl border border-emerald-900/10 flex items-start gap-2.5">
              <ShieldCheck size={16} className="text-[#135E3E] shrink-0 mt-0.5" />
              <p className="text-xs text-[#4F6357] leading-relaxed">
                Mã bí mật chỉ xuất hiện <strong>một lần</strong>, trong tệp CSV tải xuống ngay khi sinh xong.
                Máy chủ không giữ lại bản đọc được nên không có cách lấy lại.
              </p>
            </div>
          </div>

          {trang !== 'xong' && (
            <div>
              <h3 className="text-[11px] font-bold uppercase text-[#4F6357] tracking-wider mb-4 border-b border-emerald-900/10 pb-2">
                02 // Sinh mã
              </h3>

              {daCoTem && trang === 'cho' && (
                <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-3 text-xs mb-4 leading-relaxed">
                  <AlertTriangle size={14} className="inline mr-1 -mt-0.5" />
                  Lô này đã có <strong>{lo.so_tem}</strong> tem. Sinh thêm sẽ tạo dải serial mới, không ghi đè dải cũ.
                </div>
              )}

              <label className="block text-xs font-bold text-[#4F6357] uppercase tracking-wider mb-2 ml-1">
                Số tem cần sinh (1–{TOI_DA_MOT_LAN})
              </label>
              <input
                type="number" min="1" max={TOI_DA_MOT_LAN} value={soLuong}
                onChange={(e) => setSoLuong(e.target.value)}
                disabled={trang === 'dang'}
                className="w-full sm:w-48 px-4 py-3 bg-slate-50 border border-emerald-900/15 rounded-xl text-sm font-mono font-bold focus:border-[#135E3E] outline-none mb-4"
              />

              {loi && (
                <div role="alert" className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-3 text-sm mb-4 leading-relaxed">
                  {loi}
                </div>
              )}

              {trang === 'cho' && (
                <button
                  onClick={batDau}
                  disabled={!nHopLe || !lo || thieuCoa || thieuAnh || daThuHoi}
                  className="w-full bg-gradient-to-r from-[#8C6928] to-[#6E501C] text-white font-bold py-5 px-6 rounded-2xl shadow-lg text-sm uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <KeyRound size={20} /> {nHopLe ? `Sinh ${n.toLocaleString('vi-VN')} tem và tải CSV` : 'Nhập số tem hợp lệ'}
                </button>
              )}

              {trang === 'dang' && (
                <div className="space-y-3">
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full w-1/3 bg-gradient-to-r from-[#135E3E] to-[#25A56A] animate-pulse" />
                  </div>
                  <p className="text-sm font-semibold text-[#135E3E]">
                    Đang sinh mã… {giay} giây. Mỗi tem tốn khoảng 15 ms để băm.
                  </p>
                  <p className="text-xs text-rose-700 font-bold">
                    Không đóng tab và không tải lại trang cho đến khi tệp CSV tự tải xuống.
                  </p>
                </div>
              )}
            </div>
          )}

          {trang === 'xong' && ketQua && (
            <div>
              <h3 className="text-[11px] font-bold uppercase text-[#4F6357] tracking-wider mb-4 border-b border-emerald-900/10 pb-2">
                02 // Đã sinh xong
              </h3>
              <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-5">
                <CheckCircle2 size={22} className="text-[#135E3E] shrink-0 mt-0.5" />
                <div className="text-sm leading-relaxed">
                  <p className="font-bold text-[#0A1A12]">
                    Đã sinh {ketQua.soLuong.toLocaleString('vi-VN')} tem, lô đã chuyển sang trạng thái phát hành.
                  </p>
                  <p className="font-mono text-xs text-[#135E3E] mt-1 break-all">{ketQua.tu} → {ketQua.den}</p>
                  <p className="text-xs text-[#4F6357] mt-2">
                    Tệp <span className="font-mono">{ketQua.tenTep}</span> đã được tải xuống. Mở thư mục Tải xuống
                    để chắc chắn tệp có ở đó TRƯỚC khi bấm "Đã lưu xong".
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <button onClick={taiLai} className="bg-white border border-[#135E3E] text-[#135E3E] font-semibold py-3.5 px-5 rounded-xl w-full flex items-center justify-between hover:bg-emerald-50">
                  <span className="text-[13px]">Tệp không xuống? Tải lại</span>
                  <Download size={18} />
                </button>
                {onThietKeTem && (
                  <button onClick={onThietKeTem} className="bg-[#135E3E] text-white font-semibold py-3.5 px-5 rounded-xl w-full flex items-center justify-between hover:bg-[#0A3D27]">
                    <span className="text-[13px]">Thiết kế tem và xuất trang in từ tệp này</span>
                    <ChevronRight size={18} />
                  </button>
                )}
                <p className="text-xs text-[#4F6357] leading-relaxed">
                  Tệp chứa mã bí mật thật. Sau khi in và dán lớp cào xong, hãy xóa tệp khỏi máy.
                </p>
              </div>
            </div>
          )}
        </div>

        {trang === 'xong' && (
          <div className="flex justify-end mt-6">
            <button onClick={daLuuXong} className="bg-white border border-emerald-900/10 hover:bg-emerald-50 hover:text-[#135E3E] rounded-xl py-4 px-6 text-sm font-bold uppercase tracking-wide flex items-center gap-2 shadow-sm">
              Đã lưu xong, về danh sách lô <ChevronRight size={18} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
