'use client';

import Image from "next/image";
import { useRouter } from 'next/navigation';
import BackIcon from "../../../public/assets/Icon/backbutton.svg"

const BackButton = () => {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="w-[38px] h-[38px] bg-white rounded-full flex items-center justify-center cursor-pointer"
    >
      <Image src={BackIcon} alt="backicon" />
    </button>
  );
};

export default BackButton;