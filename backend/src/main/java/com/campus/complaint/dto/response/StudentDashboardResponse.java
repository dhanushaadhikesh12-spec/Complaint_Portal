package com.campus.complaint.dto.response;

import java.util.List;

public class StudentDashboardResponse {
    private long totalComplaints;
    private long newComplaints;
    private long inProgressComplaints;
    private long resolvedComplaints;
    private long closedComplaints;
    private long escalatedComplaints;
    private List<ComplaintResponse> recentComplaints;

    public StudentDashboardResponse() {}

    public long getTotalComplaints() { return totalComplaints; }
    public void setTotalComplaints(long totalComplaints) { this.totalComplaints = totalComplaints; }

    public long getNewComplaints() { return newComplaints; }
    public void setNewComplaints(long newComplaints) { this.newComplaints = newComplaints; }

    public long getInProgressComplaints() { return inProgressComplaints; }
    public void setInProgressComplaints(long inProgressComplaints) { this.inProgressComplaints = inProgressComplaints; }

    public long getResolvedComplaints() { return resolvedComplaints; }
    public void setResolvedComplaints(long resolvedComplaints) { this.resolvedComplaints = resolvedComplaints; }

    public long getClosedComplaints() { return closedComplaints; }
    public void setClosedComplaints(long closedComplaints) { this.closedComplaints = closedComplaints; }

    public long getEscalatedComplaints() { return escalatedComplaints; }
    public void setEscalatedComplaints(long escalatedComplaints) { this.escalatedComplaints = escalatedComplaints; }

    public List<ComplaintResponse> getRecentComplaints() { return recentComplaints; }
    public void setRecentComplaints(List<ComplaintResponse> recentComplaints) { this.recentComplaints = recentComplaints; }
}
