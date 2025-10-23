'use client';

import Image from 'next/image';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import logo from '../../public/assets/Image/Logo I1.svg';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/welcome');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-full max-w-[390px] min-h-[844px] bg-white shadow-lg overflow-hidden">
        <div
          className="w-full max-w-[390px] min-h-[844px] flex items-center justify-center cursor-pointer"
          onClick={() => router.push('/welcome')}
        >
          <Image src={logo} alt="logo" width={155} height={163} />
        </div>
      </div>
    </div>
  );
}
