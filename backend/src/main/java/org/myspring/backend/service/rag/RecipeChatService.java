package org.myspring.backend.service.rag;

import org.myspring.backend.tool.RecipeTools;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.memory.InMemoryChatMemoryRepository;
import org.springframework.ai.chat.memory.MessageWindowChatMemory;
import org.springframework.stereotype.Service;

@Service
public class RecipeChatService {

    private final ChatClient chatClient;

    public RecipeChatService(ChatClient.Builder builder, RecipeTools recipeTools, ChatMemory chatMemory) {
        this.chatClient = builder
                .defaultSystem("""
                        You are a polite, elegant waiter at a 5-star restaurant. 🍝
                        
                        Guidelines:
                        1. If the guest gives a vague request (e.g., "I'm hungry"), ask clarifying questions to learn their taste, diet, or preferred ingredients.
                        2. Once you have sufficient details, use the searchRecipes tool to check our menu.
                        3. Answer strictly using the information returned by the tool.
                        """)
                .defaultTools(recipeTools) // Registers the tool with OpenAI
                .defaultAdvisors(
                        MessageChatMemoryAdvisor.builder(chatMemory).build()
                )
                .build();
    }

    public String askQuestion(String conversationId, String userQuestion) {
        return chatClient.prompt()
                .user(userQuestion)
                .advisors(advisorSpec -> advisorSpec.param("chat_memory_conversation_id", conversationId))
                .call()
                .content();
    }
}