"""AI Chat service with RAG capabilities."""
from openai import OpenAI
from app.services.rag_service import rag_service
from app.database import supabase_client
from app.config import settings
import logging
from typing import List, Dict, Optional

logger = logging.getLogger(__name__)


class ChatService:
    """Service for AI-powered chat with RAG."""

    def __init__(self):
        self.client = OpenAI(api_key=settings.openai_api_key)
        self.model = settings.openai_model
        self.rag_service = rag_service
        self.db = supabase_client
        logger.info(f"Chat service initialized with model: {self.model}")

    def _build_system_prompt(self, context: Optional[Dict] = None) -> str:
        """Build system prompt with optional context."""
        base_prompt = """You are MindFuel AI, an intelligent personal development coach and mentor.
Your role is to help users grow in areas like mindset, productivity, communication, leadership, and wellness.

Key Responsibilities:
1. Provide actionable, evidence-based advice
2. Use content from the MindFuel library to support your responses
3. Be empathetic, encouraging, and non-judgmental
4. Ask clarifying questions when needed
5. Adapt your communication style to the user's needs
6. Connect concepts across different areas of personal development

Guidelines:
- Always cite sources from the MindFuel library when using specific content
- Keep responses concise but comprehensive
- Use examples and analogies to make concepts clear
- Encourage reflection and self-discovery
- Focus on practical application, not just theory
- Be honest about limitations and uncertainties
"""

        if context and context.get("relevant_content"):
            formatted_context = rag_service.format_context_for_llm(context)
            base_prompt += f"\n\n{formatted_context}"

        return base_prompt

    async def chat(
        self,
        message: str,
        user_id: Optional[str] = None,
        conversation_id: Optional[str] = None,
        use_rag: bool = True,
        filters: Optional[Dict] = None
    ) -> Dict:
        """
        Generate AI response with optional RAG context.

        Args:
            message: User message
            user_id: Optional user ID for personalization
            conversation_id: Optional conversation ID to continue
            use_rag: Whether to use RAG for context
            filters: Optional filters for RAG retrieval

        Returns:
            Dictionary with response and metadata
        """
        try:
            messages = []
            context = None

            # Retrieve conversation history if provided
            if conversation_id and user_id:
                history = await self.db.get_conversation_history(user_id, conversation_id)
                if history and len(history) > 0:
                    messages = history[0].get("messages", [])

            # Build context using RAG if enabled
            if use_rag:
                context = await self.rag_service.build_context(
                    message,
                    user_id=user_id,
                    filters=filters
                )

            # Build system prompt with context
            system_prompt = self._build_system_prompt(context)

            # Prepare messages for API
            api_messages = [{"role": "system", "content": system_prompt}]
            api_messages.extend(messages[-10:])  # Last 10 messages for context
            api_messages.append({"role": "user", "content": message})

            # Generate response
            response = self.client.chat.completions.create(
                model=self.model,
                messages=api_messages,
                temperature=settings.temperature,
                max_tokens=settings.max_tokens
            )

            assistant_message = response.choices[0].message.content

            # Update conversation history
            messages.append({"role": "user", "content": message})
            messages.append({"role": "assistant", "content": assistant_message})

            # Store conversation if user_id provided
            if user_id:
                await self.db.store_conversation(user_id, {
                    "messages": messages,
                    "context": context,
                    "metadata": {
                        "model": self.model,
                        "tokens_used": response.usage.total_tokens
                    }
                })

            result = {
                "message": assistant_message,
                "sources": context.get("sources", []) if context else [],
                "tokens_used": response.usage.total_tokens,
                "conversation_id": conversation_id
            }

            logger.info(f"Generated chat response ({result['tokens_used']} tokens)")
            return result

        except Exception as e:
            logger.error(f"Error in chat service: {e}")
            raise

    async def chat_stream(
        self,
        message: str,
        user_id: Optional[str] = None,
        conversation_id: Optional[str] = None,
        use_rag: bool = True,
        filters: Optional[Dict] = None
    ):
        """
        Generate streaming AI response with optional RAG context.

        Args:
            message: User message
            user_id: Optional user ID for personalization
            conversation_id: Optional conversation ID to continue
            use_rag: Whether to use RAG for context
            filters: Optional filters for RAG retrieval

        Yields:
            Chunks of the response
        """
        try:
            messages = []
            context = None

            # Retrieve conversation history if provided
            if conversation_id and user_id:
                history = await self.db.get_conversation_history(user_id, conversation_id)
                if history and len(history) > 0:
                    messages = history[0].get("messages", [])

            # Build context using RAG if enabled
            if use_rag:
                context = await self.rag_service.build_context(
                    message,
                    user_id=user_id,
                    filters=filters
                )

            # Build system prompt with context
            system_prompt = self._build_system_prompt(context)

            # Prepare messages for API
            api_messages = [{"role": "system", "content": system_prompt}]
            api_messages.extend(messages[-10:])
            api_messages.append({"role": "user", "content": message})

            # Generate streaming response
            stream = self.client.chat.completions.create(
                model=self.model,
                messages=api_messages,
                temperature=settings.temperature,
                max_tokens=settings.max_tokens,
                stream=True
            )

            full_response = ""
            for chunk in stream:
                if chunk.choices[0].delta.content:
                    content = chunk.choices[0].delta.content
                    full_response += content
                    yield content

            # Store conversation
            if user_id:
                messages.append({"role": "user", "content": message})
                messages.append({"role": "assistant", "content": full_response})
                await self.db.store_conversation(user_id, {
                    "messages": messages,
                    "context": context,
                    "metadata": {"model": self.model}
                })

        except Exception as e:
            logger.error(f"Error in streaming chat: {e}")
            raise

    async def generate_suggestions(
        self,
        user_id: str,
        suggestion_type: str = "general"
    ) -> List[str]:
        """
        Generate contextual suggestions for the user.

        Args:
            user_id: User ID
            suggestion_type: Type of suggestions (general, goal, practice, etc.)

        Returns:
            List of suggestion strings
        """
        try:
            # Get user context
            user_context = await self.db.get_user_context(user_id)

            # Build prompt based on suggestion type
            prompts = {
                "general": "Based on the user's current journey, suggest 3-5 actionable next steps.",
                "goal": "Suggest 3-5 meaningful goals the user might want to set.",
                "practice": "Suggest 3-5 daily practices that would benefit this user.",
                "reading": "Suggest 3-5 topics or areas the user should explore in the MindFuel library."
            }

            prompt = prompts.get(suggestion_type, prompts["general"])

            messages = [
                {
                    "role": "system",
                    "content": f"""You are MindFuel AI. Generate personalized suggestions.
User Context: {user_context}"""
                },
                {"role": "user", "content": prompt}
            ]

            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.8,
                max_tokens=500
            )

            # Parse suggestions from response
            suggestions_text = response.choices[0].message.content
            suggestions = [s.strip() for s in suggestions_text.split("\n") if s.strip() and not s.strip().startswith("#")]

            logger.info(f"Generated {len(suggestions)} suggestions for user {user_id}")
            return suggestions[:5]

        except Exception as e:
            logger.error(f"Error generating suggestions: {e}")
            raise


chat_service = ChatService()
