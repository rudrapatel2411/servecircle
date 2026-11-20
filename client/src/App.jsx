import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import i18next from 'i18next';

// Global override for Number formatting to support localized digits
const originalToLocaleString = Number.prototype.toLocaleString;
Number.prototype.toLocaleString = function (locales, options) {
  const lang = i18next.language || 'en';
  const numSystem = lang === 'hi' ? 'deva' : lang === 'gu' ? 'gujr' : 'latn';
  const resolvedLocales = locales || (lang === 'hi' ? 'hi-IN' : lang === 'gu' ? 'gu-IN' : 'en-IN');
  const resolvedOptions = { ...options, numberingSystem: numSystem };
  return originalToLocaleString.call(this, resolvedLocales, resolvedOptions);
};

/* Layouts */
import Navbar from './components/Navbar';
import DashboardLayout from './components/DashboardLayout';

/* Public */
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import WorkerRegister from './pages/auth/WorkerRegister';
import ImpactDetail from './pages/ImpactDetail';

/* Customer */
import CustomerDashboard from './pages/customer/CustomerDashboard';
import BrowseServices from './pages/customer/BrowseServices';
import GeneralServicesPage from './pages/customer/GeneralServicesPage';
// RepairServicesComingSoon and CleaningServicesComingSoon replaced by real Hubs
import CategoryHub from './pages/customer/CategoryHub';
import ServiceDetail from './pages/customer/ServiceDetail';
import EmergencyHub from './pages/customer/EmergencyHub';
import EventsHub from './pages/customer/EventsHub';
import MyHomeDashboard from './pages/customer/MyHomeDashboard';
import TrustSafety from './pages/customer/TrustSafety';
import SecureWorkerVerification from './pages/customer/SecureWorkerVerification';
import BookingFlow from './pages/customer/BookingFlow';
import BookingHistory from './pages/customer/BookingHistory';
import CustomerWallet from './pages/customer/CustomerWallet';
import CustomerSubscriptions from './pages/customer/CustomerSubscriptions';
import CustomerReviews from './pages/customer/CustomerReviews';
import AISmartDiagnosis from './pages/customer/AISmartDiagnosis';
import CustomerAIChat from './pages/customer/CustomerAIChat';
import HomeFixrWarranty from './pages/customer/HomeFixrWarranty';
import VideoConsultation from './pages/customer/VideoConsultation';
import GroupBooking from './pages/customer/GroupBooking';
import LiveTracking from './pages/customer/LiveTracking';
import RelocationHub from './pages/customer/RelocationHub';
import HealthWellnessHub from './pages/customer/HealthWellnessHub';
import PetHub from './pages/customer/PetHub';
import FoodKitchenHub from './pages/customer/FoodKitchenHub';
import TravelCommuteHub from './pages/customer/TravelCommuteHub';
import SocietyManagementHub from './pages/customer/SocietyManagementHub';
import HomeRepairsHub from './pages/customer/HomeRepairsHub';
import VehicleServicesHub from './pages/customer/VehicleServicesHub';
import CleaningHygieneHub from './pages/customer/CleaningHygieneHub';
import FurnitureDecorHub from './pages/customer/FurnitureDecorHub';
import GardenOutdoorHub from './pages/customer/GardenOutdoorHub';
import PostServiceReview from './pages/customer/PostServiceReview';
import OrderedServices from './pages/customer/OrderedServices';
import PackersDemo from './pages/customer/PackersDemo';
import PetRelocationDemo from './pages/customer/PetRelocationDemo';
import VehicleRelocationDemo from './pages/customer/VehicleRelocationDemo';
import HealthWellnessDemo from './pages/customer/HealthWellnessDemo';
import PetPremiumFlow from './pages/customer/PetPremiumFlow';
import FoodPremiumFlow from './pages/customer/FoodPremiumFlow';
import TravelPremiumFlow from './pages/customer/TravelPremiumFlow';
import SocietyPremiumFlow from './pages/customer/SocietyPremiumFlow';

/* Worker */
import WorkerDashboard from './pages/worker/WorkerDashboard';
import WorkerJobs from './pages/worker/WorkerJobs';
import WorkerSchedule from './pages/worker/WorkerSchedule';
import WorkerEarnings from './pages/worker/WorkerEarnings';
import WorkerTraining from './pages/worker/WorkerTraining';
import WorkerProfile from './pages/worker/WorkerProfile';
import BecomeAProHub from './pages/worker/BecomeAProHub';

/* Admin */
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminBookings from './pages/admin/AdminBookings';
import WorkerVerification from './pages/admin/WorkerVerification';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminCoupons from './pages/admin/AdminCoupons';
import AdminComplaints from './pages/admin/AdminComplaints';
import AdminPartners from './pages/admin/AdminPartners';
import AdminNotifications from './pages/admin/AdminNotifications';

/* B2B (Admin - Multi-Client View) */
import B2BDashboard from './pages/b2b/B2BDashboard';
import B2BBooking from './pages/b2b/B2BBooking';
import B2BContracts from './pages/b2b/B2BContracts';
import B2BLocations from './pages/b2b/B2BLocations';
import B2BTeam from './pages/b2b/B2BTeam';
import B2BInvoices from './pages/b2b/B2BInvoices';

/* B2B Client Portal (Single Society/Building View) */
import B2BClientDashboard from './pages/b2b/B2BClientDashboard';
import B2BClientServices from './pages/b2b/B2BClientServices';
import B2BClientContracts from './pages/b2b/B2BClientContracts';
import B2BClientLocations from './pages/b2b/B2BClientLocations';
import B2BClientInvoices from './pages/b2b/B2BClientInvoices';
import B2BClientHistory from './pages/b2b/B2BClientHistory';
import B2BClientSupport from './pages/b2b/B2BClientSupport';

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<><Navbar /><LandingPage /></>} />
        <Route path="/about/:id" element={<><Navbar /><ImpactDetail /></>} />
        <Route path="/login" element={<><Navbar /><LoginPage /></>} />
        <Route path="/register" element={<><Navbar /><RegisterPage /></>} />
        <Route path="/worker-register" element={<><Navbar /><WorkerRegister /></>} />
        <Route path="/ai-chat" element={<Navigate to="/customer/ai-chat" replace />} />
        <Route path="/chat" element={<Navigate to="/customer/ai-chat" replace />} />
        <Route path="/ai-diagnosis" element={<Navigate to="/customer/ai-diagnosis" replace />} />

        <Route path="/customer" element={<DashboardLayout panel="customer" />}>
          <Route index element={<CustomerDashboard />} />

          {/* Primary top-nav destinations */}
          <Route path="services" element={<BrowseServices />} />
          <Route path="events" element={<EventsHub />} />
          <Route path="emergency" element={<EmergencyHub />} />

          {/* General Services hub + sub-category pages */}
          <Route path="general-services" element={<GeneralServicesPage />} />
          <Route path="general-services/repair-services" element={<HomeRepairsHub />} />
          <Route path="general-services/cleaning-services" element={<CleaningHygieneHub />} />

          {/* General Services category pages (existing routes preserved) */}
          <Route path="travel-commute" element={<TravelCommuteHub />} />
          <Route path="food-kitchen" element={<FoodKitchenHub />} />
          <Route path="pet-services" element={<PetHub />} />
          <Route path="health-wellness" element={<HealthWellnessHub />} />
          <Route path="society-management" element={<SocietyManagementHub />} />
          <Route path="relocation" element={<RelocationHub />} />

          {/* Legacy category routes under services */}
          <Route path="services/home-repairs" element={<HomeRepairsHub />} />
          <Route path="services/vehicle-services" element={<VehicleServicesHub />} />
          <Route path="services/cleaning" element={<CleaningHygieneHub />} />
          <Route path="services/furniture-decor" element={<FurnitureDecorHub />} />
          <Route path="services/garden-outdoor" element={<GardenOutdoorHub />} />
          <Route path="services/:category" element={<CategoryHub />} />
          <Route path="services/:category/:serviceId" element={<ServiceDetail />} />

          {/* Account & tools */}
          <Route path="my-home" element={<MyHomeDashboard />} />
          <Route path="trust-safety" element={<TrustSafety />} />
          <Route path="book" element={<BookingFlow />} />
          <Route path="bookings" element={<BookingHistory />} />
          <Route path="wallet" element={<CustomerWallet />} />
          <Route path="subscriptions" element={<CustomerSubscriptions />} />
          <Route path="reviews" element={<CustomerReviews />} />
          <Route path="ai-diagnosis" element={<AISmartDiagnosis />} />
          <Route path="ai-chat" element={<CustomerAIChat />} />
          <Route path="homefixr" element={<HomeFixrWarranty />} />
          <Route path="video-consultation" element={<VideoConsultation />} />
          <Route path="group-booking" element={<GroupBooking />} />
          <Route path="live-tracking" element={<LiveTracking />} />
          <Route path="review/:bookingId" element={<PostServiceReview />} />
          <Route path="ordered-services" element={<OrderedServices />} />
          <Route path="verify-worker" element={<SecureWorkerVerification />} />

          {/* Demo & premium flows */}
          <Route path="packers-demo" element={<PackersDemo />} />
          <Route path="pet-demo" element={<PetRelocationDemo />} />
          <Route path="vehicle-demo" element={<VehicleRelocationDemo />} />
          <Route path="health-demo" element={<HealthWellnessDemo />} />
          <Route path="pet-flow" element={<PetPremiumFlow />} />
          <Route path="food-flow" element={<FoodPremiumFlow />} />
          <Route path="travel-flow" element={<TravelPremiumFlow />} />
          <Route path="society-flow" element={<SocietyPremiumFlow />} />
        </Route>

        <Route path="/worker" element={<DashboardLayout panel="worker" />}>
          <Route index element={<WorkerDashboard />} />
          <Route path="jobs" element={<WorkerJobs />} />
          <Route path="schedule" element={<WorkerSchedule />} />
          <Route path="earnings" element={<WorkerEarnings />} />
          <Route path="training" element={<WorkerTraining />} />
          <Route path="profile" element={<WorkerProfile />} />
          <Route path="become-a-pro" element={<BecomeAProHub />} />
        </Route>

        <Route path="/admin" element={<DashboardLayout panel="admin" />}>
          <Route index element={<AdminDashboard />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="workers" element={<WorkerVerification />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="complaints" element={<AdminComplaints />} />
          <Route path="partners" element={<AdminPartners />} />
          <Route path="notifications" element={<AdminNotifications />} />
          <Route path="b2b" element={<B2BDashboard />} />
          <Route path="b2b/booking" element={<B2BBooking />} />
          <Route path="b2b/contracts" element={<B2BContracts />} />
          <Route path="b2b/locations" element={<B2BLocations />} />
          <Route path="b2b/team" element={<B2BTeam />} />
          <Route path="b2b/invoices" element={<B2BInvoices />} />
        </Route>

        <Route path="/b2b" element={<DashboardLayout panel="b2b" />}>
          <Route index element={<B2BClientDashboard />} />
          <Route path="services" element={<B2BClientServices />} />
          <Route path="contracts" element={<B2BClientContracts />} />
          <Route path="locations" element={<B2BClientLocations />} />
          <Route path="team" element={<B2BTeam />} />
          <Route path="invoices" element={<B2BClientInvoices />} />
          <Route path="history" element={<B2BClientHistory />} />
          <Route path="support" element={<B2BClientSupport />} />
        </Route>

        {/* Public QR Code Verification Routes */}
        <Route path="/verify-worker" element={<SecureWorkerVerification />} />
        <Route path="/verify/worker/:workerIdCode" element={<SecureWorkerVerification />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
