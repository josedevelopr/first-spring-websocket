package com.javamaster.controller;

import com.javamaster.model.MessageModel;
import com.javamaster.storage.UserStorage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RestController;

import java.util.logging.Logger;

@RestController
@CrossOrigin
public class MessageController {
    private static final Logger log = Logger.getLogger(MessageController.class.getName());

    @Autowired
    private SimpMessagingTemplate simpMessagingTemplate;

    @MessageMapping("/chat/{to}")
    public void sendMessage(@DestinationVariable String to, MessageModel messageModel)
    {   log.info("handling send message : "+messageModel + " to : "+to);
        boolean exists = UserStorage.getInstance().getUsers().contains(to);
        if(exists)
        {   simpMessagingTemplate.convertAndSend("/topic/messages/"+to, messageModel);
        }
    }
}
