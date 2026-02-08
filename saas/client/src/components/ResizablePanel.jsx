import React, { useState, useRef, useEffect } from 'react';

const ResizablePanel = ({ 
  children, 
  defaultWidth = 400, 
  minWidth = 300, 
  maxWidth = 800,
  position = 'right' // 'left' or 'right'
}) => {
  const [width, setWidth] = useState(defaultWidth);
  const [isResizing, setIsResizing] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      
      const newWidth = position === 'right' 
        ? window.innerWidth - e.clientX 
        : e.clientX;
      
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = position === 'right' ? 'ew-resize' : 'ew-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, minWidth, maxWidth, position]);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsResizing(true);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div
      ref={panelRef}
      className={`resizable-panel ${position === 'right' ? 'resizable-panel-right' : 'resizable-panel-left'} ${
        isCollapsed ? 'collapsed' : ''
      }`}
      style={{
        width: isCollapsed ? '0px' : `${width}px`,
        [position]: 0,
      }}
    >
      {/* Resize Handle */}
      <div
        className={`resize-handle ${position === 'right' ? 'resize-handle-left' : 'resize-handle-right'}`}
        onMouseDown={handleMouseDown}
      >
        <div className="resize-handle-line"></div>
      </div>

      {/* Collapse/Expand Button */}
      <button
        onClick={toggleCollapse}
        className={`collapse-toggle ${position === 'right' ? 'collapse-toggle-left' : 'collapse-toggle-right'}`}
        title={isCollapsed ? 'Expand panel' : 'Collapse panel'}
      >
        {isCollapsed ? (
          position === 'right' ? '←' : '→'
        ) : (
          position === 'right' ? '→' : '←'
        )}
      </button>

      {/* Panel Content */}
      <div className="resizable-panel-content">
        {children}
      </div>
    </div>
  );
};

export default ResizablePanel;
