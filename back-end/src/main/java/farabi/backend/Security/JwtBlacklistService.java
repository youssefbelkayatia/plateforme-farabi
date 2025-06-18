package farabi.backend.Security;

import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Date;

@Service
public class JwtBlacklistService {
    
    // Using ConcurrentHashMap for thread safety
    private final Map<String, Date> blacklistedTokens = new ConcurrentHashMap<>();
    
    /**
     * Blacklist a token until its original expiration date
     * @param token The JWT token to blacklist
     * @param expiryDate The expiration date of the token
     */
    public void blacklistToken(String token, Date expiryDate) {
        blacklistedTokens.put(token, expiryDate);
    }
    
    /**
     * Check if a token is blacklisted
     * @param token The JWT token to check
     * @return true if the token is blacklisted, false otherwise
     */
    public boolean isBlacklisted(String token) {
        if (!blacklistedTokens.containsKey(token)) {
            return false;
        }
        
        // If the token has expired, remove it from the blacklist
        Date expiryDate = blacklistedTokens.get(token);
        if (expiryDate.before(new Date())) {
            blacklistedTokens.remove(token);
            return false;
        }
        
        return true;
    }
    
    /**
     * Clean up expired tokens from the blacklist
     * This method should be called periodically, e.g., by a scheduled task
     */
    public void cleanupExpiredTokens() {
        Date now = new Date();
        blacklistedTokens.entrySet().removeIf(entry -> entry.getValue().before(now));
    }
} 