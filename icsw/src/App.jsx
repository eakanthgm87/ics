import { Link, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { ScrollToTop } from "./components/common";

import Home from "./pages/Home";
import About from "./pages/About";
import Academics from "./pages/Academics";
import LifeAtIcs from "./pages/LifeAtIcs";
import Gallery from "./pages/Gallery";
import Admissions from "./pages/Admissions";
import Contact from "./pages/Contact";
import FounderStory from "./pages/FounderStory";

function NotFound() {
  return (
    <section className="shell flex min-h-[60vh] flex-col items-center justify-center gap-5 py-20 text-center">
      <p className="eyebrow">Error 404</p>
      <h1 className="font-poppins text-4xl font-bold">
        We couldn&apos;t find that page
      </h1>
      <p className="max-w-[520px] font-arsenal text-base text-body">
        The page you are looking for may have moved. Head back to the homepage or
        get in touch with the campus office.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link to="/" className="btn btn-primary">
          Back to Home
        </Link>
        <Link to="/contact" className="btn btn-outline">
          Contact Us
        </Link>
      </div>
    </section>
  );
}

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/academics" element={<Academics />} />
          <Route path="/life-at-ics" element={<LifeAtIcs />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/admissions" element={<Admissions />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/founder-story" element={<FounderStory />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
