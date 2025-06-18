package farabi.backend.DTO;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class LogoutResponse {
    private String message;
    private boolean success;
    
    // Explicitly adding constructor to resolve the error
    public LogoutResponse(String message, boolean success) {
        this.message = message;
        this.success = success;
    }
} 