package com.metaway.springbootwebsockets.repositories;

import com.metaway.springbootwebsockets.entities.ComponentEvent;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ComponentEventRepository extends MongoRepository<ComponentEvent, String> {
}
