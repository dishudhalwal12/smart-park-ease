from __future__ import annotations

import re
import time
from dataclasses import asdict, is_dataclass
from typing import Any

import cv2
import numpy as np
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

try:
    from fast_alpr import ALPR
except Exception as import_error:  # pragma: no cover - runtime environment dependent
    ALPR = None
    IMPORT_ERROR = str(import_error)
else:
    IMPORT_ERROR = ""


app = FastAPI(title="SmartParkEase ANPR API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _safe_value(value: Any) -> Any:
    if is_dataclass(value):
        return _safe_value(asdict(value))
    if isinstance(value, dict):
        return {key: _safe_value(raw_value) for key, raw_value in value.items()}
    if isinstance(value, (list, tuple)):
        return [_safe_value(item) for item in value]
    if hasattr(value, "__dict__"):
        try:
            return _safe_value(vars(value))
        except Exception:
            return str(value)
    return value


def _normalize_plate(text: str) -> str:
    cleaned = re.sub(r"[^A-Za-z0-9]", "", text or "").upper()
    if len(cleaned) < 6:
        return ""
    return cleaned


def _collect_candidates(payload: Any) -> list[dict[str, Any]]:
    candidates: list[dict[str, Any]] = []

    def visit(node: Any) -> None:
        if isinstance(node, dict):
            text = node.get("text") or node.get("plate") or node.get("license_plate") or node.get("value")
            confidence = node.get("confidence") or node.get("score") or node.get("probability")
            normalized = _normalize_plate(str(text)) if text else ""
            if normalized:
                try:
                    confidence_value = float(confidence) if confidence is not None else 0.0
                except Exception:
                    confidence_value = 0.0
                candidates.append({"plate": normalized, "confidence": max(0.0, min(confidence_value, 1.0))})

            for value in node.values():
                visit(value)
            return

        if isinstance(node, list):
            for value in node:
                visit(value)

    visit(payload)

    deduped: dict[str, float] = {}
    for candidate in candidates:
        plate = candidate["plate"]
        deduped[plate] = max(deduped.get(plate, 0.0), candidate["confidence"])

    return sorted(
        [{"plate": plate, "confidence": confidence} for plate, confidence in deduped.items()],
        key=lambda item: item["confidence"],
        reverse=True,
    )[:5]


class AlprEngine:
    def __init__(self) -> None:
        self._engine = None
        self._startup_error = ""
        if ALPR is None:
            self._startup_error = IMPORT_ERROR or "fast-alpr is not available"
            return

        try:
            self._engine = ALPR(
                detector_model="yolo-v9-t-384-license-plate-end2end",
                ocr_model="cct-xs-v2-global-model",
            )
        except Exception as startup_error:  # pragma: no cover - runtime environment dependent
            self._startup_error = str(startup_error)

    @property
    def is_ready(self) -> bool:
        return self._engine is not None

    @property
    def startup_error(self) -> str:
        return self._startup_error

    def predict(self, frame: np.ndarray) -> list[dict[str, Any]]:
        if not self._engine:
            raise RuntimeError(self._startup_error or "ANPR engine is not initialized")

        raw_result = self._engine.predict(frame)
        safe_result = _safe_value(raw_result)
        return _collect_candidates(safe_result)


engine = AlprEngine()


@app.get("/health")
def health() -> dict[str, Any]:
    return {
        "status": "healthy" if engine.is_ready else "degraded",
        "service": "smartparkease-anpr",
        "ready": engine.is_ready,
        "message": "ANPR engine is ready" if engine.is_ready else engine.startup_error,
    }


@app.post("/recognize")
async def recognize(image: UploadFile = File(...)) -> dict[str, Any]:
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Please upload a valid image file.")

    if not engine.is_ready:
        raise HTTPException(status_code=503, detail=engine.startup_error or "ANPR engine is unavailable.")

    content = await image.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded image is empty.")

    frame = cv2.imdecode(np.frombuffer(content, dtype=np.uint8), cv2.IMREAD_COLOR)
    if frame is None:
        raise HTTPException(status_code=400, detail="Could not decode image payload.")

    started_at = time.perf_counter()
    try:
        candidates = engine.predict(frame)
    except Exception as prediction_error:
        raise HTTPException(status_code=500, detail=f"ANPR processing failed: {prediction_error}") from prediction_error

    processing_ms = int((time.perf_counter() - started_at) * 1000)
    return {
        "success": True,
        "candidates": candidates,
        "best": candidates[0] if candidates else None,
        "processingMs": processing_ms,
        "error": None if candidates else "No plate candidates detected.",
    }
