package farabi.backend.Security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class TokenCleanupTask {

    private static final Logger logger = LoggerFactory.getLogger(TokenCleanupTask.class);
    private final JwtBlacklistService jwtBlacklistService;

    public TokenCleanupTask(JwtBlacklistService jwtBlacklistService) {
        this.jwtBlacklistService = jwtBlacklistService;
    }

    /**
     * Clean up expired tokens from the blacklist every hour
     */
    @Scheduled(fixedRate = 3600000) // 1 hour in milliseconds
    public void cleanupExpiredTokens() {
        logger.info("Running scheduled task to clean up expired tokens");
        jwtBlacklistService.cleanupExpiredTokens();
    }
} 