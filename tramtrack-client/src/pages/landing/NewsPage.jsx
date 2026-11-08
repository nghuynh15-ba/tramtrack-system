import React from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { ArrowUpRight, Newspaper } from 'lucide-react';

export default function NewsPage() {
  const news = [
    { 
      title: 'Công bố chuẩn hoá nguồn gen Tràm Năm Gân nguyên bản 100%', 
      date: '12/10/2026', 
      category: 'Nghiên cứu',
      desc: 'Dự án nghiên cứu cấp quốc gia xác nhận hàm lượng 1,8-Cineole trong Tràm 5 Gân đạt mức kỷ lục trên 71%, mở ra hướng đi mới cho dược liệu bản địa.',
      image: '/assets/botanical/melaleuca-specimen.png'
    },
    { 
      title: 'Tích hợp mã băm Argon2id vào hệ thống chống hàng giả', 
      date: '05/10/2026', 
      category: 'Công nghệ',
      desc: 'Bản cập nhật bảo mật mới nhất ứng dụng thuật toán Argon2id (dùng trong lưu trữ mật khẩu cấp quân sự) để khoá dữ liệu kiểm nghiệm.',
      image: '/assets/app-mockup.png'
    },
    { 
      title: 'Ra mắt cổng truy xuất dữ liệu mở cho người tiêu dùng', 
      date: '28/09/2026', 
      category: 'Cập nhật',
      desc: 'Giờ đây khách hàng có thể tự mình quét mã QR, tải về phiếu COA gốc và đối chiếu trực tiếp dữ liệu lô sản xuất theo thời gian thực.',
      image: '/assets/qr-sample.png'
    },
    { 
      title: 'Hợp tác phát triển vùng trồng sinh thái với nông dân miền Trung', 
      date: '15/09/2026', 
      category: 'Cộng đồng',
      desc: 'TramTrack cam kết bao tiêu sản phẩm và đào tạo kỹ thuật canh tác không hoá chất cho hơn 500 hộ nông dân tại vùng đệm sinh thái.',
      image: '/assets/product-essential-oil.png'
    },
    { 
      title: 'Làm thế nào để phân biệt tinh dầu tràm nguyên chất?', 
      date: '02/09/2026', 
      category: 'Góc chuyên gia',
      desc: 'Chuyên gia dược liệu hướng dẫn các phương pháp cảm quan kết hợp quét mã định danh số để nhận biết tinh dầu tràm thật - giả.',
      image: '/assets/product-balm.png'
    },
    { 
      title: 'Cập nhật giao diện Hệ Thống Quét Mã Thế Hệ Mới', 
      date: '20/08/2026', 
      category: 'Công nghệ',
      desc: 'Giao diện mới mang âm hưởng thiên nhiên với hiệu ứng ánh sáng mờ ảo, nâng tầm trải nghiệm quét mã bảo chứng của khách hàng.',
      image: '/assets/product-hand-wash.png'
    }
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white pt-32 pb-24 relative overflow-hidden">
        {/* Background Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-[#9E7B3B]/10 to-[#135E3E]/5 blur-[120px] mix-blend-multiply opacity-80" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-16 lg:mb-20 mt-8">
            <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full border border-[#135E3E]/20 bg-[#135E3E]/5 text-[#135E3E] text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] mb-6 shadow-sm">
              <Newspaper size={14} />
              Bản tin điện tử
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-serif text-[#0A1A12] leading-[1.2] mb-6">
              Tin Tức & <br className="sm:hidden" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#135E3E] to-[#9E7B3B] italic font-normal">Sự Kiện</span>
            </h1>
            <p className="font-sans text-[16px] sm:text-[18px] text-gray-600 leading-relaxed max-w-2xl mx-auto font-medium">
              Theo dõi những thông tin mới nhất về công nghệ truy xuất nguồn gốc, nghiên cứu dược liệu và các hoạt động từ hệ sinh thái TramTrack.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {news.map((item, idx) => (
              <div key={idx} className="group relative bg-[#FDFBF7] rounded-[2rem] border border-gray-100 shadow-[0_15px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_25px_50px_rgba(10,26,18,0.08)] hover:-translate-y-2 transition-all duration-500 cursor-pointer overflow-hidden flex flex-col h-full">
                
                {/* Image Frame */}
                <div className="relative h-60 bg-white overflow-hidden border-b border-gray-100 p-8 flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent z-10" />
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-full h-full object-contain relative z-20 mix-blend-multiply group-hover:scale-110 group-hover:-rotate-2 transition-transform duration-700 ease-out drop-shadow-[0_15px_30px_rgba(0,0,0,0.1)]"
                  />
                  {/* Category Badge on Image */}
                  <div className="absolute top-4 left-4 z-30">
                    <span className="font-mono text-[9px] font-bold tracking-[0.15em] text-[#0A1A12] uppercase bg-white/90 backdrop-blur-md shadow-sm border border-gray-100 px-4 py-2 rounded-full">
                      {item.category}
                    </span>
                  </div>
                </div>

                <div className="flex-1 p-8 relative z-10 flex flex-col bg-[#FDFBF7]">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-[#9E7B3B] font-mono tracking-wider font-bold">
                      {item.date}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-serif font-bold text-[#0A1A12] leading-snug mb-3 group-hover:text-[#135E3E] transition-colors">
                    {item.title}
                  </h3>
                  
                  <p className="font-sans text-[14px] text-gray-600 leading-relaxed font-medium line-clamp-3 mb-6">
                    {item.desc}
                  </p>
                  
                  <div className="relative z-10 flex items-center gap-2 text-xs font-bold text-[#0A1A12] uppercase tracking-[0.2em] mt-auto pt-6 border-t border-gray-100 group-hover:text-[#135E3E] transition-colors">
                    <span className="group-hover:translate-x-1 transition-transform duration-300">Đọc tiếp</span>
                    <ArrowUpRight size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
