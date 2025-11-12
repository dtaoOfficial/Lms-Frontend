// src/pages/Auth/LandingPage.js
import React, { useRef, useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from "framer-motion";
import { Typewriter } from "react-simple-typewriter";
import ThemeToggle from "../../components/ThemeToggle";
import { BookOpen, Zap, Users, BarChart, Sun, Moon } from "lucide-react";
import ScrollAnimation from "../../components/ScrollAnimation";
import { useTheme } from "../../context/ThemeContext";

// --- IMPORTS for Images ---
import courseImage1 from '../../assets/course_images/gradient-1.png';
import courseImage2 from '../../assets/course_images/gradient-2.png';
import courseImage3 from '../../assets/course_images/gradient-3.png';

// ------------------------------

// --- College Hero Slider Images ---
const collegeImages = [
  "https://res.cloudinary.com/duhki4wze/image/upload/v1762918121/WhatsApp_Image_2025-11-12_at_08.55.04_40e7c2c9_a25oub.jpg",
  "https://res.cloudinary.com/duhki4wze/image/upload/v1762918122/WhatsApp_Image_2025-11-12_at_08.54.53_c0451f1e_sog7f6.jpg",
  "https://res.cloudinary.com/duhki4wze/image/upload/v1762918121/WhatsApp_Image_2025-11-12_at_08.55.04_40e7c2c9_a25oub.jpg",
  "https://res.cloudinary.com/duhki4wze/image/upload/v1762918120/WhatsApp_Image_2025-11-12_at_08.54.56_187ebecd_drf9gg.jpg"
];

// --- Mock Data for Courses (Unchanged) ---
const courses = [
  { title: "B.Sc – Computer Science", img: courseImage1 },
  { title: "B.Com – Computer Applications", img: courseImage2 },
  { title: "B.Sc – Food Science & Technology", img: courseImage3 }
  
];

// --- Page Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// --- Main Page Component ---
function LandingPage() {
  const navigate = useNavigate();

  return (
    <motion.div
      className="flex flex-col min-h-screen bg-background text-text-primary overflow-x-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0 }}
    >
      <Header />
      
      <main>
        <ScrollAnimation>
          <HeroSection navigate={navigate} />
        </ScrollAnimation>
        <ScrollAnimation>
          <CourseSection navigate={navigate} />
        </ScrollAnimation>
        <ScrollAnimation>
          <FeaturesSection />
        </ScrollAnimation>
      </main>

      <ScrollAnimation>
        <Footer />
      </ScrollAnimation>
    </motion.div>
  );
}

/* ============================
   Header with College Info
   ============================ */
const Header = () => (
  <>
    {/* Top Red Bar */}
    <div className="bg-red-600 text-white text-sm py-2 px-4 flex justify-between items-center">
      <div>📞 9490006663</div>
      <div>📧 directorvrrcollege@gmail.com</div>
    </div>

    {/* Main Header */}
    <motion.nav variants={itemVariants} className="bg-white shadow-md relative z-50">
      <div className="flex justify-between items-center max-w-7xl mx-auto py-3 px-6">
        <div className="flex items-center gap-3">
          <img
            src="https://res.cloudinary.com/duhki4wze/image/upload/v1740047548/j7ustpcoxthwres98ftt.png"
            alt="VRR Logo"
            className="w-12 h-12"
          />
          <div>
            <h1 className="text-lg sm:text-2xl font-bold text-accent">VRR Degree College</h1>
            <p className="text-xs text-gray-600">Kallur, Andhra Pradesh</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="text-accent font-medium hover:underline"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="bg-accent text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-accent/90 transition"
          >
            Register
          </Link>
        </div>
      </div>
    </motion.nav>
  </>
);

/* ============================
   Hero Section with Auto Slider
   ============================ */
const HeroSection = ({ navigate }) => {
  const [index, setIndex] = useState(0);

  // Auto-slide every 4s
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % collegeImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full h-[80vh] overflow-hidden flex flex-col justify-center items-center text-center">
      {/* Slider Images */}
      {collegeImages.map((img, i) => (
        <motion.img
          key={i}
          src={img}
          alt={`College Slide ${i + 1}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: i === index ? 1 : 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ))}

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Content */}
      <div className="relative z-10 text-white px-4">
        <img
          src="https://res.cloudinary.com/duhki4wze/image/upload/v1740047548/j7ustpcoxthwres98ftt.png"
          alt="VRR College Logo"
          className="mx-auto w-24 h-24 mb-4 rounded-full bg-white/80 p-2"
        />
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold">VRR Degree College</h1>
        <p className="mt-2 text-base sm:text-lg">Kallur, 517113, Andhra Pradesh</p>
        <p className="mt-1 text-sm opacity-90">📞 9490006663</p>
        <p className="mt-1 text-sm opacity-90">🎓 Affiliated Programs</p>

        <ul className="mt-3 space-y-1 text-sm sm:text-base">
          <li>B.Sc – Computer Science</li>
          <li>B.Com – Computer Applications</li>
          <li>B.Sc – Food Science & Technology</li>
        </ul>

        <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
          <button
            onClick={() => navigate("/login")}
            className="bg-accent text-white px-5 py-2 rounded-lg shadow hover:bg-accent/90 transition"
          >
            Login
          </button>
          <button
            onClick={() => navigate("/register")}
            className="bg-white text-accent px-5 py-2 rounded-lg shadow hover:bg-gray-100 transition"
          >
            Register
          </button>
        </div>
      </div>

      {/* Manual Navigation Buttons */}
      <div className="absolute bottom-6 flex gap-3">
        {collegeImages.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Slide ${i + 1}`}
            className={`w-3 h-3 rounded-full ${i === index ? "bg-white" : "bg-white/40"}`}
          ></button>
        ))}
      </div>
    </section>
  );
};

/* ============================
   Course Section
   ============================ */
const CourseSection = ({ navigate }) => (
  <motion.section className="py-12 md:py-20 px-4 max-w-7xl mx-auto">
    <h2 className="text-3xl font-bold text-center text-text-primary mb-8">
      Explore Our Courses
    </h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {courses.map((course, index) => (
        <CourseCard key={index} course={course} navigate={navigate} />
      ))}
    </div>
  </motion.section>
);

/* ============================
   CourseCard (3D tilt)
   ============================ */
const CourseCard = ({ course, navigate }) => {
  const cardRef = useRef(null);
  const [imageError, setImageError] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);
  const scale = useTransform(mouseYSpring, [-0.5, 0.5], [1.02, 1.02]);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    const mouseX = e.clientX - left;
    const mouseY = e.clientY - top;
    const normX = (mouseX / width) - 0.5;
    const normY = (mouseY / height) - 0.5;
    x.set(normX);
    y.set(normY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const handleError = () => {
    setImageError(true);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        scale,
        transformStyle: "preserve-3d",
        perspective: 1000,
      }}
      className="relative bg-secondary rounded-xl shadow-lg overflow-hidden border border-white/10 transition-all duration-300 ease-out hover:shadow-xl hover:border-accent"
    >
      <motion.div
        className="absolute inset-0 rounded-xl pointer-events-none"
        style={{
          background: "radial-gradient(400px circle at var(--x) var(--y), rgba(var(--color-accent), 0.08), transparent 80%)",
        }}
        animate={{
          "--x": mouseXSpring,
          "--y": mouseYSpring,
        }}
        transition={{ duration: 0 }}
      />

      <div className="relative" style={{ transform: "translateZ(20px)", transformStyle: "preserve-3d" }}>
        {imageError || !course.img ? (
          <div className="h-40 w-full flex items-center justify-center p-4 text-center relative">
             <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-80" />
             <p className="relative z-10 text-white text-xl font-bold">{course.title}</p>
          </div>
        ) : (
          <img
            className="h-40 w-full object-cover"
            src={course.img}
            alt={course.title}
            onError={handleError}
          />
        )}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-text-primary mb-2">{course.title}</h3>
          <button
            onClick={() => navigate("/register")}
            className="mt-4 w-full rounded-md bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-accent/90 transition-colors"
          >
            Enroll Now
          </button>
        </div>
      </div>
    </motion.div>
  );
};

/* ============================
   Features Section
   ============================ */
const FeaturesSection = () => (
  <motion.section className="py-20 px-4 max-w-7xl mx-auto">
    <h2 className="text-3xl font-bold text-center text-text-primary mb-12">
      Why Choose DTAO?
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <FeatureCard
        icon={<BookOpen className="w-8 h-8" />}
        title="Expert-Led Courses"
        description="Learn from industry professionals with real-world experience."
        className="md:col-span-1"
      />
      <FeatureCard
        icon={<Zap className="w-8 h-8" />}
        title="Gamified Learning"
        description="Earn XP, level up, and compete on leaderboards to stay motivated."
        className="md:col-span-2"
      />
      <FeatureCard
        icon={<Users className="w-8 h-8" />}
        title="Community Forums"
        description="Connect with peers, ask questions, and collaborate on projects."
        className="md:col-span-2"
      />
      <FeatureCard
        icon={<BarChart className="w-8 h-8" />}
        title="Track Your Progress"
        description="Visualize your learning journey with detailed analytics."
        className="md:col-span-1"
      />
    </div>
  </motion.section>
);

const FeatureCard = ({ icon, title, description, className }) => (
  <motion.div
    whileHover={{ scale: 1.03 }}
    className={`bg-secondary p-6 rounded-lg shadow-lg border border-white/10 ${className}`}
  >
    <div className="text-accent mb-4">{icon}</div>
    <h3 className="text-xl font-semibold text-text-primary mb-2">{title}</h3>
    <p className="text-text-secondary">{description}</p>
  </motion.div>
);

/* ============================
   Footer
   ============================ */
const Footer = () => (
  <motion.footer className="bg-secondary border-t border-white/10 mt-20">
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8">
      <div>
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">College</h3>
        <ul className="mt-4 space-y-2">
          <li><Link to="#" className="text-base text-text-primary hover:text-accent">About</Link></li>
          <li><Link to="#" className="text-base text-text-primary hover:text-accent">Admissions</Link></li>
          <li><Link to="#" className="text-base text-text-primary hover:text-accent">Departments</Link></li>
        </ul>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Learn</h3>
        <ul className="mt-4 space-y-2">
          <li><Link to="#" className="text-base text-text-primary hover:text-accent">Courses</Link></li>
          <li><Link to="#" className="text-base text-text-primary hover:text-accent">Events</Link></li>
          <li><Link to="#" className="text-base text-text-primary hover:text-accent">Workshops</Link></li>
        </ul>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Legal</h3>
        <ul className="mt-4 space-y-2">
          <li><Link to="#" className="text-base text-text-primary hover:text-accent">Privacy Policy</Link></li>
          <li><Link to="#" className="text-base text-text-primary hover:text-accent">Terms of Service</Link></li>
        </ul>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Connect</h3>
        <ul className="mt-4 space-y-2">
          <li><Link to="#" className="text-base text-text-primary hover:text-accent">Contact</Link></li>
          <li><Link to="#" className="text-base text-text-primary hover:text-accent">Twitter</Link></li>
          <li><Link to="#" className="text-base text-text-primary hover:text-accent">LinkedIn</Link></li>
        </ul>
      </div>
    </div>
    <div className="border-t border-white/10 py-6 px-4 sm:px-6 lg:px-8">
      <p className="text-center text-sm text-text-secondary">
        &copy; {new Date().getFullYear()} VRR Degree College, Kallur. All rights reserved.
      </p>
    </div>
  </motion.footer>
);

/* ============================
   Mobile Theme Toggle
   ============================ */
const MobileThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <button
      onClick={toggleTheme}
      className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-secondary/70 text-text-primary transition-colors hover:text-accent"
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      <AnimatePresence mode="wait" initial={false}>
        {theme === 'light' ? (
          <motion.div
            key="sun"
            initial={{ y: -20, opacity: 0, scale: 0.5, rotate: -90 }}
            animate={{ y: 0, opacity: 1, scale: 1, rotate: 0 }}
            exit={{ y: 20, opacity: 0, scale: 0.5, rotate: 90 }}
            transition={{ duration: 0.2 }}
          >
            <Sun className="h-5 w-5" />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ y: 20, opacity: 0, scale: 0.5, rotate: 90 }}
            animate={{ y: 0, opacity: 1, scale: 1, rotate: 0 }}
            exit={{ y: -20, opacity: 0, scale: 0.5, rotate: -90 }}
            transition={{ duration: 0.2 }}
          >
            <Moon className="h-5 w-5" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
};

export default LandingPage;
