export function FlowForgeLogo({ className = "h-8 w-8" }) {
  return (
    <div className={`${className} relative`}>
      <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Outer gear ring with teeth */}
        <g>
          {/* Main gear circle */}
          <circle cx="16" cy="16" r="13" fill="currentColor" className="text-flowforge-teal" />
          
          {/* Gear teeth - 8 geometric teeth around the circle */}
          <rect x="15" y="1" width="2" height="4" fill="currentColor" className="text-flowforge-teal" />
          <rect x="27" y="15" width="4" height="2" fill="currentColor" className="text-flowforge-teal" />
          <rect x="15" y="27" width="2" height="4" fill="currentColor" className="text-flowforge-teal" />
          <rect x="1" y="15" width="4" height="2" fill="currentColor" className="text-flowforge-teal" />
          
          {/* Diagonal teeth */}
          <rect x="24.5" y="5.5" width="3" height="2" fill="currentColor" className="text-flowforge-teal" transform="rotate(45 26 6.5)" />
          <rect x="24.5" y="24.5" width="3" height="2" fill="currentColor" className="text-flowforge-teal" transform="rotate(45 26 25.5)" />
          <rect x="4.5" y="24.5" width="3" height="2" fill="currentColor" className="text-flowforge-teal" transform="rotate(45 6 25.5)" />
          <rect x="4.5" y="5.5" width="3" height="2" fill="currentColor" className="text-flowforge-teal" transform="rotate(45 6 6.5)" />
        </g>

        {/* Inner circle background */}
        <circle cx="16" cy="16" r="8" fill="currentColor" className="text-background" />
        
        {/* Forward arrow - geometric and bold */}
        <g>
          {/* Arrow shaft */}
          <rect x="10" y="15" width="8" height="2" fill="currentColor" className="text-flowforge-blue" />
          
          {/* Arrow head - triangular */}
          <path
            d="M18 12L22 16L18 20V17H18V15H18V12Z"
            fill="currentColor"
            className="text-flowforge-blue"
          />
        </g>
        
        {/* Small accent dot for depth */}
        <circle cx="16" cy="16" r="1.5" fill="currentColor" className="text-flowforge-amber opacity-80" />
      </svg>
    </div>
  )
}
