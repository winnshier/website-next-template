'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '@/lib/api/types';

interface ProductSliderProps {
  products: Product[];
  locale: string;
}

export function ProductSlider({ products, locale }: ProductSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % products.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
  };

  // 键盘控制
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        nextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        prevSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const currentProduct = products[currentIndex];

  return (
    <div className="relative h-screen overflow-hidden bg-gray-900">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
            {/* 产品图片占位 */}
            <div className="mb-8 flex justify-center">
              <div className="w-64 h-64 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-6xl">
                📦
              </div>
            </div>

            {/* 产品信息 */}
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {currentProduct.title}
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              {currentProduct.description}
            </p>

            {/* 特性列表 */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {currentProduct.features.map((feature, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm"
                >
                  {feature}
                </span>
              ))}
            </div>

            {/* 页面指示器 */}
            <div className="flex justify-center items-center gap-2 mb-8">
              {products.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex
                      ? 'bg-white w-8'
                      : 'bg-white/30 hover:bg-white/50'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            {/* 页码 */}
            <p className="text-gray-400 text-sm">
              {currentIndex + 1} / {products.length}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* 导航按钮 */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
        aria-label="Previous slide"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
        aria-label="Next slide"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* 提示文字 */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 text-sm">
        {locale === 'zh' ? '使用方向键或点击按钮切换' : 'Use arrow keys or click buttons to navigate'}
      </div>
    </div>
  );
}
