package farabi.backend.DTO;

import farabi.backend.Entity.statusUser;

public class AuthResponse {
    private String token;
    private String role;
    private statusUser status;
    
    public AuthResponse() {
    }

    public AuthResponse(String token, String role, statusUser status) {
        this.token = token;
        this.role = role;
        this.status = status;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
    
    public statusUser getStatus() {
        return status;
    }
    
    public void setStatus(statusUser status) {
        this.status = status;
    }
} 