"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import DottedMap from "dotted-map";

interface MapProps {
  dots?: Array<{
    start: { lat: number; lng: number; label?: string };
    end: { lat: number; lng: number; label?: string };
  }>;
  lineColor?: string;
}

export function WorldMap({
  dots = [],
  lineColor = "#0ea5e9",
}: MapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const map = new DottedMap({ height: 100, grid: "diagonal" });

  dots.forEach((dot, i) => {
    map.addPin({ lat: dot.start.lat, lng: dot.start.lng, data: `start-${i}` });
    map.addPin({ lat: dot.end.lat, lng: dot.end.lng, data: `end-${i}` });
  });

  const svgMap = map.getSVG({
    radius: 0.22,
    color: "#FFFFFF40", // Dark theme
    shape: "circle",
    backgroundColor: "transparent",
  });

  const points = map.getPoints();
  const getProjectedPoint = (dataId: string) => {
    const p = points.find(p => p.data === dataId);
    return p ? { x: p.x, y: p.y } : { x: 0, y: 0 };
  };

  const mapWidth = (map as any).width || 198;
  const mapHeight = (map as any).height || 100;

  const createCurvedPath = (
    start: { x: number; y: number },
    end: { x: number; y: number }
  ) => {
    const midX = (start.x + end.x) / 2;
    const distance = Math.abs(end.x - start.x);
    let midY = Math.min(start.y, end.y) - distance * 0.25;
    if (midY < 5) midY = 5;
    return `M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`;
  };

  return (
    <div className="w-full aspect-[2/1] bg-transparent rounded-lg relative font-sans overflow-hidden">
      <img
        src={`data:image/svg+xml;utf8,${encodeURIComponent(svgMap)}`}
        className="h-full w-full absolute inset-0 object-contain [mask-image:linear-gradient(to_bottom,transparent,white_10%,white_90%,transparent)] pointer-events-none select-none"
        alt="world map"
        draggable={false}
      />
      <svg
        ref={svgRef}
        viewBox={`0 0 ${mapWidth} ${mapHeight}`}
        className="w-full h-full absolute inset-0 pointer-events-none select-none overflow-visible"
        preserveAspectRatio="xMidYMid meet"
      >
        {dots.map((dot, i) => {
          const startPoint = getProjectedPoint(`start-${i}`);
          const endPoint = getProjectedPoint(`end-${i}`);
          return (
            <g key={`path-group-${i}`}>
              <motion.path
                d={createCurvedPath(startPoint, endPoint)}
                fill="none"
                stroke="url(#path-gradient)"
                strokeWidth="0.5"
                vectorEffect="non-scaling-stroke"
                initial={{
                  pathLength: 0,
                }}
                animate={{
                  pathLength: 1,
                }}
                transition={{
                  duration: 1,
                  delay: 0.5 * i,
                  ease: "easeOut",
                }}
                key={`start-upper-${i}`}
              ></motion.path>
            </g>
          );
        })}

        <defs>
          <linearGradient id="path-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="5%" stopColor={lineColor} stopOpacity="1" />
            <stop offset="95%" stopColor={lineColor} stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>

        {dots.map((dot, i) => {
          const startPoint = getProjectedPoint(`start-${i}`);
          const endPoint = getProjectedPoint(`end-${i}`);
          return (
            <g key={`points-group-${i}`}>
              <g key={`start-${i}`}>
                <circle
                  cx={startPoint.x}
                  cy={startPoint.y}
                  r="0.8"
                  fill={lineColor}
                />
                <circle
                  cx={startPoint.x}
                  cy={startPoint.y}
                  r="0.8"
                  fill={lineColor}
                  opacity="0.5"
                >
                  <animate
                    attributeName="r"
                    from="0.8"
                    to="2.5"
                    dur="1.5s"
                    begin="0s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    from="0.5"
                    to="0"
                    dur="1.5s"
                    begin="0s"
                    repeatCount="indefinite"
                  />
                </circle>
              </g>
              <g key={`end-${i}`}>
                <circle
                  cx={endPoint.x}
                  cy={endPoint.y}
                  r="0.8"
                  fill={lineColor}
                />
                <circle
                  cx={endPoint.x}
                  cy={endPoint.y}
                  r="0.8"
                  fill={lineColor}
                  opacity="0.5"
                >
                  <animate
                    attributeName="r"
                    from="0.8"
                    to="2.5"
                    dur="1.5s"
                    begin="0s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    from="0.5"
                    to="0"
                    dur="1.5s"
                    begin="0s"
                    repeatCount="indefinite"
                  />
                </circle>
              </g>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
