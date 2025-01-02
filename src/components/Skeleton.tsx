const ArticleLoadingSkeleton = () => {
    return (
      <div className="p-8 space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        
        <div className='relative'>
          <div className='flex items-center gap-8 bg-white rounded-xl border border-gray-100 p-6'>
            {/* Image skeleton */}
            <div className='relative w-[500px] h-[300px] rounded-lg bg-gray-100 animate-pulse' />
  
            <div className='flex flex-col justify-between flex-1 py-4'>
              {/* Tag skeleton */}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-20 h-6 rounded-full bg-gray-100 animate-pulse" />
              </div>
  
              <div className="space-y-4">
                {/* Title skeleton */}
                <div className='h-9 bg-gray-100 rounded animate-pulse' />
                
                {/* Content skeleton */}
                <div className='space-y-2'>
                  <div className='h-6 bg-gray-100 rounded animate-pulse' />
                  <div className='h-6 bg-gray-100 rounded animate-pulse w-3/4' />
                </div>
              </div>
  
              {/* Button skeleton */}
              <div className="mt-8">
                <div className='w-32 h-11 bg-gray-100 rounded animate-pulse' />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  export default ArticleLoadingSkeleton