"use client";

import { useRef, useEffect, useState } from "react";

type Tool = "pen" | "eraser";
type LineWidth = 2 | 5 | 8;

interface Tab {
  id: string;
  name: string;
  imageData: ImageData | null;
}

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
  const tabCounterRef = useRef(1);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState("#000000");
  const [lineWidth, setLineWidth] = useState<LineWidth>(2);
  const [tabs, setTabs] = useState<Tab[]>([
    { id: "1", name: "Drawing 1", imageData: null },
  ]);
  const [activeTabId, setActiveTabId] = useState("1");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size to window size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 120;

    // Restore previous drawing if it exists
    const activeTab = tabs.find((t) => t.id === activeTabId);
    if (activeTab?.imageData) {
      ctx.putImageData(activeTab.imageData, 0, 0);
    }

    // Handle window resize
    const handleResize = () => {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight - 120;
      ctx.putImageData(imageData, 0, 0);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [activeTabId, tabs]);

  const saveCurrentDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setTabs(tabs.map((t) => (t.id === activeTabId ? { ...t, imageData } : t)));
  };

  const addTab = () => {
    saveCurrentDrawing();
    tabCounterRef.current += 1;
    const newId = tabCounterRef.current.toString();
    const newTab: Tab = {
      id: newId,
      name: `Drawing ${tabs.length + 1}`,
      imageData: null,
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newId);
  };

  const switchTab = (id: string) => {
    saveCurrentDrawing();
    setActiveTabId(id);
  };

  const closeTab = (id: string) => {
    if (tabs.length === 1) return;
    const newTabs = tabs.filter((t) => t.id !== id);
    setTabs(newTabs);
    if (activeTabId === id) {
      setActiveTabId(newTabs[0].id);
    }
  };

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
      {/* Tabs */}
      <div className="bg-gray-200 border-b-2 border-gray-400 flex items-center gap-2 px-4 py-2 overflow-x-auto">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`flex items-center gap-2 px-4 py-2 rounded-t border-2 cursor-pointer transition ${
              activeTabId === tab.id
                ? "bg-blue-500 text-white border-blue-600 shadow-lg"
                : "bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-150"
            }`}
          >
            <button
              onClick={() => switchTab(tab.id)}
              className="font-semibold text-sm"
            >
              {tab.name}
            </button>
            {tabs.length > 1 && (
              <button
                onClick={() => closeTab(tab.id)}
                className={`font-bold text-sm transition ${
                  activeTabId === tab.id
                    ? "text-white hover:text-gray-200"
                    : "text-gray-500 hover:text-red-600"
                }`}
              >
                ✕
              </button>
            )}
          </div>
        ))}
        <button
          onClick={addTab}
          className="ml-2 px-3 py-2 bg-blue-500 text-white rounded font-medium hover:bg-blue-600 transition text-sm"
        >
          + New
        </button>
      </div>

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
