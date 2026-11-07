import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Overview from "./components/Overview";
import PlayerList from "./components/PlayerList";
import CountriesPage from "./pages/CountriesPage";
import ClubsPage from "./pages/ClubsPage";
import LeaguePage from "./pages/LeaguePage";
import VotingPage from "./pages/VotingPage";


const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap";

const Page = ({ children }) => (
  <div className="mx-auto w-full max-w-7xl px-6 py-8">
    {children}
  </div>
);

export default function App() {
  useEffect(() => {
    if (document.querySelector(`link[href="${FONT_HREF}"]`)) return;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = FONT_HREF;
    document.head.appendChild(link);
  }, []);

  return (
    <div className="min-h-screen bg-[#070d19] font-['Inter',ui-sans-serif,system-ui,sans-serif] text-slate-200 antialiased selection:bg-blue-500 selection:text-white">
      {/* GLOBAL NAVBAR */}
      <Navbar />

      {/* ROUTE CONTENT */}
      <main className="w-full">
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/players" element={<PlayerList />} />
          <Route path="/league/:leagueName" element={<LeaguePage />} />
          <Route path="/voting" element={<VotingPage />} />
          
          <Route
            path="/countries"
            element={
              <Page>
                <CountriesPage />
              </Page>
            }
          />
          <Route
            path="/clubs"
            element={
              <Page>
                <ClubsPage />
              </Page>
            }
          />
        </Routes>
      </main>
    </div>
  );
}