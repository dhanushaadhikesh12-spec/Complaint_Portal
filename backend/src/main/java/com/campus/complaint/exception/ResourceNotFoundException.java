package com.campus.complaint.exception;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
    public ResourceNotFoundException(String resource, Long id) {
        super(resource + " not found with id: " + id);
    }
    public ResourceNotFoundException(String resource, String identifier) {
        super(resource + " not found with identifier: " + identifier);
    }
}

