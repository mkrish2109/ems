import Image from "next/image";
import Link from "next/link";
import { IoMdSettings } from "react-icons/io";
import home from "../../../../public/assets/Icon/home.svg";
import users from "../../../../public/assets/Icon/users.svg";
import report from "../../../../public/assets/Icon/report.svg";

interface BottomNavigationProps {
  isFamilyHead: boolean;
}

export default function BottomNavigation({ isFamilyHead }: BottomNavigationProps) {
  return (
    <div className="mt-auto sticky bottom-0 ">
      <div className="w-full h-[94px] bg-white shadow-[0px_3px_3px_rgba(0,141,210,0.1)] rounded-t-[15px] mt-3">
        <div className="flex min-h-[48px] justify-evenly items-center py-5">
          <Link href="#" className="flex flex-col items-center">
            <Image src={home} alt="home" height={22} />
            <span className="text-[16px] font-medium text-[#052C4D] mt-1">
              Dashboard
            </span>
          </Link>
          {isFamilyHead && (
            <Link href="/members" className="flex flex-col items-center">
              <Image src={users} alt="users" height={22} />
              <span className="text-[16px] font-medium text-[#052C4D] mt-1">
                Members
              </span>
            </Link>
          )}
          <Link href="/reports" className="flex flex-col items-center">
            <Image src={report} alt="report" height={22} />
            <span className="text-[16px] font-medium text-[#052C4D] mt-1">
              Reports
            </span>
          </Link>
          <Link href="#" className="flex flex-col items-center">
            <IoMdSettings color="#008DD2" size={22} />
            <span className="text-[16px] font-medium text-[#052C4D] mt-1">
              Setting
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}