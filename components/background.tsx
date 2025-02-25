import type React from "react";
import Image from "next/image";
import background from "@/public/imgs/background.jpg";

export default function Background({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen relative overflow-hidden bg-[#13263c]">
      {/* Background Image */}
      {/* <Image
        src={background || "/placeholder.svg"}
        alt="Background"
        layout="fill"
        objectFit="cover"
        quality={100}
        priority
        className="z-0"
      /> */}

      {/* Content */}
      <div className="relative z-20">{children}</div>
    </div>
  );
}
