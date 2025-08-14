"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/lib/languageContext';
import { useAuth } from '@/lib/authContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Header from '@/components/Header';
import LoginDialog from '@/components/LoginDialog';
// 移除 Runway SDK 导入，改为使用服务器端 API
interface GenerationTask {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: {
    video_url?: string;
    thumbnail_url?: string;
  };
  error?: string;
}

export default function AIEffectGeneratorPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<string>('');
  const [currentTask, setCurrentTask] = useState<GenerationTask | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  
  const videoInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const progressTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 清理预览URL的函数
  const cleanupPreview = (url: string | null) => {
    if (url) {
      URL.revokeObjectURL(url);
    }
  };

  // 组件卸载时清理预览URL和定时器
  useEffect(() => {
    return () => {
      cleanupPreview(videoPreview);
      cleanupPreview(imagePreview);
      if (progressTimeoutRef.current) {
        clearTimeout(progressTimeoutRef.current);
      }
    };
  }, [videoPreview, imagePreview]);

  // 检查登录状态的函数
  const checkLoginStatus = () => {
    if (!user) {
      setIsLoginDialogOpen(true);
      return false;
    }
    return true;
  };

  // 处理视频生成
  const handleGenerateVideo = async () => {
    if (!checkLoginStatus()) return;
    
    if (!videoFile || !imageFile) {
      setError(t('step1Desc'));
      return;
    }

    // 检查 API 密钥配置（现在在服务器端）
    // 注意：API 密钥现在在服务器端使用，客户端不需要检查

    setIsGenerating(true);
    setError(null);
    setGenerationProgress(t('uploadingFiles'));
    setCurrentStep(3); // 立即进入第3步，避免闪烁

    try {
      // 上传图片文件（角色图片）
      console.log('Uploading image file (Character Image):', imageFile.name, imageFile.size);
      const imageFormData = new FormData();
      imageFormData.append('file', imageFile);
      const imageResponse = await fetch('/api/upload-supabase', {
        method: 'POST',
        body: imageFormData,
      });
      const imageResult = await imageResponse.json();
      console.log('Image upload result:', imageResult);
      
      if (!imageResponse.ok) {
        throw new Error(imageResult.error || t('uploadFailed'));
      }

      // 使用防抖更新进度
      if (progressTimeoutRef.current) {
        clearTimeout(progressTimeoutRef.current);
      }
      progressTimeoutRef.current = setTimeout(() => {
        setGenerationProgress(t('uploadingFiles'));
      }, 100);

      // 上传视频文件（参考表演视频）
      console.log('Uploading video file (Reference Performance Video):', videoFile.name, videoFile.size);
      const videoFormData = new FormData();
      videoFormData.append('file', videoFile);
      const videoResponse = await fetch('/api/upload-supabase', {
        method: 'POST',
        body: videoFormData,
      });
      const videoResult = await videoResponse.json();
      console.log('Video upload result:', videoResult);
      
      if (!videoResponse.ok) {
        throw new Error(videoResult.error || t('uploadFailed'));
      }

      if (progressTimeoutRef.current) {
        clearTimeout(progressTimeoutRef.current);
      }
      progressTimeoutRef.current = setTimeout(() => {
        setGenerationProgress(t('processingVideo'));
      }, 100);

      // 创建 Runway 任务
      console.log('Creating Runway task with:', {
        imageUrl: imageResult.file_url, // 角色图片（第一个上传的文件）
        videoUrl: videoResult.file_url, // 参考表演视频（第二个上传的文件）
      });
      
      const taskResponse = await fetch('/api/runway', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'createTask',
          imageUrl: imageResult.file_url, // 角色图片（第一个上传的文件）
          videoUrl: videoResult.file_url, // 参考表演视频（第二个上传的文件）
        }),
      });

      const taskResult = await taskResponse.json();
      
      if (!taskResponse.ok) {
        throw new Error(taskResult.error || t('generationFailed'));
      }

      const task = taskResult.task;
      setCurrentTask(task);
      setGenerationProgress(t('processingVideo'));

      // 开始轮询任务状态
      let finalTask = task;
      const maxAttempts = 60; // 最多轮询60次（5分钟）
      let attempts = 0;

      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 5000)); // 每5秒检查一次

        const statusResponse = await fetch('/api/runway', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'getTaskStatus',
            taskId: task.id,
          }),
        });

        const statusResult = await statusResponse.json();
        
        if (!statusResponse.ok) {
          throw new Error(statusResult.error || t('generationFailed'));
        }

        finalTask = statusResult.task;
        
        // 使用防抖更新进度
        if (progressTimeoutRef.current) {
          clearTimeout(progressTimeoutRef.current);
        }
        progressTimeoutRef.current = setTimeout(() => {
          setGenerationProgress(`处理中: ${finalTask.status}`);
        }, 200);

        if (finalTask.status === 'completed' || finalTask.status === 'failed') {
          break;
        }

        attempts++;
      }

      if (finalTask.status === 'completed' && finalTask.result?.video_url) {
        setGeneratedVideoUrl(finalTask.result.video_url);
        setCurrentStep(4);
      } else {
        throw new Error(finalTask.error || t('generationFailed'));
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : t('generationError'));
      setCurrentStep(2); // 回到第2步
    } finally {
      setIsGenerating(false);
      setGenerationProgress('');
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      {/* 页面标题 */}
      <div className="relative z-10 pt-20 pb-16 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-white mb-4">{t('aiEffectGenerator')}</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            {t('aiEffectGeneratorDesc')}
          </p>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="relative z-10 pb-20">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto p-8 bg-gray-900/80 backdrop-blur-lg border border-gray-700 rounded-2xl">
          
          {/* 步骤指示器 */}
          <div className="flex justify-center items-center space-x-6 mb-8">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  currentStep === step
                    ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/50'
                    : currentStep > step
                    ? 'bg-purple-400 text-white'
                    : 'bg-gray-600 text-gray-300'
                }`}>
                  {currentStep > step ? '✓' : step}
                </div>
                {step < 4 && (
                  <div className={`w-12 h-0.5 mx-3 transition-all duration-300 ${
                    currentStep > step ? 'bg-purple-400' : 'bg-gray-600'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* 内容区域 */}
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-purple-400 mb-4">
              {currentStep === 1 && t('step1Title')}
              {currentStep === 2 && t('step2Title')}
              {currentStep === 3 && t('step3Title')}
              {currentStep === 4 && t('generationSuccess')}
            </h3>
            <p className="text-gray-300 text-lg">
              {currentStep === 1 && t('step1Desc')}
              {currentStep === 2 && t('step2Desc')}
              {currentStep === 3 && t('generatingDesc')}
              {currentStep === 4 && t('generationSuccess')}
            </p>
          </div>

          {/* 步骤内容 */}
          {currentStep === 1 && (
            <div className="mb-8">
              {!imageFile ? (
                <div 
                  className="border-2 border-dashed border-purple-400 rounded-lg p-24 text-center cursor-pointer hover:border-purple-300 transition-colors min-h-[500px] flex flex-col items-center justify-center"
                  onClick={() => {
                    if (!checkLoginStatus()) return;
                    imageInputRef.current?.click();
                  }}
                >
                  <div className="text-6xl mb-6">🖼️</div>
                  <h4 className="text-xl font-semibold text-white mb-3">
                    {t('uploadImage')}
                  </h4>
                  <p className="text-gray-300 mb-6 text-base">
                    {t('dragDropImage')}
                  </p>
                  <div className="text-sm text-gray-400 space-y-2">
                    <p>{t('imageFormats')}</p>
                    <p>{t('maxImageSize')}</p>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-24 h-24 bg-gray-700 rounded flex items-center justify-center">
                      <span className="text-2xl">🖼️</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-semibold text-sm">{imageFile.name}</h4>
                      <p className="text-gray-400 text-xs">{(imageFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => {
                        cleanupPreview(imagePreview);
                        setImageFile(null);
                        setImagePreview(null);
                        // 清空 input 的值，这样相同文件也能重新上传
                        if (imageInputRef.current) {
                          imageInputRef.current.value = '';
                        }
                      }}
                      className="text-purple-400 border-purple-400 hover:bg-purple-400 hover:text-white text-xs px-3 py-1"
                    >
                      {t('reupload')}
                    </Button>
                  </div>
                  {imagePreview && (
                    <div className="mt-4">
                      <img 
                        src={imagePreview} 
                        alt={t('uploadImage')}
                        className="w-full max-h-64 object-contain rounded-lg"
                      />
                    </div>
                  )}
                </div>
              )}
              <input
                ref={imageInputRef}
                type="file"
                accept=".jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    // 检查文件格式
                    const allowedTypes = ['image/jpeg', 'image/png'];
                    if (!allowedTypes.includes(file.type)) {
                      alert(t('imageFormats'));
                      return;
                    }
                    
                    if (file.size > 5 * 1024 * 1024) {
                      alert(t('maxImageSize'));
                      return;
                    }
                    setImageFile(file);
                    // 创建图片预览URL
                    const url = URL.createObjectURL(file);
                    setImagePreview(url);
                  }
                }}
                className="hidden"
              />
            </div>
          )}

          {currentStep === 2 && (
            <div className="mb-8">
              {!videoFile ? (
                <div 
                  className="border-2 border-dashed border-purple-400 rounded-lg p-24 text-center cursor-pointer hover:border-purple-300 transition-colors min-h-[500px] flex flex-col items-center justify-center"
                  onClick={() => videoInputRef.current?.click()}
                >
                  <div className="text-6xl mb-6">🎬</div>
                  <h4 className="text-xl font-semibold text-white mb-3">
                    {t('uploadVideo')}
                  </h4>
                  <p className="text-gray-300 mb-6 text-base">
                    {t('dragDropVideo')}
                  </p>
                  <div className="text-sm text-gray-400 space-y-2">
                    <p>{t('videoFormats')}</p>
                    <p>{t('maxFileSize')}</p>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-24 h-16 bg-gray-700 rounded flex items-center justify-center">
                      <span className="text-2xl">🎬</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-semibold text-sm">{videoFile.name}</h4>
                      <p className="text-gray-400 text-xs">{(videoFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => {
                        cleanupPreview(videoPreview);
                        setVideoFile(null);
                        setVideoPreview(null);
                        // 清空 input 的值，这样相同文件也能重新上传
                        if (videoInputRef.current) {
                          videoInputRef.current.value = '';
                        }
                      }}
                      className="text-purple-400 border-purple-400 hover:bg-purple-400 hover:text-white text-xs px-3 py-1"
                    >
                      {t('reupload')}
                    </Button>
                  </div>
                  {videoPreview && (
                    <div className="mt-4">
                      <video 
                        controls 
                        className="w-full max-h-64 rounded-lg"
                        src={videoPreview}
                      >
                        {t('browserNotSupportVideo')}
                      </video>
                    </div>
                  )}
                </div>
              )}
              <input
                ref={videoInputRef}
                type="file"
                accept=".mp4,.mov"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    // 检查文件格式
                    const allowedTypes = ['video/mp4', 'video/quicktime'];
                    if (!allowedTypes.includes(file.type)) {
                      alert(t('videoFormats'));
                      return;
                    }
                    
                    if (file.size > 500 * 1024 * 1024) {
                      alert(t('maxFileSize'));
                      return;
                    }
                    setVideoFile(file);
                    // 创建视频预览URL
                    const url = URL.createObjectURL(file);
                    setVideoPreview(url);
                  }
                }}
                className="hidden"
              />
            </div>
          )}

          {currentStep === 3 && (
            <div className="mb-8">
              <div className="text-center py-8">
                <div className="text-6xl mb-4 animate-spin">✨</div>
                <h4 className="text-2xl font-semibold text-white mb-4">
                  {t('generating')}
                </h4>
                <p className="text-gray-300 text-lg mb-4">
                  {generationProgress || t('generatingDesc')}
                </p>
                {error && (
                  <div className="mt-4 p-4 bg-red-900/50 border border-red-500 rounded-lg">
                    <p className="text-red-300 text-sm">{error}</p>
                  </div>
                )}
                <div className="mt-8">
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div 
                      className="h-3 rounded-full transition-all duration-500 bg-purple-500" 
                      style={{ width: isGenerating ? '60%' : '100%' }} 
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="mb-8">
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="text-center">
                  <div className="text-6xl mb-4">🎉</div>
                  <h4 className="text-2xl font-semibold text-white mb-4">
                    {t('generationSuccess')}
                  </h4>
                  <p className="text-gray-300 text-lg mb-6">
                    {t('generationSuccess')}
                  </p>
                  {generatedVideoUrl && (
                    <div className="mt-6">
                      <video 
                        controls 
                        className="w-full max-h-96 rounded-lg mx-auto"
                        src={generatedVideoUrl}
                      >
                        {t('browserNotSupportVideo')}
                      </video>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex justify-end">
            {currentStep === 1 && imageFile && (
              <Button
                onClick={() => setCurrentStep(2)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg"
              >
                {t('nextStep')}
              </Button>
            )}
            
            {currentStep === 2 && videoFile && (
              <Button
                onClick={handleGenerateVideo}
                disabled={isGenerating}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? t('generating') : t('generateVideo')}
              </Button>
            )}
            
            {currentStep === 3 && isGenerating && (
              <div className="text-center">
                <p className="text-gray-400 text-sm">{t('generatingDesc')}</p>
              </div>
            )}
            
            {currentStep === 4 && (
              <div className="flex space-x-4">
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
                >
                  {t('downloadVideo')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  className="text-purple-400 border-purple-400 hover:bg-purple-400 hover:text-white px-6 py-2 rounded-lg"
                >
                  {t('regenerate')}
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>

    {/* 登录对话框 */}
    <LoginDialog 
      isOpen={isLoginDialogOpen} 
      onClose={() => setIsLoginDialogOpen(false)} 
    />
  </div>
  );
}