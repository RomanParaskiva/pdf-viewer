import { useState, useEffect } from "react";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import "./App.scss";

import ru_RU from '@react-pdf-viewer/locales/lib/ru_RU.json';

import packageJson from '../package.json';

const pdfjsVersion = packageJson.dependencies['pdfjs-dist'];

function App() {
  const [pdfUrl, setPdfUrl] = useState("");
  // const [numPages, setNumPages] = useState();
  // const [page, setPage] = useState(1);
  // const [title, setTitle] = useState("");
  // const [scale, setScale] = useState(1);

  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  const characterMap = {
    isCompressed: true,
    // The url has to end with "/"
    url: 'https://unpkg.com/pdfjs-dist@2.6.347/cmaps/',
};




  // function onDocumentLoadSuccess({ numPages }) {
  //   setNumPages(numPages);
  // }

  // function onItemClick({ pageNumber: itemPageNumber }) {
  //   setPage(itemPageNumber);
  // }

  // const useGesture = createUseGesture([pinchAction, dragAction]);
  // const ref = useRef(null);
  // useEffect(() => {
  //   const handler = (e) => e.preventDefault();
  //   document.addEventListener("gesturestart", handler);
  //   document.addEventListener("gesturechange", handler);
  //   document.addEventListener("gestureend", handler);
  //   return () => {
  //     document.removeEventListener("gesturestart", handler);
  //     document.removeEventListener("gesturechange", handler);
  //     document.removeEventListener("gestureend", handler);
  //   };
  // }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPdfUrl(document.querySelector("#pdf-url")?.dataset?.url || "");
      // setTitle(document.querySelector("#pdf-url")?.dataset?.title || "");
    }
    return () => {
      setPdfUrl(null);
    };
  }, []);

  // const [style, api] = useSpring(() => ({
  //   x: 0,
  //   y: 0,
  //   scale: 1,
  // }));

  // useGesture(
  //   {
  //     // onHover: ({ active, event }) => console.log('hover', event, active),
  //     // onMove: ({ event }) => console.log('move', event),
  //     onDrag: ({
  //       pinching,
  //       cancel,
  //       swipe: [swipeX],
  //       overflow,
  //       offset: [x, y],
  //       ...rest
  //     }) => {
  //       if (pinching) return cancel();
  //       if (swipeX) {
  //         if (swipeX === 1) setPage((prev) => (prev === 1 ? 1 : prev - 1));
  //         if (swipeX === -1)
  //           setPage((prev) => (prev === numPages ? numPages : prev + 1));
  //         api.start({ x: 0, y: 0 });
  //       } else {
  //       api.start({ x, y });
  //       }
  //     },
  //     onPinch: ({
  //       origin: [ox, oy],
  //       first,
  //       movement: [ms],
  //       offset: [s, a],
  //       memo,
  //     }) => {
  //       if (first) {
  //         const { width, height, x, y } = ref.current?.getBoundingClientRect();
  //         const tx = ox - (x + width / 2);
  //         const ty = oy - (y + height / 2);
  //         memo = [style.x.get(), style.y.get(), tx, ty];
  //       }
  //       ref.current.style.transformOrigin = `${ox} ${oy}`;
  //       api.start({
  //         scale: s,
  //         x: style.x.get(),
  //         y: style.y.get(),
  //         origin: [ox, oy],
  //       });
  //       return memo;
  //     },
  //   },
  //   {
  //     target: ref,
  //     drag: { from: () => [style.x.get(), style.y.get()] },
  //     pinch: {
  //       scaleBounds: { min: 0.5, max: 2 },
  //       rubberband: true,
  //       axis: "lock",
  //       pinchOnWheel: true,
  //     },
  //   }
  // );

  return (
    <>
      <div className="pdf-wrapper">
      <Worker workerUrl={`https://unpkg.com/pdfjs-dist@${pdfjsVersion}/build/pdf.worker.min.js`}>
        <Viewer
          fileUrl={pdfUrl}
          plugins={[defaultLayoutPluginInstance]}
          defaultScale={1}
          characterMap={characterMap}
          localization={ru_RU}
          theme="auto"
        />
      </Worker>
      </div>
    </>
  );
}

export default App;
