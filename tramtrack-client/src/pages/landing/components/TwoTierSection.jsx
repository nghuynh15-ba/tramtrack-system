import React from 'react';
import {
  ShieldCheck, Fingerprint, QrCode, Search,
  CheckCircle2, AlertTriangle, Layers, ArrowRight, Lock
} from 'lucide-react';

const TIER_DATA = [
  {
    tier: 1,
    title: 'Tầng 1 — Công khai',
    subtitle: 'Trước khi mua',
    icon: ShieldCheck,
    colorClass: 'text-[#135E3E]',
    bgClass: 'bg-[#135E3E]/5',
    borderClass: 'border-[#135E3E]/20',
    iconBgClass: 'bg-[#135E3E]/10',
    features: [
      { icon: QrCode, text: 'Quét mã QR ngoài tem bất kỳ lúc nào' },
      { icon: Search, text: 'Tra cứu thông tin lô hàng và COA chi tiết' },
      { icon: CheckCircle2, text: 'Không đổi trạng thái tem — hoàn toàn an toàn' },
      { icon: Layers, text: 'Cho phép quét nhiều lần, không giới hạn' },
    ],
  },
  {
    tier: 2,
    title: 'Tầng 2 — Bí mật',
    subtitle: 'Sau khi mua',
    icon: Lock,
    colorClass: 'text-[#9E7B3B]',
    bgClass: 'bg-[#9E7B3B]/5',
    borderClass: 'border-[#9E7B3B]/20',
    iconBgClass: 'bg-[#9E7B3B]/10',
    features: [
      { icon: Fingerprint, text: 'Cào lớp phủ bạc, lộ mã bí mật 12 ký tự' },
      { icon: ShieldCheck, text: 'Kích hoạt định danh duy nhất cấp đơn vị sản phẩm' },
      { icon: CheckCircle2, text: 'Xác minh nguyên bản — chỉ người sở hữu mới biết mã' },
      { icon: AlertTriangle, text: 'Cảnh báo đỏ ngay lập tức nếu mã đã bị dùng trước đó', danger: true },
    ],
  },
];

export default function TwoTierSection() {
  return (
    <section className="relative py-24 bg-[#FDFBF7] text-[#0A1A12] overflow-hidden" id="two-tier">
      {/* Background accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#9E7B3B]/5 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#135E3E]/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="container max-w-6xl mx-auto px-4 lg:px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full border border-[#9E7B3B]/20 bg-[#9E7B3B]/5 text-[#9E7B3B] text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] mb-6">
            Cơ chế xác thực
          </div>
          <h2 className="text-4xl sm:text-5xl font-serif font-bold text-[#0A1A12] leading-[1.2] mb-6">
            Bảo Mật <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#135E3E] to-[#9E7B3B] italic">Hai Tầng</span>
            <br />
            Không Thể Sao Chép
          </h2>
          <p className="text-gray-600 font-medium leading-relaxed">
            Mỗi con tem kết hợp lớp xác thực công khai cho người quan tâm và lớp bí mật chỉ người sở hữu sản phẩm thật mới có thể kích hoạt.
          </p>
        </div>

        {/* Cards Layout */}
        <div className="relative grid lg:grid-cols-2 gap-8 lg:gap-16 items-start">
          
          {TIER_DATA.map((tier, index) => (
            <div
              key={tier.tier}
              className={`relative bg-white rounded-[2.5rem] p-8 sm:p-10 shadow-[0_20px_60px_rgba(10,26,18,0.04)] border border-gray-100 hover:shadow-[0_30px_60px_rgba(10,26,18,0.08)] transition-shadow duration-500 group overflow-hidden`}
            >
              {/* Top Accent Line */}
              <div className={`absolute top-0 left-0 w-full h-1.5 ${tier.bgClass} group-hover:h-2 transition-all duration-300`} />
              
              {/* Background Glow */}
              <div className={`absolute -top-24 -right-24 w-48 h-48 ${tier.bgClass} rounded-full blur-[40px] opacity-50 group-hover:opacity-100 transition-opacity duration-500`} />

              {/* Card Header */}
              <div className="flex items-center gap-5 mb-8 relative z-10">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${tier.iconBgClass} ${tier.colorClass} border ${tier.borderClass}`}>
                  <tier.icon size={28} strokeWidth={1.5} />
                </div>
                <div>
                  <div className={`text-[10px] font-bold uppercase tracking-[0.15em] mb-1 ${tier.colorClass}`}>
                    Tầng {tier.tier}
                  </div>
                  <h3 className="text-2xl font-bold text-[#0A1A12] font-serif leading-tight">{tier.title}</h3>
                  <div className="text-sm text-gray-500 mt-1 font-medium">{tier.subtitle}</div>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-5 relative z-10">
                {tier.features.map((f, i) => (
                  <div key={i} className="flex items-start gap-4 group/feature">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      f.danger 
                        ? 'bg-red-50 text-red-500' 
                        : `${tier.iconBgClass} ${tier.colorClass}`
                    }`}>
                      <f.icon size={14} />
                    </div>
                    <p className={`text-sm sm:text-[15px] leading-relaxed font-medium pt-1 ${
                      f.danger ? 'text-red-600 font-semibold' : 'text-gray-600'
                    }`}>
                      {f.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Connector line (Desktop only) */}
          <div className="hidden lg:flex absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 items-center z-20">
            <div className="w-12 h-[2px] bg-gradient-to-r from-[#135E3E]/20 to-[#9E7B3B]/20" />
            <div className="w-12 h-12 bg-white rounded-full border border-gray-100 shadow-md flex items-center justify-center text-[#9E7B3B]">
              <ArrowRight size={20} />
            </div>
            <div className="w-12 h-[2px] bg-gradient-to-l from-[#9E7B3B]/20 to-[#135E3E]/20" />
          </div>

        </div>
      </div>
    </section>
  );
}
