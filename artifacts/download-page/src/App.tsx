import { useEffect, useState } from "react";

const API_BASE = "";

interface ApkInfo {
  available: boolean;
  filename?: string;
  sizeMB?: string;
}

export default function App() {
  const [info, setInfo] = useState<ApkInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/apk/info`)
      .then((r) => r.json())
      .then((data) => setInfo(data))
      .catch(() => setInfo({ available: false }))
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = () => {
    window.location.href = `${API_BASE}/api/apk/download`;
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.iconWrap}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <rect width="24" height="24" rx="6" fill="#00D4FF" />
            <path
              d="M7 10l5 5 5-5"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 15V4"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M5 19h14"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <h1 style={styles.title}>Cuphead UI</h1>
        <p style={styles.subtitle}>
          Oculta los botones táctiles de tus juegos cuando usas un mando
        </p>

        {loading ? (
          <div style={styles.statusBox}>
            <span style={{ color: "#888" }}>Verificando APK...</span>
          </div>
        ) : info?.available ? (
          <>
            <div style={styles.statusBox}>
              <span style={styles.dot} />
              <span style={{ color: "#22c55e", fontWeight: 600 }}>
                APK disponible
              </span>
              {info.sizeMB && (
                <span style={{ color: "#888", marginLeft: 8 }}>
                  ({info.sizeMB} MB)
                </span>
              )}
            </div>

            <button style={styles.btn} onClick={handleDownload}>
              Descargar APK
            </button>

            <div style={styles.steps}>
              <p style={styles.stepsTitle}>Cómo instalar:</p>
              <ol style={styles.stepsList}>
                <li>Descarga el archivo APK</li>
                <li>
                  En Android: <em>Ajustes → Seguridad → Fuentes desconocidas</em>
                </li>
                <li>Abre el archivo descargado e instala</li>
              </ol>
            </div>
          </>
        ) : (
          <div style={styles.statusBox}>
            <span style={styles.dotGray} />
            <span style={{ color: "#888" }}>APK no disponible aún</span>
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8f9fb",
    fontFamily: "'Inter', sans-serif",
    padding: "20px",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "20px",
    padding: "40px 32px",
    maxWidth: "400px",
    width: "100%",
    textAlign: "center",
    boxShadow: "0 2px 20px rgba(0,0,0,0.08)",
    border: "1px solid #eee",
  },
  iconWrap: {
    marginBottom: "16px",
  },
  title: {
    fontSize: "28px",
    fontWeight: 700,
    color: "#111",
    margin: "0 0 8px",
  },
  subtitle: {
    fontSize: "15px",
    color: "#666",
    margin: "0 0 24px",
    lineHeight: 1.5,
  },
  statusBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    backgroundColor: "#f8f9fb",
    border: "1px solid #eee",
    borderRadius: "10px",
    padding: "10px 16px",
    marginBottom: "20px",
    fontSize: "14px",
  },
  dot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#22c55e",
    display: "inline-block",
  },
  dotGray: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#ccc",
    display: "inline-block",
  },
  btn: {
    width: "100%",
    backgroundColor: "#00D4FF",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    padding: "14px",
    fontSize: "16px",
    fontWeight: 600,
    cursor: "pointer",
    marginBottom: "24px",
  },
  steps: {
    textAlign: "left",
    backgroundColor: "#f8f9fb",
    borderRadius: "12px",
    padding: "16px",
  },
  stepsTitle: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#444",
    margin: "0 0 8px",
  },
  stepsList: {
    fontSize: "13px",
    color: "#666",
    margin: 0,
    paddingLeft: "18px",
    lineHeight: 1.8,
  },
};
