import Image from "next/image";
import Link from "next/link";
import { FaPlus } from "react-icons/fa";
import logo from "../../../../public/assets/Icon/logo.svg";
import roundplus from "../../../../public/assets/Icon/roundplus.svg";
import user from "../../../../public/assets/Icon/user.svg";

interface DashboardHeaderProps {
  role: "Family Head" | "Family Member" | "Solo User" | "Admin";
  isFamilyHead: boolean;
}

export default function DashboardHeader({ role, isFamilyHead }: DashboardHeaderProps) {
  return (
    <div className="sticky top-0 z-40">
      <div className="relative w-full h-[94px] bg-white shadow-[0px_3px_3px_rgba(0,141,210,0.1)] rounded-b-[15px]">
        <div className="absolute bottom-0 w-full flex items-center justify-between px-6 mb-[15px]">
          <div className="flex items-center">
            <div className="w-[37px] h-[39px] relative mr-[25px]">
              <Image src={logo} alt="logo" />
            </div>
            <h3 className="text-[16px] text-black">
              Welcome,{" "}
              {role === "Family Head"
                ? "Family Head"
                : role === "Solo User"
                ? "Solo User"
                : "Member"}
            </h3>
          </div>
          <div className="flex items-center text-[#008DD2]">
            {(role === "Family Head" ||
              role === "Family Member" ||
              role === "Solo User" ||
              role === "Admin") && (
              <span className="mr-4">
                <Link href="/profile">
                  <Image src={user} alt="user" />
                </Link>
              </span>
            )}

            {isFamilyHead && (
              <span className="mr-4">
                <Link href="/addMember">
                  <FaPlus size={18} />
                </Link>
              </span>
            )}

            <span className="relative group">
              <Link href="/addExpense">
                <Image src={roundplus} alt="roundplus" />
              </Link>
              <span className="absolute top-full right-0 mt-1 whitespace-nowrap px-2 py-1 text-[12px] text-white bg-black rounded-md opacity-0 group-hover:opacity-100 transition duration-200 z-50">
                Add Expense
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}