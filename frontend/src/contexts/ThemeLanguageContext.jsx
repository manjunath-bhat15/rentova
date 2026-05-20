import { createContext, useContext, useState, useEffect } from 'react';

const ThemeLanguageContext = createContext();

const translations = {
  en: {
    // Auth
    loginTitle: "Welcome back",
    loginSubtitle: "Sign in to your Rentova account",
    emailLabel: "Email Address",
    passwordLabel: "Password",
    loginBtn: "Sign In",
    noAccount: "Don't have an account?",
    registerLink: "Create one",
    registerTitle: "Create account",
    registerSubtitle: "Join Rentova and start managing rentals",
    fullNameLabel: "Full Name",
    regEmailLabel: "Email",
    regPasswordLabel: "Password",
    regPasswordPlaceholder: "Min. 6 characters",
    roleLabel: "Register As",
    customerOption: "Customer — I want to book services",
    vendorOption: "Vendor — I offer services",
    createBtn: "Create Account",
    verifyTitle: "Verify Email",
    verifySubtitle: "We sent an OTP to",
    otpLabel: "Enter 6-digit OTP",
    verifyBtn: "Verify & Login",
    haveAccount: "Already have an account?",
    loginLink: "Sign in",
    loading: "Please wait...",

    // Navigation and Page Titles
    overview: "Overview",
    myListings: "My Listings",
    addListing: "Add Listing",
    myBookings: "My Bookings",
    wallet: "Wallet",
    messages: "Messages",
    nearbyVendors: "Nearby Vendors",
    notifications: "Notifications",
    commandCenter: "Admin Command Center",
    users: "User Management",
    adminWorkspace: "Admin Workspace",
    vendorWorkspace: "Vendor Workspace",
    customerWorkspace: "Customer Workspace",
    online: "Live",
    offline: "Offline",
    logout: "Logout",

    // Overview Page
    vendorOps: "Vendor operations",
    custDashboard: "Customer dashboard",
    welcome: "Welcome",
    activeBookings: "Active bookings",
    revenue: "Revenue",
    walletBalance: "Wallet balance",
    recentBookings: "Recent bookings",
    latestActivity: "Latest operational activity",
    openAll: "Open all",
    noBookings: "No bookings yet",
    vendorEmptyDesc: "Create a listing to start receiving orders.",
    custEmptyDesc: "Browse nearby services to create your first booking.",
    nearbyInventory: "Nearby inventory",
    freshServices: "Fresh services around your current location",
    mapView: "Map view",
    noNearbyListings: "No nearby listings yet",
    allowLocationDesc: "Allow location access or expand your radius in the Nearby Vendors tab.",
    newNearbyListing: "New nearby listing",
    view: "View",
    dismiss: "Dismiss",
    findNearby: "Find Nearby",

    // Statuses
    statusPending: "Pending",
    statusConfirmed: "Confirmed",
    statusInProgress: "In Progress",
    statusCompleted: "Completed",
    statusCancelled: "Cancelled",

    // Units
    unitHr: "/hr",
    unitDay: "/day",
    unitPc: "/pc",
    unitSession: "/session",

    // Cards
    inactive: "Inactive",
    noDesc: "No description provided.",
    bookNow: "Book Now",
    edit: "Edit",
    details: "Details →",

    // Map Panel
    noMapCoords: "No map coordinates yet",
    addGpsCoords: "Add GPS coordinates to show this location on the map.",

    // Wallet Page
    availableBalance: "Available Balance",
    topUp: "Top Up",
    quickAmount: "Quick top-up options",
    addFunds: "Add Funds",
    recentTransactions: "Recent Transactions",
    noTransactions: "No transactions yet",
    minTopUp: "Minimum top-up is ₹1.00",
    topUpSuccess: "Top-up success!",
    topUpFailed: "Top-up failed. Please try again."
  },
  kn: {
    // Auth
    loginTitle: "ಸುಸ್ವಾಗತ",
    loginSubtitle: "ನಿಮ್ಮ ರೆಂಟೋವಾ ಖಾತೆಗೆ ಲಾಗಿನ್ ಮಾಡಿ",
    emailLabel: "ಇಮೇಲ್ ವಿಳಾಸ",
    passwordLabel: "ಪಾಸ್‌ವರ್ಡ್",
    loginBtn: "ಲಾಗಿನ್ ಮಾಡಿ",
    noAccount: "ಖಾತೆ ಹೊಂದಿಲ್ಲವೇ?",
    registerLink: "ಹೊಸ ಖಾತೆ ತೆರೆಯಿರಿ",
    registerTitle: "ಖಾತೆ ತೆರೆಯಿರಿ",
    registerSubtitle: "ರೆಂಟೋವಾ ಸೇರಿ ಮತ್ತು ಬಾಡಿಗೆ ವ್ಯವಹಾರ ನಿರ್ವಹಿಸಿ",
    fullNameLabel: "ಪೂರ್ಣ ಹೆಸರು",
    regEmailLabel: "ಇಮೇಲ್",
    regPasswordLabel: "ಪಾಸ್‌ವರ್ಡ್",
    regPasswordPlaceholder: "ಕನಿಷ್ಠ ೬ ಅಕ್ಷರಗಳು",
    roleLabel: "ನೋಂದಣಿ ವಿಧಾನ",
    customerOption: "ಗ್ರಾಹಕರು — ಸೇವೆಗಳನ್ನು ಬುಕ್ ಮಾಡಲು",
    vendorOption: "ವ್ಯಾಪಾರಿ — ಸೇವೆಗಳನ್ನು ನೀಡಲು",
    createBtn: "ಖಾತೆ ರಚಿಸಿ",
    verifyTitle: "ಇಮೇಲ್ ದೃಢೀಕರಿಸಿ",
    verifySubtitle: "ನಾವು ಒಟಿಪಿಯನ್ನು ಕಳುಹಿಸಿದ್ದೇವೆ",
    otpLabel: "೬-ಅಂಕಿಯ ಒಟಿಪಿ ನಮೂದಿಸಿ",
    verifyBtn: "ದೃಢೀಕರಿಸಿ ಮತ್ತು ಲಾಗಿನ್ ಮಾಡಿ",
    haveAccount: "ಈಗಾಗಲೇ ಖಾತೆ ಹೊಂದಿದ್ದೀರಾ?",
    loginLink: "ಸೈನ್ ಇನ್ ಮಾಡಿ",
    loading: "ದಯವಿಟ್ಟು ನಿರೀಕ್ಷಿಸಿ...",

    // Navigation and Page Titles
    overview: "ಅವಲೋಕನ",
    myListings: "ನನ್ನ ಸೇವೆಗಳು",
    addListing: "ಹೊಸ ಸೇವೆ ಸೇರಿಸಿ",
    myBookings: "ನನ್ನ ಬುಕಿಂಗ್ಸ್",
    wallet: "ವ್ಯಾಲೆಟ್",
    messages: "ಸಂದೇಶಗಳು",
    nearbyVendors: "ಹತ್ತಿರದ ವ್ಯಾಪಾರಿಗಳು",
    notifications: "ಸೂಚನೆಗಳು",
    commandCenter: "ಅಡ್ಮಿನ್ ನಿಯಂತ್ರಣ ಕೇಂದ್ರ",
    users: "ಬಳಕೆದಾರರ ನಿರ್ವಹಣೆ",
    adminWorkspace: "ಅಡ್ಮಿನ್ ಕಾರ್ಯಸ್ಥಳ",
    vendorWorkspace: "ವ್ಯಾಪಾರಿ ಕಾರ್ಯಸ್ಥಳ",
    customerWorkspace: "ಗ್ರಾಹಕರ ಕಾರ್ಯಸ್ಥಳ",
    online: "ಆನ್‌ಲೈನ್",
    offline: "ಆಫ್‌ಲೈನ್",
    logout: "ಲಾಗ್‌ಔಟ್",

    // Overview Page
    vendorOps: "ವ್ಯಾಪಾರಿ ಕಾರ್ಯಾಚರಣೆಗಳು",
    custDashboard: "ಗ್ರಾಹಕರ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    welcome: "ಸುಸ್ವಾಗತ",
    activeBookings: "ಸಕ್ರಿಯ ಬುಕಿಂಗ್ಸ್",
    revenue: "ಒಟ್ಟು ಆದಾಯ",
    walletBalance: "ವ್ಯಾಲೆಟ್ ಬಾಕಿ",
    recentBookings: "ಇತ್ತೀಚಿನ ಬುಕಿಂಗ್ಸ್",
    latestActivity: "ಇತ್ತೀಚಿನ ಕಾರ್ಯಾಚರಣೆಗಳು",
    openAll: "ಎಲ್ಲವನ್ನೂ ವೀಕ್ಷಿಸಿ",
    noBookings: "ಯಾವುದೇ ಬುಕಿಂಗ್ ಇಲ್ಲ",
    vendorEmptyDesc: "ಆರ್ಡರ್ ಪಡೆಯಲು ಹೊಸ ಸೇವೆಯನ್ನು ಪ್ರಾರಂಭಿಸಿ.",
    custEmptyDesc: "ಬುಕಿಂಗ್ ಮಾಡಲು ಹತ್ತಿರದ ಸೇವೆಗಳನ್ನು ನೋಡಿ.",
    nearbyInventory: "ಹತ್ತಿರದ ಸೇವಾ ಲಭ್ಯತೆ",
    freshServices: "ನಿಮ್ಮ ಸ್ಥಳದ ಹತ್ತಿರ ಲಭ್ಯವಿರುವ ಸೇವೆಗಳು",
    mapView: "ನಕ್ಷೆ ವೀಕ್ಷಣೆ",
    noNearbyListings: "ಹತ್ತಿರದಲ್ಲಿ ಯಾವುದೇ ಸೇವೆಗಳು ಲಭ್ಯವಿಲ್ಲ",
    allowLocationDesc: "ಸ್ಥಳದ ಅನುಮತಿ ನೀಡಿ ಅಥವಾ ಹುಡುಕಾಟದ ವ್ಯಾಪ್ತಿಯನ್ನು ವಿಸ್ತರಿಸಿ.",
    newNearbyListing: "ಹತ್ತಿರದ ಹೊಸ ಸೇವೆ",
    view: "ವೀಕ್ಷಿಸಿ",
    dismiss: "ತಿರಸ್ಕರಿಸಿ",
    findNearby: "ಸೇವೆ ಹುಡುಕಿ",

    // Statuses
    statusPending: "ಬಾಕಿ ಇದೆ",
    statusConfirmed: "ಖಚಿತಪಡಿಸಲಾಗಿದೆ",
    statusInProgress: "ಪ್ರಗತಿಯಲ್ಲಿದೆ",
    statusCompleted: "ಪೂರ್ಣಗೊಂಡಿದೆ",
    statusCancelled: "ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ",

    // Units
    unitHr: "/ಗಂಟೆಗೆ",
    unitDay: "/ದಿನಕ್ಕೆ",
    unitPc: "/ನಂಬರ್",
    unitSession: "/ಅವಧಿಗೆ",

    // Cards
    inactive: "ನಿಷ್ಕ್ರಿಯ",
    noDesc: "ಯಾವುದೇ ವಿವರಣೆ ಒದಗಿಸಿಲ್ಲ.",
    bookNow: "ಬುಕ್ ಮಾಡಿ",
    edit: "ಸಂಪಾದಿಸಿ",
    details: "ವಿವರಗಳು →",

    // Map Panel
    noMapCoords: "ನಕ್ಷೆಯ ಜಿಪಿಎಸ್ ವಿವರಗಳಿಲ್ಲ",
    addGpsCoords: "ನಕ್ಷೆಯಲ್ಲಿ ತೋರಿಸಲು ಜಿಪಿಎಸ್ ವಿವರಗಳನ್ನು ಸೇರಿಸಿ.",

    // Wallet Page
    availableBalance: "ಲಭ್ಯವಿರುವ ಬಾಕಿ ಮೊತ್ತ",
    topUp: "ಹಣ ಸೇರಿಸಿ",
    quickAmount: "ತ್ವರಿತ ಸೇರ್ಪಡೆ ಆಯ್ಕೆಗಳು",
    addFunds: "ಹಣ ಸೇರಿಸಿ",
    recentTransactions: "ಇತ್ತೀಚಿನ ವಹಿವಾಟುಗಳು",
    noTransactions: "ಯಾವುದೇ ವಹಿವಾಟುಗಳು ಇನ್ನೂ ನಡೆದಿಲ್ಲ",
    minTopUp: "ಕನಿಷ್ಠ ₹1.00 ಹಣ ಸೇರಿಸಬೇಕು",
    topUpSuccess: "ಹಣ ಯಶಸ್ವಿಯಾಗಿ ಸೇರಿಸಲಾಗಿದೆ!",
    topUpFailed: "ಹಣ ಸೇರ್ಪಡೆ ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ."
  }
};

export function ThemeLanguageProvider({ children }) {
  // Temporarily locked to English and original Dark theme as requested
  const [lang] = useState('en');
  const [theme] = useState('light');

  useEffect(() => {
    // Keep document class locked to light mode (add light-theme)
    document.documentElement.classList.add('light-theme');
  }, []);

  const toggleLanguage = () => {
    // Temporarily disabled
  };

  const toggleTheme = () => {
    // Temporarily disabled
  };

  const t = (key) => {
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <ThemeLanguageContext.Provider value={{ lang, theme, toggleLanguage, toggleTheme, t }}>
      {children}
    </ThemeLanguageContext.Provider>
  );
}

export function useThemeLanguage() {
  const context = useContext(ThemeLanguageContext);
  if (!context) {
    throw new Error('useThemeLanguage must be used within a ThemeLanguageProvider');
  }
  return context;
}
