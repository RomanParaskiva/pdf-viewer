import { useState, useEffect, useRef } from "react";
import { Document, Page, Outline } from "react-pdf";
import { useSpring, animated } from "@react-spring/web";
import { createUseGesture, pinchAction, dragAction } from "@use-gesture/react";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import "./App.scss";

import { pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

function App() {
  const [pdfUrl, setPdfUrl] = useState("");
  const [numPages, setNumPages] = useState();
  const [page, setPage] = useState(1);
  const [title, setTitle] = useState("");
  const [scale, setScale] = useState(1);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  function onItemClick({ pageNumber: itemPageNumber }) {
    setPage(itemPageNumber);
  }

  const useGesture = createUseGesture([pinchAction, dragAction]);
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => e.preventDefault();
    document.addEventListener("gesturestart", handler);
    document.addEventListener("gesturechange", handler);
    document.addEventListener("gestureend", handler);
    return () => {
      document.removeEventListener("gesturestart", handler);
      document.removeEventListener("gesturechange", handler);
      document.removeEventListener("gestureend", handler);
    };
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPdfUrl(document.querySelector("#pdf-url")?.dataset?.url || "");
      setTitle(document.querySelector("#pdf-url")?.dataset?.title || "");
    }
    return () => {
      setPdfUrl(null);
    };
  }, []);

  const [style, api] = useSpring(() => ({
    x: 0,
    y: 0,
    scale: 1,
  }));

  useGesture(
    {
      // onHover: ({ active, event }) => console.log('hover', event, active),
      // onMove: ({ event }) => console.log('move', event),
      onDrag: ({
        pinching,
        cancel,
        swipe: [swipeX],
        overflow,
        offset: [x, y],
        ...rest
      }) => {
        if (pinching) return cancel();
        if (swipeX) {
          if (swipeX === 1) setPage((prev) => (prev === 1 ? 1 : prev - 1));
          if (swipeX === -1)
            setPage((prev) => (prev === numPages ? numPages : prev + 1));
          api.start({ x: 0, y: 0 });
        } else {
        api.start({ x, y });
        }
      },
      onPinch: ({
        origin: [ox, oy],
        first,
        movement: [ms],
        offset: [s, a],
        memo,
      }) => {
        if (first) {
          const { width, height, x, y } = ref.current?.getBoundingClientRect();
          const tx = ox - (x + width / 2);
          const ty = oy - (y + height / 2);
          memo = [style.x.get(), style.y.get(), tx, ty];
        }
        ref.current.style.transformOrigin = `${ox} ${oy}`;
        api.start({
          scale: s,
          x: style.x.get(),
          y: style.y.get(),
          origin: [ox, oy],
        });
        return memo;
      },
    },
    {
      target: ref,
      drag: { from: () => [style.x.get(), style.y.get()] },
      pinch: {
        scaleBounds: { min: 0.5, max: 2 },
        rubberband: true,
        axis: "lock",
        pinchOnWheel: true,
      },
    }
  );

  return (
    <>
      <div className="pdf-wrapper">
        <Document
          className="document"
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onItemClick={onItemClick}
        >
          <animated.div className="animateddiv" ref={ref} style={style}>
            <Page className="page" pageNumber={page} scale={scale} />
            {/* {Array.from(new Array(numPages), (el, index) => (
              <Page
                key={`page_${index + 1}`}
                className="page"
                pageNumber={index + 1}
                scale={scale}
              />
            ))} */}
          </animated.div>
        </Document>

        <div className="toolbar">
          <div className="scale-tools">
            <span className="text">Масштаб</span>
            <span
              className="pdf-btn"
              onClick={() =>
                setScale((prev) => (prev === 2 ? prev : prev + 0.1))
              }
            >
              +
            </span>
            <span
              className="pdf-btn"
              onClick={() =>
                setScale((prev) => (prev === 0.5 ? 0.5 : prev - 0.1))
              }
            >
              -
            </span>
          </div>
          <span className="text">{title}</span>
          <span
            className="pdf-btn"
            onClick={() => {
              setPage((prev) => (prev === 1 ? 1 : prev - 1));
              setScale(1);
            }}
          >
            &#5176;
          </span>
          <span className="text">
            {page} / {numPages}
          </span>

          <span
            className="pdf-btn"
            onClick={() => {
              setPage((prev) => (prev === numPages ? numPages : prev + 1));
              setScale(1);
            }}
          >
            &#5171;
          </span>
        </div>
      </div>
    </>
  );
}

export default App;
