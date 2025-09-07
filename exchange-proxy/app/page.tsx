"use client"
import { Appbar } from "./components/appbar";
import { Home } from "./components/home";

export default function Page() {
  return (
    <>
      <div className="min-h-full">
        <div className="mx-auto w-full max-w-[60%]">
          <Home />
        </div>
      </div>
    </>
  );
}
