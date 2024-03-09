package com.metaway.springbootwebsockets.controllers;

import com.metaway.springbootwebsockets.entities.ChatMessage;
import com.metaway.springbootwebsockets.entities.ComponentEvent;
import com.metaway.springbootwebsockets.repositories.ComponentEventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;

@Controller
public class ChatController {

    @Autowired
    private ComponentEventRepository componentEventRepository;

    @MessageMapping("/chat.sendMessage") // Define a URL de mapeamento da mensagem
    @SendTo("/topic/public") // Especifique o destino para onde a mensagem será enviada
    public ChatMessage sendMessage(@Payload ChatMessage chatMessage) {
        return chatMessage; // Process the message and send it to the specified destination
    }

    @MessageMapping("/chat.addUser")
    @SendTo("/topic/public")
    public ChatMessage addUser(@Payload ChatMessage chatMessage, SimpMessageHeaderAccessor headerAccessor) {
        // Add username in web socket session
        headerAccessor.getSessionAttributes().put("username", chatMessage.getSender());
        return chatMessage;
    }

    @MessageMapping("/chat.componentClicked")
    @SendTo("/topic/public")
    public ChatMessage componentClicked(@Payload ChatMessage chatMessage){
        ComponentEvent componentEvent = new ComponentEvent();
        componentEvent.setMoment(LocalDateTime.now().minusHours(3)); // MongoDB stores times in UTC by default, and converts any local time representations into this form.
        componentEvent.setUsername(chatMessage.getSender());
        componentEvent.setMessage(chatMessage.getContent());
        componentEventRepository.save(componentEvent);
        return chatMessage;
    }
}
