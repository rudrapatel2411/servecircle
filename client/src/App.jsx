import { BrowserRouter, Routes, Route } from 'react-router-dom';

/* Layouts */
import Navbar from './components/Navbar';
import DashboardLayout from './components/DashboardLayout';

/* Public */
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ImpactDetail from './pages/ImpactDetail';

/* Customer */
import CustomerDashboard from './pages/customer/CustomerDashboard';
import BrowseServices from './pages/customer/BrowseServices';
import GeneralServicesPage from './pages/customer/GeneralServicesPage';
import RepairServicesComingSoon from './pages/customer/RepairServicesComingSoon';
import CleaningServicesComingSoon from './pages/customer/CleaningServicesComingSoon';
import CategoryHub from './pages/customer/CategoryHub';
import ServiceDetail from './pages/customer/ServiceDetail';
import EmergencyHub from './pages/customer/EmergencyHub';
import EventsHub from './pages/customer/EventsHub';
import MyHomeDashboard from './pages/customer/MyHomeDashboard';
import TrustSafety from './pages/customer/TrustSafety';
import BookingFlow from './pages/customer/BookingFlow';
import BookingHistory from './pages/customer/BookingHistory';
import CustomerWallet from './pages/customer/CustomerWallet';
import CustomerSubscriptions from './pages/customer/CustomerSubscriptions';
import CustomerReviews from './pages/customer/CustomerReviews';
import AISmartDiagnosis from './pages/customer/AISmartDiagnosis';
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

/* B2B */
import B2BDashboard from './pages/b2b/B2BDashboard';
import B2BBooking from './pages/b2b/B2BBooking';
import B2BContracts from './pages/b2b/B2BContracts';
import B2BLocations from './pages/b2b/B2BLocations';
import B2BTeam from './pages/b2b/B2BTeam';
import B2BInvoices from './pages/b2b/B2BInvoices';

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<><Navbar /><LandingPage /></>} />
        <Route path="/about/:id" element={<><Navbar /><ImpactDetail /></>} />
        <Route path="/login" element={<><Navbar /><LoginPage /></>} />
        <Route path="/register" element={<><Navbar /><RegisterPage /></>} />

        <Route path="/customer" element={<DashboardLayout panel="customer" />}>
          <Route index element={<CustomerDashboard />} />

          {/* Primary top-nav destinations */}
          <Route path="services" element={<BrowseServices />} />
          <Route path="events" element={<EventsHub />} />
          <Route path="emergency" element={<EmergencyHub />} />

          {/* General Services hub + Coming Soon placeholders */}
          <Route path="general-services" element={<GeneralServicesPage />} />
          <Route path="general-services/repair-services" element={<RepairServicesComingSoon />} />
          <Route path="general-services/cleaning-services" element={<CleaningServicesComingSoon />} />

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
          <Route path="homefixr" element={<HomeFixrWarranty />} />
          <Route path="video-consultation" element={<VideoConsultation />} />
          <Route path="group-booking" element={<GroupBooking />} />
          <Route path="live-tracking" element={<LiveTracking />} />
          <Route path="review/:bookingId" element={<PostServiceReview />} />

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
        </Route>

        <Route path="/b2b" element={<DashboardLayout panel="b2b" />}>
          <Route index element={<B2BDashboard />} />
          <Route path="booking" element={<B2BBooking />} />
          <Route path="contracts" element={<B2BContracts />} />
          <Route path="locations" element={<B2BLocations />} />
          <Route path="team" element={<B2BTeam />} />
          <Route path="invoices" element={<B2BInvoices />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
