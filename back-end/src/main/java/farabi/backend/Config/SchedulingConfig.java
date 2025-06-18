package farabi.backend.Config;

import farabi.backend.Security.JwtBlacklistService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

@Configuration
@EnableScheduling
public class SchedulingConfig {

    private static final Logger logger = LoggerFactory.getLogger(SchedulingConfig.class);
    private final JwtBlacklistService jwtBlacklistService;

    public SchedulingConfig(JwtBlacklistService jwtBlacklistService) {
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