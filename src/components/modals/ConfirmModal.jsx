import { motion } from "framer-motion";
import { T } from "../../theme";

export default function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(10px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 3000,
        padding: 20,
      }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: "spring", stiffness: 320, damping: 26 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: T.bgCardSolid,
          backdropFilter: "blur(24px)",
          border: `1px solid ${T.border}`,
          borderRadius: 20,
          padding: 24,
          width: 360,
          maxWidth: "90vw",
          boxSizing: "border-box",
          boxShadow: "0 32px 80px rgba(0,0,0,0.15)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 14,
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: T.redBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 17,
              flexShrink: 0,
            }}
          >
            ⚠️
          </div>
          <p
            style={{ margin: 0, fontSize: 14, fontWeight: 800, color: T.text }}
          >
            Konfirmasi
          </p>
        </div>

        <p
          style={{
            margin: "0 0 20px",
            fontSize: 13,
            color: T.textSub,
            lineHeight: 1.6,
          }}
        >
          {message}
        </p>

        <div style={{ display: "flex", gap: 10 }}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={onCancel}
            style={{
              flex: 1,
              padding: "11px",
              borderRadius: 12,
              background: "transparent",
              border: `1px solid ${T.border}`,
              color: T.textMuted,
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "Arial",
            }}
          >
            Batal
          </motion.button>
          <motion.button
            whileHover={{
              scale: 1.02,
              boxShadow: "0 8px 24px rgba(239,68,68,0.35)",
            }}
            whileTap={{ scale: 0.97 }}
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: "11px",
              borderRadius: 12,
              background: T.red,
              border: "none",
              color: "white",
              fontSize: 13,
              fontWeight: 800,
              cursor: "pointer",
              fontFamily: "Arial",
            }}
          >
            Ya, Lanjutkan
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
