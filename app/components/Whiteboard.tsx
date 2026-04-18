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
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const getCurrentDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
  };

  const addTab = () => {
    const imageData = getCurrentDrawing();
    tabCounterRef.current += 1;
    const newId = tabCounterRef.current.toString();
    
    setTabs((prevTabs) => {
      const updatedTabs = prevTabs.map((t) =>
        t.id === activeTabId ? { ...t, imageData } : t
      );
      const newTab: Tab = {
        id: newId,
        name: `Drawing ${prevTabs.length + 1}`,
        imageData: null,
      };
      return [...updatedTabs, newTab];
    });
    setActiveTabId(newId);
  };

  const switchTab = (id: string) => {
    if (id === activeTabId) return;
    const imageData = getCurrentDrawing();
    setTabs((prevTabs) =>
      prevTabs.map((t) => (t.id === activeTabId ? { ...t, imageData } : t))
    );
    setActiveTabId(id);
  };

  const closeTab = (id: string) => {
    if (tabs.length === 1) return;
    
    const imageData = getCurrentDrawing();
    
    setTabs((prevTabs) => {
      const updatedTabs = prevTabs.map((t) =>
        t.id === activeTabId ? { ...t, imageData } : t
      );
      return updatedTabs.filter((t) => t.id !== id);
    });
    
    if (activeTabId === id) {
      const remainingTabs = tabs.filter((t) => t.id !== id);
      setActiveTabId(remainingTabs[0].id);
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

  const exportWorkspace = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const currentImageData = getCurrentDrawing();
    
    const offscreen1 = document.createElement('canvas');
    offscreen1.width = canvas.width;
    offscreen1.height = canvas.height;
    const ctx1 = offscreen1.getContext('2d');
    
    const offscreen2 = document.createElement('canvas');
    offscreen2.width = canvas.width;
    offscreen2.height = canvas.height;
    const ctx2 = offscreen2.getContext('2d');
    
    if (!ctx1 || !ctx2) return;

    const workspaceTabs = tabs.map(tab => {
      let dataURL = null;
      const targetImageData = tab.id === activeTabId ? currentImageData : tab.imageData;
      
      if (targetImageData) {
        ctx1.putImageData(targetImageData, 0, 0);
        ctx2.fillStyle = '#ffffff';
        ctx2.fillRect(0, 0, offscreen2.width, offscreen2.height);
        ctx2.drawImage(offscreen1, 0, 0);
        dataURL = offscreen2.toDataURL("image/png");
      }
      
      return {
        id: tab.id,
        name: tab.name,
        dataURL
      };
    });

    const workspace = {
      version: 1,
      activeTabId,
      tabs: workspaceTabs
    };
    
    const jsonStr = JSON.stringify(workspace);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.download = "whiteboard_workspace.json";
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const workspace = JSON.parse(text);
        
        if (workspace.version === 1 && Array.isArray(workspace.tabs)) {
          const canvas = canvasRef.current;
          if (!canvas) return;
          
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = canvas.width;
          tempCanvas.height = canvas.height;
          const ctx = tempCanvas.getContext('2d');
          if (!ctx) return;
          
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const newTabs = await Promise.all(workspace.tabs.map((tabData: any) => {
            return new Promise<Tab>((resolve) => {
              if (!tabData.dataURL) {
                resolve({
                  id: tabData.id,
                  name: tabData.name,
                  imageData: null
                });
                return;
              }
              
              const img = new Image();
              img.onload = () => {
                ctx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
                ctx.drawImage(img, 0, 0);
                const imageData = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
                resolve({
                  id: tabData.id,
                  name: tabData.name,
                  imageData
                });
              };
              img.onerror = () => {
                resolve({
                  id: tabData.id,
                  name: tabData.name,
                  imageData: null
                });
              };
              img.src = tabData.dataURL;
            });
          }));
          
          setTabs(newTabs);
          
          const maxId = Math.max(...newTabs.map((t: Tab) => parseInt(t.id) || 0), 0);
          tabCounterRef.current = maxId;
          
          setActiveTabId(workspace.activeTabId || newTabs[0]?.id || "1");
        }
      } catch (err) {
        console.error("Failed to parse workspace file", err);
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    reader.readAsText(file);
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

        {/* Import/Export */}
        <div className="flex gap-2 ml-auto">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".json" 
            className="hidden" 
          />
          <button
            onClick={handleImportClick}
            className="px-4 py-2 bg-green-500 text-white rounded font-medium hover:bg-green-600 transition"
          >
            📥 Import All
          </button>
          <button
            onClick={exportWorkspace}
            className="px-4 py-2 bg-purple-500 text-white rounded font-medium hover:bg-purple-600 transition"
          >
            📤 Export All
          </button>
        </div>
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
