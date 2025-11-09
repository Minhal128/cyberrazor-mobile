/**
 * Smart FAQ Assistant with JSON + Gemini AI
 * Provides intelligent question-answer matching with AI fallback
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

class SmartFAQAssistant {
  constructor(faqData, apiKey = null) {
    this.faqs = faqData?.faqs || [];
    this.ai = apiKey ? new GoogleGenerativeAI(apiKey) : null;
    console.log(`[SmartFAQAssistant] Initialized with ${this.faqs.length} FAQs, AI: ${this.ai ? 'enabled' : 'disabled'}`);
  }

  async getAnswer(userQuestion) {
    console.log(`[SmartFAQAssistant] Processing question: "${userQuestion}"`);
    
    // Step 0: Check if question is related to CyberRazor/cybersecurity
    if (!this.isRelevantTopic(userQuestion)) {
      console.log(`[SmartFAQAssistant] ⚠️ Off-topic question detected`);
      return {
        answer: "I'm sorry, but that question doesn't seem to be related to CyberRazor or cybersecurity. I can help you with questions about:\n\n• CyberRazor features and setup\n• Threat detection and security\n• System configuration\n• Mobile and web app usage\n• Integration with security tools\n\nPlease ask me something about CyberRazor!",
        source: 'off_topic',
        confidence: 0,
        relatedQuestions: this.getSampleQuestions(5)
      };
    }
    
    // Step 1: First try to find exact or close match in JSON
    const jsonAnswer = this.findInJSON(userQuestion);
    
    console.log(`[SmartFAQAssistant] JSON match confidence: ${jsonAnswer.confidence.toFixed(3)}`);
    
    // If confidence is too low (< 0.5), treat as off-topic
    if (jsonAnswer.confidence < 0.5) {
      console.log(`[SmartFAQAssistant] ⚠️ Very low confidence (${jsonAnswer.confidence.toFixed(3)}) - treating as off-topic`);
      return {
        answer: "I'm sorry, but that question doesn't seem to be related to CyberRazor or cybersecurity. I specialize in answering questions about:\n\n• CyberRazor features and capabilities\n• Threat detection and security\n• System setup and configuration\n• Mobile and web app usage\n• Integration with security tools like Wazuh\n• AI-powered threat analysis\n\nPlease ask me something about CyberRazor or cybersecurity!",
        source: 'off_topic',
        confidence: 0,
        relatedQuestions: this.getSampleQuestions(5)
      };
    }
    
    // If we found a good match in JSON, return it
    if (jsonAnswer.confidence > 0.7) {
      console.log(`[SmartFAQAssistant] ✅ Using JSON answer (high confidence)`);
      return {
        answer: jsonAnswer.answer,
        source: 'faq_database',
        confidence: jsonAnswer.confidence,
        relatedQuestions: jsonAnswer.relatedQuestions,
        matchedQuestion: jsonAnswer.matchedQuestion
      };
    }

    // Step 2: If no good JSON match and AI is available, use Gemini
    if (this.ai) {
      try {
        console.log(`[SmartFAQAssistant] 🤖 Trying Gemini AI...`);
        const aiAnswer = await this.getAIAnswer(userQuestion);
        console.log(`[SmartFAQAssistant] ✅ Got AI answer`);
        return {
          answer: aiAnswer,
          source: 'ai_generated',
          confidence: 0.8,
          relatedQuestions: this.findRelatedQuestions(userQuestion)
        };
      } catch (error) {
        console.error("[SmartFAQAssistant] AI Error:", error);
        // Fallback to JSON even with low confidence
        return {
          answer: jsonAnswer.answer || "I'm not sure about that. Please try rephrasing your question or contact support for more specific help.",
          source: 'faq_fallback',
          confidence: jsonAnswer.confidence,
          relatedQuestions: jsonAnswer.relatedQuestions,
          matchedQuestion: jsonAnswer.matchedQuestion
        };
      }
    }

    // Step 3: Final fallback
    console.log(`[SmartFAQAssistant] ⚠️ Using fallback answer`);
    return {
      answer: jsonAnswer.answer || "I couldn't find an answer for that question. Please try rephrasing or ask about CyberRazor features, threats, or setup.",
      source: 'faq_fallback',
      confidence: jsonAnswer.confidence,
      relatedQuestions: jsonAnswer.relatedQuestions,
      matchedQuestion: jsonAnswer.matchedQuestion
    };
  }

  findInJSON(userQuestion) {
    const lowerQuestion = userQuestion.toLowerCase();
    let bestMatch = { 
      answer: null, 
      confidence: 0, 
      relatedQuestions: [],
      matchedQuestion: null 
    };
    
    // Check each FAQ for matches
    this.faqs.forEach(faq => {
      const confidence = this.calculateMatchConfidence(lowerQuestion, faq.question, faq.answer);
      
      if (confidence > bestMatch.confidence) {
        bestMatch = {
          answer: faq.answer,
          confidence: confidence,
          relatedQuestions: this.findSemanticallySimilar(faq.question, 3),
          matchedQuestion: faq.question
        };
      }
    });

    return bestMatch;
  }

  calculateMatchConfidence(userQuestion, faqQuestion, faqAnswer) {
    const lowerFAQQuestion = faqQuestion.toLowerCase();
    const lowerFAQAnswer = faqAnswer.toLowerCase();
    
    let confidence = 0;
    
    // Exact match in question
    if (userQuestion === lowerFAQQuestion) {
      confidence = 1.0;
    }
    // Question contains user question or vice versa
    else if (lowerFAQQuestion.includes(userQuestion) || userQuestion.includes(lowerFAQQuestion)) {
      confidence = 0.9;
    }
    // Check for keyword matches in question
    else {
      const userWords = userQuestion.split(/\s+/).filter(w => w.length > 2);
      const faqWords = lowerFAQQuestion.split(/\s+/).filter(w => w.length > 2);
      
      const matchingWords = userWords.filter(word => 
        faqWords.some(faqWord => faqWord.includes(word) || word.includes(faqWord))
      );
      
      const wordConfidence = matchingWords.length / Math.max(userWords.length, faqWords.length);
      
      // Also check answer for relevant keywords
      const answerMatches = userWords.filter(word => lowerFAQAnswer.includes(word)).length;
      const answerConfidence = answerMatches / userWords.length;
      
      confidence = Math.max(wordConfidence, answerConfidence * 0.5);
    }
    
    return confidence;
  }

  findSemanticallySimilar(targetQuestion, limit = 3) {
    const targetLower = targetQuestion.toLowerCase();
    const similarities = [];
    
    this.faqs.forEach(faq => {
      if (faq.question.toLowerCase() !== targetLower) {
        const commonWords = targetLower.split(/\s+/).filter(word => 
          faq.question.toLowerCase().includes(word) && word.length > 2
        ).length;
        
        if (commonWords > 0) {
          similarities.push({
            question: faq.question,
            score: commonWords
          });
        }
      }
    });
    
    return similarities
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.question);
  }

  findRelatedQuestions(userQuestion) {
    return this.findSemanticallySimilar(userQuestion, 3);
  }

  async getAIAnswer(userQuestion) {
    if (!this.ai) {
      throw new Error("AI not available");
    }

    // Create context from relevant FAQs
    const contextFAQs = this.findRelevantFAQsForContext(userQuestion, 10);
    const context = contextFAQs.map(faq => 
      `Q: ${faq.question}\nA: ${faq.answer}` 
    ).join('\n\n');

    const prompt = `You are a helpful assistant for CyberRazor cybersecurity platform. 
Use the following FAQ context to answer the user's question accurately and helpfully.

IMPORTANT: 
- If the answer is clearly in the context, use it directly
- If related information exists, combine it intelligently
- If completely unrelated, say you don't know but suggest related topics
- Keep answers clear and concise (2-3 sentences max)
- Always be truthful about what you know
- Focus on CyberRazor features, security, threats, and setup

FAQ Context:
${context}

User Question: ${userQuestion}

Please provide a helpful answer based on the context above:`;

    const model = this.ai.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }

  findRelevantFAQsForContext(userQuestion, limit = 10) {
    const lowerQuestion = userQuestion.toLowerCase();
    const scoredFAQs = this.faqs.map(faq => ({
      faq,
      score: this.calculateRelevanceScore(lowerQuestion, faq)
    }));
    
    return scoredFAQs
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.faq);
  }

  calculateRelevanceScore(userQuestion, faq) {
    let score = 0;
    
    // Check question
    const questionWords = faq.question.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const userWords = userQuestion.split(/\s+/).filter(w => w.length > 2);
    
    const questionMatches = userWords.filter(userWord =>
      questionWords.some(qWord => qWord.includes(userWord) || userWord.includes(qWord))
    ).length;
    
    // Check answer
    const answerWords = faq.answer.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const answerMatches = userWords.filter(userWord =>
      answerWords.some(aWord => aWord.includes(userWord) || userWord.includes(aWord))
    ).length;
    
    score = (questionMatches * 2 + answerMatches) / (userWords.length * 3);
    return score;
  }

  // Check if question is related to CyberRazor/cybersecurity
  isRelevantTopic(userQuestion) {
    const lowerQuestion = userQuestion.toLowerCase();
    
    // CyberRazor-specific keywords
    const cyberRazorKeywords = [
      'cyberrazor', 'cyber razor', 'soar', 'wazuh', 'thehive', 
      'threat', 'security', 'alert', 'detection', 'vulnerability',
      'malware', 'phishing', 'attack', 'firewall', 'encryption',
      'authentication', 'authorization', 'breach', 'incident',
      'dashboard', 'scan', 'monitor', 'protect', 'defense',
      'cyber', 'hack', 'intrusion', 'forensic', 'siem',
      'endpoint', 'network', 'antivirus', 'ransomware', 'exploit',
      'patch', 'compliance', 'audit', 'log', 'analysis',
      'ai', 'machine learning', 'automation', 'response',
      'install', 'setup', 'configure', 'integrate', 'deploy',
      'mobile', 'app', 'web', 'portal', 'admin', 'user',
      'login', 'signup', 'password', 'account', 'profile',
      'notification', 'email', 'report', 'export', 'api'
    ];
    
    // Check if question contains any relevant keywords
    const hasRelevantKeyword = cyberRazorKeywords.some(keyword => 
      lowerQuestion.includes(keyword)
    );
    
    // If no keywords found, check if it's asking about features/capabilities
    const isFeatureQuestion = /\b(what|how|can|does|is|do|will|should|feature|work|use)\b/.test(lowerQuestion);
    
    // Very short questions (< 3 words) are likely too vague
    const wordCount = lowerQuestion.split(/\s+/).length;
    if (wordCount < 3 && !hasRelevantKeyword) {
      return false;
    }
    
    // If it has relevant keywords OR is a feature question with reasonable length
    return hasRelevantKeyword || (isFeatureQuestion && wordCount >= 3);
  }

  // Get sample questions to show users
  getSampleQuestions(limit = 5) {
    const samples = [
      "What is CyberRazor?",
      "How does CyberRazor detect threats?",
      "Can I use CyberRazor on my phone?",
      "How do I set up CyberRazor?",
      "What security features does CyberRazor have?",
      "How does the AI work?",
      "Is CyberRazor free?",
      "How do I integrate with Wazuh?"
    ];
    return samples.slice(0, limit);
  }

  // Utility method to get all questions for display
  getAllQuestions() {
    return this.faqs.map(faq => faq.question);
  }

  // Search through FAQs
  searchFAQs(query, limit = 5) {
    const lowerQuery = query.toLowerCase();
    return this.faqs
      .filter(faq => 
        faq.question.toLowerCase().includes(lowerQuery) ||
        faq.answer.toLowerCase().includes(lowerQuery)
      )
      .slice(0, limit);
  }
}

export default SmartFAQAssistant;
