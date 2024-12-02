import Image from 'next/image'
import { ArrowRight } from "lucide-react"
import { Button } from './ui/button'

const ArticleOfTheWeek = () => {
  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Article of the week</h1>
      
      <div className='relative group'>
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 to-white rounded-2xl transform -rotate-1 scale-[1.02] opacity-0  transition-all duration-500" />
        
        <div className='flex gap-8 bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-xl transition-all duration-300'>
          <div className='relative w-[500px] h-[300px] overflow-hidden rounded-lg'>
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent z-10" />
            <Image 
              src="/guy.svg" 
              alt="Developer coding" 
              fill
              className='object-cover group-hover:scale-105 transition-all duration-500' 
            />
          </div>

          <div className='flex flex-col justify-between flex-1 py-4'>
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium">
                Featured
              </span>
            </div>

            <div className="space-y-4">
              <h2 className='text-3xl font-bold text-gray-900 group-hover:text-emerald-700 transition-colors duration-300'>
                How to build a liquidity pool
              </h2>
              <p className='text-lg text-gray-600 font-light'>
                Learn how to build a liquidity pool on morph using solidity and react
              </p>
            </div>

            <div className="mt-8">
              <Button 
                className='bg-emerald-600 hover:bg-emerald-700 transition-colors group/btn flex items-center gap-2'
                size="lg"
              >
                Read more
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ArticleOfTheWeek