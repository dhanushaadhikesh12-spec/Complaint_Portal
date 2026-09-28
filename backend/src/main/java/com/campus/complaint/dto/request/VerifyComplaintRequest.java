package com.campus.complaint.dto.request;

import jakarta.validation.constraints.NotBlank;

public class VerifyComplaintRequest {
    @NotBlank(message = "Action is required (CLOSE or REOPEN)")
    private String action;

    private String feedback;
    private Integer rating;

    public VerifyComplaintRequest() {}

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }
}
