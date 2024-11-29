import Image from 'next/image'
import React from 'react'
import { Button } from './ui/button'

const ArticleOfTheWeek = () => {
  return (
    <div className='flex group gap-4 bg-white hover:shadow-md transition-all duration-300 rounded-xl '>
        <div>
            <Image src="/guy.svg" alt="bookkoala" width={664} height={256} className='group-hover:scale-95 transition-all duration-300' />
        </div>
        <div className='flex flex-col gap-4'>
            <h2 className='text-2xl font-semibold mt-3 font-manrope group-hover:text-[#1fb859] transition-all duration-300'>How to build a liquidity pool</h2>
            <span className='flex justify-between items-center'>
            <p className='text-sm max-w-[400px] font-manrope'>Learn how to build a liquidity pool on morph using solidity and react</p>
            <Button className='bg-[#1fb859]' size="sm">Read more</Button>
            </span>
        </div>
    </div>
  )
}

export default ArticleOfTheWeek