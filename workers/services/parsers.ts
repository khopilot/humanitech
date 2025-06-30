import mammoth from 'mammoth';
import { parse as parseCSV } from 'papaparse';
import * as XLSX from 'xlsx';
import type { ParsedDocument } from '../types/bindings';

export class DocumentParser {
  async parseFile(file: File): Promise<ParsedDocument> {
    const buffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);
    
    try {
      switch (file.type) {
        case 'application/pdf':
          return await this.parsePDF(uint8Array);
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          return await this.parseWord(buffer);
        case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
          return this.parseExcel(buffer);
        case 'text/csv':
          return this.parseCSV(uint8Array);
        case 'text/plain':
          return this.parseText(uint8Array);
        default:
          throw new Error(`Unsupported file type: ${file.type}`);
      }
    } catch (error) {
      console.error('Parse error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown parsing error';
      return {
        raw: `Error parsing file: ${errorMessage}`,
        metadata: {
          extractedAt: new Date().toISOString(),
          error: errorMessage
        }
      };
    }
  }

  private async parsePDF(buffer: Uint8Array): Promise<ParsedDocument> {
    // Note: pdf-parse might not work directly in Workers
    // You might need to use a different PDF parsing approach
    // or implement a simpler text extraction method
    
    // Fallback implementation
    const decoder = new TextDecoder();
    const text = decoder.decode(buffer);
    
    // Simple PDF text extraction (very basic)
    const textMatch = text.match(/stream\s*(.*?)\s*endstream/gs);
    const extractedText = textMatch ? textMatch.join(' ') : 'PDF parsing not fully supported in Workers';
    
    return {
      raw: extractedText,
      metadata: {
        extractedAt: new Date().toISOString(),
        wordCount: extractedText.split(/\s+/).length
      }
    };
  }

  private async parseWord(buffer: ArrayBuffer): Promise<ParsedDocument> {
    try {
      const result = await mammoth.extractRawText({ arrayBuffer: buffer });
      
      return {
        raw: result.value,
        metadata: {
          extractedAt: new Date().toISOString(),
          wordCount: result.value.split(/\s+/).length
        }
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Word parsing failed: ${errorMessage}`);
    }
  }

  private parseExcel(buffer: ArrayBuffer): ParsedDocument {
    try {
      const workbook = XLSX.read(buffer, { type: 'array' });
      let content = '';
      const sheets = [];
      
      workbook.SheetNames.forEach(sheetName => {
        const sheet = workbook.Sheets[sheetName];
        const csvData = XLSX.utils.sheet_to_csv(sheet);
        content += `\n\n=== Sheet: ${sheetName} ===\n${csvData}`;
        
        sheets.push({
          name: sheetName,
          data: XLSX.utils.sheet_to_json(sheet, { header: 1 })
        });
      });
      
      return {
        raw: content,
        structured: { sheets },
        metadata: {
          extractedAt: new Date().toISOString(),
          sheetCount: workbook.SheetNames.length
        }
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Excel parsing failed: ${errorMessage}`);
    }
  }

  private parseCSV(buffer: Uint8Array): ParsedDocument {
    try {
      const decoder = new TextDecoder();
      const text = decoder.decode(buffer);
      
      const result = parseCSV(text, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true
      });
      
      if (result.errors.length > 0) {
        console.warn('CSV parsing warnings:', result.errors);
      }
      
      return {
        raw: text,
        structured: {
          data: result.data,
          headers: result.meta.fields,
          rowCount: result.data.length
        },
        metadata: {
          extractedAt: new Date().toISOString(),
          rowCount: result.data.length,
          columnCount: result.meta.fields?.length || 0
        }
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`CSV parsing failed: ${errorMessage}`);
    }
  }

  private parseText(buffer: Uint8Array): ParsedDocument {
    const decoder = new TextDecoder();
    const text = decoder.decode(buffer);
    
    return {
      raw: text,
      metadata: {
        extractedAt: new Date().toISOString(),
        wordCount: text.split(/\s+/).length,
        lineCount: text.split('\n').length
      }
    };
  }
}