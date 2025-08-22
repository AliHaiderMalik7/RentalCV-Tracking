import React from 'react';

const AuthBanner = ({ 
  imageSrc, 
  altText = "Luxury property",
  titlePart1 = "Rental",
  titlePart2 = "CV.ai",
  subtitle = "Elevating rental experiences through premium verification",
  borderColor = "#28c76f",
  titleColor = "#0369a1"
}:any) => {
  return (
    < >
      {/* Image Container */}
      <div className="flex-1 flex items-center justify-center max-w-full max-h-[70vh]">
        <img
          src={imageSrc}
          alt={altText}
          className="max-w-2/3 max-h-full object-contain"
        />
      </div>

      {/* Text Container */}
      <div className="w-full max-w-3xl mx-auto mt-8 mb-12">
        <div className="border-l-4 pl-6" style={{ borderColor }}>
          <h1 className="text-5xl font-light mb-3 tracking-tight" style={{ color: titleColor }}>
            {titlePart1}<span className="font-bold">{titlePart2}</span>
          </h1>
          <p className="text-slate-600 text-xl font-light">
            {subtitle}
          </p>
        </div>
      </div>
    </>
  );
};

export default AuthBanner;