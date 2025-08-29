"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/lib/languageContext';
import { useAuth } from '@/lib/authContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Header from '@/components/Header';
import LoginDialog from '@/components/LoginDialog';
import { processVideoGeneration } from '@/lib/credits';
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
  const [isCancelling, setIsCancelling] = useState(false);
  
  const videoInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const progressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

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

  // 监听第四步状态，确保视频URL正确设置
  useEffect(() => {
    if (currentStep === 4) {
      console.log('🔍 第四步状态检查:');
      console.log('当前步骤:', currentStep);
      console.log('生成的视频URL:', generatedVideoUrl);
      console.log('生成状态:', isGenerating);
      console.log('错误状态:', error);
      
      // 如果进入第四步但没有视频URL，尝试重新获取
      if (!generatedVideoUrl && currentTask) {
        console.log('⚠️ 进入第四步但视频URL未设置，尝试重新获取任务状态');
        // 这里可以添加重新获取任务状态的逻辑
      }
    }
  }, [currentStep, generatedVideoUrl, isGenerating, error, currentTask]);

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
    setIsCancelling(false); // 确保取消状态重置

    // 创建AbortController用于取消请求
    abortControllerRef.current = new AbortController();

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
        // 添加额外的安全检查
        if (abortControllerRef.current?.signal.aborted) {
          console.log('Request was aborted, stopping polling');
          break;
        }
        
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
        
        // 更新进度显示
        if (progressTimeoutRef.current) {
          clearTimeout(progressTimeoutRef.current);
        }
        
        let progressText = '';
        if (finalTask.status === 'RUNNING') {
          progressText = `处理中... ${finalTask.progress || 0}%`;
        } else if (finalTask.status === 'PENDING') {
          progressText = '等待中...';
        } else if (finalTask.status === 'FAILED') {
          progressText = '处理失败';
        } else if (finalTask.status === 'COMPLETED') {
          progressText = '处理完成';
        }
        
        progressTimeoutRef.current = setTimeout(() => {
          setGenerationProgress(progressText);
        }, 200);

        // 检查任务是否完成
        if (finalTask.status === 'SUCCEEDED' || finalTask.status === 'FAILED' || 
            finalTask.status === 'completed' || finalTask.status === 'failed') {
          console.log(`Task completed with status: ${finalTask.status}, stopping polling`);
          break; // 退出轮询循环
        }

        attempts++;
      }

            // 处理最终任务结果
      console.log('🔍 开始处理最终任务结果...');
      console.log('📊 任务状态:', finalTask.status);
      console.log('📹 任务输出:', finalTask.output);
      console.log('🔗 输出URL:', finalTask.output?.[0]);
      console.log('🔍 完整任务对象:', JSON.stringify(finalTask, null, 2));
      
      // 尝试多种可能的输出字段
      let videoUrl = finalTask.output?.[0];
      console.log('🔍 尝试 output[0]:', videoUrl);
      
      if (!videoUrl) {
        // 尝试其他可能的字段
        videoUrl = finalTask.result?.video_url;
        console.log('🔍 尝试 result.video_url:', videoUrl);
      }
      if (!videoUrl) {
        videoUrl = finalTask.video_url;
        console.log('🔍 尝试 video_url:', videoUrl);
      }
      if (!videoUrl) {
        videoUrl = finalTask.url;
        console.log('🔍 尝试 url:', videoUrl);
      }
      if (!videoUrl) {
        // 尝试result中的其他字段
        videoUrl = finalTask.result?.url;
        console.log('🔍 尝试 result.url:', videoUrl);
      }
      if (!videoUrl) {
        // 尝试result中的output字段
        videoUrl = finalTask.result?.output?.[0];
        console.log('🔍 尝试 result.output[0]:', videoUrl);
      }
      if (!videoUrl) {
        // 尝试result中的video字段
        videoUrl = finalTask.result?.video;
        console.log('🔍 尝试 result.video:', videoUrl);
      }
      
      console.log('🎯 最终找到的视频URL:', videoUrl);
      
              if ((finalTask.status === 'SUCCEEDED' || finalTask.status === 'completed') && videoUrl) {
          console.log('🎉 视频生成成功！输出URL:', videoUrl);
          
          // 扣除用户积分
          if (user?.id) {
            try {
              const result = await processVideoGeneration(user.id, 30); // 假设生成30秒视频
              if (!result.success) {
                console.error('积分扣除失败:', result.error);
                // 即使积分扣除失败，仍然显示成功，但记录错误
              } else {
                console.log('✅ 积分扣除成功');
              }
            } catch (error) {
              console.error('积分扣除过程中出错:', error);
            }
          }
          
          // 先设置视频URL，确保状态正确
          setGeneratedVideoUrl(videoUrl);
          
          // 清除所有生成相关状态
          setIsGenerating(false);
          setGenerationProgress('');
          setError(null);
          
          // 最后进入第四步
          setCurrentStep(4);
          
          console.log('🚀 进入第四步，显示生成的视频');
          console.log('🎬 视频URL已设置:', videoUrl);
        } else if (finalTask.status === 'FAILED' || finalTask.status === 'failed') {
          // 处理特定的失败情况
          let errorMessage = finalTask.error || t('generationFailed');
          
          // 根据错误代码提供更友好的错误信息
          if (finalTask.failureCode === 'NO_FACE_FOUND') {
            errorMessage = '未检测到人脸。请确保上传的图片包含清晰的人脸，并且人脸部分足够大且清晰。';
          } else if (finalTask.failureCode === 'INVALID_IMAGE') {
            errorMessage = '图片格式无效或质量过低。请上传清晰的JPG或PNG格式图片。';
          } else if (finalTask.failureCode === 'FILE_TOO_LARGE') {
            errorMessage = '文件过大。请确保图片小于5MB，视频小于500MB。';
          } else if (finalTask.failure) {
            errorMessage = finalTask.failure;
          }
          
          throw new Error(errorMessage);
        } else {
          // 超时或其他未知状态
          console.log('⚠️ 进入超时分支，状态:', finalTask.status);
          console.log('❌ 任务成功但无法获取视频URL');
          console.log('🔍 可能的原因:');
          console.log('  - 任务刚完成，输出URL还未准备好');
          console.log('  - API响应结构不匹配');
          console.log('  - 需要等待更长时间');
          
          // 如果任务成功但没有URL，等待一下再重试
          if (finalTask.status === 'SUCCEEDED') {
            console.log('⏳ 任务成功，等待5秒后重试获取URL...');
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            // 重新获取任务状态
            try {
              const retryResponse = await fetch('/api/runway', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  action: 'getTaskStatus',
                  taskId: task.id,
                }),
              });
              
              const retryResult = await retryResponse.json();
              if (retryResponse.ok && retryResult.task) {
                const retryTask = retryResult.task;
                console.log('🔄 重试获取任务状态:', retryTask.status);
                console.log('📹 重试任务输出:', retryTask.output);
                
                // 再次尝试获取视频URL
                let retryVideoUrl = retryTask.output?.[0] || retryTask.result?.video_url || retryTask.video_url || retryTask.url;
                if (retryVideoUrl) {
                  console.log('🎉 重试成功！找到视频URL:', retryVideoUrl);
                  setGeneratedVideoUrl(retryVideoUrl);
                  setIsGenerating(false);
                  setGenerationProgress('');
                  setError(null);
                  setCurrentStep(4);
                  return; // 成功，直接返回
                }
              }
            } catch (retryError) {
              console.error('重试获取任务状态失败:', retryError);
            }
          }
          
          throw new Error('生成成功但无法获取视频URL，请稍后重试或联系客服。');
        }

    } catch (err) {
      setError(err instanceof Error ? err.message : t('generationError'));
      // 只有在失败时才回到第2步，成功时不应该改变步骤
      if (currentStep === 3) {
        setCurrentStep(2);
      }
    } finally {
      // 只有在没有成功生成时才重置状态
      if (currentStep !== 4) {
        setIsGenerating(false);
        setGenerationProgress('');
      }
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
                {!error ? (
                  <>
                    <div className="text-6xl mb-4 animate-spin">✨</div>
                    <h4 className="text-2xl font-semibold text-white mb-4">
                      {t('generating')}
                    </h4>
                    <p className="text-gray-300 text-lg mb-4">
                      {generationProgress || t('generatingDesc')}
                    </p>
                    <div className="mt-8">
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <div 
                          className="h-3 rounded-full transition-all duration-500 bg-purple-500" 
                          style={{ width: isGenerating ? '60%' : '100%' }} 
                        />
                      </div>
                    </div>
                    
                    {/* 取消按钮 */}
                    <div className="mt-6">
                      <Button
                        onClick={() => {
                          if (abortControllerRef.current) {
                            abortControllerRef.current.abort();
                          }
                          setIsCancelling(true);
                          setIsGenerating(false);
                          setCurrentStep(2);
                        }}
                        variant="outline"
                        className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white px-6 py-2 rounded-lg"
                        disabled={isCancelling}
                      >
                        {isCancelling ? '取消中...' : '取消生成'}
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center">
                    <div className="text-6xl mb-4">⚠️</div>
                    <h4 className="text-2xl font-semibold text-red-400 mb-4">
                      生成失败
                    </h4>
                    <div className="mt-4 p-6 bg-red-900/30 border border-red-500 rounded-lg max-w-2xl mx-auto">
                      <p className="text-red-300 text-lg mb-4">{error}</p>
                      
                      {/* 针对特定错误的建议 */}
                      {error.includes('未检测到人脸') && (
                        <div className="text-left text-sm text-red-200 space-y-2">
                          <p className="font-semibold">💡 建议：</p>
                          <ul className="list-disc list-inside space-y-1 ml-4">
                            <li>确保图片中有清晰的人脸</li>
                            <li>人脸部分应该占据图片的较大比例</li>
                            <li>避免模糊、过暗或过亮的图片</li>
                            <li>确保人脸没有被遮挡</li>
                          </ul>
                        </div>
                      )}
                      
                      {error.includes('图片格式无效') && (
                        <div className="text-left text-sm text-red-200 space-y-2">
                          <p className="font-semibold">💡 建议：</p>
                          <ul className="list-disc list-inside space-y-1 ml-4">
                            <li>使用JPG或PNG格式的图片</li>
                            <li>确保图片分辨率足够高</li>
                            <li>避免使用截图或压缩过度的图片</li>
                          </ul>
                        </div>
                      )}
                      
                      {error.includes('视频格式无效') && (
                        <div className="text-left text-sm text-red-200 space-y-2">
                          <p className="font-semibold">💡 建议：</p>
                          <ul className="list-disc list-inside space-y-1 ml-4">
                            <li>使用MP4或MOV格式的视频</li>
                            <li>确保视频质量良好</li>
                            <li>避免使用过短或过长的视频</li>
                          </ul>
                        </div>
                      )}
                      
                      <div className="mt-6 flex justify-center space-x-4">
                        <Button
                          onClick={() => {
                            setError(null);
                            setCurrentStep(2);
                          }}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg"
                        >
                          重新选择文件
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setError(null);
                            handleGenerateVideo();
                          }}
                          className="text-purple-400 border-purple-400 hover:bg-purple-400 hover:text-white px-6 py-2 rounded-lg"
                        >
                          重试
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="mb-8">
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="text-center">
                  {generatedVideoUrl ? (
                    <div className="mt-6">
                     
                      <div className="mt-6">
                        <video 
                          controls 
                          className="w-full max-h-96 rounded-lg mx-auto border-2 border-purple-500"
                          src={generatedVideoUrl}
                          onLoadStart={() => console.log('🎬 开始加载视频...')}
                          onLoadedData={() => console.log('✅ 视频加载完成')}
                          onError={(e) => console.error('❌ 视频加载失败:', e)}
                        >
                          {t('browserNotSupportVideo')}
                        </video>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-6 p-4 bg-red-900/30 border border-red-500 rounded-lg">
                      <p className="text-red-300">⚠️ 视频URL未设置，请检查生成状态</p>
                      <p className="text-sm text-red-200 mt-2">
                        当前状态: {currentStep === 4 ? '第四步' : '未知'}<br/>
                        视频URL: {generatedVideoUrl || '未设置'}
                      </p>
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
                  onClick={() => {
                    if (generatedVideoUrl) {
                      const link = document.createElement('a');
                      link.href = generatedVideoUrl;
                      link.download = 'ai-generated-video.mp4';
                      link.click();
                    }
                  }}
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