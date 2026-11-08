import React from 'react';
import { MapPin, Droplets, FlaskConical, Fingerprint, ChevronRight } from 'lucide-react';

const STEPS = [
  {
    step: '01',
    icon: MapPin,
    title: 'Vườn Nguyên Liệu',
    subtitle: 'Tràm năm gân',
    description: 'Thu hoạch lá và cành non từ vườn tràm năm gân Melaleuca quinquenervia tại vùng đất phèn Đồng bằng sông Cửu Long.',
    colorClass: 'text-emerald-600',
    bgClass: 'bg-emerald-50',
    borderClass: 'border-emerald-200',
    gradientClass: 'from-emerald-500 to-emerald-400'
  },
  {
    step: '02',
    icon: Droplets,
    title: 'Chưng Cất',
    subtitle: 'Lôi cuốn hơi nước',
    description: 'Chưng cất bằng phương pháp lôi cuốn hơi nước, ngưng tụ thu hồi tinh dầu nguyên chất với tỷ lệ thu hồi tối ưu.',
    colorClass: 'text-blue-600',
    bgClass: 'bg-blue-50',
    borderClass: 'border-blue-200',
    gradientClass: 'from-blue-500 to-blue-400'
  },
  {
    step: '03',
    icon: FlaskConical,
    title: 'Kiểm Nghiệm',
    subtitle: 'Sắc ký khí GC-MS',
    description: 'Phân tích thành phần hóa học: 1,8-Cineole đạt 71.05%, Limonene 3.1% — đạt chuẩn Dược điển Việt Nam.',
    colorClass: 'text-amber-600',
    bgClass: 'bg-amber-50',
    borderClass: 'border-amber-200',
    gradientClass: 'from-amber-500 to-amber-400'
  },
  {
    step: '04',
    icon: Fingerprint,
    title: 'Niêm Phong',
    subtitle: 'Con tem bảo mật',
    description: 'Niêm phong con tem bảo mật hai lớp chống bóc dán, tích hợp mã QR công khai và lớp cào chứa mã bí mật.',
    colorClass: 'text-rose-600',
    bgClass: 'bg-rose-50',
    borderClass: 'border-rose-200',
    gradientClass: 'from-rose-500 to-rose-400'
  },
];

export default function JourneySection() {
  return (
    <section className="relative py-24 bg-white text-[#0A1A12] overflow-hidden" id="journey">
      {/* Background accents */}
      <div className="absolute top-1/2 left-0 w-full h-[500px] bg-gradient-to-b from-[#FDFBF7] to-white pointer-events-none -translate-y-1/2" />

      <div className="container max-w-7xl mx-auto px-4 lg:px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full border border-[#9E7B3B]/20 bg-[#9E7B3B]/5 text-[#9E7B3B] text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] mb-6">
            Hành trình minh bạch
          </div>
          <h2 className="text-4xl sm:text-5xl font-serif font-bold text-[#0A1A12] leading-[1.2] mb-6">
            Bốn Chặng <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#135E3E] to-[#9E7B3B] italic">Chuẩn Hóa</span>
          </h2>
          <p className="text-gray-600 font-medium leading-relaxed">
            Từ vườn tràm đến tay người tiêu dùng — mỗi bước đều được ghi nhận, kiểm nghiệm và bảo chứng.
          </p>
        </div>

        {/* Grid Container with decorative line */}
        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-[45%] left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gray-200 to-transparent -translate-y-1/2 z-0" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 relative z-10">
            {STEPS.map((step, index) => (
              <div
                key={step.step}
                className="group relative bg-[#FDFBF7] rounded-[2rem] p-8 shadow-[0_15px_40px_rgba(0,0,0,0.03)] border border-gray-100 hover:shadow-[0_25px_50px_rgba(10,26,18,0.08)] hover:-translate-y-2 transition-all duration-500 overflow-hidden"
              >
                {/* Accent Top Gradient Line */}
                <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${step.gradientClass} opacity-80 group-hover:h-2 group-hover:opacity-100 transition-all duration-300`} />
                
                {/* Step Number Watermark */}
                <div className={`absolute -bottom-4 -right-2 text-[6rem] font-serif font-bold ${step.colorClass} opacity-[0.03] group-hover:opacity-[0.08] group-hover:scale-110 transition-all duration-500 leading-none select-none pointer-events-none`}>
                  {step.step}
                </div>

                <div className="relative z-10">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${step.bgClass} ${step.colorClass} border ${step.borderClass} mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-sm`}>
                    <step.icon size={26} strokeWidth={1.5} />
                  </div>
                  
                  <h3 className="text-xl font-bold text-[#0A1A12] font-serif leading-tight mb-2">
                    {step.title}
                  </h3>
                  <div className={`text-[10px] font-bold uppercase tracking-widest ${step.colorClass} mb-4`}>
                    {step.subtitle}
                  </div>
                  
                  <p className="text-sm text-gray-600 leading-relaxed font-medium">
                    {step.description}
                  </p>
                </div>
                
                {/* Arrow indicator (Mobile/Tablet) */}
                {index < STEPS.length - 1 && (
                  <div className="lg:hidden absolute -bottom-3 left-1/2 -translate-x-1/2 text-gray-300">
                    <ChevronRight size={20} className="rotate-90" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
