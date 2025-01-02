"use client"
import Image from 'next/image'
import { ArrowRight } from "lucide-react"
import Link from 'next/link'
import { Button } from './ui/button'
import { api } from '../../convex/_generated/api'
import { useQuery } from 'convex/react'

const ArticleOfTheWeek = () => {
  const topArticle = useQuery(api.articles.trending)

  if (!topArticle) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded" />
        <div className="h-[300px] bg-gray-100 rounded-xl" />
      </div>
    )
  }

  if (!topArticle) return null

  const encodedSlug = encodeURIComponent(topArticle[0].slug)
  .toLowerCase()
  .replace(/%20/g, '-')
  .replace(/[&]/g, 'and')
  .replace(/[^a-z0-9-]/g, '');

  return (
    <Link href={`/blog/${encodedSlug}`} className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Article of the week</h1>
      
      <div className='relative group hover:shadow-lg'>
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 to-white rounded-2xl transform -rotate-1 scale-[1.02] opacity-0  transition-all duration-500" />
        
        <div className='flex items-center gap-8 bg-white rounded-xl border border-gray-100 p-6 shadow-sm  transition-all duration-300'>
          <div className='relative w-[500px] h-[300px] overflow-hidden rounded-lg'>
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent z-10" />
            <Image 
              src={topArticle[0].headerImage || '/guy.svg'} 
              alt="Developer coding" 
              fill
              className='object-cover group-hover:scale-90 transition-all duration-700' 
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
                {topArticle[0].title}
              </h2>
              <p className='text-lg text-gray-600 font-light'>
                {topArticle[0].content.slice(0, 100)}...
              </p>
            </div>

            {/* <div className="mt-8">
              <Button 
                className='bg-emerald-600 hover:bg-emerald-700 transition-colors group/btn flex items-center gap-2'
                size="lg"
              >
                Read more
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </Button>
            </div> */}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default ArticleOfTheWeek