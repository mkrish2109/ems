'use client';

import Image from 'next/image';
import Link from 'next/link';
import logo from '../../../public/assets/Image/Logo I1.svg';
import { FcGoogle } from "react-icons/fc";
import { MdAlternateEmail } from "react-icons/md";
import { signIn } from "next-auth/react";

export default function Welcome() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-full max-w-[390px] min-h-[844px] bg-white shadow-lg">
        <div className="w-full h-[459px] top-0 bg-[rgba(0,141,210,0.1)] rounded-b-[195px] flex flex-col items-center justify-center">
          <div className="flex flex-col items-center">
            <Image src={logo} alt="logo" width={93} height={98} />
            <h3 className="text-[24px] text-black mt-8">Welcome to</h3>
            <h4 className="text-[20px] font-bold text-black">Expense Management System</h4>
            <p className="w-[289px] text-[16px] text-center text-black mt-6">
              A place where you can track all your expenses and incomes...
            </p>
          </div>
        </div>
        <div className="mt-[46px] px-6">
          <p className="text-[17.317px] font-bold text-black mb-[18px]">Lets Get Started...</p>
          <button
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="w-full h-14 border border-[#052C4D] rounded-2xl flex items-center justify-center mb-4 cursor-pointer"
          >
            <div className="flex items-center">
              <FcGoogle className="text-2xl mr-2" />
              <span className="text-[16px] text-[#1C1C1C]">Continue with Google</span>
            </div>
          </button>
          <Link href="/register">
            <button className="w-full h-14 border border-[#052C4D] rounded-2xl flex items-center justify-center cursor-pointer">
              <div className="flex items-center">
                <MdAlternateEmail className="text-2xl text-[#008DD2] mr-2" />
                <span className="text-[16px] text-[#1C1C1C]">Continue with Email</span>
              </div>
            </button>
          </Link>
        </div>
        <div className="mt-16 text-center">
          <p className="text-[16px] text-black">
            Already have an account?
            <Link href="/login" className="text-[#008DD2] underline ml-1">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
