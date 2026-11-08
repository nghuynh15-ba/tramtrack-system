import React, { useEffect, useState } from 'react';
import LandingPage from './pages/landing/LandingPage';
import WebQrScanner from './pages/scan/WebQrScanner';
import VerifyTier1Screen from './pages/consumer/verify-t1/VerifyTier1Screen';
import ActivateTier2Screen from './pages/consumer/activate-t2/ActivateTier2Screen';
import VerificationResultValid from './pages/scan/VerificationResultValid';
import VerificationResultWarning from './pages/scan/VerificationResultWarning';
import VerificationResultInvalid from './pages/scan/VerificationResultInvalid';
import ProductTraceabilityCOA from './pages/scan/ProductTraceabilityCOA';
import HanhTrinhLo from './components/HanhTrinhLo';
import XemTruocHanhTrinh from './pages/admin/XemTruocHanhTrinh';
import StampDesigner from './pages/admin/StampDesigner';
import SafetyBotanicalGuide from './pages/scan/SafetyBotanicalGuide';
import ConsumerFraudReportScreen from './pages/scan/ConsumerFraudReportScreen';
import PublicRegistryLookupScreen from './pages/scan/PublicRegistryLookupScreen';
import AboutTeamPage from './pages/landing/AboutTeamPage';
import ProducerAuthFacilityPortal from './pages/scan/ProducerAuthFacilityPortal';
import AntiCounterfeitHeatmapDashboard from './pages/scan/AntiCounterfeitHeatmapDashboard';
import BatchManagementScreen from './pages/scan/BatchManagementScreen';
import BatchCreationWizard from './pages/scan/BatchCreationWizard';
import SecurityMintingPrintExport from './pages/scan/SecurityMintingPrintExport';
import DistributorBatchAcceptancePortal from './pages/scan/DistributorBatchAcceptancePortal';
import FacilityLegalDossierScreen from './pages/admin/FacilityLegalDossierScreen';
import MarketSurveillanceIncidentScreen from './pages/admin/MarketSurveillanceIncidentScreen';
import StampPrintingManagement from './pages/admin/StampPrintingManagement';
import PrivateLayout from './components/PrivateLayout';
import GlobalSplashScreen from './components/common/GlobalSplashScreen';
import EcosystemPage from './pages/landing/EcosystemPage';
import NewsPage from './pages/landing/NewsPage';


import { layPhieu, layNguoi, xoaPhieu } from './services/api';

/**
 * Điều hướng và luồng người tiêu dùng.
 *
 * ─── Chỗ đã sửa quan trọng nhất của toàn bộ giao diện ───────────────────────
 *
 * Bản trước tự phán quyết ngay trong tệp này:
 *
 *     if (scanData?.serial === '000000' || ... === 'SAI') navigateTo('/result-invalid');
 *     else if (scanData?.serial === 'WARNING')            navigateTo('/result-warning');
 *     else                                               navigateTo('/result-valid');
 *
 * Nghĩa là mọi chuỗi quét được, trừ ba chuỗi viết sẵn, đều dẫn tới màn XÁC
 * THỰC THÀNH CÔNG. Một con tem giả bất kỳ cũng sẽ nhận được màn xanh. Đoạn đó
 * đã bị bỏ hẳn: bây giờ phán quyết chỉ đến từ trường ket_qua trong câu trả lời
 * của máy chủ, và nó được vẽ ngay tại màn đã gọi máy chủ.
 *
 * Ba màn kết quả cũ vẫn giữ lại nhưng chuyển xuống /demo/* để trình diễn khi
 * không có mạng. Chúng không nối với luồng thật ở bất cứ đường nào, nên không
 * thể vô tình lọt vào kết quả của một lần quét thật.
 *
 * ─── Đường dẫn động ────────────────────────────────────────────────────────
 *
 * Mã QR in trên tem chứa <tên miền>/s/TDT-2026-000001, nên hai đường dẫn động
 * /s/:serial và /a/:serial là bắt buộc. Ở đây chúng được khớp bằng biểu thức
 * chính quy thay vì thêm react-router-dom: toàn bộ điều hướng của dự án đã nằm
 * gọn trong tệp này và chỉ có hai đường dẫn động, nên đưa router vào lúc này
 * là viết lại 22 màn hình để đổi lấy đúng mười dòng dưới đây.
 */

// Cờ `i`: mã QR in toàn chữ hoa (gọn hơn nên ô mã to hơn) nên đường dẫn có thể là /S/ hoặc /A/.
const KHOP_TANG_1 = /^\/s\/([^/?#]+)/i;
const KHOP_TANG_2 = /^\/a\/([^/?#]+)/i;

const DUONG_DAN_B2B = [
  '/dashboard', '/batches', '/create-batch', '/mint-export',
  '/print-stamps', '/distributor-portal', '/facility-legal', '/surveillance', '/preview-story', '/stamp-design',
];

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  /**
   * Màn mở đầu chỉ chạy ở TRANG CHỦ.
   *
   * Trước đây nó chạy trên mọi đường dẫn, kể cả /producer-portal và cả khu
   * quản trị: mở trang ra là ba giây rưỡi chữ "THIẾT LẬP KẾT NỐI BẢO MẬT..."
   * rồi mới thấy gì. Người quét mã QR đang đứng ở quầy, và người đăng nhập
   * vào khu quản trị, đều không có lý do gì phải chờ một hoạt ảnh thương hiệu.
   */
  const [isAppReady, setIsAppReady] = useState(
    () => window.location.pathname !== '/'
  );

  // Chuỗi quét được nhưng không chứa serial nào — giữ lại để hiện cho người dùng.
  const [chuoiQuetLoi, setChuoiQuetLoi] = useState(null);
  // Hồ sơ lô lấy được từ Tầng 1 hoặc Tầng 2, dùng cho màn hành trình / COA.
  const [hoSoLo, setHoSoLo] = useState(null);
  // Serial đang phản ánh ở biểu mẫu báo cáo.
  const [serialBaoCao, setSerialBaoCao] = useState('');

  // Đã có phiếu trong sessionStorage thì vào thẳng khu quản trị. Giữ thành
  // state chứ không gọi layPhieu() trong điều kiện: React không vẽ lại khi
  // sessionStorage đổi, nên đăng nhập xong màn hình sẽ đứng im.
  const [daDangNhap, setDaDangNhap] = useState(() => Boolean(layPhieu()));

  // Lô đang làm việc — /mint-export và /print-stamps đều cần biết lô nào.
  const [maLoDangLam, setMaLoDangLam] = useState(null);

  useEffect(() => {
    const khiLui = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', khiLui);
    return () => window.removeEventListener('popstate', khiLui);
  }, []);

  const navigateTo = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo(0, 0);
  };

  const moBaoCao = (serial) => {
    setSerialBaoCao(serial || '');
    navigateTo('/report-fraud');
  };

  const moHanhTrinh = ({ lo, serial } = {}) => {
    if (lo) setHoSoLo({ lo, serial });
    navigateTo('/story');
  };

  const dangXuat = () => {
    xoaPhieu();
    setDaDangNhap(false);
    setMaLoDangLam(null);
    navigateTo('/producer-portal');
  };

  const moLo = (maLo, duongDan) => {
    setMaLoDangLam(maLo);
    navigateTo(duongDan);
  };

  if (!isAppReady) {
    return <GlobalSplashScreen onComplete={() => setIsAppReady(true)} />;
  }

  /* ─────────── Tầng 1: tra cứu khi tem còn nguyên ─────────── */

  const khopT1 = currentPath.match(KHOP_TANG_1);
  if (khopT1) {
    const serial = decodeURIComponent(khopT1[1]).toUpperCase();
    return (
      <VerifyTier1Screen
        key={serial}
        serial={serial}
        onKichHoat={() => navigateTo(`/a/${serial}`)}
        onXemHanhTrinh={moHanhTrinh}
        onBaoCao={() => moBaoCao(serial)}
        onQuetLai={() => navigateTo('/scan')}
        onDong={() => navigateTo('/')}
      />
    );
  }

  /* ─────────── Tầng 2: kích hoạt sau khi cào ─────────── */

  const khopT2 = currentPath.match(KHOP_TANG_2);
  if (khopT2) {
    const serial = decodeURIComponent(khopT2[1]).toUpperCase();
    return (
      <ActivateTier2Screen
        key={serial}
        serial={serial}
        onXemHanhTrinh={moHanhTrinh}
        onHuongDanAnToan={() => navigateTo('/safety-guide')}
        onBaoCao={() => moBaoCao(serial)}
        onQuetLai={() => navigateTo('/scan')}
        onDong={() => navigateTo('/')}
      />
    );
  }

  /* ─────────── Máy quét ─────────── */

  if (currentPath === '/scan') {
    // Quét được một mã QR nhưng trong đó không có serial TramTrack nào.
    if (chuoiQuetLoi) {
      return (
        <VerificationResultInvalid
          invalidCode={chuoiQuetLoi}
          nguonGoc="tang-1"
          onRetry={() => setChuoiQuetLoi(null)}
          onReportFake={() => moBaoCao('')}
        />
      );
    }

    return (
      <WebQrScanner
        onClose={() => navigateTo('/')}
        onScanSuccess={({ serial, chuoiTho }) => {
          if (serial) {
            setChuoiQuetLoi(null);
            navigateTo(`/s/${serial}`);
          } else {
            setChuoiQuetLoi(chuoiTho);
          }
        }}
      />
    );
  }

  /* ─────────── Màn nội dung quanh kết quả ─────────── */

  if (currentPath === '/traceability') {
    // Không có hồ sơ lô trong bộ nhớ thì không vẽ hồ sơ của một lô nào cả —
    // ví dụ khi người dùng mở thẳng /traceability hoặc tải lại trang. Đưa họ
    // về máy quét để lấy đúng hồ sơ của con tem trong tay.
    if (!hoSoLo) {
      return (
        <WebQrScanner
          onClose={() => navigateTo('/')}
          onScanSuccess={({ serial, chuoiTho }) => {
            if (serial) navigateTo(`/s/${serial}`);
            else { setChuoiQuetLoi(chuoiTho); navigateTo('/scan'); }
          }}
        />
      );
    }
    return (
      <ProductTraceabilityCOA
        batchInfo={{
          serial: hoSoLo.serial,
          batch: hoSoLo.lo?.ma_lo,
          coaId: hoSoLo.lo?.so_phieu_coa,
          anhPhieuCoa: hoSoLo.lo?.anh_phieu_coa || null,
          cineole:
            hoSoLo.lo?.ham_luong_cineole === null || hoSoLo.lo?.ham_luong_cineole === undefined
              ? null
              : Number(hoSoLo.lo.ham_luong_cineole),
          lab: hoSoLo.lo?.don_vi_kiem_nghiem,
          distilledAt: hoSoLo.lo?.ngay_chung_cat,
        }}
        onBack={() => navigateTo(hoSoLo.serial ? `/s/${hoSoLo.serial}` : '/')}
        onNavigateToGuide={() => navigateTo('/safety-guide')}
      />
    );
  }

  if (currentPath === '/story') {
    // Cũng như /traceability: không có hồ sơ lô trong bộ nhớ thì không vẽ hành trình của lô nào.
    if (!hoSoLo) {
      return (
        <WebQrScanner
          onClose={() => navigateTo('/')}
          onScanSuccess={({ serial, chuoiTho }) => {
            if (serial) navigateTo(`/s/${serial}`);
            else { setChuoiQuetLoi(chuoiTho); navigateTo('/scan'); }
          }}
        />
      );
    }
    return (
      <HanhTrinhLo
        lo={hoSoLo.lo}
        onClose={() => navigateTo(hoSoLo.serial ? `/s/${hoSoLo.serial}` : '/')}
        onBaoCao={() => moBaoCao(hoSoLo.serial || '')}
        onKichHoat={hoSoLo.serial ? () => navigateTo(`/a/${hoSoLo.serial}`) : undefined}
      />
    );
  }

  if (currentPath === '/safety-guide') {
    return (
      <SafetyBotanicalGuide
        onBack={() => navigateTo(serialBaoCao ? `/s/${serialBaoCao}` : '/')}
        onReportFake={() => moBaoCao(serialBaoCao)}
      />
    );
  }

  if (currentPath === '/report-fraud') {
    return (
      <ConsumerFraudReportScreen
        initialSerial={serialBaoCao}
        onClose={() => navigateTo('/')}
      />
    );
  }

  if (currentPath === '/registry') {
    return (
      <PublicRegistryLookupScreen
        onBack={() => navigateTo('/')}
        onNavigateToScan={() => navigateTo('/scan')}
      />
    );
  }

  if (currentPath === '/producer-portal') {
    return (
      <ProducerAuthFacilityPortal
        onBack={() => navigateTo('/')}
        onDangNhapXong={() => { setDaDangNhap(true); navigateTo('/dashboard'); }}
      />
    );
  }

  /* ─────────── Khu quản trị ─────────── */

  if (DUONG_DAN_B2B.includes(currentPath)) {
    // Chưa đăng nhập thì không vẽ gì trong khu quản trị, kể cả khi
    // người dùng gõ thẳng /dashboard vào thanh địa chỉ.
    if (!daDangNhap) {
      return (
        <ProducerAuthFacilityPortal
          onBack={() => navigateTo('/')}
          onDangNhapXong={() => setDaDangNhap(true)}
        />
      );
    }

    return (
      <PrivateLayout
        currentPath={currentPath}
        navigateTo={navigateTo}
        nguoi={layNguoi()}
        onDangXuat={dangXuat}
      >
        {currentPath === '/dashboard' && (
          <AntiCounterfeitHeatmapDashboard
            onBack={() => navigateTo('/producer-portal')}
            onHetPhien={dangXuat}
            onMoBaoCao={() => navigateTo('/surveillance')}
          />
        )}
        {currentPath === '/batches' && (
          <BatchManagementScreen
            onBack={() => navigateTo('/producer-portal')}
            onNavigateToCreateBatch={() => navigateTo('/create-batch')}
            onSinhMa={(maLo) => moLo(maLo, '/mint-export')}
            onXemTem={(maLo) => moLo(maLo, '/print-stamps')}
            onXemTruoc={(maLo) => moLo(maLo, '/preview-story')}
            onHetPhien={dangXuat}
          />
        )}
        {currentPath === '/create-batch' && (
          <BatchCreationWizard
            onCancel={() => navigateTo('/batches')}
            onComplete={(maLo) => moLo(maLo, '/mint-export')}
            onHetPhien={dangXuat}
          />
        )}
        {currentPath === '/mint-export' && (
          <SecurityMintingPrintExport
            maLo={maLoDangLam}
            onBack={() => navigateTo('/batches')}
            onComplete={() => navigateTo('/batches')}
            onThietKeTem={() => navigateTo('/stamp-design')}
            onHetPhien={dangXuat}
          />
        )}
        {currentPath === '/stamp-design' && <StampDesigner />}
        {currentPath === '/print-stamps' && (
          <StampPrintingManagement
            maLo={maLoDangLam}
            onBack={() => navigateTo('/batches')}
            onHetPhien={dangXuat}
          />
        )}
        {currentPath === '/preview-story' && (
          <XemTruocHanhTrinh
            maLo={maLoDangLam}
            onBack={() => navigateTo('/batches')}
            onHetPhien={dangXuat}
          />
        )}
        {currentPath === '/surveillance' && (
          <MarketSurveillanceIncidentScreen onHetPhien={dangXuat} />
        )}

        {/* Hai màn dưới chưa có điểm cuối nào ở máy chủ — giữ nguyên,
            không truyền onHetPhien vì chúng không gọi máy chủ. */}
        {currentPath === '/distributor-portal' && (
          <DistributorBatchAcceptancePortal onBack={() => navigateTo('/producer-portal')} />
        )}
        {currentPath === '/facility-legal' && <FacilityLegalDossierScreen />}
      </PrivateLayout>
    );
  }

  /* ─────────── Màn trình diễn, không nối máy chủ ───────────
   *
   * Dùng khi thuyết trình mà không có mạng hoặc không có tem thật trong tay.
   * Mọi số liệu ở đây là số liệu mẫu và màn hình tự khai điều đó.
   * Không có đường nào từ luồng quét thật dẫn tới đây.
   */

  if (currentPath === '/demo/result-valid') {
    return (
      <VerificationResultValid
        laDuLieuMau
        batchData={{
          serial: 'TDT-2026-900001',
          batchId: 'LO-2026-Q4-DEMO',
          cineoleRate: '71.05 %',
          distillationDate: '2026-08-14',
          activatedAt: new Date().toISOString(),
          coaId: 'COA-2026-8821',
          lab: 'Viện Kiểm nghiệm (dữ liệu mẫu)',
        }}
        onViewJourney={() => navigateTo('/')}
        onViewSafetyGuide={() => navigateTo('/safety-guide')}
      />
    );
  }

  if (currentPath === '/demo/result-warning') {
    return (
      <VerificationResultWarning
        serialNumber="TDT-2026-900002"
        firstActivatedAt={new Date(Date.now() - 3 * 86400000).toISOString()}
        firstLocation="Cần Thơ"
        hienViTri
        onReportFake={() => moBaoCao('TDT-2026-900002')}
        onViewBatchInfo={() => navigateTo('/')}
      />
    );
  }

  if (currentPath === '/demo/result-invalid') {
    return (
      <VerificationResultInvalid
        invalidCode="TDT-2026-999999"
        nguonGoc="tang-2"
        onRetry={() => navigateTo('/scan')}
        onReportFake={() => moBaoCao('')}
      />
    );
  }

  /* ─────────── Trang giới thiệu ─────────── */

  if (currentPath === '/ecosystem') return <EcosystemPage />;
  if (currentPath === '/news') return <NewsPage />;
  if (currentPath === '/team') return <AboutTeamPage />;

  return <LandingPage />;
}
