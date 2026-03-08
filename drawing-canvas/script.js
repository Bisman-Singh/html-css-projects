(() => {
  const canvas = document.getElementById("drawingCanvas");
  const preview = document.getElementById("previewCanvas");
  const grid = document.getElementById("gridCanvas");
  const ctx = canvas.getContext("2d");
  const pCtx = preview.getContext("2d");
  const gCtx = grid.getContext("2d");

  const colorPicker = document.getElementById("colorPicker");
  const colorHex = document.getElementById("colorHex");
  const brushSize = document.getElementById("brushSize");
  const sizeValue = document.getElementById("sizeValue");
  const opacitySlider = document.getElementById("opacitySlider");
  const opacityValue = document.getElementById("opacityValue");
  const gridToggle = document.getElementById("gridToggle");
  const confirmModal = document.getElementById("confirmModal");

  let currentTool = "pencil";
  let currentColor = "#ffffff";
  let currentSize = 4;
  let currentOpacity = 1;
  let fillMode = false;
  let isDrawing = false;
  let startX = 0;
  let startY = 0;

  const undoStack = [];
  const redoStack = [];
  const MAX_HISTORY = 50;

  function resizeCanvases() {
    const area = document.querySelector(".canvas-area");
    const w = area.clientWidth;
    const h = area.clientHeight;

    [canvas, preview, grid].forEach((c) => {
      c.width = w;
      c.height = h;
    });

    if (undoStack.length > 0) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
      };
      img.src = undoStack[undoStack.length - 1];
    } else {
      fillWhite();
    }

    if (gridToggle.checked) drawGrid();
  }

  function fillWhite() {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function saveState() {
    if (undoStack.length >= MAX_HISTORY) undoStack.shift();
    undoStack.push(canvas.toDataURL());
    redoStack.length = 0;
  }

  function undo() {
    if (undoStack.length <= 1) return;
    redoStack.push(undoStack.pop());
    restoreState(undoStack[undoStack.length - 1]);
  }

  function redo() {
    if (redoStack.length === 0) return;
    const state = redoStack.pop();
    undoStack.push(state);
    restoreState(state);
  }

  function restoreState(dataUrl) {
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = dataUrl;
  }

  function drawGrid() {
    gCtx.clearRect(0, 0, grid.width, grid.height);
    gCtx.strokeStyle = "rgba(148, 163, 184, 0.12)";
    gCtx.lineWidth = 1;
    const step = 20;
    for (let x = step; x < grid.width; x += step) {
      gCtx.beginPath();
      gCtx.moveTo(x + 0.5, 0);
      gCtx.lineTo(x + 0.5, grid.height);
      gCtx.stroke();
    }
    for (let y = step; y < grid.height; y += step) {
      gCtx.beginPath();
      gCtx.moveTo(0, y + 0.5);
      gCtx.lineTo(grid.width, y + 0.5);
      gCtx.stroke();
    }
  }

  function clearGrid() {
    gCtx.clearRect(0, 0, grid.width, grid.height);
  }

  function setContextStyle(context) {
    context.strokeStyle = currentColor;
    context.fillStyle = currentColor;
    context.lineWidth = currentSize;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.globalAlpha = currentOpacity;
  }

  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }

  function onPointerDown(e) {
    e.preventDefault();
    isDrawing = true;
    const pos = getPos(e);
    startX = pos.x;
    startY = pos.y;

    if (currentTool === "pencil" || currentTool === "eraser") {
      setContextStyle(ctx);
      if (currentTool === "eraser") {
        ctx.strokeStyle = "#ffffff";
        ctx.globalAlpha = 1;
      }
      ctx.beginPath();
      ctx.moveTo(startX, startY);
    }
  }

  function onPointerMove(e) {
    if (!isDrawing) return;
    e.preventDefault();
    const pos = getPos(e);

    if (currentTool === "pencil" || currentTool === "eraser") {
      setContextStyle(ctx);
      if (currentTool === "eraser") {
        ctx.strokeStyle = "#ffffff";
        ctx.globalAlpha = 1;
      }
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else {
      pCtx.clearRect(0, 0, preview.width, preview.height);
      setContextStyle(pCtx);
      drawShape(pCtx, startX, startY, pos.x, pos.y);
    }
  }

  function onPointerUp(e) {
    if (!isDrawing) return;
    isDrawing = false;

    if (currentTool === "pencil" || currentTool === "eraser") {
      ctx.closePath();
    } else {
      pCtx.clearRect(0, 0, preview.width, preview.height);
      const pos = getPos(e.changedTouches ? e.changedTouches[0] : e);
      // Only draw if there's actual movement
      if (Math.abs(pos.x - startX) > 1 || Math.abs(pos.y - startY) > 1) {
        setContextStyle(ctx);
        drawShape(ctx, startX, startY, pos.x, pos.y);
      }
    }

    saveState();
    ctx.globalAlpha = 1;
  }

  function drawShape(context, x1, y1, x2, y2) {
    context.beginPath();
    switch (currentTool) {
      case "line":
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.stroke();
        break;
      case "rectangle": {
        const w = x2 - x1;
        const h = y2 - y1;
        if (fillMode) {
          context.fillRect(x1, y1, w, h);
        } else {
          context.strokeRect(x1, y1, w, h);
        }
        break;
      }
      case "circle": {
        const rx = Math.abs(x2 - x1) / 2;
        const ry = Math.abs(y2 - y1) / 2;
        const cx = x1 + (x2 - x1) / 2;
        const cy = y1 + (y2 - y1) / 2;
        context.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        if (fillMode) {
          context.fill();
        } else {
          context.stroke();
        }
        break;
      }
    }
  }

  function exportPNG() {
    const link = document.createElement("a");
    link.download = "drawing.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  function showClearConfirm() {
    confirmModal.classList.add("visible");
  }

  function hideClearConfirm() {
    confirmModal.classList.remove("visible");
  }

  function clearCanvas() {
    fillWhite();
    saveState();
    hideClearConfirm();
  }

  // ── Tool selection ──

  document.querySelectorAll(".tool-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelector(".tool-btn.active").classList.remove("active");
      btn.classList.add("active");
      currentTool = btn.dataset.tool;
    });
  });

  // ── Fill/Stroke toggle ──

  document.querySelectorAll(".toggle-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelector(".toggle-btn.active").classList.remove("active");
      btn.classList.add("active");
      fillMode = btn.dataset.mode === "fill";
    });
  });

  // ── Color ──

  colorPicker.addEventListener("input", (e) => {
    currentColor = e.target.value;
    colorHex.textContent = currentColor;
    document.querySelectorAll(".swatch").forEach((s) => s.classList.remove("active"));
  });

  document.querySelectorAll(".swatch").forEach((swatch) => {
    swatch.addEventListener("click", () => {
      currentColor = swatch.dataset.color;
      colorPicker.value = currentColor;
      colorHex.textContent = currentColor;
      document.querySelectorAll(".swatch").forEach((s) => s.classList.remove("active"));
      swatch.classList.add("active");
    });
  });

  // ── Sliders ──

  brushSize.addEventListener("input", (e) => {
    currentSize = parseInt(e.target.value);
    sizeValue.textContent = currentSize;
  });

  opacitySlider.addEventListener("input", (e) => {
    currentOpacity = parseInt(e.target.value) / 100;
    opacityValue.textContent = e.target.value;
  });

  // ── Grid ──

  gridToggle.addEventListener("change", () => {
    if (gridToggle.checked) drawGrid();
    else clearGrid();
  });

  // ── Action buttons ──

  document.getElementById("undoBtn").addEventListener("click", undo);
  document.getElementById("redoBtn").addEventListener("click", redo);
  document.getElementById("clearBtn").addEventListener("click", showClearConfirm);
  document.getElementById("exportBtn").addEventListener("click", exportPNG);
  document.getElementById("modalCancel").addEventListener("click", hideClearConfirm);
  document.getElementById("modalConfirm").addEventListener("click", clearCanvas);

  confirmModal.addEventListener("click", (e) => {
    if (e.target === confirmModal) hideClearConfirm();
  });

  // ── Keyboard shortcuts ──

  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === "z") {
        e.preventDefault();
        undo();
      } else if (e.key === "y") {
        e.preventDefault();
        redo();
      } else if (e.key === "s") {
        e.preventDefault();
        exportPNG();
      }
      return;
    }

    const keyMap = { p: "pencil", l: "line", r: "rectangle", c: "circle", e: "eraser" };
    if (keyMap[e.key]) {
      document.querySelector(".tool-btn.active").classList.remove("active");
      document.querySelector(`[data-tool="${keyMap[e.key]}"]`).classList.add("active");
      currentTool = keyMap[e.key];
    }
  });

  // ── Canvas events ──

  canvas.addEventListener("mousedown", onPointerDown);
  canvas.addEventListener("mousemove", onPointerMove);
  canvas.addEventListener("mouseup", onPointerUp);
  canvas.addEventListener("mouseleave", onPointerUp);

  canvas.addEventListener("touchstart", onPointerDown, { passive: false });
  canvas.addEventListener("touchmove", onPointerMove, { passive: false });
  canvas.addEventListener("touchend", (e) => {
    if (!isDrawing) return;
    isDrawing = false;
    if (currentTool === "pencil" || currentTool === "eraser") {
      ctx.closePath();
    } else {
      pCtx.clearRect(0, 0, preview.width, preview.height);
      if (e.changedTouches.length > 0) {
        const pos = getPos(e.changedTouches[0]);
        if (Math.abs(pos.x - startX) > 1 || Math.abs(pos.y - startY) > 1) {
          setContextStyle(ctx);
          drawShape(ctx, startX, startY, pos.x, pos.y);
        }
      }
    }
    saveState();
    ctx.globalAlpha = 1;
  });

  // ── Init ──

  window.addEventListener("resize", resizeCanvases);
  resizeCanvases();
  fillWhite();
  saveState();
})();
