package com.resumeintel.infrastructure.persistence.entity;

import java.util.UUID;

public class User {
    private UUID id = UUID.randomUUID();

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }
}
