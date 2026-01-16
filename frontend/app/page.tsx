"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { AuroraBackground } from "@/components/ui/aurora-background";

const ModeToggle = dynamic(
  () =>
    import("@/components/mode-toggle").then((mod) => ({
      default: mod.ModeToggle,
    })),
  {
    ssr: false,
  }
);

export default function Home() {
  return (
    <AuroraBackground>
      <div className="absolute top-4 right-4 z-50">
        <ModeToggle />
      </div>
      <div className="relative z-10 flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-6xl font-bold text-black dark:text-white">
          Welcome to <span className="text-blue-600">ICPC Portal</span>
        </h1>

        <p className="mt-3 text-2xl text-neutral-700 dark:text-neutral-200">
          USICT ACM Student Chapter
        </p>

        <div className="flex mt-6 gap-4">
          <Link href="/login">
            <Button size="lg">Login</Button>
          </Link>
          <Link href="/register">
            <Button variant="outline" size="lg">
              Register
            </Button>
          </Link>
        </div>
      </div>
    </AuroraBackground>
  );
}
