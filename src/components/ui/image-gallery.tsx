"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { OptimizedImage } from "./image";
import { cn } from "@/lib/utils";

interface ImageGalleryProps {
  images: {
    src: string;
    alt: string;
    title?: string;
    description?: string;
  }[];
  className?: string;
}

export function ImageGallery({ images, className }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const openModal = (index: number) => {
    setSelectedIndex(index);
  };

  const closeModal = () => {
    setSelectedIndex(null);
  };

  const goToPrevious = () => {
    if (selectedIndex !== null) {
      setSelectedIndex(selectedIndex > 0 ? selectedIndex - 1 : images.length - 1);
    }
  };

  const goToNext = () => {
    if (selectedIndex !== null) {
      setSelectedIndex(selectedIndex < images.length - 1 ? selectedIndex + 1 : 0);
    }
  };

  return (
    <>
      <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", className)}>
        {images.map((image, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="relative group cursor-pointer"
            onClick={() => openModal(index)}
          >
            <OptimizedImage
              src={image.src}
              alt={image.alt}
              width={400}
              height={300}
              className="w-full h-64 object-cover rounded-lg shadow-lg group-hover:shadow-xl transition-all duration-300"
              placeholder="empty"
              hover
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 rounded-lg flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-white/90 backdrop-blur-sm rounded-full p-3">
                  <ChevronRight className="h-6 w-6 text-gray-800" />
                </div>
              </div>
            </div>
            {image.title && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 rounded-b-lg">
                <h3 className="text-white font-semibold">{image.title}</h3>
                {image.description && (
                  <p className="text-white/80 text-sm">{image.description}</p>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-4xl max-h-[90vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={closeModal}
                className="absolute -top-4 -right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>

              {/* Navigation buttons */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={goToPrevious}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white transition-colors"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={goToNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white transition-colors"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}

              {/* Image */}
              <OptimizedImage
                src={images[selectedIndex].src}
                alt={images[selectedIndex].alt}
                width={800}
                height={600}
                className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
                placeholder="empty"
                priority
              />

              {/* Image info */}
              {(images[selectedIndex].title || images[selectedIndex].description) && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-lg">
                  {images[selectedIndex].title && (
                    <h3 className="text-white text-xl font-semibold mb-2">
                      {images[selectedIndex].title}
                    </h3>
                  )}
                  {images[selectedIndex].description && (
                    <p className="text-white/80">
                      {images[selectedIndex].description}
                    </p>
                  )}
                </div>
              )}

              {/* Image counter */}
              {images.length > 1 && (
                <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                  {selectedIndex + 1} / {images.length}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
