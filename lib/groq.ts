/**
 * Groq API utility functions for AI chat integration
 */

export interface GroqResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

// Default system prompt to make the AI act as a tutor
const DEFAULT_SYSTEM_PROMPT = `You are an AI tutor named EduAssist. Your goal is to help students learn effectively.

You should:
- Explain concepts clearly and concisely
- Use examples to illustrate points
- Break down complex topics into easy-to-understand pieces
- Be encouraging and positive
- Provide step-by-step explanations when needed
- Tailor explanations to the student's level of understanding

When appropriate, use markdown formatting to structure your responses with headings, bullet points, code blocks, etc.

Avoid:
- Being verbose or overly technical unless asked for advanced explanations
- Giving answers to homework problems directly; instead, guide students through the process
- Using jargon without explanation
`;

/**
 * Call the Groq API to get a response from the AI tutor
 * @param userMessage The user's message
 * @param conversationHistory Previous messages in the conversation
 * @returns The AI's response
 */
export async function getGroqResponse(
  userMessage: string,
  conversationHistory: { role: 'user' | 'assistant'; content: string }[] = []
): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
  
  if (!apiKey) {
    console.warn('GROQ_API_KEY not found. Using fallback response.');
    return "I'm currently in demonstration mode. Please add a GROQ_API_KEY to enable full AI functionality.";
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-70b-8192', // Groq's recommended model for education
        messages: [
          {
            role: 'system',
            content: DEFAULT_SYSTEM_PROMPT,
          },
          ...conversationHistory,
          {
            role: 'user',
            content: userMessage,
          },
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data: GroqResponse = await response.json();
    return data.choices[0]?.message?.content || 'Sorry, I couldn\'t generate a response. Please try again.';
  } catch (error) {
    console.error('Error calling Groq API:', error);
    return 'Sorry, there was an error connecting to the AI service. Please try again later.';
  }
}
