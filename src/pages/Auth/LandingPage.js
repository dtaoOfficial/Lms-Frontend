import React, { useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from "framer-motion";
import { Typewriter } from "react-simple-typewriter";
import ThemeToggle from "../../components/ThemeToggle";
// --- FIX: Correct icon names ---
import { BookOpen, Zap, Users, BarChart, Sun, Moon } from "lucide-react"; 
import ScrollAnimation from "../../components/ScrollAnimation";
import { useTheme } from "../../context/ThemeContext";

// --- IMPORTS for Images ---
import courseImage1 from '../../assets/course_images/gradient-1.png';
import courseImage2 from '../../assets/course_images/gradient-2.png';
import courseImage3 from '../../assets/course_images/gradient-3.png';
import courseImage4 from '../../assets/course_images/gradient-4.png';
import courseImage5 from '../../assets/course_images/gradient-5.png';
import courseImage6 from '../../assets/course_images/gradient-6.png';
// ------------------------------

// --- Mock Data for Courses (Unchanged) ---
const courses = [
  { title: "React Deep Dive", img: courseImage1 },
  { title: "Node.js Masterclass", img: courseImage2 },
  { title: "Tailwind CSS from Scratch", img: courseImage3 },
  { title: "JavaScript Algorithms", img: courseImage4 },
  { title: "DevOps Fundamentals", img: courseImage5 },
  { title: "AI for Developers", img: courseImage6 },
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

// --- 1. Header Component (Unchanged) ---
const Header = () => (
  <motion.nav 
    variants={itemVariants}
    className="absolute top-0 left-0 right-0 z-50"
  >
    <div className="flex h-20 items-center justify-between max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex-shrink-0">
        <Link to="/" className="text-2xl font-extrabold text-accent">
          DTAO
        </Link>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        {/* --- FIX: Show full toggle on desktop, simple toggle on mobile --- */}
        <div className="hidden sm:block">
          <ThemeToggle />
        </div>
        <div className="sm:hidden">
          <MobileThemeToggle />
        </div>
        {/* ----------------------------------------------------------------- */}

        <Link
          to="/login"
          className="px-3 py-1.5 text-sm font-medium text-text-primary rounded-md hover:bg-white/10 transition-colors"
        >
          Login
        </Link>
        <Link
          to="/register"
          className="px-3 py-1.5 bg-accent text-white rounded-md text-sm font-medium hover:bg-accent/90 transition-opacity"
        >
          Register
        </Link>
      </div>
    </div>
  </motion.nav>
);

// --- 2. Hero Section (Unchanged) ---
const HeroSection = ({ navigate }) => (
  <motion.section 
    className="relative flex flex-col items-center justify-center min-h-[80vh] text-center px-4 overflow-hidden pt-24"
  >
    {/* Animated Grid Pattern Background */}
    <GridPattern />

    {/* Hero Content */}
    <div className="relative z-10 flex flex-col items-center">
      <h1 className="text-4xl font-bold tracking-tight text-text-primary sm:text-6xl lg:text-7xl">
        <Typewriter
          words={["Welcome to DTAO Learning"]}
          loop={1}
          cursor
          cursorStyle="_"
          typeSpeed={70}
          deleteSpeed={50}
          delaySpeed={1000}
        />
      </h1>
      <p className="mt-6 text-lg leading-8 text-text-secondary max-w-2xl mx-auto">
        Unlock your potential with our expert-led courses. From coding to design,
        your journey to mastery starts here.
      </p>
      <div className="mt-10">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/login")}
          className="rounded-md bg-accent px-5 py-3 text-base font-semibold text-white shadow-lg hover:bg-accent/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Get Started
        </motion.button>
      </div>
    </div>
  </motion.section>
);

// --- 3. Course Section (Unchanged) ---
const CourseSection = ({ navigate }) => (
  <motion.section className="py-20 px-4 max-w-7xl mx-auto">
    <h2 className="text-3xl font-bold text-center text-text-primary mb-12">
      Explore Our Courses
    </h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {courses.map((course, index) => (
        <CourseCard key={index} course={course} navigate={navigate} />
      ))}
    </div>
  </motion.section>
);

// --- 3D TILT CARD with Image Fallback (Unchanged) ---
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
      className="relative bg-secondary rounded-xl shadow-lg overflow-hidden border border-white/10
                 transition-all duration-300 ease-out
                 hover:shadow-xl hover:border-accent"
    >
      <motion.div
        className="absolute inset-0 rounded-xl pointer-events-none"
        style={{
          background: "radial-gradient(400px circle at var(--x) var(--y), rgba(var(--color-accent), 0.3), transparent 80%)",
        }}
        animate={{
          "--x": mouseXSpring,
          "--y": mouseYSpring,
        }}
        transition={{ duration: 0 }}
      />

      <div className="relative" style={{ transform: "translateZ(20px)", transformStyle: "preserve-3d" }}>
        {imageError || !course.img ? (
          <div className="h-40 w-full flex items-center justify-center p-4 text-center">
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

// --- 4. Features Bento Grid (Unchanged) ---
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

// --- 5. Footer Component (FIXED) ---
const Footer = () => (
  <motion.footer className="bg-secondary border-t border-white/10 mt-20">
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8">
      <div>
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Company</h3>
        <ul className="mt-4 space-y-2">
          <li><Link to="#" className="text-base text-text-primary hover:text-accent">About</Link></li>
          <li><Link to="#" className="text-base text-text-primary hover:text-accent">Careers</Link></li>
          <li><Link to="#" className="text-base text-text-primary hover:text-accent">Press</Link></li>
        </ul>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Learn</h3>
        <ul className="mt-4 space-y-2">
          <li><Link to="#" className="text-base text-text-primary hover:text-accent">Features</Link></li>
          <li><Link to="#" className="text-base text-text-primary hover:text-accent">Courses</Link></li>
          <li><Link to="#" className="text-base text-text-primary hover:text-accent">Pricing</Link></li>
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
        &copy; {new Date().getFullYear()} DTAO Official. All rights reserved.
      </p> {/* <-- SYNTAX FIX */}
    </div>
  </motion.footer>
);

// --- Grid Pattern Component (Unchanged) ---
const GridPattern = () => {
  return (
    <motion.div
      className="absolute inset-0 z-0 h-full w-full"
      style={{
        backgroundImage:
          "radial-gradient(circle, rgba(var(--color-accent), 0.1) 1px, transparent 1.5px)",
        backgroundSize: "30px 30px",
      }}
      animate={{
        backgroundPosition: ["0% 0%", "100% 100%"],
      }}
      transition={{
        duration: 30,
        ease: "linear",
        repeat: Infinity,
        repeatType: "mirror",
      }}
    />
  );
};

// --- NEW Mobile Theme Toggle (FIXED) ---
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
            <Sun className="h-5 w-5" /> {/* <-- ICON NAME FIX */}
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ y: 20, opacity: 0, scale: 0.5, rotate: 90 }}
            animate={{ y: 0, opacity: 1, scale: 1, rotate: 0 }}
            exit={{ y: -20, opacity: 0, scale: 0.5, rotate: -90 }}
            transition={{ duration: 0.2 }}
          >
            <Moon className="h-5 w-5" /> {/* <-- ICON NAME FIX */}
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
};


export default LandingPage;