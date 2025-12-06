import React from "react";
import { assets } from "../../assets/assets";
import {
  LayoutDashboardIcon,
  ListCollapseIcon,
  ListIcon,
  PlusSquareIcon,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const AdminSideBar = () => {
  const user = {
    firstName: "Admin",
    lastName: "User",
    imageUrl: assets.profile,
  };

  const adminNavlinks = [
    { name: "Bảng điều khiển", path: "/admin", icon: LayoutDashboardIcon },
    {
      name: "Tạo phim",
      path: "/admin/create-movies",
      icon: PlusSquareIcon,
    },
    { name: "Danh sách phim", path: "/admin/movies", icon: ListIcon },
    {
      name: "Tạo thể loại",
      path: "/admin/genres/create",
      icon: PlusSquareIcon,
    },
    { name: "Danh sách thể loại", path: "/admin/genres", icon: ListIcon },
    {
      name: "Tạo loại ghế",
      path: "/admin/seat-types/create",
      icon: PlusSquareIcon,
    },
    { name: "Danh sách loại ghế", path: "/admin/seat-types", icon: ListIcon },
    {
      name: "Tạo phòng chiếu",
      path: "/admin/rooms/create",
      icon: PlusSquareIcon,
    },
    { name: "Danh sách phòng chiếu", path: "/admin/rooms", icon: ListIcon },
    {
      name: "Tạo suất chiếu",
      path: "/admin/create-shows",
      icon: PlusSquareIcon,
    },
    { name: "Danh sách suất chiếu", path: "/admin/list-shows", icon: ListIcon },
    {
      name: "Danh sách đặt vé",
      path: "/admin/list-bookings",
      icon: ListCollapseIcon,
    },
  ];
  return (
    <div
      className="h-[calc(100vh-64px)] md:flex md:flex-col items-center pt-8 max-w-13 
    md:max-w-60 w-full border-r border-gray-300/20 text-sm"
    >
      <img
        className="h-9 md:h-14 w-9 md:w-14 rounded-full mx-auto"
        src={user.imageUrl}
        alt="sidebar"
      />
      <p className="mt-2 text-base max-md:hidden">
        {user.firstName} {user.lastName}
      </p>

      <div className="w-full mt-6">
        {adminNavlinks.map((link, index) => (
          <NavLink
            key={index}
            to={link.path}
            end
            className={({ isActive }) =>
              `relative flex items-center max-md:justify-center gap-2 w-full py-2.5 min-md:pl-10 first:mt-6 
            text-gray-400 ${isActive && "bg-primary/15 text-primary group"}`
            }
          >
            {({ isActive }) => (
              <>
                <link.icon className="h-5 w-5" />
                <p className="max-md:hidden">{link.name}</p>
                <span
                  className={`w-1.5 h-10 rounded-1 right-0 absolute ${
                    isActive && "bg-primary"
                  }`}
                ></span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default AdminSideBar;
