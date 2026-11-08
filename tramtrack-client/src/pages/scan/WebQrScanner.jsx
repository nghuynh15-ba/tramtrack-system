import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { ArrowLeft, Zap, ZapOff, Keyboard, CameraOff, ScanLine, AlertCircle } from 'lucide-react';
import { serialTuChuoiQuet, chuanHoaSerial, serialDungDinhDang } from '../../services/ma';

/**
 * Máy quét mã QR công khai trên tem.
 *
 * Mã QR không chứa serial trần mà chứa cả đường dẫn
 *   https://<tên miền>/s/TDT-2026-000001
 * để người dùng chụp bằng camera mặc định của điện thoại là mở được ngay,
 * không phải cài ứng dụng nào. Nên ở đây phải tách serial ra khỏi đường dẫn
 * trước khi chuyển lên trên — trước đây chuỗi đọc được bị chuyển thẳng đi làm
 * serial, và một đường dẫn đầy đủ thì không bao giờ khớp định dạng serial.
 *
 * Ô nhập tay chỉ hỏi SERIAL. Mã bí mật dưới lớp cào thuộc Tầng 2 và được nhập
 * ở màn riêng, sau khi người dùng đã xem hồ sơ lô và quyết định mua.
 */
export default function WebQrScanner({ onScanSuccess, onClose }) {
  const [hasPermission, setHasPermission] = useState(null); // null = pending, true = granted, false = denied
  const [torchOn, setTorchOn] = useState(false);
  const [showManual, setShowManual] = useState(false);
  
  // success & animation states
  const [isSuccess, setIsSuccess] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  
  const html5QrCodeRef = useRef(null);
  const isProcessingRef = useRef(false);

  // manual entry state
  const [serial, setSerial] = useState('');
  const [loiNhap, setLoiNhap] = useState(null);

  useEffect(() => {
    let html5QrCode;
    const startScanner = async () => {
      try {
        html5QrCode = new Html5Qrcode("reader");
        html5QrCodeRef.current = html5QrCode;
        
        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            aspectRatio: window.innerHeight / window.innerWidth, // Full screen feed
          },
          (decodedText) => {
            if (isProcessingRef.current) return;
            isProcessingRef.current = true;
            
            if (html5QrCode.isScanning) {
              // 1. Success feedback (UI changes immediately)
              setIsSuccess(true);
              if ('vibrate' in navigator) navigator.vibrate(50);
              
              // 2. Start fade out after letting user see the green border
              setTimeout(() => {
                setIsFadingOut(true);
              }, 400);

              // 3. Stop scanner and notify parent after fade completes
              setTimeout(() => {
                html5QrCode.stop().then(() => {
                  // Tách serial khỏi đường dẫn. Không tách được thì vẫn chuyển
                  // lên nguyên chuỗi để màn kết quả hiện lại cho người dùng
                  // thấy mình vừa quét nhầm thứ gì.
                  onScanSuccess({
                    serial: serialTuChuoiQuet(decodedText),
                    chuoiTho: decodedText,
                  });
                }).catch(console.error);
              }, 700);
            }
          },
          () => {
            // Ignore frame scan failures
          }
        );
        setHasPermission(true);
      } catch (err) {
        console.error("Camera error:", err);
        setHasPermission(false);
        setShowManual(true);
      }
    };
    
    startScanner();

    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch(console.error);
      }
    };
  }, [onScanSuccess]);

  const toggleTorch = async () => {
    if (!html5QrCodeRef.current || !html5QrCodeRef.current.isScanning) return;
    try {
      const newTorchState = !torchOn;
      await html5QrCodeRef.current.applyVideoConstraints({
        advanced: [{ torch: newTorchState }]
      });
      setTorchOn(newTorchState);
    } catch (err) {
      console.warn("Torch not supported on this device/browser", err);
    }
  };

  const handleManualSubmit = () => {
    const tho = serial.trim();
    if (!tho) return;

    // Người dùng dán cả đường dẫn vào cũng nhận — hay gặp khi họ chụp mã QR
    // bằng camera mặc định rồi copy đường dẫn sang đây.
    const s = serialTuChuoiQuet(tho) || chuanHoaSerial(tho);

    if (!serialDungDinhDang(s)) {
      setLoiNhap('Serial có dạng TDT-2026-000000 — bốn chữ số năm, rồi sáu chữ số.');
      return;
    }
    setLoiNhap(null);
    onScanSuccess({ serial: s, chuoiTho: tho });
  };

  return (
    <div className={`fixed inset-0 bg-black text-[#0A1A12] flex flex-col justify-between z-50 overflow-hidden font-sans transition-opacity duration-300 ${isFadingOut ? 'opacity-0' : 'opacity-100'}`}>
      
      {/* 1. Fullscreen Video Stream */}
      <div id="reader" className="absolute inset-0 w-full h-full object-cover [&>video]:object-cover [&>video]:w-full [&>video]:h-full" />
      
      {/* SVG Mask Definition */}
      <svg width="0" height="0" className="absolute pointer-events-none">
        <defs>
          <mask id="cutout-mask">
            <rect width="100%" height="100%" fill="white" />
            <rect id="cutout-rect" x="50%" y="50%" rx="24" fill="black" />
          </mask>
        </defs>
        <style>{`
          #cutout-rect { width: 280px; height: 280px; transform: translate(-140px, -140px); }
          @media (min-width: 640px) {
            #cutout-rect { width: 320px; height: 320px; transform: translate(-160px, -160px); }
          }
        `}</style>
      </svg>

      {/* 2. Backdrop Blur Mask */}
      <div 
        className="absolute inset-0 pointer-events-none z-10 bg-[#0A1A12]/35 backdrop-blur-md" 
        style={{ mask: 'url(#cutout-mask)', WebkitMask: 'url(#cutout-mask)' }} 
      />
      
      {/* Vignette Overlay for Depth */}
      <div className="absolute inset-0 pointer-events-none z-10 shadow-[inset_0_0_120px_rgba(0,0,0,0.6)] mix-blend-multiply opacity-70" />

      {/* 3. Floating Header */}
      <div className="absolute top-0 inset-x-0 p-6 flex justify-between items-center z-30">
        <button 
          onClick={onClose} 
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-md border border-emerald-900/10 shadow-sm text-[#0A1A12] hover:scale-105 transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-emerald-900/10 shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#135E3E] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#135E3E]"></span>
          </span>
          <span className="font-mono text-[11px] font-bold tracking-wider text-[#0A1A12]">
            CAMERA // SẴN SÀNG
          </span>
        </div>

        <button 
          onClick={toggleTorch}
          className={`w-10 h-10 flex items-center justify-center rounded-full backdrop-blur-md border border-emerald-900/10 shadow-sm hover:scale-105 transition-all ${torchOn ? 'bg-[#8C6928] text-white' : 'bg-white/90 text-[#0A1A12]'}`}
        >
          {torchOn ? <Zap size={18} /> : <ZapOff size={18} />}
        </button>
      </div>

      {/* 4. HUD Reticle Stage */}
      <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center">
        {hasPermission === false ? (
          <div className="flex flex-col items-center justify-center text-center max-w-sm bg-white/95 p-8 rounded-3xl backdrop-blur-md shadow-xl pointer-events-auto mx-6">
            <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4 shadow-sm border border-red-100">
              <CameraOff size={32} />
            </div>
            <h3 className="text-lg font-bold text-[#0A1A12] mb-2">Camera bị từ chối</h3>
            <p className="text-sm text-[#4F6357] mb-6">Vui lòng cấp quyền truy cập máy ảnh hoặc nhập mã thủ công để tiếp tục.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-2.5 rounded-xl border border-emerald-900/20 text-[#0A1A12] font-semibold text-sm hover:bg-emerald-50 transition-colors"
            >
              Cấp lại quyền
            </button>
          </div>
        ) : (
          <div className={`relative w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] rounded-[24px] transition-all duration-300 ${isSuccess ? 'scale-[1.02] border-2 border-[#135E3E] ring-4 ring-[#135E3E]/20' : 'scale-100 border-2 border-transparent'}`}>
            
            {/* 4 Corner Brackets */}
            <div className={`absolute -top-[2px] -left-[2px] w-6 h-6 border-t-[3.5px] border-l-[3.5px] border-[#8C6928] rounded-tl-[24px] transition-opacity ${isSuccess ? 'opacity-0' : 'opacity-100'}`} />
            <div className={`absolute -top-[2px] -right-[2px] w-6 h-6 border-t-[3.5px] border-r-[3.5px] border-[#8C6928] rounded-tr-[24px] transition-opacity ${isSuccess ? 'opacity-0' : 'opacity-100'}`} />
            <div className={`absolute -bottom-[2px] -left-[2px] w-6 h-6 border-b-[3.5px] border-l-[3.5px] border-[#8C6928] rounded-bl-[24px] transition-opacity ${isSuccess ? 'opacity-0' : 'opacity-100'}`} />
            <div className={`absolute -bottom-[2px] -right-[2px] w-6 h-6 border-b-[3.5px] border-r-[3.5px] border-[#8C6928] rounded-br-[24px] transition-opacity ${isSuccess ? 'opacity-0' : 'opacity-100'}`} />

            {/* Center Crosshair */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center transition-opacity ${isSuccess ? 'opacity-0' : 'opacity-100'}`}>
              <div className="absolute w-[1px] h-full bg-[#135E3E]/40" />
              <div className="absolute w-full h-[1px] bg-[#135E3E]/40" />
            </div>

            {/* Measurement Ticks (Left) */}
            <div className={`absolute -left-12 top-1/2 -translate-y-1/2 h-[160px] flex flex-col justify-between items-end opacity-60 transition-opacity ${isSuccess ? 'opacity-0' : 'opacity-100'}`}>
              {[...Array(6)].map((_,i) => (
                <div key={`l-${i}`} className="flex items-center gap-1.5">
                  <span className="text-[9px] font-mono text-white tracking-widest">{100 - i*20}</span>
                  <div className="w-1.5 h-[1px] bg-white" />
                </div>
              ))}
            </div>

            {/* Measurement Ticks (Right) */}
            <div className={`absolute -right-12 top-1/2 -translate-y-1/2 h-[160px] flex flex-col justify-between items-start opacity-60 transition-opacity ${isSuccess ? 'opacity-0' : 'opacity-100'}`}>
              {[...Array(6)].map((_,i) => (
                <div key={`r-${i}`} className="flex items-center gap-1.5">
                  <div className="w-1.5 h-[1px] bg-white" />
                  <span className="text-[9px] font-mono text-white tracking-widest">{100 - i*20}</span>
                </div>
              ))}
            </div>

            {/* Dual-Spectral Laser */}
            {hasPermission === true && !isSuccess && (
              <div className="absolute inset-x-0 w-full h-full overflow-hidden rounded-[24px]">
                <div className="absolute inset-x-0 w-full" style={{ animation: 'scanBeam 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite' }}>
                  <div className="h-[2.5px] bg-gradient-to-r from-transparent via-[#135E3E] to-transparent shadow-[0_0_15px_#135E3E]" />
                </div>
                <div className="absolute inset-x-0 w-full" style={{ animation: 'scanBeam 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite 0.15s' }}>
                  <div className="h-[1px] mt-1 bg-gradient-to-r from-transparent via-[#DFBA73] to-transparent shadow-[0_0_8px_#DFBA73]" />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5. Floating Action Dock */}
      <div className={`absolute bottom-8 inset-x-0 px-6 flex flex-col items-center gap-4 z-30 transition-all duration-500 ${showManual ? 'translate-y-48 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'} ${isSuccess ? 'opacity-0' : ''}`}>
        <div className="bg-[#0A1A12]/80 text-white/90 backdrop-blur-md px-4 py-2 rounded-full text-xs font-sans flex items-center gap-2 shadow-lg">
          <ScanLine size={14} className="text-[#DFBA73]" />
          Quét mã QR trên tem — chưa cần cào lớp phủ
        </div>

        <button
          onClick={() => setShowManual(true)}
          className="w-full max-w-xs py-3.5 px-6 rounded-2xl bg-white/95 backdrop-blur-lg border border-emerald-900/15 shadow-[0_10px_30px_rgba(10,26,18,0.12)] text-[#0A1A12] font-medium text-sm flex items-center justify-center gap-2.5 hover:bg-white hover:border-[#8C6928] transition-all"
        >
          <Keyboard size={18} className="text-[#4F6357]" />
          Nhập serial thủ công
        </button>
      </div>

      {/* 6. Manual Fallback Bottom Sheet */}
      <div className={`absolute bottom-0 inset-x-0 bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(10,26,18,0.15)] z-40 transition-transform duration-300 ease-out ${showManual ? 'translate-y-0' : 'translate-y-full'} ${isSuccess ? 'opacity-0' : ''}`}>
        <div className="p-6 pb-8 flex flex-col items-center w-full max-w-md mx-auto pointer-events-auto">
          <div 
            className="w-12 h-1.5 bg-emerald-900/10 hover:bg-emerald-900/20 rounded-full mb-6 cursor-pointer transition-colors" 
            onClick={() => setShowManual(false)} 
          />
          <h3 className="text-lg font-bold text-[#0A1A12] mb-1.5 w-full text-center">Nhập serial thủ công</h3>
          <p className="text-[13px] text-[#4F6357] mb-6 w-full text-center leading-relaxed">
            Serial là dòng chữ in ngay dưới mã QR, bên ngoài lớp phủ bạc.
            <br />
            Chưa cần cào gì ở bước này.
          </p>

          <div className="w-full space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#4F6357] uppercase tracking-wider mb-1.5">
                Số serial công khai
              </label>
              <input
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                type="text"
                placeholder="TDT-2026-000000"
                value={serial}
                onChange={(e) => {
                  setSerial(e.target.value.toUpperCase());
                  setLoiNhap(null);
                }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleManualSubmit(); }}
                className={`w-full bg-[#F6F8F5] border rounded-xl px-4 py-3 font-mono text-[#0A1A12] placeholder-[#8F9E96] focus:ring-1 outline-none transition-all uppercase ${
                  loiNhap
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-400'
                    : 'border-emerald-900/10 focus:border-[#8C6928] focus:ring-[#8C6928]'
                }`}
              />
            </div>

            {loiNhap && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-start gap-2.5">
                <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                <p className="text-rose-900 text-[13px] leading-relaxed">{loiNhap}</p>
              </div>
            )}

            <button
              onClick={handleManualSubmit}
              className="w-full bg-[#8C6928] hover:bg-[#7A5A20] text-white py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider shadow-md mt-4 transition-colors"
            >
              Tra cứu hồ sơ lô
            </button>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes scanBeam {
          0% { top: -2%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 102%; opacity: 0; }
        }
        /* html5-qrcode overrides to make it fit nicely */
        #reader__dashboard_section_csr span {
          display: none !important;
        }
        #reader__dashboard_section_csr button {
          display: none !important;
        }
      `}</style>
    </div>
  );
}
