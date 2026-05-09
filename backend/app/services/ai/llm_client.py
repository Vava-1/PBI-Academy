"""LLM client for AI services."""
from typing import List, Dict, Any, Optional
import httpx

from app.config import settings


class LLMClient:
    """Client for LLM API calls."""
    
    def __init__(self):
        self.openai_key = settings.openai_api_key
        
        # Default to OpenAI if available, otherwise mock
        self.provider = "openai" if self.openai_key else "mock"
    
    async def chat_completion(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: int = 1000,
        model: Optional[str] = None
    ) -> str:
        """Get chat completion from LLM."""
        if self.provider == "openai":
            return await self._openai_chat(messages, temperature, max_tokens, model)
        else:
            # Mock response for development
            return self._mock_chat(messages)
    
    async def _openai_chat(
        self,
        messages: List[Dict[str, str]],
        temperature: float,
        max_tokens: int,
        model: Optional[str]
    ) -> str:
        """Call OpenAI API."""
        model = model or "gpt-3.5-turbo"
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.openai_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": model,
                    "messages": messages,
                    "temperature": temperature,
                    "max_tokens": max_tokens
                },
                timeout=60.0
            )
            
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]
    
    def _mock_chat(self, messages: List[Dict[str, str]]) -> str:
        """Generate mock response for development."""
        last_message = messages[-1]["content"].lower() if messages else ""
        
        if "quiz" in last_message or "question" in last_message:
            return """[
                {"id": "q1", "question_text": "What is the capital of France?", "options": ["London", "Paris", "Berlin", "Madrid"], "correct_answer": "B", "difficulty": "easy", "explanation": "Paris is the capital of France."},
                {"id": "q2", "question_text": "Which tense describes an action happening now?", "options": ["Past", "Present", "Future", "Perfect"], "correct_answer": "B", "difficulty": "easy", "explanation": "Present tense describes current actions."}
            ]"""
        
        if "exam" in last_message:
            return """To prepare for your exam effectively:
            
1. Create a study schedule with specific time blocks
2. Practice with timed mock tests
3. Focus on your weak areas identified in analytics
4. Get adequate rest before the exam
5. Review test-taking strategies for your specific exam format

Would you like specific tips for any section?"""
        
        return """I'm here to help with your learning journey! I can assist with:
- Language practice and grammar questions
- Exam preparation strategies
- Course content explanations
- Study plan recommendations

What would you like to work on today?"""
    
    async def evaluate_writing(
        self,
        text: str,
        exam_type: str,
        rubric: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Evaluate writing using AI."""
        from app.services.ai.evaluator import EXAM_EVALUATOR_SYSTEM_PROMPT
        
        prompt = f"""Evaluate the following {exam_type} writing response:

Student Response:
{text}

Provide detailed scoring according to {exam_type} rubrics."""
        
        messages = [
            {"role": "system", "content": EXAM_EVALUATOR_SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ]
        
        response = await self.chat_completion(messages, temperature=0.3, max_tokens=2000)
        
        # Parse evaluation from response
        # In production, this would parse structured JSON
        return self._parse_evaluation_response(response, exam_type)
    
    def _parse_evaluation_response(self, response: str, exam_type: str) -> Dict[str, Any]:
        """Parse evaluation from LLM response."""
        import json
        import re
        
        # Try to find JSON in response
        json_match = re.search(r'\{.*\}', response, re.DOTALL)
        if json_match:
            try:
                return json.loads(json_match.group())
            except json.JSONDecodeError:
                pass
        
        # Fallback to default evaluation
        return {
            "overall_score": 75,
            "max_score": 100,
            "cefr_level": "B1",
            "score_breakdown": [
                {"dimension": "Content", "score": 18, "max_score": 25, "justification": "Good ideas but needs more development"},
                {"dimension": "Organization", "score": 17, "max_score": 25, "justification": "Clear structure with minor issues"},
                {"dimension": "Language", "score": 20, "max_score": 25, "justification": "Good vocabulary range"},
                {"dimension": "Mechanics", "score": 20, "max_score": 25, "justification": "Few grammar errors"}
            ],
            "feedback": {
                "summary": "Good response with room for improvement",
                "strengths": ["Clear thesis", "Good vocabulary"],
                "improvement_plan": ["Add more specific examples", "Check verb tenses"]
            },
            "grammar_analysis": {
                "errors": [],
                "error_count": 0,
                "accuracy_rate": 95
            },
            "vocabulary_analysis": {
                "unique_words": 150,
                "sophisticated_terms": [],
                "repetitive_patterns": []
            }
        }
