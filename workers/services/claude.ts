import type { ClaudeMessage } from '../types/bindings';

export class ClaudeService {
  constructor(private apiKey: string) {}

  async generateResponse(
    messages: ClaudeMessage[], 
    systemPrompt?: string
  ): Promise<string> {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 4000,
          system: systemPrompt,
          messages,
        }),
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.status}`);
      }

      const data = await response.json();
      return data.content[0]?.text || '';
    } catch (error) {
      console.error('Claude API error:', error);
      throw new Error('Failed to generate response from Claude');
    }
  }

  async parseDocument(content: string, documentType: string): Promise<any> {
    const systemPrompt = `You are an expert in mine action operations. Extract structured data from the following ${documentType} document and format it as JSON. Include key information such as:
    - Location/coordinates
    - Date/time
    - Personnel involved
    - Activities performed
    - Hazards identified
    - Safety measures
    - Equipment used
    - Results/outcomes
    
    Respond with valid JSON only.`;
    
    const response = await this.generateResponse([
      { 
        role: 'user', 
        content: `Parse this ${documentType} document and extract key information:\n\n${content.slice(0, 4000)}` 
      }
    ], systemPrompt);

    try {
      return JSON.parse(response);
    } catch {
      return { 
        raw: response,
        error: 'Failed to parse as JSON',
        extractedText: content.slice(0, 1000)
      };
    }
  }

  async generateReport(
    data: any[], 
    reportType: string, 
    donorSpecific?: string,
    dateRange?: { start: string; end: string }
  ): Promise<string> {
    const systemPrompt = `You are a mine action specialist creating ${reportType} reports. Generate professional, donor-appropriate content based on the provided data. 
    
    Include:
    - Executive summary
    - Key metrics and achievements
    - Challenges and mitigation strategies
    - Future recommendations
    - Compliance with IMAS standards
    
    Format as professional markdown document.`;
    
    const contextInfo = donorSpecific ? `for ${donorSpecific}` : 'for general stakeholders';
    const periodInfo = dateRange ? `covering period ${dateRange.start} to ${dateRange.end}` : '';
    
    const prompt = `Generate a comprehensive ${reportType} report ${contextInfo} ${periodInfo} based on this data:
    
    Data Summary:
    - Total documents processed: ${data.length}
    - Document types: ${[...new Set(data.map(d => d.type))].join(', ')}
    
    Detailed Data: ${JSON.stringify(data.slice(0, 10), null, 2)}
    
    Ensure the report follows international mine action reporting standards.`;

    return await this.generateResponse([
      { role: 'user', content: prompt }
    ], systemPrompt);
  }

  async assessRisk(
    surveyData: any[], 
    incidentLogs: any[],
    area: string
  ): Promise<{ level: string; analysis: string; recommendations: string[] }> {
    const systemPrompt = `You are a mine action risk assessment expert. Analyze survey data and incident logs to predict risk levels and priority areas according to IMAS standards.
    
    Risk levels: LOW, MEDIUM, HIGH, CRITICAL
    
    Consider:
    - Historical incident patterns
    - Hazard density and types
    - Population proximity
    - Infrastructure importance
    - Environmental factors
    
    Respond with JSON containing: level, analysis, recommendations array.`;
    
    const prompt = `Analyze risk for area "${area}" based on:
    
    Survey Data: ${JSON.stringify(surveyData)}
    Incident Logs: ${JSON.stringify(incidentLogs)}
    
    Provide comprehensive risk assessment with actionable recommendations.`;

    const response = await this.generateResponse([
      { role: 'user', content: prompt }
    ], systemPrompt);

    try {
      return JSON.parse(response);
    } catch {
      // Fallback parsing
      const level = response.includes('CRITICAL') ? 'CRITICAL' :
                   response.includes('HIGH') ? 'HIGH' :
                   response.includes('MEDIUM') ? 'MEDIUM' : 'LOW';
      
      return {
        level,
        analysis: response,
        recommendations: ['Review assessment manually', 'Consult field specialists']
      };
    }
  }

  async generateSOP(
    topic: string, 
    imasStandards: string[], 
    category: string
  ): Promise<string> {
    const systemPrompt = `You are a mine action technical expert. Generate Standard Operating Procedure (SOP) content based on IMAS standards and international best practices.
    
    Include:
    - Purpose and scope
    - References to IMAS standards
    - Responsibilities
    - Procedures (step-by-step)
    - Safety requirements
    - Quality assurance
    - Documentation requirements
    
    Format as professional SOP document with clear sections and numbering.`;
    
    const prompt = `Generate a comprehensive SOP for: ${topic}
    
    Category: ${category}
    Reference IMAS standards: ${imasStandards.join(', ')}
    
    Ensure compliance with international mine action standards and include specific safety protocols.`;

    return await this.generateResponse([
      { role: 'user', content: prompt }
    ], systemPrompt);
  }

  async chatResponse(
    messages: ClaudeMessage[],
    userContext?: { role: string; recentDocuments?: any[] }
  ): Promise<string> {
    const systemPrompt = `You are an expert AI assistant specializing in humanitarian mine action operations. You help IM officers and program managers with:
    
    - Mine action standards (IMAS)
    - Risk assessment and analysis
    - Operational planning
    - Report generation
    - Safety protocols
    - Data interpretation
    - Equipment specifications
    - Training requirements
    
    User role: ${userContext?.role || 'USER'}
    
    Provide accurate, professional, and actionable advice based on international mine action best practices. Always prioritize safety and compliance with IMAS standards.`;

    return await this.generateResponse(messages, systemPrompt);
  }
}