// Text extraction from PDF and DOCX files
// Using unpdf for serverless-compatible PDF parsing

export interface ExtractionResult {
  text: string;
  pageCount?: number;
  error?: string;
}

/**
 * Extract text from a PDF file buffer using unpdf
 * unpdf is designed for serverless environments and doesn't require workers
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<ExtractionResult> {
  try {
    const { extractText } = await import("unpdf");

    // Convert Buffer to Uint8Array
    const uint8Array = new Uint8Array(buffer);

    // Extract all text from the PDF
    const result = await extractText(uint8Array, { mergePages: true });

    // Ensure we return a plain string
    const extractedText = typeof result.text === "string" ? result.text : String(result.text || "");
    const pageCount = typeof result.totalPages === "number" ? result.totalPages : undefined;

    return {
      text: extractedText.trim(),
      pageCount,
    };
  } catch (error) {
    console.error("[PDF Extract] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to extract PDF text";
    return {
      text: "",
      error: errorMessage,
    };
  }
}

/**
 * Extract text from a DOCX file buffer
 */
export async function extractTextFromDOCX(buffer: Buffer): Promise<ExtractionResult> {
  try {
    // Dynamic import for mammoth
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return {
      text: result.value.trim(),
    };
  } catch (error) {
    console.error("[DOCX Extract] Error:", error);
    return {
      text: "",
      error: error instanceof Error ? error.message : "Failed to extract DOCX text",
    };
  }
}

/**
 * Extract text from a file based on its type
 */
export async function extractTextFromFile(
  buffer: Buffer,
  fileType: string
): Promise<ExtractionResult> {
  const normalizedType = fileType.toLowerCase();

  if (normalizedType === "application/pdf" || normalizedType.endsWith(".pdf")) {
    return extractTextFromPDF(buffer);
  }

  if (
    normalizedType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    normalizedType.endsWith(".docx")
  ) {
    return extractTextFromDOCX(buffer);
  }

  return {
    text: "",
    error: `Unsupported file type: ${fileType}. Please upload a PDF or DOCX file.`,
  };
}

/**
 * Validate file type
 */
export function isValidResumeFileType(fileType: string): boolean {
  const normalizedType = fileType.toLowerCase();
  return (
    normalizedType === "application/pdf" ||
    normalizedType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    normalizedType.endsWith(".pdf") ||
    normalizedType.endsWith(".docx")
  );
}

/**
 * Get file extension from MIME type
 */
export function getFileExtension(mimeType: string): string {
  if (mimeType === "application/pdf") return "pdf";
  if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
    return "docx";
  return "unknown";
}
