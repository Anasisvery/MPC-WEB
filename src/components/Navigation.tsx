import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Menu, X, ShieldAlert, LogOut, LayoutDashboard, Trophy, Users, Calendar, Award, FileText } from "lucide-react";

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  showAdmin: boolean;
  setShowAdmin: (show: boolean) => void;
}

export default function Navigation({ activeTab, setActiveTab, showAdmin, setShowAdmin }: NavigationProps) {
  const { settings, currentUser, logout } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "home", label: "Home", icon: Award },
    { id: "tournaments", label: "Tournaments", icon: Trophy },
    { id: "players", label: "Players", icon: Users },
    { id: "teams", label: "Teams", icon: Award },
    { id: "fixtures", label: "Fixtures", icon: Calendar },
    { id: "rankings", label: "Rankings", icon: Award },
    { id: "announcements", label: "Announcements", icon: FileText },
  ];

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    setShowAdmin(false);
    setMobileMenuOpen(false);
  };

  const handleAdminToggle = () => {
    setShowAdmin(!showAdmin);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#0B0E14]/95 border-b border-gray-800 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo and Branding */}
          <div className="flex items-center cursor-pointer" onClick={() => handleNavClick("home")}>
            <img 
              src={settings?.club_logo || "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=200"} 
              alt={settings?.club_short_name || "MPC"} 
              className="h-12 w-12 rounded-lg object-cover border border-[#C5A85C]/30 mr-3"
              referrerPolicy="no-referrer"
            />
            <div>
              <span className="text-xl font-bold tracking-wider text-white flex items-center gap-1 font-display">
                {settings?.club_name || "Mafia PES Club"}
              </span>
              <span className="text-xs text-[#C5A85C] tracking-widest block uppercase font-mono font-bold">
                {settings?.game_name || "eFootball"} Division
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id && !showAdmin;
              return (
                <button
                  key={item.id}
                  id={`nav-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                    isActive 
                      ? "bg-[#C5A85C]/10 text-[#C5A85C] border border-[#C5A85C]/30" 
                      : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Admin Toggle / User Controls */}
          <div className="hidden md:flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleAdminToggle}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${
                    showAdmin 
                      ? "bg-[#C5A85C] text-black font-bold shadow-lg shadow-[#C5A85C]/20" 
                      : "bg-gray-800 text-white hover:bg-gray-700 border border-gray-700"
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Admin Dashboard
                </button>
                <button 
                  onClick={logout}
                  title="Sign Out"
                  className="p-2 rounded-lg bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 text-red-400 transition"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleAdminToggle}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  showAdmin 
                    ? "bg-[#C5A85C] text-black font-bold shadow-lg shadow-[#C5A85C]/20" 
                    : "bg-[#C5A85C]/10 hover:bg-[#C5A85C]/20 text-[#C5A85C] border border-[#C5A85C]/30"
                }`}
              >
                <ShieldAlert className="h-4 w-4" />
                Admin Panel
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0F131A] border-b border-gray-800 px-2 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id && !showAdmin;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-base font-medium flex items-center gap-3 ${
                  isActive 
                    ? "bg-[#C5A85C]/10 text-[#C5A85C] border-l-4 border-[#C5A85C]" 
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
              >
                {item.label}
              </button>
            );
          })}
          
          <div className="pt-4 border-t border-gray-800/60 flex flex-col gap-2">
            {currentUser ? (
              <>
                <button
                  onClick={handleAdminToggle}
                  className={`w-full text-center px-4 py-2.5 rounded-lg text-base font-semibold flex items-center justify-center gap-2 ${
                    showAdmin 
                      ? "bg-[#C5A85C] text-black font-bold" 
                      : "bg-gray-800 text-white hover:bg-gray-700"
                  }`}
                >
                  <LayoutDashboard className="h-5 w-5" />
                  Admin Dashboard
                </button>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center px-4 py-2.5 rounded-lg text-base font-medium bg-red-950/20 text-red-400 border border-red-900/40 hover:bg-red-950/40 flex items-center justify-center gap-2"
                >
                  <LogOut className="h-5 w-5" />
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={handleAdminToggle}
                className={`w-full text-center px-4 py-2.5 rounded-lg text-base font-semibold flex items-center justify-center gap-2 ${
                  showAdmin 
                    ? "bg-[#C5A85C] text-black font-bold" 
                    : "bg-[#C5A85C]/10 text-[#C5A85C] border border-[#C5A85C]/30"
                }`}
              >
                <ShieldAlert className="h-5 w-5" />
                Admin Panel Login
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
