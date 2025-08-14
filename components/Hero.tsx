"use client";

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/languageContext';

export default function Hero() {
  const { t } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleError = (e: Event) => {
      console.log('Video failed to load:', e);
      console.log('Video error details:', video.error);
    };

    const handleLoadStart = () => {
      console.log('Video started loading');
    };

    const handleCanPlay = () => {
      console.log('Video can play');
      setVideoLoaded(true);
    };

    const handleLoadedData = () => {
      console.log('Video loaded data');
      // 尝试播放视频
      video.play().catch((error) => {
        console.log('Auto-play failed:', error);
      });
    };

    video.addEventListener('error', handleError);
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('loadeddata', handleLoadedData);

    return () => {
      video.removeEventListener('error', handleError);
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('loadeddata', handleLoadedData);
    };
  }, []);

  return (
         <section className="relative min-h-screen overflow-hidden bg-black">
      
             {/* Hero Content */}
                            <div className="relative z-10 text-center w-full pt-20 pb-20">
        <h1 className="text-2xl md:text-4xl font-bold text-white mb-6 drop-shadow-lg">
          {t('heroTitle')}
        </h1>
        
                 {/* 红框布局的视频展示区域 */}
                                       <div className="relative w-full mb-12 px-2 lg:px-4">
                                                                                                                                                                                                <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
                                                                                                                                                                                                                                                                                                                                                                                                                                                               {/* 左侧列 - 四个垂直堆叠的横屏视频 */}
                  <div className="space-y-16 flex flex-col">
                   {/* 左侧第一个横屏视频 */}
                                     <div className="aspect-[2/1] bg-black overflow-hidden rounded-sm">
                     <video 
                       className="w-full h-full object-cover"
                       autoPlay 
                       loop 
                       muted 
                       playsInline
                     >
                       <source src="/Video1.mp4" type="video/mp4" />
                     </video>
                   </div>
                   
                   {/* 左侧第二个横屏视频 */}
                                     <div className="aspect-[2/1] bg-black overflow-hidden rounded-sm">
                     <video 
                       className="w-full h-full object-cover"
                       autoPlay 
                       loop 
                       muted 
                       playsInline
                     >
                       <source src="/Video2.mp4" type="video/mp4" />
                     </video>
                   </div>
                   
                   {/* 左侧第三个横屏视频 */}
                                     <div className="aspect-[2/1] bg-black overflow-hidden rounded-sm">
                     <video 
                       className="w-full h-full object-cover"
                       autoPlay 
                       loop 
                       muted 
                       playsInline
                     >
                       <source src="/Video3.mp4" type="video/mp4" />
                     </video>
                   </div>
                   
                   {/* 左侧第四个横屏视频 */}
                                     <div className="aspect-[2/1] bg-black overflow-hidden rounded-sm">
                     <video 
                       className="w-full h-full object-cover"
                       autoPlay 
                       loop 
                       muted 
                       playsInline
                     >
                       <source src="/Video4.mp4" type="video/mp4" />
                     </video>
                   </div>
                   
                   {/* 占位空间，让左侧列与右侧列底部对齐 */}
                   <div className="flex-1"></div>
                 </div>
               
                                                                                                                                                                                                                                                 {/* 中间列 - 两个小的竖屏视频 */}
                   <div className="space-y-2 flex flex-col">
                    {/* 上方竖屏视频 */}
                                      <div className="aspect-[4/5] bg-black overflow-hidden rounded-sm flex items-center justify-center">
                       <video 
                         className="h-full object-contain"
                         autoPlay 
                         loop 
                         muted 
                         playsInline
                       >
                         <source src="/Video6.mp4" type="video/mp4" />
                       </video>
                     </div>
                    
                    {/* 下方竖屏视频 */}
                                      <div className="aspect-[4/5] bg-black overflow-hidden rounded-sm flex items-center justify-center">
                       <video 
                         className="h-full object-contain"
                         autoPlay 
                         loop 
                         muted 
                         playsInline
                       >
                         <source src="/Video7.mp4" type="video/mp4" />
                       </video>
                     </div>
                     
                     {/* 占位空间，让中间列与右侧列底部对齐 */}
                     <div className="flex-1"></div>
                  </div>
                 
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               {/* 右侧列 - 两个横屏视频上下分布 */}
                                          <div className="col-span-3 space-y-16 pt-0 flex flex-col">
                                       {/* 右侧第一个横屏视频 */}
                                        <div className="aspect-[2/1] bg-black overflow-hidden rounded-sm">
                         <video 
                           className="w-full h-full object-cover"
                           autoPlay 
                           loop 
                           muted 
                           playsInline
                         >
                           <source src="/Video5.mp4" type="video/mp4" />
                         </video>
                       </div>
                       
                                                                       {/* 三个正方形视频 */}
                         <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
                          {/* 第一个正方形视频 */}
                          <div className="aspect-square bg-black overflow-hidden rounded-sm">
                            <video 
                              className="w-full h-full object-cover"
                              autoPlay 
                              loop 
                              muted 
                              playsInline
                            >
                              <source src="/Video12.mp4" type="video/mp4" />
                            </video>
                          </div>
                          
                          {/* 第二个正方形视频 */}
                          <div className="aspect-square bg-black overflow-hidden rounded-sm">
                            <video 
                              className="w-full h-full object-cover"
                              autoPlay 
                              loop 
                              muted 
                              playsInline
                            >
                              <source src="/Video13.mp4" type="video/mp4" />
                            </video>
                          </div>
                          
                          {/* 第三个正方形视频 */}
                          <div className="aspect-square bg-black overflow-hidden rounded-sm">
                            <video 
                              className="w-full h-full object-cover"
                              autoPlay 
                              loop 
                              muted 
                              playsInline
                            >
                              <source src="/Video14.mp4" type="video/mp4" />
                            </video>
                          </div>
                        </div>
                  
                                                                                   {/* 立即体验按钮 */}
              <div className="text-center mt-6">
                <Link href="/ai-effect-generator">
                  <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 rounded-lg text-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                    {t('tryNow')}
                  </button>
                </Link>
              </div>
                </div>
           </div>
          
       
         </div>
        </div>
    </section>
  )
} 