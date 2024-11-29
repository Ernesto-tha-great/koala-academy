import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BlogHeader() {
  return (
    <div 
    className="relative bg-cover bg-center rounded-xl font-manrope "
    style={{
      backgroundImage: 'url("/bookkoala.svg")'
    }}
  >

      <div className="relative w-[1200px] h-[600px] overflow-hidden ">
        <div className="absolute bottom-12 left-12 max-w-xl text-white">
          <h1 className="text-5xl font-bold mb-3">
            Learn to build like an engineer
          </h1>
          <p className="text-sm text-gray-300 mb-6">
            Join Morph Academy and learn from the best. Our platform is designed to help you learn the technical skills you need to succeed in your career.
          </p>
          <div className="flex w-full max-w-md relative">
            <input
              type="text"
              placeholder="What do you want to learn?"
              className="w-full px-4 py-5 rounded-lg text-gray-900 focus:outline-none text-sm pr-[100px]"
            />
            <Button 
              className="bg-green-500 hover:bg-green-600 rounded-lg absolute right-2 top-1/2 -translate-y-1/2"
            >
              Search
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}