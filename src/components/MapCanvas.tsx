import React from "react";

type MapCanvasProps = {
  className?: string;
};

const MapCanvas = React.forwardRef<HTMLDivElement, MapCanvasProps>(function MapCanvas({ className }, ref) {
  return <div ref={ref} className={className || "w-full h-full rounded-xl overflow-hidden"} />;
});

export default MapCanvas;
