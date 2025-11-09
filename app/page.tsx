import AdvertiseBar from "@/components/navbar/AdvertiseBar";
import Navbar from "@/components/navbar/Navbar";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <AdvertiseBar />
      <Navbar />
    </div>
  );
}
