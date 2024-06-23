import { useState, useEffect, useRef, createRef } from "react";
import { Document, Page } from "react-pdf";
import { useSpring, animated } from "@react-spring/web";
import { createUseGesture, pinchAction, dragAction } from "@use-gesture/react";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import "./App.scss";

import { pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

function App() {
  const [pdfUrl, setPdfUrl] = useState("");
  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState(1);
  const [title, setTitle] = useState("");
  const [scale, setScale] = useState(1);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const pageRefs = useRef([]);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    pageRefs.current = Array(numPages)
      .fill()
      .map((_, i) => pageRefs.current[i] || createRef());
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

  useEffect(() => {
    const updateWidth = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        let visiblePageIndex = -1;
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const pageIndex = pageRefs.current.findIndex(
              (ref) => ref.current === entry.target
            );
            if (pageIndex !== -1) {
              visiblePageIndex = pageIndex;
            }
          }
        });
        if (visiblePageIndex !== -1) {
          setPage(visiblePageIndex + 1);
        }
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 0.5,
      }
    );

    pageRefs.current.forEach((ref) => {
      if (ref.current) {
        observer.observe(ref.current);
      }
    });

    return () => {
      pageRefs.current.forEach((ref) => {
        if (ref.current) {
          observer.unobserve(ref.current);
        }
      });
    };
  }, [numPages]);

  const [style, api] = useSpring(() => ({
    x: 0,
    y: 0,
    scale: 1,
  }));

  useGesture(
    {
      onDrag: ({
        pinching,
        cancel,
        swipe: [swipeX],
        offset: [x, y],
      }) => {
        if (pinching) return cancel();
        if (swipeX) {
          // if (swipeX === 1) setPage((prev) => (prev === 1 ? 1 : prev - 1));
          // if (swipeX === -1)
          //   setPage((prev) => (prev === numPages ? numPages : prev + 1));
          api.start({ x: 0, y: 0 });
        } else {
          api.start({ x, y });
        }
      },
      onPinch: ({
        origin: [ox, oy],
        first,
        offset: [s],
        memo,
      }) => {
        if (first) {
          const { width, height, x, y } = ref.current?.getBoundingClientRect();
          const tx = ox - (x + width / 2);
          const ty = oy - (y + height / 2);
          memo = [style.x.get(), style.y.get(), tx, ty];
        }
        ref.current.style.transformOrigin = `${ox}px ${oy}px`;
        api.start({
          scale: s,
          x: style.x.get(),
          y: style.y.get(),
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

  const scrollToPage = (pageNumber) => {
    if (pageRefs.current[pageNumber - 1]?.current) {
      pageRefs.current[pageNumber - 1].current.scrollIntoView({
        behavior: "smooth",
      });
    }
  };

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <div className="pdf-wrapper">
        <Document
          className="document"
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onItemClick={onItemClick}
        >
          <animated.div className="animateddiv" ref={ref} style={style}>
            {Array.from(new Array(numPages), (el, index) => (
              <div
                key={`page_${index + 1}`}
                ref={pageRefs.current[index]}
                style={{ marginBottom: "10px" }} // Добавим отступы между страницами
              >
                <Page
                  className="page"
                  pageNumber={index + 1}
                  scale={scale}
                  width={screenWidth}
                />
              </div>
            ))}
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

          <div>
            <span
              className="pdf-btn"
              onClick={() => {
                const newPage = page === 1 ? 1 : page - 1;
                setPage(newPage);
                scrollToPage(newPage);
              }}
            >
              &#5176;
            </span>
          </div>

          <span className="text">
            {page} / {numPages}
          </span>

          <div>
            <span
              className="pdf-btn"
              onClick={() => {
                const newPage = page === numPages ? numPages : page + 1;
                setPage(newPage);
                scrollToPage(newPage);
              }}
            >
              &#5171;
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;
