"use client";

import { useRef, useEffect, useState } from "react";

type Tool = "pen" | "eraser";
type LineWidth = 2 | 5 | 8;

const COLORS = [
  "#000000",
  "#FF0000",
  "#00FF00",
  "#0000FF",
  "#FFFF00",
  "#FF00FF",
];

export default function Whiteboard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState("#000000");
  const [lineWidth, setLineWidth] = useState<LineWidth>(2);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size to window size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Handle window resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const startDrawing = (
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x =
      "touches" in e
        ? e.touches[0].clientX - rect.left
        : (e as React.MouseEvent).clientX - rect.left;
    const y =
      "touches" in e
        ? e.touches[0].clientY - rect.top
        : (e as React.MouseEvent).clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x =
      "touches" in e
        ? e.touches[0].clientX - rect.left
        : (e as React.MouseEvent).clientX - rect.left;
    const y =
      "touches" in e
        ? e.touches[0].clientY - rect.top
        : (e as React.MouseEvent).clientY - rect.top;

    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (tool === "eraser") {
      ctx.clearRect(x - lineWidth / 2, y - lineWidth / 2, lineWidth, lineWidth);
    } else {
      ctx.strokeStyle = color;
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.closePath();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="w-full h-screen flex flex-col bg-white">
      {/* Toolbar */}
      <div className="bg-gray-100 border-b border-gray-300 p-4 flex items-center gap-6 flex-wrap">
        {/* Tool Selection */}
        <div className="flex gap-2">
          <button
            onClick={() => setTool("pen")}
            className={`px-4 py-2 rounded font-medium transition ${
              tool === "pen"
                ? "bg-blue-500 text-white"
                : "bg-white border border-gray-300 hover:bg-gray-50"
            }`}
          >
            ✏️ Pen
          </button>
          <button
            onClick={() => setTool("eraser")}
            className={`px-4 py-2 rounded font-medium transition ${
              tool === "eraser"
                ? "bg-blue-500 text-white"
                : "bg-white border border-gray-300 hover:bg-gray-50"
            }`}
          >
            🧹 Eraser
          </button>
        </div>

        {/* Color Palette */}
        {tool === "pen" && (
          <div className="flex gap-2 items-center">
            <span className="text-sm font-medium text-gray-700">Color:</span>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded border-2 transition ${
                    color === c ? "border-gray-800" : "border-gray-300"
                  }`}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
          </div>
        )}

        {/* Line Width */}
        <div className="flex gap-2 items-center">
          <span className="text-sm font-medium text-gray-700">Thickness:</span>
          <div className="flex gap-2">
            {[2, 5, 8].map((width) => (
              <button
                key={width}
                onClick={() => setLineWidth(width as LineWidth)}
                className={`px-3 py-2 rounded border transition ${
                  lineWidth === width
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white border-gray-300 hover:bg-gray-50"
                }`}
              >
                {width}px
              </button>
            ))}
          </div>
        </div>

        {/* Clear Button */}
        <button
          onClick={clearCanvas}
          className="px-4 py-2 bg-red-500 text-white rounded font-medium hover:bg-red-600 transition"
        >
          🗑️ Clear
        </button>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        className="flex-1 cursor-crosshair bg-white"
      />
    </div>
  );
}
