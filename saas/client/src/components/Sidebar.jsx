import { Protect, useClerk, useUser } from "@clerk/clerk-react";
import {
  Eraser,
  FileText,
  House,
  Image,
  LogOut,
  Scissors,
  SquarePen,
  Users,
  Repeat,
  BarChart3,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/ai", label: "Dashboard", Icon: House },
  { to: "/ai/write-article", label: "Write Article", Icon: SquarePen },
  { to: "/ai/generate-images", label: "Generate Images", Icon: Image },
  { to: "/ai/content-repurposer", label: "Content Repurposer", Icon: Repeat },
  { to: "/ai/data-visualizer", label: "Data Visualizer", Icon: BarChart3 },
  { to: "/ai/remove-background", label: "Remove Background", Icon: Eraser },
  { to: "/ai/remove-object", label: "Remove Object", Icon: Scissors },
  { to: "/ai/review-resume", label: "Review Resume", Icon: FileText },
  { to: "/ai/community", label: "Community", Icon: Users },
];

const Sidebar = ({ sidebar, setSidebar }) => {
  const { user } = useUser();
  const { signOut, openUserProfile } = useClerk();

  return (
    <div
      className={`w-60 sidebar-glass flex flex-col justify-between items-center max-sm:absolute top-14 bottom-0 ${
        sidebar ? "translate-x-0" : "max-sm:-translate-x-full"
      } transition-all`}
    >
      {/* Top Section */}
      <div className="my-4 w-full sidebar-user-block">
        <img
          src={user.imageUrl}
          alt="User"
          className="w-12 h-12 rounded-full mx-auto object-cover"
        />
        <h1 className="mt-2 text-center text-sm font-semibold">{user.fullName}</h1>

        {/* Nav Items */}
        <div className="px-3 mt-4 text-sm sidebar-items">
          {navItems.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/ai"}
              onClick={() => setSidebar(false)}
              className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
            >
              {({ isActive }) => (
                <>
                  <span className="icon-wrapper">
                    <Icon className="w-4 h-4" />
                  </span>
                  <span className="truncate">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="w-full sidebar-footer px-4 py-3 flex items-center justify-between">
        <div
          onClick={openUserProfile}
          className="flex gap-2 items-center cursor-pointer"
        >
          <img
            src={user.imageUrl}
            alt="User"
            className="w-7 h-7 rounded-full"
          />
          <div>
            <h1 className="text-sm font-medium">{user.fullName}</h1>
            <p className="text-xs opacity-80">
              <Protect plan="premium" fallback="Free">Premium</Protect> Plan
            </p>
          </div>
        </div>
        <LogOut
          onClick={signOut}
          className="w-4 h-4 cursor-pointer opacity-80 hover:opacity-100"
          title="Sign out"
        />
      </div>
    </div>
  );
};

export default Sidebar;
