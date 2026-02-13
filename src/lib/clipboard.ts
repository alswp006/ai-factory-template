/**
 * Copy text to clipboard
 * Returns true on success, false on failure or if text is empty
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  // Don't attempt clipboard write when text is empty
  if (!text || text.trim() === "") {
    return false;
  }

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    // Handle clipboard write failure gracefully
    console.error("Failed to copy to clipboard:", error);
    return false;
  }
}
