// src/hooks/useCSVUploader.js
import { useState } from "react";

/**
 * useCSVUploader
 * ----------------
 * A custom React hook for parsing and validating CSV files on the client.
 * Used in Admin Exam CSV Upload flow.
 *
 * Expected Headers:
 *   Question, OptionA, OptionB, OptionC, OptionD, Answer, Explanation
 */

export default function useCSVUploader() {
  const [previewData, setPreviewData] = useState([]);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");

  /**
   * Parse the uploaded CSV file into structured objects
   * @param {File} file - CSV file from input
   */
  const parseCSV = async (file) => {
    if (!file) {
      setError("Please select a valid CSV file.");
      return;
    }

    if (!file.name.endsWith(".csv")) {
      setError("Only CSV files are allowed.");
      return;
    }

    try {
      const text = await file.text();
      const rows = text
        .split(/\r?\n/)
        .map((r) => r.trim())
        .filter((r) => r.length > 0)
        .map((r) => r.split(","));

      if (rows.length === 0) {
        setError("The CSV file is empty.");
        setPreviewData([]);
        return;
      }

      const headers = rows[0].map((h) => h.trim().toLowerCase());
      const expectedHeaders = [
        "question",
        "optiona",
        "optionb",
        "optionc",
        "optiond",
        "answer",
        "explanation",
      ];

      const validHeaders = expectedHeaders.every((h) => headers.includes(h));
      if (!validHeaders) {
        setError(
          `Invalid CSV headers. Expected: ${expectedHeaders.join(", ")}`
        );
        setPreviewData([]);
        return;
      }

      // Find index of each column (flexible header positions)
      const headerMap = {};
      headers.forEach((h, i) => {
        headerMap[h] = i;
      });

      // Build parsed question list
      const parsed = rows.slice(1).map((cols) => ({
        question: cols[headerMap["question"]] || "",
        optionA: cols[headerMap["optiona"]] || "",
        optionB: cols[headerMap["optionb"]] || "",
        optionC: cols[headerMap["optionc"]] || "",
        optionD: cols[headerMap["optiond"]] || "",
        answer: cols[headerMap["answer"]] || "",
        explanation: cols[headerMap["explanation"]] || "",
      }));

      // Filter out empty questions
      const clean = parsed.filter((q) => q.question.trim().length > 0);

      if (clean.length === 0) {
        setError("No valid questions found in CSV.");
        setPreviewData([]);
        return;
      }

      setPreviewData(clean);
      setError("");
      setFileName(file.name);
    } catch (err) {
      console.error("CSV parsing failed:", err);
      setError("Failed to read CSV file. Check file encoding or format.");
      setPreviewData([]);
    }
  };

  /** Reset hook data */
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
