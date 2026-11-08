import React, { useCallback, useEffect, useRef, useState } from 'react';
import { X, Leaf, Droplets, FlaskConical, Package, ImageIcon, BookOpen, ShieldCheck, ChevronRight, RotateCcw, Pause } from 'lucide-react';
import { ngayVietNam } from '../services/ma';

/**
 * Hành trình của lô, kể theo dạng story (như Facebook/Instagram):
 * mở đầu → 4 chặng (mỗi chặng 2 khung: số liệu của lô, rồi kiến thức chung) → kết.
 *
 * Chạm nửa phải: khung kế. Chạm nửa trái: khung trước. Giữ tay: tạm dừng.
 * Tự chuyển khung sau vài giây; người bật "giảm chuyển động" thì không tự chuyển,
 * tranh đứng yên, chỉ chạm để đi tiếp.
 *
 * Một component cho cả ba nơi: người mua quét tem (/story), cơ sở xem trước trong
 * khu quản trị và ở bước xác nhận của form tạo lô. Cả ba cùng đọc một đối tượng `lo`.
 *
 * Chỉ kể những gì cơ sở đã khai. Trường nào trống thì ghi "Cơ sở chưa cung cấp",
 * không điền thay. Khung "Bạn có biết" là kiến thức chung, có nhãn riêng, và không
 * nói gì về công dụng sức khỏe.
 *
 * `lo.hanh_trinh` có thể mang sẵn ten_tinh/ten_xa (từ máy chủ) hoặc chỉ mang mã
 * (bản nháp trong khu quản trị); trường hợp sau tự tra tên từ danh sách hành chính.
 */

const CHUA_CO = 'Cơ sở chưa cung cấp';

function dinhDangNgay(s) {
  if (!s) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s));
  return m ? `${m[3]}/${m[2]}/${m[1]}` : ngayVietNam(s);
}

function diaDiem(c, dl) {
  if (!c || !c.ma_tinh) return null;
  let tinh = c.ten_tinh || null;
  let xa = c.ten_xa || null;
  if (dl) {
    if (!tinh) tinh = (dl.t.find(([ma]) => ma === c.ma_tinh) || [])[1] || null;
    if (!xa && c.ma_xa) xa = ((dl.x[c.ma_tinh] || []).find(([ma]) => ma === c.ma_xa) || [])[1] || null;
  }
  const kq = [xa, tinh].filter(Boolean).join(', ');
  return kq || null;
}

function useGiamChuyenDong() {
  const [giam, setGiam] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );
  useEffect(() => {
    if (!window.matchMedia) return undefined;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const cb = () => setGiam(mq.matches);
    mq.addEventListener?.('change', cb);
    return () => mq.removeEventListener?.('change', cb);
  }, []);
  return giam;
}

/* ------------------------------------------------------------------ */
/* Tranh minh họa động cho từng chặng: SVG + CSS, không thư viện, không ảnh.
   Chỉ chạy khi thẻ đã hiện (class tt-run); bật "giảm chuyển động" thì đứng yên. */

const CSS_CANH = `
.tt-canh *{transform-box:fill-box}
.tt-canh .a{animation-play-state:running}
.tt-hold .a,.tt-hold .tt-kb{animation-play-state:paused!important}
@keyframes tt-sway{0%,100%{transform:rotate(-2.2deg)}50%{transform:rotate(2.2deg)}}
@keyframes tt-fall{0%{transform:translate(0,-6px) rotate(0);opacity:0}15%{opacity:1}100%{transform:translate(-26px,92px) rotate(260deg);opacity:0}}
@keyframes tt-sun{0%,100%{transform:scale(1);opacity:.95}50%{transform:scale(1.1);opacity:1}}
@keyframes tt-rip{0%{transform:scaleX(.5);opacity:.7}100%{transform:scaleX(1.25);opacity:0}}
@keyframes tt-flame{0%,100%{transform:scale(1,1)}50%{transform:scale(.88,1.18)}}
@keyframes tt-steam{0%{transform:translateY(0) scale(.6);opacity:0}25%{opacity:.8}100%{transform:translateY(-34px) scale(1.5);opacity:0}}
@keyframes tt-drop{0%{transform:translateY(0);opacity:0}15%{opacity:1}85%{opacity:1}100%{transform:translateY(26px);opacity:0}}
@keyframes tt-fill{0%{transform:scaleY(.08)}100%{transform:scaleY(1)}}
@keyframes tt-bub{0%{transform:translateY(0) scale(.6);opacity:0}20%{opacity:.9}100%{transform:translateY(-34px) scale(1);opacity:0}}
@keyframes tt-wave{0%,100%{transform:translateX(-4px)}50%{transform:translateX(4px)}}
@keyframes tt-draw{0%{stroke-dashoffset:420}60%,100%{stroke-dashoffset:0}}
@keyframes tt-peak{0%,55%{opacity:0;transform:scale(.4)}70%,100%{opacity:1;transform:scale(1)}}
@keyframes tt-belt{0%{transform:translateX(0)}100%{transform:translateX(-24px)}}
@keyframes tt-cap{0%,10%{transform:translateY(-34px);opacity:0}30%{opacity:1}45%,100%{transform:translateY(0);opacity:1}}
@keyframes tt-tem{0%,48%{transform:scale(0);opacity:0}62%{transform:scale(1.18);opacity:1}72%,100%{transform:scale(1);opacity:1}}
@keyframes tt-shine{0%,70%{transform:translateX(-30px);opacity:0}78%{opacity:.9}100%{transform:translateX(30px);opacity:0}}
@keyframes tt-kb{0%{object-position:50% 50%;transform:scale(1.03)}100%{object-position:76% 50%;transform:scale(1.08)}}
@media (prefers-reduced-motion: reduce){.tt-canh .a{animation:none!important}.tt-kb{animation:none!important}}
`;

const an = (ten, giay, extra = '') => ({ animation: `${ten} ${giay}s ${extra || 'ease-in-out infinite'}` });

function Khung({ nhan, cielo, dat, children }) {
  return (
    <svg viewBox="0 0 320 620" preserveAspectRatio="xMidYMid slice" className="w-full h-full block" role="img" aria-label={nhan}>
      <rect width="320" height="620" fill={cielo} />
      <g transform="translate(0 115) scale(1)">{children}</g>
      <rect y="264" width="320" height="358" fill={dat} />
    </svg>
  );
}

function CanhNguyenLieu({ chay }) {
  const cay = (x, h, d) => (
    <g key={x} className="a" style={{ ...an('tt-sway', 4 + d, 'ease-in-out infinite'), transformOrigin: '50% 100%' }}>
      <rect x={x - 2.5} y={112 - h} width="5" height={h} rx="2.5" fill="#E9E2D0" />
      <rect x={x - 2.5} y={112 - h} width="5" height={h} rx="2.5" fill="url(#vanTram)" opacity=".5" />
      <ellipse cx={x} cy={112 - h - 8} rx="17" ry="15" fill="#2F7D52" />
      <ellipse cx={x - 9} cy={112 - h - 2} rx="10" ry="9" fill="#3E9566" />
      <ellipse cx={x + 10} cy={112 - h - 4} rx="9" ry="8" fill="#256B45" />
    </g>
  );
  return (
    <Khung nhan="Rừng tràm bên mặt nước, lá tràm rơi nhẹ" cielo="#FCEBC8" dat="#69A898">
      <defs>
        <linearGradient id="troi1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FCEBC8" /><stop offset="1" stopColor="#E7F1E6" /></linearGradient>
        <linearGradient id="vanTram" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#B8A57A" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient>
      </defs>
      <rect width="320" height="112" fill="url(#troi1)" />
      <g className="a" style={{ ...an('tt-sun', 4), transformOrigin: '50% 50%' }}>
        <circle cx="262" cy="32" r="22" fill="#F7D488" opacity=".45" />
        <circle cx="262" cy="32" r="14" fill="#F2B84B" />
      </g>
      <path d="M0 100 Q60 88 120 98 T240 96 T320 98 V112 H0Z" fill="#CFE3CF" />
      {cay(60, 58, 0)}{cay(120, 76, 1.2)}{cay(188, 64, 0.6)}
      <rect y="112" width="320" height="38" fill="#7FB6A4" />
      <rect y="112" width="320" height="38" fill="#3F8F82" opacity=".35" />
      {[70, 150, 235].map((x, i) => (
        <ellipse key={x} cx={x} cy={124 + (i % 2) * 8} rx="24" ry="2.5" fill="none" stroke="#fff" strokeWidth="1.2" className="a" style={{ ...an('tt-rip', 3 + i * 0.6, 'ease-out infinite'), animationDelay: `${i * 0.8}s` }} />
      ))}
      {[[95, 40, 0], [150, 30, 1.6], [205, 44, 3.1], [130, 52, 4.4]].map(([x, y, d], i) => (
        <ellipse key={i} cx={x} cy={y} rx="5" ry="2" fill="#4FA470" className="a" style={{ ...an('tt-fall', 6, 'linear infinite'), animationDelay: `${d}s` }} />
      ))}
    </Khung>
  );
}

function CanhChungCat({ chay }) {
  return (
    <Khung nhan="Nồi chưng cất hơi nước, ống ngưng và giọt tinh dầu nhỏ vào bình" cielo="#F3EEE3" dat="#D9CFBA">
      <rect y="124" width="320" height="26" fill="#D9CFBA" />
      {/* bếp lửa */}
      <rect x="40" y="108" width="62" height="16" rx="3" fill="#6B5B45" />
      {[56, 71, 86].map((x, i) => (
        <g key={x} transform={`translate(${x} 96)`}>
          <path d="M0 14 C-5 8 -2 3 0 0 C2 4 6 8 0 14Z" fill={i === 1 ? '#F2B84B' : '#E4793A'} className="a" style={{ ...an('tt-flame', 0.7 + i * 0.15), transformOrigin: '50% 100%', animationDelay: `${i * 0.2}s` }} />
        </g>
      ))}
      {/* nồi */}
      <path d="M38 62 H104 L98 104 H44Z" fill="#9AA8A0" />
      <path d="M38 62 H104 L102 74 H40Z" fill="#B6C3BB" />
      <path d="M44 56 Q71 36 98 56Z" fill="#7F8F86" />
      <rect x="68" y="34" width="6" height="8" rx="2" fill="#6B7A72" />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={64 + i * 8} cy="34" r="5" fill="#fff" className="a" style={{ ...an('tt-steam', 2.6, 'ease-out infinite'), animationDelay: `${i * 0.85}s`, transformOrigin: '50% 100%' }} />
      ))}
      {/* ống dẫn và ống ngưng */}
      <path d="M98 50 Q125 38 146 46" fill="none" stroke="#8D9B93" strokeWidth="6" strokeLinecap="round" />
      <line x1="146" y1="46" x2="214" y2="84" stroke="#7DB3C6" strokeWidth="21" strokeLinecap="round" />
      <line x1="146" y1="46" x2="214" y2="84" stroke="#C9E4EE" strokeWidth="16" strokeLinecap="round" />
      <line x1="150" y1="48" x2="210" y2="82" stroke="#5E9CB4" strokeWidth="2" strokeDasharray="3 5" strokeLinecap="round" />
      {/* giọt nhỏ xuống bình */}
      {[0, 1, 2].map((i) => (
        <g key={i} transform="translate(222 92)">
          <path d="M0 0 C-4 6 -4 10 0 10 C4 10 4 6 0 0Z" fill="#D9A441" className="a" style={{ ...an('tt-drop', 1.8, 'ease-in infinite'), animationDelay: `${i * 0.6}s` }} />
        </g>
      ))}
      {/* bình hứng */}
      <path d="M205 106 H239 L243 140 Q243 146 237 146 H207 Q201 146 201 140Z" fill="#fff" opacity=".7" stroke="#9FB5AA" strokeWidth="2" />
      <g clipPath="url(#binh2)">
        <rect x="200" y="106" width="44" height="40" fill="#D9A441" className="a" style={{ ...an('tt-fill', 9, 'linear infinite'), transformOrigin: '50% 100%' }} />
      </g>
      <clipPath id="binh2"><path d="M207 108 H237 L241 140 Q241 144 237 144 H207 Q203 144 203 140Z" /></clipPath>
    </Khung>
  );
}

function CanhKiemNghiem({ chay }) {
  return (
    <Khung nhan="Bình thí nghiệm sủi bọt và đồ thị sắc ký vẽ dần, đỉnh 1,8-cineole sáng lên" cielo="#EAF0F4" dat="#CBD6DE">
      <rect y="126" width="320" height="24" fill="#CBD6DE" />
      {/* bình tam giác */}
      <path d="M62 52 H92 V74 L116 120 Q120 128 110 128 H44 Q34 128 38 120 L62 74Z" fill="#fff" opacity=".75" stroke="#8FA5B3" strokeWidth="2.4" strokeLinejoin="round" />
      <clipPath id="binh3"><path d="M64 54 H90 V76 L113 119 Q116 124 109 124 H45 Q38 124 41 119 L64 76Z" /></clipPath>
      <g clipPath="url(#binh3)">
        <rect x="30" y="92" width="96" height="36" fill="#D9A441" />
        <path d="M30 92 q12 -6 24 0 t24 0 t24 0 t24 0 V84 H30Z" fill="#D9A441" className="a" style={{ ...an('tt-wave', 2.4) }} />
      </g>
      <rect x="58" y="46" width="38" height="8" rx="3" fill="#8FA5B3" />
      {[0, 1, 2, 3].map((i) => (
        <circle key={i} cx={56 + i * 10} cy="112" r={2.4 + (i % 2)} fill="#fff" opacity=".9" className="a" style={{ ...an('tt-bub', 2.2 + i * 0.3, 'ease-in infinite'), animationDelay: `${i * 0.55}s` }} />
      ))}
      {/* màn hình đồ thị */}
      <rect x="150" y="22" width="150" height="100" rx="8" fill="#10261C" />
      <g stroke="#2B4A3B" strokeWidth="1">
        {[44, 66, 88, 110].map((y) => <line key={y} x1="160" x2="290" y1={y} y2={y} />)}
      </g>
      <path d="M160 108 H182 Q190 108 194 100 T204 106 H220 Q228 106 232 40 Q236 106 244 106 H262 Q268 100 272 106 H290" fill="none" stroke="#6EE3A0" strokeWidth="2.4" strokeLinejoin="round" strokeDasharray="420" className="a" style={{ ...an('tt-draw', 5, 'ease-out infinite') }} />
      <g className="a" style={{ ...an('tt-peak', 5, 'ease-out infinite'), transformOrigin: '50% 100%' }}>
        <circle cx="232" cy="40" r="5" fill="#F2B84B" />
        <rect x="240" y="26" width="56" height="16" rx="5" fill="#F2B84B" />
        <text x="268" y="37.5" textAnchor="middle" fontSize="8" fontWeight="700" fill="#10261C" fontFamily="ui-monospace,monospace">1,8-cineole</text>
      </g>
    </Khung>
  );
}

function CanhDongChai({ chay }) {
  return (
    <Khung nhan="Chai tinh dầu chạy trên băng chuyền, được đậy nắp rồi dán tem hai lớp" cielo="#EFF3EC" dat="#D5DDD3">
      <rect y="112" width="320" height="38" fill="#D5DDD3" />
      <rect y="108" width="320" height="10" fill="#8C9A92" />
      <g className="a" style={{ ...an('tt-belt', 1.2, 'linear infinite') }}>
        {Array.from({ length: 16 }, (_, i) => <rect key={i} x={i * 24 - 4} y="118" width="12" height="4" rx="2" fill="#6F7E76" />)}
      </g>
      {/* chai nền (mờ) hai bên */}
      {[40, 270].map((x) => (
        <g key={x} opacity=".55">
          <rect x={x - 17} y="58" width="34" height="50" rx="8" fill="#7A4B25" />
          <rect x={x - 6} y="46" width="12" height="14" rx="2" fill="#7A4B25" />
          <rect x={x - 8} y="40" width="16" height="8" rx="2" fill="#2B2B2B" />
        </g>
      ))}
      {/* chai chính */}
      <g>
        <rect x="136" y="48" width="48" height="60" rx="11" fill="#8A5429" />
        <rect x="142" y="52" width="6" height="50" rx="3" fill="#fff" opacity=".18" />
        <rect x="150" y="36" width="20" height="14" rx="3" fill="#8A5429" />
        <g className="a" style={{ ...an('tt-cap', 6, 'ease-out infinite') }}>
          <rect x="147" y="24" width="26" height="14" rx="3" fill="#252525" />
          <rect x="147" y="24" width="26" height="4" rx="2" fill="#4A4A4A" />
        </g>
        {/* nhãn chai */}
        <rect x="141" y="64" width="38" height="30" rx="4" fill="#F7F2E4" />
        <rect x="146" y="69" width="28" height="3" rx="1.5" fill="#135E3E" />
        <rect x="146" y="75" width="20" height="2" rx="1" fill="#B8913A" />
        {/* tem QR */}
        <g className="a" style={{ ...an('tt-tem', 6, 'ease-out infinite'), transformOrigin: '50% 50%' }}>
          <rect x="151" y="80" width="18" height="18" rx="3" fill="#fff" stroke="#B8913A" strokeWidth="1.2" />
          {[[153, 82], [161, 82], [153, 90], [157, 86], [161, 90], [165, 86]].map(([x, y], i) => <rect key={i} x={x} y={y} width="4" height="4" fill="#0B3D27" />)}
          <rect x="164" y="93" width="3" height="3" fill="#B8913A" />
        </g>
        <g className="a" style={{ ...an('tt-shine', 6, 'ease-in-out infinite') }}>
          <rect x="146" y="76" width="8" height="26" fill="#fff" opacity=".7" transform="skewX(-18)" />
        </g>
      </g>
    </Khung>
  );
}


/* ------------------------------------------------------------------ */
/* Story */

/**
 * Ảnh thật làm nền cho một chặng, đặt ở public/story/chang-N.jpg (N = 1..4).
 * Có ảnh thì phủ lên tranh vẽ và chạy hiệu ứng lia máy chậm; chưa có ảnh (hoặc lỗi tải)
 * thì vẫn thấy tranh vẽ bên dưới. Ảnh chỉ là minh họa, luôn kèm nhãn nói rõ điều đó.
 */
// Chiều cao ảnh theo loại khung: khung số liệu có thẻ thấp hơn nên ảnh gọn lại để lộ trọn chủ thể.
const CAO_ANH = { 1: ['56%', '68%'], 2: ['67%', '70%'], 3: ['56%', '68%'] };

function NenAnh({ chang, Canh, kt }) {
  const [ok, setOk] = useState(false);
  const [loi, setLoi] = useState(false);
  return (
    <div className="tt-canh absolute inset-0 bg-[#0B1410]">
      <div className="absolute inset-0"><Canh /></div>
      {!loi && (
        <img
          src={`/story/chang-${chang + 1}.jpg`}
          alt=""
          onLoad={(e) => { if (e.currentTarget.naturalWidth > 0) setOk(true); else setLoi(true); }}
          onError={() => setLoi(true)}
          className="tt-kb absolute inset-x-0 top-0 w-full object-cover "
          style={{ height: CAO_ANH[chang] ? CAO_ANH[chang][kt ? 1 : 0] : '100%', transition: 'opacity .7s, height .5s ease', opacity: ok ? 1 : 0, animation: 'tt-kb 22s ease-in-out infinite alternate', animationPlayState: 'inherit' }}
        />
      )}
      {ok && (
        <span style={{ top: 96 }} className="absolute left-3 z-10 bg-black/45 text-white/90 text-[10px] font-semibold rounded-full px-2.5 py-1 backdrop-blur">
          Ảnh minh họa, không phải ảnh của lô này
        </span>
      )}
    </div>
  );
}

const CANH = [CanhNguyenLieu, CanhChungCat, CanhKiemNghiem, CanhDongChai];
const BIEU_TUONG = [Leaf, Droplets, FlaskConical, Package];
const TIEU_DE = ['Nguyên liệu', 'Chưng cất', 'Kiểm nghiệm', 'Đóng chai và niêm phong'];
const MS_SO = 7500;
const MS_KT = 8500;
const MS_MO = 5500;
const MS_TT = 10000;
const MS_NGAN = 9000;

const KIEN_THUC = [
  {
    tieuDe: 'Điều gì làm nên sự đặc biệt của cây tràm năm gân?',
    noi: 'Tràm năm gân (Melaleuca quinquenervia) nổi bật với lớp vỏ xốp nhiều tầng và lá có chứa tinh dầu thơm tự nhiên. Điểm đặc biệt của loài cây này là khả năng thích nghi với môi trường đất ẩm, ngập nước và thành phần tinh dầu đa dạng. Chính những đặc điểm đó khiến tràm năm gân trở thành nguồn nguyên liệu có giá trị trong sản xuất tinh dầu.',
  },
  {
    tieuDe: 'Chưng cất hơi nước',
    noi: 'Lá tràm được đặt trong nồi, hơi nước nóng đi qua kéo theo tinh dầu, rồi hơi được làm lạnh thành nước và dầu tách lớp. Nhiệt độ, thời gian và việc giữ nồi sạch giữa các mẻ đều tác động đến mùi và thành phần, vì vậy mẻ và số giờ được ghi lại.',
  },
  {
    tieuDe: 'Vì sao tinh dầu cần được kiểm nghiệm?',
    noi: 'Sau quá trình chưng cất, tinh dầu được lấy mẫu để phân tích thành phần hóa học và đánh giá các chỉ tiêu chất lượng. Kết quả kiểm nghiệm giúp xác định hàm lượng các hợp chất đặc trưng như 1,8-cineole, đồng thời cung cấp cơ sở để đối chiếu với tiêu chuẩn chất lượng áp dụng. Nhờ đó, chất lượng của từng lô tinh dầu được ghi nhận và minh bạch hơn với người tiêu dùng.',
  },
  {
    tieuDe: 'Vì sao tem có hai lớp',
    noi: 'Mã QR in sẵn nên ai cũng quét được, kể cả khi chưa mua, và quét không làm thay đổi gì. Lớp cào chỉ lộ ra khi bạn cào, mã bên dưới chỉ dùng một lần nên người cào sau sẽ nhận được cảnh báo.',
  },
];

function BeTram({ className = '' }) {
  return (
    <img
      src="/assets/botanical/be-tram.png"
      alt="Bé Tràm, linh vật của TramTrack"
      draggable="false"
      className={`select-none pointer-events-none ${className}`}
    />
  );
}

function Dong({ nhan, giaTri, mono = false }) {
  return (
    <div className="py-2 border-b border-emerald-900/10 last:border-0">
      <dt className="text-[10px] font-bold uppercase tracking-wider text-[#4F6357]">{nhan}</dt>
      <dd className={`mt-0.5 text-[15px] break-words ${mono ? 'font-mono' : ''} ${giaTri ? 'font-semibold text-[#0A1A12]' : 'italic text-[#4F6357]/70 text-[14px]'}`}>
        {giaTri || CHUA_CO}
      </dd>
    </div>
  );
}

export default function HanhTrinhLo({ lo, onClose, xemTruoc = false, onBaoCao, onKichHoat }) {
  const giam = useGiamChuyenDong();
  const [dl, setDl] = useState(null);
  const [phongTo, setPhongTo] = useState(false);
  const [idx, setIdx] = useState(0);
  const [tien, setTien] = useState(0);
  const [giu, setGiu] = useState(false);
  const [dayDu, setDayDu] = useState(false);
  const [moKT, setMoKT] = useState(false);

  const ht = (lo && lo.hanh_trinh) || {};
  const nl = ht.nguyen_lieu || {};
  const cc = ht.chung_cat || {};
  const dc = ht.dong_chai || {};

  const canTen = [nl, cc, dc].some((c) => c.ma_tinh && !c.ten_tinh);
  useEffect(() => {
    if (!canTen || dl) return undefined;
    let huy = false;
    import('../data/dvhc.json').then((m) => { if (!huy) setDl(m.default || m); }).catch(() => {});
    return () => { huy = true; };
  }, [canTen, dl]);

  const cineole = lo && lo.ham_luong_cineole !== null && lo.ham_luong_cineole !== undefined && lo.ham_luong_cineole !== ''
    ? Number(lo.ham_luong_cineole) : null;
  const coCineole = cineole !== null && Number.isFinite(cineole);
  const nhoTien = (n, don) => (n === undefined || n === null ? null : `${Number(n).toLocaleString('vi-VN')} ${don}`);

  // Danh sách khung: mở đầu, (số liệu + kiến thức) × 4, kết.
  // Bản ngắn: tóm tắt, 4 chặng (kiến thức bấm để mở), kết. Bản đầy đủ: như cũ.
  const khung = [];
  if (dayDu) {
    khung.push({ loai: 'mo', ms: MS_MO });
    for (let i = 0; i < 4; i += 1) {
      khung.push({ loai: 'so', chang: i, ms: MS_SO });
      khung.push({ loai: 'kt', chang: i, ms: MS_KT });
    }
  } else {
    khung.push({ loai: 'tt', ms: MS_TT });
    for (let i = 0; i < 4; i += 1) khung.push({ loai: 'so', chang: i, ms: MS_NGAN });
  }
  khung.push({ loai: 'ket', ms: Infinity });
  const tong = khung.length;
  const k = khung[idx];

  const di = useCallback((d) => {
    setIdx((cu) => Math.max(0, Math.min(tong - 1, cu + d)));
  }, [tong]);

  // Đếm giờ. Dùng ref để vòng lặp không bị kẹt giá trị cũ.
  const tam = useRef({ idx: 0, giu: false, xong: 0 });
  tam.current.idx = idx;
  tam.current.giu = giu || phongTo || moKT;
  useEffect(() => { tam.current.xong = 0; setTien(0); setMoKT(false); }, [idx, dayDu]);
  useEffect(() => {
    if (giam) return undefined;
    let raf = 0;
    let truoc = performance.now();
    const chay = (bay) => {
      const dt = Math.min(100, bay - truoc);
      truoc = bay;
      const kh = khung[tam.current.idx];
      if (!tam.current.giu && !document.hidden && Number.isFinite(kh.ms)) {
        tam.current.xong += dt;
        const t = tam.current.xong / kh.ms;
        if (t >= 1) { tam.current.xong = 0; setTien(0); setIdx((cu) => Math.min(tong - 1, cu + 1)); }
        else setTien(t);
      }
      raf = requestAnimationFrame(chay);
    };
    raf = requestAnimationFrame(chay);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [giam, tong]);

  // Bàn phím
  useEffect(() => {
    const f = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); di(1); }
      else if (e.key === 'ArrowLeft') di(-1);
      else if (e.key === 'Escape' && onClose) onClose();
    };
    window.addEventListener('keydown', f);
    return () => window.removeEventListener('keydown', f);
  }, [di, onClose]);

  // Chạm: nhanh = chuyển khung, giữ = dừng
  const bam = useRef({ t: 0, x: 0, y: 0 });
  const xuongTay = (e) => {
    bam.current = { t: Date.now(), x: e.clientX, y: e.clientY };
    setGiu(true);
  };
  const lenTay = (e) => {
    setGiu(false);
    const b = { ...bam.current };
    if (!b.t) return;
    bam.current.t = 0;
    const nhanh = Date.now() - b.t < 280;
    const yen = Math.abs(e.clientX - b.x) < 12 && Math.abs(e.clientY - b.y) < 12;
    if (!nhanh || !yen) return;
    if (e.target.closest && e.target.closest('button, a, summary')) return;
    const r = e.currentTarget.getBoundingClientRect();
    if (e.clientX - r.left < r.width * 0.33) di(-1); else di(1);
  };
  const huyTay = () => { bam.current.t = 0; setGiu(false); };

  const batDauDayDu = () => { setDayDu(true); setIdx(0); };
  const boQua = () => setIdx(tong - 1);
  const stage = k.chang;
  const Canh = stage !== undefined ? CANH[stage] : null;
  const Icon = stage !== undefined ? BIEU_TUONG[stage] : null;

  const noiDungSo = () => {
    if (stage === 0) {
      return (
        <dl>
          <Dong nhan="Vùng trồng / thu hái" giaTri={diaDiem(nl, dl)} />
          <Dong nhan="Ngày thu hái" giaTri={dinhDangNgay(nl.ngay_thu_hai)} />
          <Dong nhan="Đơn vị cung ứng lá" giaTri={nl.don_vi_cung_ung} />
        </dl>
      );
    }
    if (stage === 1) {
      return (
        <dl>
          <Dong nhan="Cơ sở chưng cất" giaTri={cc.co_so} />
          <Dong nhan="Địa điểm chưng cất" giaTri={diaDiem(cc, dl)} />
          <Dong nhan="Ngày chưng cất" giaTri={dinhDangNgay(lo && lo.ngay_chung_cat)} />
          <Dong nhan="Mẻ / nồi" giaTri={cc.so_me} />
          <Dong nhan="Thời gian chưng cất" giaTri={nhoTien(cc.gio_chung_cat, 'giờ')} />
        </dl>
      );
    }
    if (stage === 2) {
      return (
        <>
          <div className="flex items-end gap-2 mb-1">
            <span className="font-mono text-4xl font-bold text-[#8C6928] leading-none">{coCineole ? cineole.toFixed(2) : '—'}</span>
            <span className="text-sm font-bold text-[#8C6928] mb-1">% 1,8-cineole</span>
          </div>
          <dl>
            <Dong nhan="Số phiếu kiểm nghiệm" giaTri={lo && lo.so_phieu_coa} mono />
            <Dong nhan="Đơn vị kiểm nghiệm" giaTri={lo && lo.don_vi_kiem_nghiem} />
          </dl>
          {lo && lo.anh_phieu_coa && (
            <button
              onClick={() => setPhongTo(true)}
              className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-[#135E3E] border border-[#135E3E]/30 rounded-lg px-3 py-2 hover:bg-emerald-50"
            >
              <ImageIcon size={15} /> Xem ảnh phiếu kiểm nghiệm
            </button>
          )}
          <p className="text-[12px] text-[#4F6357] leading-relaxed mt-2">
            Số liệu do cơ sở khai kèm ảnh phiếu. Hệ thống chưa đối chiếu trực tiếp với phòng kiểm nghiệm.
          </p>
        </>
      );
    }
    return (
      <dl>
        <Dong nhan="Nơi đóng chai" giaTri={dc.noi} />
        <Dong nhan="Địa điểm đóng chai" giaTri={diaDiem(dc, dl)} />
        <Dong nhan="Ngày đóng chai" giaTri={dinhDangNgay(dc.ngay_dong_chai)} />
        <Dong nhan="Quy cách" giaTri={nhoTien(dc.quy_cach_ml, 'ml / chai')} />
        <Dong nhan="Số chai của lô" giaTri={nhoTien(dc.so_chai, 'chai')} />
      </dl>
    );
  };

  return (
    <div className="fixed inset-0 z-[80] bg-[#050E09] flex items-center justify-center font-sans" role="dialog" aria-label="Hành trình của lô">
      <style>{CSS_CANH}</style>
      <div
        className={`relative w-full h-full sm:h-[min(100%,880px)] sm:max-w-[440px] sm:rounded-3xl overflow-hidden select-none text-[#0A1A12] ${giu ? 'tt-hold' : ''}`}
        onPointerDown={xuongTay}
        onPointerUp={lenTay}
        onPointerCancel={huyTay}
        onPointerLeave={huyTay}
        style={{ touchAction: 'pan-y' }}
      >
        {/* Nền */}
        {Canh ? (
          <div key={stage} className="tt-run absolute inset-0"><NenAnh chang={stage} Canh={Canh} kt={k.loai === 'kt'} /></div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B3D27] via-[#135E3E] to-[#0B3D27]" />
        )}
        {Canh && <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/30 to-transparent pointer-events-none" />}

        {/* Thanh tiến độ và đầu khung */}
        <div className="absolute top-0 inset-x-0 z-20 px-3 pt-3">
          <div className="flex gap-1" aria-hidden="true">
            {khung.map((_, i) => (
              <span key={i} className="flex-1 h-[3px] rounded-full bg-white/40 overflow-hidden">
                <span className="block h-full bg-white" style={{ width: `${i < idx ? 100 : i === idx ? (giam ? 100 : tien * 100) : 0}%` }} />
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-3">
            <span className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-[#135E3E] shadow">
              {Icon ? <Icon size={16} /> : <ShieldCheck size={16} />}
            </span>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="text-[12px] font-bold text-white drop-shadow truncate">
                {stage !== undefined ? `Chặng ${stage + 1} · ${TIEU_DE[stage]}` : 'TramTrack'}
              </p>
              <p className="text-[10px] text-white/80 drop-shadow font-mono truncate">Lô {(lo && lo.ma_lo) || '—'}</p>
            </div>
            {k.loai !== 'ket' && (
              <button
                onClick={boQua}
                onPointerDown={(e) => e.stopPropagation()}
                className="h-8 px-3 rounded-full bg-black/35 text-white text-[12px] font-semibold hover:bg-black/55"
              >
                Bỏ qua
              </button>
            )}
            {giu && <Pause size={16} className="text-white drop-shadow" aria-label="Đang tạm dừng" />}
            {onClose && (
              <button
                onClick={onClose}
                onPointerDown={(e) => e.stopPropagation()}
                className="w-9 h-9 rounded-full bg-black/35 text-white flex items-center justify-center hover:bg-black/55"
                aria-label="Đóng"
              >
                <X size={18} />
              </button>
            )}
          </div>
          {/demo/i.test(String((lo && lo.ma_lo) || '')) && (
            <p className="mt-2 inline-block bg-amber-100 text-amber-900 text-[11px] font-semibold rounded-full px-3 py-1">
              Lô trình diễn · dữ liệu minh họa
            </p>
          )}
          {xemTruoc && (
            <p className="mt-2 inline-block bg-amber-100 text-amber-900 text-[11px] font-semibold rounded-full px-3 py-1">
              Bản xem trước · người mua sẽ thấy đúng nội dung này
            </p>
          )}
        </div>

        {/* Nội dung từng khung */}
        {k.loai === 'mo' && (
          <div className="absolute inset-0 z-10 flex flex-col justify-end px-6 pb-14 text-white">
            <div className="flex items-end gap-3 mb-4">
              <BeTram className="w-20 drop-shadow-[0_6px_10px_rgba(0,0,0,0.35)]" />
              <p className="text-[13px] leading-snug text-white/90 bg-white/15 backdrop-blur-sm rounded-2xl rounded-bl-sm px-3 py-2 mb-2">
                Chào bạn, mình là bé Tràm. Mình dẫn bạn đi theo chai tinh dầu này nhé!
              </p>
            </div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#E7C873] mb-3">Hành trình của lô</p>
            <h1 className="font-['Be_Vietnam_Pro'] font-bold text-3xl leading-tight mb-2">{(lo && lo.ten_dong_sp) || 'Tinh dầu tràm'}</h1>
            <p className="font-mono text-sm font-bold text-[#BFE5CF] mb-5">Lô {(lo && lo.ma_lo) || '—'}</p>
            <p className="text-[16px] leading-relaxed text-white/90 mb-8">
              Từ lá tràm đến giọt tinh dầu trong chai bạn đang cầm đi qua bốn chặng. Mỗi chặng có số liệu của riêng lô này, do cơ sở khai, và một mẩu kiến thức để bạn hiểu chặng đó làm gì.
            </p>
            <p className="flex items-center gap-1 text-[13px] text-white/70">Chạm bên phải để xem tiếp <ChevronRight size={16} /></p>
          </div>
        )}

        {k.loai === 'tt' && (
          <div className="absolute inset-0 z-10 flex flex-col justify-end px-5 pb-10 text-white">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#E7C873] mb-2">Tóm tắt lô</p>
            <h1 className="font-['Be_Vietnam_Pro'] font-bold text-2xl leading-tight mb-1">{(lo && lo.ten_dong_sp) || 'Tinh dầu tràm'}</h1>
            <p className="font-mono text-sm font-bold text-[#BFE5CF] mb-4">Lô {(lo && lo.ma_lo) || '—'}</p>
            <div className="bg-white/95 text-[#0A1A12] rounded-2xl px-4 py-2 shadow-xl">
              <dl>
                <Dong nhan="Vùng trồng" giaTri={diaDiem(nl, dl)} />
                <Dong nhan="Ngày chưng cất" giaTri={dinhDangNgay(lo && lo.ngay_chung_cat)} />
                <Dong nhan="1,8-cineole" giaTri={coCineole ? `${cineole.toFixed(2)} %` : null} />
                <Dong nhan="Số phiếu kiểm nghiệm" giaTri={lo && lo.so_phieu_coa} mono />
                <Dong nhan="Ngày đóng chai" giaTri={dinhDangNgay(dc.ngay_dong_chai)} />
              </dl>
            </div>
            <p className="text-[11px] text-white/75 mt-3 leading-relaxed">Do cơ sở khai kèm phiếu, hệ thống chưa đối chiếu trực tiếp với phòng kiểm nghiệm.</p>
            <p className="flex items-center gap-1 text-[13px] text-white/80 mt-2">Chạm bên phải để xem từng chặng <ChevronRight size={16} /></p>
          </div>
        )}

        {(k.loai === 'so' || k.loai === 'kt') && (
          <div
            className="absolute z-10 bottom-0 inset-x-0 max-h-[58%] overflow-y-auto bg-white/95 backdrop-blur-md rounded-t-3xl shadow-[0_-12px_40px_-12px_rgba(0,0,0,0.4)] px-5 pt-5 pb-8"
            style={{ touchAction: 'pan-y' }}
          >
            {k.loai === 'so' ? (
              <>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#135E3E] to-[#0A3D27] text-white flex items-center justify-center shadow">
                    <Icon size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8C6928]">Chặng {stage + 1} / 4</p>
                    <h2 className="font-['Be_Vietnam_Pro'] font-bold text-xl leading-tight">{TIEU_DE[stage]}</h2>
                  </div>
                </div>
                {noiDungSo()}
                {!dayDu && (
                  <div className="mt-3 border-t border-emerald-900/10 pt-3">
                    <button
                      onClick={() => setMoKT((v) => !v)}
                      onPointerDown={(e) => e.stopPropagation()}
                      className="flex items-center gap-2 text-sm font-semibold text-[#135E3E]"
                      aria-expanded={moKT}
                    >
                      <BeTram className="w-8 shrink-0" /> Bạn có biết: {KIEN_THUC[stage].tieuDe}
                    </button>
                    {moKT && (
                      <>
                        <p className="text-[15px] leading-relaxed text-[#2F4136] mt-2">{KIEN_THUC[stage].noi}</p>
                        <p className="text-[11px] text-[#4F6357] mt-2">Kiến thức chung, không phải dữ liệu của lô và không nói về công dụng sức khỏe.</p>
                      </>
                    )}
                  </div>
                )}
              </>
            ) : (
              <>
                <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#8C6928] mb-2">
                  <BookOpen size={14} /> Bạn có biết · kiến thức chung
                </p>
                <div className="flex items-start gap-3">
                  <BeTram className="w-16 shrink-0 -mt-1" />
                  <div>
                    <h2 className="font-['Be_Vietnam_Pro'] font-bold text-xl leading-tight mb-3">{KIEN_THUC[stage].tieuDe}</h2>
                    <p className="text-[16px] leading-relaxed text-[#2F4136]">{KIEN_THUC[stage].noi}</p>
                  </div>
                </div>
                <p className="text-[11px] text-[#4F6357] mt-4">Đây không phải dữ liệu của lô, và không nói về công dụng sức khỏe.</p>
              </>
            )}
          </div>
        )}

        {k.loai === 'ket' && (
          <div className="absolute inset-0 z-10 flex flex-col justify-end px-6 pb-10 text-white overflow-y-auto" style={{ touchAction: 'pan-y' }}>
            <BeTram className="w-20 mb-2 drop-shadow-[0_6px_10px_rgba(0,0,0,0.35)]" />
            <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#E7C873] mb-3">
              <ShieldCheck size={15} /> Bạn có thể góp phần
            </p>
            <h2 className="font-['Be_Vietnam_Pro'] font-bold text-2xl leading-tight mb-3">Truy xuất chỉ hiệu quả khi mọi người cùng tham gia</h2>
            <p className="text-[15px] leading-relaxed text-white/85 mb-6">
              Nếu bạn đã mua chai này, hãy kích hoạt để lô có thêm một lần xác nhận. Nếu có điều gì khác thường, hãy báo cho cơ sở.
            </p>
            <div className="flex flex-col gap-2 mb-3">
              {onKichHoat && (
                <button onClick={onKichHoat} className="rounded-xl bg-white text-[#0B3D27] text-sm font-bold px-4 py-3.5 hover:bg-emerald-50">
                  Tôi đã mua, kích hoạt chai
                </button>
              )}
              {onBaoCao && (
                <button onClick={onBaoCao} className="rounded-xl border border-white/50 text-white text-sm font-semibold px-4 py-3.5 hover:bg-white/10">
                  Báo cáo điều khác thường
                </button>
              )}
              {!dayDu && (
                <button onClick={batDauDayDu} className="flex items-center justify-center gap-2 text-white text-sm font-semibold px-4 py-2 rounded-xl border border-white/30 hover:bg-white/10">
                  <BookOpen size={14} /> Xem đầy đủ hành trình
                </button>
              )}
              <button onClick={() => setIdx(0)} className="flex items-center justify-center gap-2 text-white/80 text-sm font-semibold px-4 py-2 hover:text-white">
                <RotateCcw size={14} /> Xem lại từ đầu
              </button>
            </div>
            <p className="text-[11px] text-white/65 leading-relaxed border-t border-white/20 pt-3">
              Các chặng do cơ sở sản xuất tự khai khi tạo lô. TramTrack lưu lại và ghi nhật ký thay đổi, nhưng không khẳng định từng chai là thật hay giả. Nếu thông tin khác với chai trong tay, hãy gửi báo cáo cho cơ sở.
            </p>
          </div>
        )}
      </div>

      {phongTo && lo && lo.anh_phieu_coa && (
        <div
          className="fixed inset-0 z-[95] bg-black/85 flex items-center justify-center p-4"
          onClick={() => setPhongTo(false)}
          role="dialog"
          aria-label="Ảnh phiếu kiểm nghiệm"
        >
          <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white flex items-center justify-center" aria-label="Đóng">
            <X size={18} />
          </button>
          <img src={lo.anh_phieu_coa} alt="Ảnh phiếu kiểm nghiệm" className="max-w-full max-h-full object-contain bg-white rounded-lg" />
        </div>
      )}
    </div>
  );
}
