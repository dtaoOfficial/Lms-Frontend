// src/hooks/useCSVUploader.js
import { useState } from "react";
import Papa from "papaparse";

/**
 * ✅ useCSVUploader (Final Synced Version)
 * Works perfectly with backend CSVParserUtil.java
 * Supports:
 *  - Custom delimiter (¬)
 *  - Custom quoteChar (using £)
 *  - C code syntax like printf("%d", a>10 || b<20)
 *  - Validates headers
 *  - Clean preview data for upload
 */
export default function useCSVUploader() {
  const [previewData, setPreviewData] = useState([]);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");

  const parseCSV = async (file) => {
    if (!file) {
      setError("Please select a valid CSV file.");
      return;
    }

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError("Only CSV files are allowed (.csv).");
      return;
    }

    try {
      const text = await file.text();

      // ✅ Proper CSV parsing using PapaParse
      const { data, errors, meta } = Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        quoteChar: "£",        // 👈 custom quote char (matches backend)
        escapeChar: "",        // 👈 disable escape parsing
        delimiter: "¬",        // 👈 custom delimiter
        newline: "",           // auto-detect line endings
        transformHeader: (h) =>
          h.replace(/\s+/g, "").trim().toLowerCase(), // normalize headers
        dynamicTyping: false,
      });

      if (errors?.length > 0) {
        console.warn("⚠️ CSV parse warnings:", errors);
      }

      if (!data || data.length === 0) {
        setError("No valid data found in CSV file.");
        setPreviewData([]);
        return;
      }

      const expectedHeaders = [
        "question",
        "optiona",
        "optionb",
        "optionc",
        "optiond",
        "answer",
        "explanation",
      ];

      const fileHeaders = meta.fields?.map((h) => h.toLowerCase()) || [];
      const validHeaders = expectedHeaders.every((h) =>
        fileHeaders.includes(h)
      );

      if (!validHeaders) {
        setError(
          `Invalid CSV headers. Expected: ${expectedHeaders.join("¬")}`
        );
        setPreviewData([]);
        return;
      }

      // ✅ Clean and normalize question data
      const cleanData = data
        .map((row) => ({
          question: (row.question || "").trim(),
          optionA: (row.optiona || "").trim(),
          optionB: (row.optionb || "").trim(),
          optionC: (row.optionc || "").trim(),
          optionD: (row.optiond || "").trim(),
          answer: (row.answer || "").trim(),
          explanation: (row.explanation || "").trim(),
        }))
        .filter((q) => q.question.length > 0);

      if (cleanData.length === 0) {
        setError("No valid questions found in the CSV file.");
        setPreviewData([]);
        return;
      }

      setPreviewData(cleanData);
      setError("");
      setFileName(file.name);
    } catch (err) {
      console.error("💥 CSV parsing failed:", err);
      setError(
        "Failed to parse CSV file. Please ensure it's UTF-8 encoded and formatted correctly."
      );
      setPreviewData([]);
    }
  };

  const resetCSV = () => {
    setPreviewData([]);
    setError("");
    setFileName("");
  };

  return {
    previewData,
    error,
    fileName,
    parseCSV,
    resetCSV,
  };
}
