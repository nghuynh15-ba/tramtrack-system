import React from 'react';
import Navbar from '../landing/components/Navbar';
import Footer from '../landing/components/Footer';
import { ShieldCheck, Code, Beaker, Layout, GraduationCap, Lightbulb, Compass } from 'lucide-react';

const TEAM_MEMBERS = [
  {
    id: 'pharma',
    name: 'Nguyễn Thị Yến Phượng',
    role: 'Chuyên Môn & Nội Dung',
    department: 'Dược Học',
    description: 'Nghiên cứu đặc tính sinh học, kiểm soát chất lượng dược liệu và thiết lập ranh giới công bố y khoa chính xác.',
    image: '/assets/team-phuong.png',
    color: 'from-emerald-500/20 to-teal-500/20',
    icon: Beaker,
  },
  {
    id: 'leader',
    name: 'Nguyễn Thị Như Huỳnh',
    role: 'Leader Dự Án & Kỹ Thuật',
    department: 'Công Nghệ Thông Tin',
    description: 'Chịu trách nhiệm dẫn dắt dự án, thiết kế kiến trúc hệ thống và phát triển lõi xác thực: sinh mã, băm Argon2id và cơ chế kích hoạt một lần.',
    image: '/assets/team-leader.png',
    color: 'from-blue-500/20 to-indigo-500/20',
    icon: Code,
  },
  {
    id: 'ops',
    name: 'Trần Hiếu',
    role: 'Vận Hành & Thương Mại',
    department: 'Logistics & Thiết Kế',
    description: 'Quản lý chuỗi cung ứng, phối hợp nhà in, thiết kế nhận diện thương hiệu và hoạch định chiến lược phân phối.',
    image: '/assets/team-hieu.png',
    color: 'from-amber-500/20 to-orange-500/20',
    icon: Layout,
  }
];

const MENTORS = [
  {
    id: 'mentor-1',
    name: 'ThS. Nguyễn Linh Tuyền',
    role: 'Giảng viên | Dược liệu - Dược học cổ truyền',
    department: 'Khoa Dược',
    description: 'Công tác tại Bộ môn Dược liệu – Khoa Dược. Trực tiếp cố vấn khoa học, định hướng nghiên cứu và kiểm định các tiêu chuẩn dược tính chuyên sâu.',
    image: '/assets/team-mentor-1.png',
    color: 'from-slate-400/20 to-gray-400/20',
    icon: GraduationCap,
  },
  {
    id: 'mentor-2',
    name: 'Võ Thanh Tuấn',
    role: 'Cố vấn chiến lược',
    department: 'Chuyên viên trung tâm NIIC',
    description: 'Mang đến tầm nhìn chiến lược dài hạn, tư vấn mô hình vận hành doanh nghiệp và cách tiếp cận thị trường quốc tế.',
    image: '/assets/team-mentor-2.png',
    color: 'from-rose-400/20 to-red-400/20',
    icon: Lightbulb,
  }
];

export default function AboutTeamPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#0A1A12] flex flex-col font-sans selection:bg-[#135E3E] selection:text-white relative overflow-hidden">

      {/* Absolute Background Elements for Page Wide Aesthetics */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-[#9E7B3B]/5 to-transparent rounded-full blur-[120px] pointer-events-none -translate-y-1/4 translate-x-1/4" />
      <div className="absolute top-1/3 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-[#135E3E]/5 to-transparent rounded-full blur-[100px] pointer-events-none -translate-x-1/3" />
      <div className="absolute bottom-0 right-1/4 w-[1000px] h-[1000px] bg-[#135E3E]/[0.02] rounded-full blur-[150px] pointer-events-none translate-y-1/3" />

      <Navbar />

      <main className="flex-1 pt-32 pb-32 relative z-10">

        {/* ================= HEADER HERO ================= */}
        <section className="container max-w-7xl mx-auto px-4 mb-32">
          <div className="text-center max-w-6xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#135E3E]/10 text-[#135E3E] text-xs font-bold uppercase tracking-widest mb-8 shadow-sm animate-[fade-in-up_1s_ease-out]">
              <ShieldCheck size={16} />
              Đội ngũ Phát triển TramTrack
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold font-serif leading-[1.1] mb-8 text-[#0A1A12] animate-[fade-in-up_1s_ease-out_0.2s_both]">
              Những người kiến tạo<br />
              <span className="text-[#9E7B3B] italic font-normal text-4xl md:text-5xl lg:text-6xl mt-4 block whitespace-nowrap">Tương lai của Dược liệu minh bạch</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed font-light max-w-2xl mx-auto animate-[fade-in-up_1s_ease-out_0.4s_both]">
              Sự kết hợp hoàn hảo giữa nền tảng Công nghệ Thông tin hiện đại, tri thức Y Dược sâu sắc và tư duy Vận hành nhạy bén.
            </p>
          </div>
        </section>

        {/* ================= FOUNDING TEAM ================= */}
        <section className="container max-w-7xl mx-auto px-4 mb-40">
          <div className="flex items-center justify-center gap-4 mb-32 pt-16 opacity-80">
            <div className="h-px bg-gradient-to-r from-transparent via-[#135E3E]/30 to-transparent w-32" />
            <h2 className="text-lg font-bold uppercase tracking-[0.3em] text-[#135E3E]">Nhóm Sáng Lập</h2>
            <div className="h-px bg-gradient-to-r from-transparent via-[#135E3E]/30 to-transparent w-32" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
            {TEAM_MEMBERS.map((member, idx) => (
              <div
                key={member.id}
                className="group relative flex flex-col items-center transition-all duration-700 hover:-translate-y-4"
                style={{ animationDelay: `${idx * 150}ms`, animationFillMode: 'both' }}
              >
                {/* Image Section - Frameless & Floating */}
                <div className="relative h-[320px] sm:h-[400px] flex justify-center w-full">
                  {/* Aura/Glow */}
                  <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-gradient-to-br ${member.color} blur-[60px] opacity-40 group-hover:scale-125 group-hover:opacity-70 transition-all duration-700 pointer-events-none`} />

                  {/* Member Image */}
                  <img
                    src={member.image}
                    alt={member.name}
                    className="relative z-10 w-full h-full object-contain object-bottom drop-shadow-[0_20px_40px_rgba(0,0,0,0.15)] transition-transform duration-700 ease-out group-hover:scale-110"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  {/* Fallback avatar */}
                  <div className="hidden absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full z-0 items-center justify-center bg-white/50 text-[#135E3E] font-serif font-bold text-5xl shadow-[0_0_50px_rgba(0,0,0,0.05)] backdrop-blur-md">
                    {member.name.charAt(0)}
                  </div>
                </div>

                {/* Content Section */}
                <div className="pt-10 text-center flex flex-col items-center relative z-20 w-full">
                  <div className="flex items-center justify-center gap-2 mb-6 text-[#9E7B3B] bg-white px-5 py-2 rounded-full border border-[#9E7B3B]/10 shadow-[0_5px_20px_rgba(158,123,59,0.08)] transition-transform duration-500 group-hover:-translate-y-2">
                    <member.icon size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{member.department}</span>
                  </div>

                  <h3 className="text-3xl font-serif font-bold text-[#0A1A12] mb-3 group-hover:text-[#135E3E] transition-colors">
                    {member.name}
                  </h3>
                  <div className="text-xs font-bold text-[#135E3E] mb-6 tracking-[0.2em] uppercase">
                    {member.role}
                  </div>

                  <p className="text-gray-600 text-sm leading-loose max-w-sm px-4">
                    {member.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ================= ADVISORY BOARD (MENTORS) ================= */}
        <section className="container max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-center gap-4 mb-32 pt-20 opacity-80">
            <div className="h-px bg-gradient-to-r from-transparent via-[#9E7B3B]/40 to-transparent w-32" />
            <h2 className="text-lg font-bold uppercase tracking-[0.3em] text-[#9E7B3B] flex items-center gap-2">
              <Compass size={18} /> Ban Cố Vấn
            </h2>
            <div className="h-px bg-gradient-to-r from-transparent via-[#9E7B3B]/40 to-transparent w-32" />
          </div>

          {/* 2-Column layout for Mentors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-24">
            {MENTORS.map((mentor) => (
              <div
                key={mentor.id}
                className="group relative flex flex-col items-center transition-all duration-700 hover:-translate-y-4"
              >
                {/* Image Section - Scaled down slightly for mentors to show hierarchy */}
                <div className="relative h-[280px] sm:h-[340px] flex justify-center w-full">
                  <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 sm:w-72 sm:h-72 rounded-full bg-gradient-to-br ${mentor.color} blur-[50px] opacity-30 group-hover:scale-125 group-hover:opacity-60 transition-all duration-700 pointer-events-none`} />

                  <img
                    src={mentor.image}
                    alt={mentor.name}
                    className="relative z-10 w-full h-full object-contain object-bottom drop-shadow-[0_15px_30px_rgba(0,0,0,0.12)] transition-transform duration-700 ease-out group-hover:scale-105"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="hidden absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full z-0 items-center justify-center bg-white/50 text-gray-500 font-serif font-bold text-4xl shadow-sm backdrop-blur-sm">
                    {mentor.name.charAt(0)}
                  </div>
                </div>

                {/* Content Section */}
                <div className="pt-8 text-center flex flex-col items-center relative z-20 w-full">
                  <div className="flex items-center justify-center gap-2 mb-5 text-gray-600 bg-white px-5 py-2 rounded-full border border-gray-200 shadow-sm transition-transform duration-500 group-hover:-translate-y-1">
                    <mentor.icon size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{mentor.department}</span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#0A1A12] mb-2 group-hover:text-[#9E7B3B] transition-colors">
                    {mentor.name}
                  </h3>
                  <div className="text-xs font-bold text-gray-500 mb-5 tracking-[0.15em] uppercase">
                    {mentor.role}
                  </div>

                  <p className="text-gray-600 text-sm leading-loose max-w-md px-4">
                    {mentor.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
